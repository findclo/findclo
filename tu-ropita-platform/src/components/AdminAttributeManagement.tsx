'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { privateAttributesApiWrapper } from '@/api-wrappers/attributes';
import { IAttributeWithValues } from '@/lib/backend/models/interfaces/attribute.interface';
import Cookies from 'js-cookie';
import { IAttributeCreateDTO, IAttributeValueCreateDTO } from '@/lib/backend/dtos/attribute.dto.interface';

interface AdminAttributeManagementProps {
  className?: string;
}

interface AdminAttributeState {
  attributes: IAttributeWithValues[];
  isLoading: boolean;
  error: string | null;
  selectedAttribute: IAttributeWithValues | null;
  isEditingAttribute: boolean;
  isCreatingAttribute: boolean;
  isCreatingValue: boolean;
  attributeFormData: IAttributeCreateDTO;
  valueFormData: IAttributeValueCreateDTO;
  expandedAttributes: Set<number>;
}

const initialAttributeFormData: IAttributeCreateDTO = {
  name: '',
};

const initialValueFormData: IAttributeValueCreateDTO = {
  value: '',
};

export const AdminAttributeManagement: React.FC<AdminAttributeManagementProps> = ({
  className
}) => {
  const [state, setState] = useState<AdminAttributeState>({
    attributes: [],
    isLoading: true,
    error: null,
    selectedAttribute: null,
    isEditingAttribute: false,
    isCreatingAttribute: false,
    isCreatingValue: false,
    attributeFormData: initialAttributeFormData,
    valueFormData: initialValueFormData,
    expandedAttributes: new Set(),
  });

  const token = Cookies.get("Authorization");

  useEffect(() => {
    loadAttributes();
  }, []);

  const loadAttributes = useCallback(async () => {
    if (!token) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const attributes = await privateAttributesApiWrapper.listAdminAttributes(token, true);
      setState(prev => ({
        ...prev,
        attributes: attributes as IAttributeWithValues[],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error loading attributes:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'No se pudieron cargar los atributos',
        isLoading: false
      }));
    }
  }, [token]);

  const handleCreateAttribute = useCallback(() => {
    setState(prev => ({
      ...prev,
      isCreatingAttribute: true,
      isEditingAttribute: false,
      isCreatingValue: false,
      selectedAttribute: null,
      attributeFormData: initialAttributeFormData
    }));
  }, []);

  const handleCreateValue = useCallback((attribute: IAttributeWithValues) => {
    setState(prev => ({
      ...prev,
      isCreatingValue: true,
      isCreatingAttribute: false,
      isEditingAttribute: false,
      selectedAttribute: attribute,
      valueFormData: initialValueFormData
    }));
  }, []);

  const handleDeleteAttribute = useCallback(async (attribute: IAttributeWithValues) => {
    if (!token) return;

    if (!confirm(`¿Estás seguro de que deseas eliminar "${attribute.name}"? Esto eliminará todos sus valores. Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await privateAttributesApiWrapper.deleteAttribute(token, attribute.id);
      await loadAttributes();
    } catch (error) {
      console.error('Error deleting attribute:', error);
      alert('No se pudo eliminar el atributo');
    }
  }, [token, loadAttributes]);

  const handleDeleteValue = useCallback(async (attributeId: number, valueId: number, valueName: string) => {
    if (!token) return;

    if (!confirm(`¿Estás seguro de que deseas eliminar el valor "${valueName}"?`)) {
      return;
    }

    try {
      await privateAttributesApiWrapper.deleteAttributeValue(token, attributeId, valueId);
      await loadAttributes();
    } catch (error) {
      console.error('Error deleting attribute value:', error);
      alert('No se pudo eliminar el valor');
    }
  }, [token, loadAttributes]);

  const handleSaveAttribute = useCallback(async () => {
    if (!token) return;

    try {
      if (state.isCreatingAttribute) {
        await privateAttributesApiWrapper.createAttribute(token, state.attributeFormData);
      }

      await loadAttributes();
      setState(prev => ({
        ...prev,
        isCreatingAttribute: false,
        isEditingAttribute: false,
        selectedAttribute: null,
        attributeFormData: initialAttributeFormData
      }));
    } catch (error) {
      console.error('Error saving attribute:', error);
      alert('No se pudo guardar el atributo');
    }
  }, [token, state.isCreatingAttribute, state.attributeFormData, loadAttributes]);

  const handleSaveValue = useCallback(async () => {
    if (!token || !state.selectedAttribute) return;

    try {
      await privateAttributesApiWrapper.createAttributeValue(
        token,
        state.selectedAttribute.id,
        state.valueFormData
      );

      await loadAttributes();
      setState(prev => ({
        ...prev,
        isCreatingValue: false,
        selectedAttribute: null,
        valueFormData: initialValueFormData
      }));
    } catch (error) {
      console.error('Error saving value:', error);
      alert('No se pudo guardar el valor');
    }
  }, [token, state.selectedAttribute, state.valueFormData, loadAttributes]);

  const handleCancelEdit = useCallback(() => {
    setState(prev => ({
      ...prev,
      isCreatingAttribute: false,
      isEditingAttribute: false,
      isCreatingValue: false,
      selectedAttribute: null,
      attributeFormData: initialAttributeFormData,
      valueFormData: initialValueFormData
    }));
  }, []);

  const handleAttributeFormChange = useCallback((field: keyof IAttributeCreateDTO, value: any) => {
    setState(prev => ({
      ...prev,
      attributeFormData: { ...prev.attributeFormData, [field]: value }
    }));
  }, []);

  const handleValueFormChange = useCallback((field: keyof IAttributeValueCreateDTO, value: any) => {
    setState(prev => ({
      ...prev,
      valueFormData: { ...prev.valueFormData, [field]: value }
    }));
  }, []);

  const toggleExpanded = useCallback((attributeId: number) => {
    setState(prev => {
      const newExpanded = new Set(prev.expandedAttributes);
      if (newExpanded.has(attributeId)) {
        newExpanded.delete(attributeId);
      } else {
        newExpanded.add(attributeId);
      }
      return { ...prev, expandedAttributes: newExpanded };
    });
  }, []);

  const renderAttributeItem = useCallback((attribute: IAttributeWithValues) => {
    const hasValues = attribute.values.length > 0;
    const isExpanded = state.expandedAttributes.has(attribute.id);

    return (
      <div key={attribute.id} className="attribute-item mb-2">
        <div
          className={cn(
            'flex items-center p-3 rounded-lg border transition-all duration-200',
            'hover:bg-gray-50 dark:hover:bg-gray-800',
            'border-gray-200 dark:border-gray-700'
          )}
        >
          {/* Expand/Collapse Button */}
          {hasValues && (
            <button
              onClick={() => toggleExpanded(attribute.id)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded mr-2"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Attribute Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {attribute.name}
              </h3>
            </div>
            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>{attribute.values.length} valores</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleCreateValue(attribute)}
              className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400"
              title="Agregar valor"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteAttribute(attribute)}
              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              title="Eliminar atributo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Values */}
        {hasValues && isExpanded && (
          <div className="ml-8 mt-2 space-y-1">
            {attribute.values.map(value => (
              <div
                key={value.id}
                className="flex items-center p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="flex-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{value.value}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    (slug: {value.slug})
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteValue(attribute.id, value.id, value.value)}
                  className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  title="Eliminar valor"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }, [
    state.expandedAttributes,
    toggleExpanded,
    handleCreateValue,
    handleDeleteAttribute,
    handleDeleteValue
  ]);

  const renderAttributeForm = () => {
    if (!state.isCreatingAttribute && !state.isEditingAttribute) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {state.isCreatingAttribute ? 'Crear Atributo' : 'Editar Atributo'}
          </h3>
          <button
            onClick={handleCancelEdit}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              value={state.attributeFormData.name}
              onChange={(e) => handleAttributeFormChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Ej: Color, Talla, Material"
            />
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
            onClick={handleSaveAttribute}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {state.isCreatingAttribute ? 'Crear' : 'Guardar'}
          </button>
        </div>
      </div>
    );
  };

  const renderValueForm = () => {
    if (!state.isCreatingValue || !state.selectedAttribute) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Agregar Valor a "{state.selectedAttribute.name}"
          </h3>
          <button
            onClick={handleCancelEdit}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Valor *
            </label>
            <input
              type="text"
              value={state.valueFormData.value}
              onChange={(e) => handleValueFormChange('value', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Ej: Rojo, M, Algodón"
            />
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
            onClick={handleSaveValue}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Agregar Valor
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
          <p className="text-gray-600 dark:text-gray-400">Cargando atributos...</p>
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
          onClick={loadAttributes}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  return (
    <div className={cn('admin-attribute-management', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Atributos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra los atributos de productos y sus valores
          </p>
        </div>
        <button
          onClick={handleCreateAttribute}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear Atributo
        </button>
      </div>

      {renderAttributeForm()}
      {renderValueForm()}

      {/* Attributes List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Atributos ({state.attributes.length})
          </h2>
        </div>
        <div className="p-4">
          {state.attributes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No se encontraron atributos. Crea tu primer atributo para comenzar.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {state.attributes.map(attribute => renderAttributeItem(attribute))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAttributeManagement;
