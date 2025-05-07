import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './dropdown-menu';
import { Input } from './input';
import { Button } from './button';
import {
  Filter,
  ChevronsUpDown,
  X,
  ArrowUp,
  ArrowDown,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from './checkbox';
import { ResizableTableHeader } from './resizable-table-header';

export type SortDirection = 'asc' | 'desc' | null;

export type FilterConfig = {
  column: string;
  value: string;
};

export type FilterOption = {
  label: string;
  value: string;
  color?: string;
};

interface FilterableTableHeaderProps {
  column: string;
  label: string | React.ReactNode;
  filterValue: string;
  onFilterChange: (column: string, value: string) => void;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: (column: string, direction: 'asc' | 'desc' | null) => void;
  filterOptions?: FilterOption[];
  width?: number;
  onResize?: (column: string, width: number) => void;
  minWidth?: number;
  maxWidth?: number;
}

export function FilterableTableHeader({
  column,
  label,
  filterValue,
  onFilterChange,
  sortDirection,
  onSort,
  filterOptions,
  width,
  onResize,
  minWidth = 100,
  maxWidth = 800
}: FilterableTableHeaderProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(filterValue);
  const [isHovering, setIsHovering] = React.useState(false);

  React.useEffect(() => {
    setInputValue(filterValue);
  }, [filterValue]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onFilterChange(column, inputValue);
    }
  };

  const handleOptionSelect = (value: string) => {
    onFilterChange(column, value);
  };

  const handleResize = (newWidth: number) => {
    if (onResize) {
      onResize(column, newWidth);
    }
  };

  return (
    <ResizableTableHeader
      width={width}
      onResize={handleResize}
      minWidth={minWidth}
      maxWidth={maxWidth}
    >
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <span>{label}</span>
            {filterValue && (
              <Filter className="ml-2 h-4 w-4 text-muted-foreground" />
            )}
            {sortDirection === 'asc' && <ArrowUp className="ml-2 h-4 w-4" />}
            {sortDirection === 'desc' && <ArrowDown className="ml-2 h-4 w-4" />}
            {!sortDirection && isHovering && (
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px]">
          {filterOptions ? (
            <div className="p-2">
              <div className="pb-2 text-sm text-muted-foreground">
                Filter options
              </div>
              <div className="space-y-2">
                {filterOptions.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      'flex items-center p-2 rounded-md cursor-pointer',
                      option.color
                    )}
                    onClick={() => handleOptionSelect(option.value)}
                  >
                    <Checkbox
                      checked={filterValue === option.value}
                      className="mr-2"
                      onCheckedChange={() => handleOptionSelect(option.value)}
                    />
                    <span className="text-sm">{option.label}</span>
                    {filterValue === option.value && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </div>
                ))}
                {filterValue && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-8 mt-2"
                    onClick={() => {
                      onFilterChange(column, '');
                    }}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear filter
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2">
              <Input
                placeholder={`Filter ${typeof label === 'string' ? label.toLowerCase() : column.toLowerCase()} (Search ↵)`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-8"
              />
              {filterValue && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => {
                    setInputValue('');
                    onFilterChange(column, '');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          {onSort && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onSort(column, 'asc')}
                className={cn(sortDirection === 'asc' && 'bg-accent')}
              >
                <ArrowUp className="mr-2 h-4 w-4" />
                Sort Ascending
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onSort(column, 'desc')}
                className={cn(sortDirection === 'desc' && 'bg-accent')}
              >
                <ArrowDown className="mr-2 h-4 w-4" />
                Sort Descending
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onSort(column, null)}
                className={cn(sortDirection === null && 'bg-accent')}
              >
                <ChevronsUpDown className="mr-2 h-4 w-4" />
                Remove Sort
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </ResizableTableHeader>
  );
}
