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

interface CategoryFilterProps {
  allCategories: string[];
  selectedCategories: string[];
  onChangeSelected: (cats: string[]) => void;
  children?: React.ReactNode;
}

export function CategoryFilter({
  allCategories,
  selectedCategories,
  onChangeSelected,
} : CategoryFilterProps) {
  const [selectAll, setSelectAll] = useState(true);

  const handleCategoryChange = (cat: string, checked: boolean) => {
    let newCategories = [...selectedCategories];
    if (checked) newCategories.push(cat);
    else newCategories = newCategories.filter((c) => c !== cat);
    onChangeSelected(newCategories);
    setSelectAll(newCategories.length === allCategories.length);
  };


  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    onChangeSelected(checked ? allCategories : []);
  };

  const handleDeselectAll = () => {
    setSelectAll(false);
    onChangeSelected([]);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="relative bg-background hover:bg-accent border-accent"
        >
          <Filter className="h-4 w-4" />
          {selectedCategories.length > 0 && (
            <div 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#FF6600' }}
            >
              <span className="text-xs font-medium text-white">
                {selectedCategories.length}
              </span>
            </div>
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
          {allCategories.map((category) => (
            <DropdownMenuItem
              key={category}
              className="flex items-center space-x-2 p-2"
              onSelect={(e) => e.preventDefault()}
            >
              <Checkbox
                id={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={(checked) =>
                  handleCategoryChange(category, checked as boolean)
                }
              />
              <label
                htmlFor={category}
                className="flex-grow text-sm cursor-pointer"
              >
                {category}
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