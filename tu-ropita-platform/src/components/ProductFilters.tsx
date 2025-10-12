'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { IAttributeFilterMap } from '@/lib/backend/dtos/listProductResponse.dto.interface';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, X } from 'lucide-react';

interface ProductFiltersProps {
  attributes: IAttributeFilterMap[];
}

export const ProductFilters = ({ attributes }: ProductFiltersProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Parse current filters from URL (IDs) and convert to slugs for internal state
  const getCurrentFilters = (): Record<string, string[]> => {
    const filters: Record<string, string[]> = {};

    // Parse value IDs from URL
    const valueIdsParam = searchParams.get('attributeValues');
    if (!valueIdsParam) return filters;

    const valueIds = valueIdsParam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

    // Convert IDs to slugs for internal state
    attributes.forEach(attr => {
      const selectedValueSlugs = attr.values
        .filter(v => valueIds.includes(v.value_id))
        .map(v => v.value_slug);

      if (selectedValueSlugs.length > 0) {
        filters[attr.attribute_slug] = selectedValueSlugs;
      }
    });

    return filters;
  };

  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>(getCurrentFilters());

  const handleFilterToggle = (attributeSlug: string, valueSlug: string) => {
    setSelectedFilters(prev => {
      const current = prev[attributeSlug] || [];
      const isSelected = current.includes(valueSlug);

      if (isSelected) {
        // Remove filter
        const updated = current.filter(v => v !== valueSlug);
        if (updated.length === 0) {
          const { [attributeSlug]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [attributeSlug]: updated };
      } else {
        // Add filter
        return { ...prev, [attributeSlug]: [...current, valueSlug] };
      }
    });
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    // Remove previous attribute values parameter
    params.delete('attributeValues');

    // Convert selected slugs to value IDs
    const valueIds: number[] = [];

    Object.entries(selectedFilters).forEach(([attributeSlug, valueSlugs]) => {
      const attribute = attributes.find(a => a.attribute_slug === attributeSlug);
      if (attribute) {
        valueSlugs.forEach(valueSlug => {
          const value = attribute.values.find(v => v.value_slug === valueSlug);
          if (value) {
            valueIds.push(value.value_id);
          }
        });
      }
    });

    // Add value IDs as single parameter
    if (valueIds.length > 0) {
      params.set('attributeValues', valueIds.join(','));
    }

    router.push(`${pathname}?${params.toString()}`);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setSelectedFilters({});
    const params = new URLSearchParams(searchParams.toString());

    // Remove attribute values parameter
    params.delete('attributeValues');

    router.push(`${pathname}?${params.toString()}`);
    setIsOpen(false);
  };

  const hasActiveFilters = Object.keys(selectedFilters).length > 0;
  const activeFilterCount = Object.values(selectedFilters).reduce((acc, curr) => acc + curr.length, 0);

  const FiltersContent = () => (
    <div className="space-y-4">
      {attributes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay filtros disponibles</p>
      ) : (
        <Accordion type="multiple" className="w-full">
          {attributes.map((attribute) => (
            <AccordionItem key={attribute.attribute_id} value={attribute.attribute_slug}>
              <AccordionTrigger className="text-sm font-medium">
                {attribute.attribute_name}
                {selectedFilters[attribute.attribute_slug]?.length > 0 && (
                  <span className="ml-2 text-xs text-primary">
                    ({selectedFilters[attribute.attribute_slug].length})
                  </span>
                )}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  {attribute.values.map((value) => {
                    const isChecked = selectedFilters[attribute.attribute_slug]?.includes(value.value_slug) || false;

                    return (
                      <div key={value.value_id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${attribute.attribute_slug}-${value.value_slug}`}
                          checked={isChecked}
                          onCheckedChange={() => handleFilterToggle(attribute.attribute_slug, value.value_slug)}
                          aria-label={`Filtrar por ${value.value}`}
                        />
                        <label
                          htmlFor={`${attribute.attribute_slug}-${value.value_slug}`}
                          className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                        >
                          {value.value}
                          <span className="ml-1 text-xs text-muted-foreground">({value.count})</span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile: Floating button with Sheet */}
      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="default"
              className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg"
              aria-label="Abrir filtros"
            >
              <SlidersHorizontal className="h-5 w-5" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
              <SheetDescription>
                Selecciona los atributos para filtrar productos
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4 overflow-y-auto h-[calc(80vh-180px)]">
              <FiltersContent />
            </div>
            <SheetFooter className="flex-row gap-2 mt-4">
              <Button
                variant="outline"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="flex-1"
              >
                Limpiar
              </Button>
              <Button onClick={applyFilters} className="flex-1">
                Aplicar filtros
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Fixed sidebar */}
      <aside className="hidden md:block w-64 pr-6">
        <div className="sticky top-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Filtros</h2>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Limpiar
              </Button>
            )}
          </div>
          <FiltersContent />
          <Button
            onClick={applyFilters}
            className="w-full mt-4"
            disabled={!hasActiveFilters}
          >
            Aplicar filtros
          </Button>
        </div>
      </aside>
    </>
  );
};
