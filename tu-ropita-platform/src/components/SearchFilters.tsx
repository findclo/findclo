import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import React from 'react';

interface SearchFiltersProps {
    filters: any;
    setFilters: React.Dispatch<React.SetStateAction<any>>;
    // Remove onClose prop
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ filters, setFilters }) => {
    const handlePriceChange = (value: number[]) => {
        setFilters({ ...filters, minPrice: value[0], maxPrice: value[1] });
    };

    const handleCategoryChange = (category: string, checked: boolean) => {
        const updatedCategories = checked
            ? [...(filters.categories || []), category]
            : (filters.categories || []).filter((c: string) => c !== category);
        setFilters({ ...filters, categories: updatedCategories });
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-2">Precio</h3>
                <Slider
                    defaultValue={[0, 1000]}
                    max={1000}
                    step={10}
                    onValueChange={handlePriceChange}
                />
                <div className="flex justify-between mt-2">
                    <span>${filters.minPrice || 0}</span>
                    <span>${filters.maxPrice || 1000}</span>
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold mb-2">Categorías</h3>
                {['Camisetas', 'Pantalones', 'Vestidos', 'Accesorios'].map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                            id={category}
                            checked={(filters.categories || []).includes(category)}
                            onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                        />
                        <label htmlFor={category}>{category}</label>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchFilters;