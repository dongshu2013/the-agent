import * as React from 'react';
import { TableHead } from './table';
import { cn } from '@/lib/utils';

interface ResizableTableHeaderProps {
  className?: string;
  children: React.ReactNode;
  onResize?: (newWidth: number) => void;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
}

export function ResizableTableHeader({
  className,
  children,
  onResize,
  width,
  minWidth = 50,
  maxWidth = 1000
}: ResizableTableHeaderProps) {
  const thRef = React.useRef<HTMLTableCellElement>(null);
  const [isResizing, setIsResizing] = React.useState(false);
  const [hovering, setHovering] = React.useState(false);

  // Handle mouse down on the resizer
  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startWidth =
        thRef.current?.getBoundingClientRect().width || width || 100;
      setIsResizing(true);

      // Apply styles to show we're actively resizing
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      const handleMouseMove = (e: MouseEvent) => {
        if (!thRef.current) return;

        const diff = e.clientX - startX;
        const newWidth = Math.max(
          minWidth,
          Math.min(maxWidth, startWidth + diff)
        );

        // Apply the new width to the table header
        thRef.current.style.width = `${newWidth}px`;
        thRef.current.style.minWidth = `${newWidth}px`;
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.body.style.removeProperty('cursor');
        document.body.style.removeProperty('user-select');

        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        // Call the resize callback with the final width
        if (onResize && thRef.current) {
          onResize(thRef.current.getBoundingClientRect().width);
        }
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [minWidth, maxWidth, width, onResize]
  );

  // Calculate initial width
  const initialWidth = width || minWidth;

  return (
    <TableHead
      ref={thRef}
      className={cn('relative', className)}
      style={{
        width: `${initialWidth}px`,
        minWidth: `${initialWidth}px`,
        position: 'relative'
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="w-full overflow-hidden text-ellipsis">{children}</div>

      {/* Resize handle */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '5px',
          cursor: 'col-resize',
          opacity: isResizing || hovering ? 1 : 0,
          transition: 'opacity 0.2s',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseDown={handleMouseDown}
      >
        <div
          style={{
            height: '100%',
            width: '2px',
            backgroundColor: isResizing ? '#3b82f6' : '#e2e8f0'
          }}
        />
      </div>
    </TableHead>
  );
}
