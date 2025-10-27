'use client';

import React, { useState, useEffect } from 'react';
import { publicAttributesApiWrapper } from '@/api-wrappers/attributes';
import { IAttributeWithValues } from '@/lib/backend/models/interfaces/attribute.interface';
import { IProductAttributeAssignment } from '@/lib/backend/dtos/attribute.dto.interface';
import { AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AttributeSelectorProps {
  selectedAttributes: Map<number, Set<number>>; // attributeId -> Set of valueIds
  onAttributesChange: (attributes: Map<number, Set<number>>) => void;
  className?: string;
}

export const AttributeSelector: React.FC<AttributeSelectorProps> = ({
  selectedAttributes,
  onAttributesChange,
  className = ''
}) => {
  const [attributes, setAttributes] = useState<IAttributeWithValues[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedAttributes, setExpandedAttributes] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadAttributes();
  }, []);

  const loadAttributes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await publicAttributesApiWrapper.getAttributes(true);
      setAttributes(data as IAttributeWithValues[]);
    } catch (error) {
      console.error('Error loading attributes:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar atributos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectValue = (attributeId: number, valueId: number) => {
    const newSelectedAttributes = new Map(selectedAttributes);
    const currentValues = newSelectedAttributes.get(attributeId) || new Set<number>();

    // Toggle value (multiselect behavior for all)
    if (currentValues.has(valueId)) {
      currentValues.delete(valueId);
    } else {
      currentValues.add(valueId);
    }

    if (currentValues.size === 0) {
      newSelectedAttributes.delete(attributeId);
    } else {
      newSelectedAttributes.set(attributeId, currentValues);
    }

    onAttributesChange(newSelectedAttributes);
  };

  const isValueSelected = (attributeId: number, valueId: number): boolean => {
    const values = selectedAttributes.get(attributeId);
    return values ? values.has(valueId) : false;
  };

  const toggleAttributeExpansion = (attributeId: number) => {
    setExpandedAttributes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(attributeId)) {
        newSet.delete(attributeId);
      } else {
        newSet.add(attributeId);
      }
      return newSet;
    });
  };

  const getSelectedCount = (attributeId: number): number => {
    const values = selectedAttributes.get(attributeId);
    return values ? values.size : 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Cargando atributos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={loadAttributes}
          className="mt-2 text-sm text-blue-600 hover:text-blue-700 underline"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  if (attributes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No hay atributos disponibles para asignar.
        </p>
      </div>
    );
  }

  return (
    <div className={`attribute-selector space-y-3 ${className}`}>
      {attributes.map(attribute => {
        const hasValues = attribute.values.length > 0;

        if (!hasValues) {
          return null;
        }

        const isExpanded = expandedAttributes.has(attribute.id);
        const selectedCount = getSelectedCount(attribute.id);

        return (
          <div key={attribute.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            {/* Accordion Header */}
            <button
              onClick={() => toggleAttributeExpansion(attribute.id)}
              className={cn(
                "w-full flex items-center justify-between p-4 transition-colors",
                "hover:bg-gray-50 dark:hover:bg-gray-800",
                isExpanded && "bg-gray-50 dark:bg-gray-800"
              )}
            >
              <div className="flex items-center gap-3 flex-1">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
                <div className="flex flex-col items-start">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {attribute.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {attribute.values.length} opciones disponibles
                  </p>
                </div>
              </div>

              {/* Selection Badge */}
              {selectedCount > 0 ? (
                <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                  {selectedCount} seleccionado{selectedCount > 1 ? 's' : ''}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-gray-500 dark:text-gray-400">
                  Ninguno seleccionado
                </Badge>
              )}
            </button>

            {/* Accordion Content */}
            {isExpanded && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
                <div className="space-y-2">
                  {attribute.values.map(value => {
                    const isSelected = isValueSelected(attribute.id, value.id);

                    return (
                      <label
                        key={value.id}
                        className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectValue(attribute.id, value.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {value.value}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AttributeSelector;
