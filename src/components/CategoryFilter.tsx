import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter } from "lucide-react";

interface Category {
  id: string;
  label: string;
}

// Example categories - replace with your actual categories
const CATEGORIES: Category[] = [
  { id: "restaurants", label: "Restaurants" },
  { id: "shopping", label: "Shopping" },
  { id: "entertainment", label: "Entertainment" },
  { id: "services", label: "Services" },
];

export function CategoryFilter() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(true);

  // Initialize with all categories selected
  useEffect(() => {
    if (selectAll) {
      setSelectedCategories(CATEGORIES.map(cat => cat.id));
    }
  }, []);

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setSelectedCategories(prev => {
      const newSelection = checked
        ? [...prev, categoryId]
        : prev.filter(id => id !== categoryId);
      
      setSelectAll(newSelection.length === CATEGORIES.length);
      return newSelection;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setSelectedCategories(checked ? CATEGORIES.map(cat => cat.id) : []);
  };

  const handleDeselectAll = () => {
    setSelectAll(false);
    setSelectedCategories([]);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Filter className="h-4 w-4" />
          {selectedCategories.length > 0 && (
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="p-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={selectAll}
              onCheckedChange={handleSelectAll}
            />
            <label
              htmlFor="select-all"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Select All
            </label>
          </div>
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          {CATEGORIES.map((category) => (
            <DropdownMenuItem
              key={category.id}
              className="flex items-center space-x-2 p-2"
              onSelect={(e) => e.preventDefault()}
            >
              <Checkbox
                id={category.id}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={(checked) =>
                  handleCategoryChange(category.id, checked as boolean)
                }
              />
              <label
                htmlFor={category.id}
                className="flex-grow text-sm cursor-pointer"
              >
                {category.label}
              </label>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator />
        <div className="p-2 sticky bottom-0 bg-popover">
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={handleDeselectAll}
          >
            Deselect All
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}