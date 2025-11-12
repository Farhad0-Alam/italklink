import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";

export interface GradientStop {
  color: string;
  stop: number;
}

export interface GradientConfig {
  type: 'linear' | 'radial';
  angle: number;
  stops: GradientStop[];
}

interface GradientBuilderProps {
  value: GradientConfig;
  onChange: (gradient: GradientConfig) => void;
  useBrandColors?: boolean;
  brandColor?: string;
  accentColor?: string;
}

export function GradientBuilder({ 
  value, 
  onChange,
  useBrandColors = false,
  brandColor = "#4ecdc4",
  accentColor = "#f093fb"
}: GradientBuilderProps) {
  const [expandedStop, setExpandedStop] = useState<number | null>(null);

  const handleTypeChange = (type: 'linear' | 'radial') => {
    onChange({ ...value, type });
  };

  const handleAngleChange = (angle: number) => {
    onChange({ ...value, angle });
  };

  const handleStopColorChange = (index: number, color: string) => {
    const newStops = [...value.stops];
    newStops[index] = { ...newStops[index], color };
    onChange({ ...value, stops: newStops });
  };

  const handleStopPositionChange = (index: number, stop: number) => {
    const newStops = [...value.stops];
    newStops[index] = { ...newStops[index], stop };
    onChange({ ...value, stops: newStops });
  };

  const addStop = () => {
    const newStop = {
      color: "#ffffff",
      stop: 50
    };
    const newStops = [...value.stops, newStop].sort((a, b) => a.stop - b.stop);
    onChange({ ...value, stops: newStops });
  };

  const removeStop = (index: number) => {
    if (value.stops.length <= 2) return; // Keep at least 2 stops
    const newStops = value.stops.filter((_, i) => i !== index);
    onChange({ ...value, stops: newStops });
    if (expandedStop === index) setExpandedStop(null);
  };

  const gradientPreview = `linear-gradient(${value.angle}deg, ${value.stops
    .map(s => `${s.color} ${s.stop}%`)
    .join(', ')})`;

  return (
    <div className="space-y-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
      <div>
        <Label className="text-xs text-slate-400 mb-2 block">
          Gradient Preview
        </Label>
        <div 
          className="w-full h-12 rounded border border-slate-600"
          style={{ background: gradientPreview }}
        />
      </div>

      {!useBrandColors && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-slate-400 mb-2 block">Type</Label>
              <select
                value={value.type}
                onChange={(e) => handleTypeChange(e.target.value as 'linear' | 'radial')}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
              >
                <option value="linear">Linear</option>
                <option value="radial">Radial</option>
              </select>
            </div>

            {value.type === 'linear' && (
              <div>
                <Label className="text-xs text-slate-400 mb-2 block">
                  Angle: {value.angle}°
                </Label>
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={value.angle}
                  onChange={(e) => handleAngleChange(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-600 rounded-lg appearance-none slider"
                />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-xs text-slate-400">Color Stops</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addStop}
                className="h-7 text-xs gap-1 border-slate-600 hover:bg-slate-700"
              >
                <Plus className="w-3 h-3" />
                Add Stop
              </Button>
            </div>

            <div className="space-y-3">
              {value.stops.map((stop, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 grid grid-cols-[1fr_auto_auto] gap-2 items-center">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded border border-slate-600 cursor-pointer"
                          style={{ backgroundColor: stop.color }}
                          onClick={() => setExpandedStop(expandedStop === index ? null : index)}
                        />
                        <Input
                          type="text"
                          value={stop.color.replace('#', '')}
                          onChange={(e) => {
                            const hex = e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);
                            if (hex.length === 6) {
                              handleStopColorChange(index, `#${hex}`);
                            }
                          }}
                          className="flex-1 px-2 py-1 bg-slate-700 border border-slate-600 text-white text-xs font-mono uppercase"
                          maxLength={6}
                          placeholder="FA8BFF"
                        />
                      </div>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={stop.stop}
                        onChange={(e) => handleStopPositionChange(index, parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 bg-slate-700 border border-slate-600 text-white text-xs text-center"
                      />
                      {value.stops.length > 2 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeStop(index)}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-red-400 hover:bg-red-950/20"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {expandedStop === index && (
                    <div className="pl-2">
                      <HexColorPicker
                        color={stop.color}
                        onChange={(color) => handleStopColorChange(index, color)}
                        style={{ width: '100%', height: '150px' }}
                      />
                    </div>
                  )}

                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={stop.stop}
                    onChange={(e) => handleStopPositionChange(index, parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-600 rounded-lg appearance-none slider"
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {useBrandColors && (
        <p className="text-xs text-slate-500 italic">
          Using brand colors automatically. Disable "Use Brand Color" to customize gradient.
        </p>
      )}
    </div>
  );
}
