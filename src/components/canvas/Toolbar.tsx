import React from 'react';
import { Brush, Eraser, Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Tool, ToolSettings } from '@/types/canvas';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  settings: ToolSettings;
  onSettingsChange: (settings: Partial<ToolSettings>) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const PRESET_COLORS = [
  '#FFFFFF',
  '#0EA5E9',
  '#8B5CF6',
  '#F97316',
  '#10B981',
  '#EC4899',
  '#EAB308',
  '#F43F5E',
];

export const Toolbar: React.FC<ToolbarProps> = ({
  settings,
  onSettingsChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 p-3 bg-card/95 backdrop-blur-sm rounded-xl shadow-soft border border-border animate-fade-in">
      {/* Tool Selection */}
      <div className="flex items-center gap-1 pr-3 border-r border-border">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-9 w-9 transition-all',
                settings.tool === 'brush' && 'bg-primary/20 text-primary tool-active'
              )}
              onClick={() => onSettingsChange({ tool: 'brush' })}
            >
              <Brush className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Brush (B)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-9 w-9 transition-all',
                settings.tool === 'eraser' && 'bg-primary/20 text-primary tool-active'
              )}
              onClick={() => onSettingsChange({ tool: 'eraser' })}
            >
              <Eraser className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Eraser (E)</TooltipContent>
        </Tooltip>
      </div>

      {/* Color Picker */}
      {settings.tool === 'brush' && (
        <div className="flex items-center gap-1.5 pr-3 border-r border-border">
          {PRESET_COLORS.map((color) => (
            <Tooltip key={color}>
              <TooltipTrigger asChild>
                <button
                  className={cn(
                    'w-6 h-6 rounded-full transition-all hover:scale-110',
                    settings.color === color && 'ring-2 ring-primary ring-offset-2 ring-offset-card'
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => onSettingsChange({ color })}
                />
              </TooltipTrigger>
              <TooltipContent>{color}</TooltipContent>
            </Tooltip>
          ))}
          <Tooltip>
            <TooltipTrigger asChild>
              <label className="relative cursor-pointer">
                <input
                  type="color"
                  value={settings.color}
                  onChange={(e) => onSettingsChange({ color: e.target.value })}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div
                  className="w-6 h-6 rounded-full border-2 border-dashed border-muted-foreground hover:border-primary transition-colors"
                  style={{ backgroundColor: settings.color }}
                />
              </label>
            </TooltipTrigger>
            <TooltipContent>Custom Color</TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* Stroke Width */}
      <div className="flex items-center gap-3 px-3 border-r border-border min-w-[140px]">
        <span className="text-xs text-muted-foreground">Size</span>
        <Slider
          value={[settings.width]}
          onValueChange={([value]) => onSettingsChange({ width: value })}
          min={1}
          max={50}
          step={1}
          className="w-20"
        />
        <span className="text-xs text-foreground w-6 text-center">{settings.width}</span>
      </div>

      {/* Undo/Redo */}
      <div className="flex items-center gap-1 pl-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={onUndo}
              disabled={!canUndo}
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={onRedo}
              disabled={!canRedo}
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};
