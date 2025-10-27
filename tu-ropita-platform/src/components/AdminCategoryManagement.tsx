'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  ChevronDown, 
  ChevronRight, 
  GripVertical,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { privateCategoriesApiWrapper, publicCategoriesApiWrapper } from '@/api-wrappers/categories';
import { ICategoryTree, ICategory } from '@/lib/backend/models/interfaces/category.interface';
import Cookies from 'js-cookie';
import { ICategoryCreateDTO } from '@/lib/backend/dtos/category.dto.interface';

interface AdminCategoryManagementProps {
  className?: string;
}

interface AdminCategoryState {
  categories: ICategoryTree[];
  allCategories: ICategory[];
  isLoading: boolean;
  error: string | null;
  selectedCategory: ICategoryTree | null;
  isEditing: boolean;
  isCreating: boolean;
  formData: ICategoryCreateDTO;
  expandedCategories: Set<number>;
  draggedCategory: ICategoryTree | null;
  searchQuery: string;
  showInactive: boolean;
}

const initialFormData: ICategoryCreateDTO = {
  name: '',
  description: '',
  parent_id: null,
};

export const AdminCategoryManagement: React.FC<AdminCategoryManagementProps> = ({
  className
}) => {
  const [state, setState] = useState<AdminCategoryState>({
    categories: [],
    allCategories: [],
    isLoading: true,
    error: null,
    selectedCategory: null,
    isEditing: false,
    isCreating: false,
    formData: initialFormData,
    expandedCategories: new Set(),
    draggedCategory: null,
    searchQuery: '',
    showInactive: false
  });
  const token = Cookies.get("Authorization")

  const loadCategories = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await publicCategoriesApiWrapper.getCategoryTree();
      setState(prev => ({
        ...prev,
        categories: response.categories,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error loading categories:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'No se pudieron cargar las categorías',
        isLoading: false
      }));
    }
  }, []);

  const loadAllCategories = useCallback(async () => {
    try {
      const allCategories = await publicCategoriesApiWrapper.getAllCategories();
      setState(prev => ({
        ...prev,
        allCategories: allCategories || []
      }));
    } catch (error) {
      console.error('Error loading all categories:', error);
    }
  }, []);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
    loadAllCategories();
  }, [loadCategories, loadAllCategories]);

  const handleCreateCategory = useCallback(() => {
    setState(prev => ({
      ...prev,
      isCreating: true,
      isEditing: false,
      selectedCategory: null,
      formData: initialFormData
    }));
  }, []);

  const handleEditCategory = useCallback((category: ICategoryTree) => {
    setState(prev => ({
      ...prev,
      isEditing: true,
      isCreating: false,
      selectedCategory: category,
      formData: {
        name: category.name,
        description: category.description || '',
        parent_id: category.parent_id,
      }
    }));
  }, []);

  const handleDeleteCategory = useCallback(async (category: ICategoryTree) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar "${category.name}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await privateCategoriesApiWrapper.deleteCategory(token!, category.id);
      await loadCategories();
      await loadAllCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('No se pudo eliminar la categoría');
    }
  }, [token, loadCategories, loadAllCategories]);

  const handleSaveCategory = useCallback(async () => {
    try {
      if (state.isCreating) {
        await privateCategoriesApiWrapper.createCategory(token!, state.formData);
      } else if (state.isEditing && state.selectedCategory) {
        await privateCategoriesApiWrapper.updateCategory(token!, state.selectedCategory.id, state.formData);
      }

      await loadCategories();
      await loadAllCategories();
      setState(prev => ({
        ...prev,
        isCreating: false,
        isEditing: false,
        selectedCategory: null,
        formData: initialFormData
      }));
    } catch (error) {
      console.error('Error saving category:', error);
      alert('No se pudo guardar la categoría');
    }
  }, [token, state.isCreating, state.isEditing, state.selectedCategory, state.formData, loadCategories, loadAllCategories]);

  const handleCancelEdit = useCallback(() => {
    setState(prev => ({
      ...prev,
      isCreating: false,
      isEditing: false,
      selectedCategory: null,
      formData: initialFormData
    }));
  }, []);

  const handleFormChange = useCallback((field: keyof ICategoryCreateDTO, value: any) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value }
    }));
  }, []);

  const toggleExpanded = useCallback((categoryId: number) => {
    setState(prev => {
      const newExpanded = new Set(prev.expandedCategories);
      if (newExpanded.has(categoryId)) {
        newExpanded.delete(categoryId);
      } else {
        newExpanded.add(categoryId);
      }
      return { ...prev, expandedCategories: newExpanded };
    });
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, category: ICategoryTree) => {
    setState(prev => ({ ...prev, draggedCategory: category }));
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, targetCategory: ICategoryTree) => {
    e.preventDefault();

    if (!state.draggedCategory || state.draggedCategory.id === targetCategory.id) {
      return;
    }

    try {
      // Update hierarchy
      await privateCategoriesApiWrapper.updateCategory(token!, state.draggedCategory.id, {
        parent_id: targetCategory.parent_id
      });

      await loadCategories();
      await loadAllCategories();
    } catch (error) {
      console.error('Error updating category hierarchy:', error);
      alert('No se pudo actualizar la jerarquía de categorías');
    } finally {
      setState(prev => ({ ...prev, draggedCategory: null }));
    }
  }, [token, state.draggedCategory, loadCategories, loadAllCategories]);

  const filterCategoriesByQuery = useCallback((categories: ICategoryTree[], query: string): ICategoryTree[] => {
    return categories.filter(category => {
      const matches = category.name.toLowerCase().includes(query) ||
                     category.description?.toLowerCase().includes(query);

      if (matches) return true;

      if (category.children.length > 0) {
        const matchingChildren = filterCategoriesByQuery(category.children, query);
        return matchingChildren.length > 0;
      }

      return false;
    }).map(category => ({
      ...category,
      children: category.children.length > 0
        ? filterCategoriesByQuery(category.children, query)
        : []
    }));
  }, []);

  const filterActiveCategories = useCallback((categories: ICategoryTree[]): ICategoryTree[] => {
    return categories.map(category => ({
      ...category,
      children: category.children.length > 0
        ? filterActiveCategories(category.children)
        : []
    }));
  }, []);

  const filteredCategories = useMemo(() => {
    let filtered = state.categories;

    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filterCategoriesByQuery(filtered, query);
    }

    if (!state.showInactive) {
      filtered = filterActiveCategories(filtered);
    }

    return filtered;
  }, [state.categories, state.searchQuery, state.showInactive, filterCategoriesByQuery, filterActiveCategories]);

  const renderCategoryItem = useCallback((category: ICategoryTree, level: number = 0) => {
    const hasChildren = category.children.length > 0;
    const isExpanded = state.expandedCategories.has(category.id);
    const isSelected = state.selectedCategory?.id === category.id;
    const isDragging = state.draggedCategory?.id === category.id;

    return (
      <div key={category.id} className="category-item">
        <div
          className={cn(
            'flex items-center p-3 rounded-lg border transition-all duration-200',
            'hover:bg-gray-50 dark:hover:bg-gray-800',
            isSelected && 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
            isDragging && 'opacity-50',
            'opacity-60'
          )}
          style={{ marginLeft: `${level * 20}px` }}
          draggable
          onDragStart={(e) => handleDragStart(e, category)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, category)}
        >
          {/* Drag Handle */}
          <GripVertical className="w-4 h-4 text-gray-400 mr-2 cursor-move" />

          {/* Expand/Collapse Button */}
          {hasChildren && (
            <button
              onClick={() => toggleExpanded(category.id)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Category Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className={cn(
                'text-sm font-medium truncate',
                'text-gray-500 dark:text-gray-400'
              )}>
                {category.name}
              </h3>
            </div>
            {category.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {category.description}
              </p>
            )}
            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              <span>Nivel: {category.level}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleEditCategory(category)}
              className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              title="Editar categoría"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteCategory(category)}
              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              title="Eliminar categoría"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {category.children.map(child => renderCategoryItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  }, [
    state.expandedCategories,
    state.selectedCategory,
    state.draggedCategory,
    handleDragStart,
    handleDragOver,
    handleDrop,
    toggleExpanded,
    handleEditCategory,
    handleDeleteCategory
  ]);

  // Render category form
  const renderCategoryForm = () => {
    if (!state.isCreating && !state.isEditing) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {state.isCreating ? 'Crear Categoría' : 'Editar Categoría'}
          </h3>
          <button
            onClick={handleCancelEdit}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              value={state.formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nombre de la categoría"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción
            </label>
            <textarea
              value={state.formData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descripción de la categoría"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categoría Padre
            </label>
            <select
              value={state.formData.parent_id || ''}
              onChange={(e) => handleFormChange('parent_id', e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sin padre (categoría raíz)</option>
              {state.allCategories
                .filter(category => !state.selectedCategory || category.id !== state.selectedCategory.id)
                .map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
            </select>
          </div>

        </div>
          

        <div className="flex items-center justify-end space-x-3 mt-6">
          <button
            onClick={handleCancelEdit}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveCategory}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {state.isCreating ? 'Crear' : 'Guardar'}
          </button>
        </div>
      </div>
    );
  };

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando categorías...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 dark:text-red-400 mb-4">{state.error}</p>
        <button
          onClick={loadCategories}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  return (
    <div className={cn('admin-category-management', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Categorías
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra las categorías de productos y su jerarquía
          </p>
        </div>
        <button
          onClick={handleCreateCategory}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear Categoría
        </button>
      </div>

      {renderCategoryForm()}

      

      {/* Category Tree */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Categorías ({filteredCategories.length})
          </h2>
        </div>
        <div className="p-4">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                {state.searchQuery ? 'No se encontraron categorías que coincidan con tu búsqueda.' : 'No se encontraron categorías.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCategories.map(category => renderCategoryItem(category))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCategoryManagement;
