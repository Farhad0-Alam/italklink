import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface PanelProps {
  data: any;
  onChange: (data: any) => void;
  cardData?: any;
}

export function TypographyPanel({ data, onChange, cardData }: PanelProps & { 
  showAlignment?: boolean;
  defaultColor?: string;
  colorLabel?: string;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Font Family</label>
        <select
          value={data.fontFamily || "inherit"}
          onChange={(e) => onChange({ ...data, fontFamily: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
        >
          <option value="inherit">Theme Default</option>
          <option value="'Inter', sans-serif">Inter</option>
          <option value="'Roboto', sans-serif">Roboto</option>
          <option value="'Open Sans', sans-serif">Open Sans</option>
          <option value="'Poppins', sans-serif">Poppins</option>
          <option value="'Montserrat', sans-serif">Montserrat</option>
          <option value="'Playfair Display', serif">Playfair Display</option>
          <option value="'Georgia', serif">Georgia</option>
          <option value="monospace">Monospace</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Font Size</label>
          <select
            value={data.fontSize || ""}
            onChange={(e) => onChange({ ...data, fontSize: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
          >
            <option value="">Default</option>
            <option value="12px">12px</option>
            <option value="14px">14px</option>
            <option value="16px">16px</option>
            <option value="18px">18px</option>
            <option value="20px">20px</option>
            <option value="24px">24px</option>
            <option value="28px">28px</option>
            <option value="32px">32px</option>
            <option value="36px">36px</option>
            <option value="48px">48px</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Font Weight</label>
          <select
            value={data.fontWeight || ""}
            onChange={(e) => onChange({ ...data, fontWeight: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
          >
            <option value="">Default</option>
            <option value="300">Light</option>
            <option value="400">Normal</option>
            <option value="500">Medium</option>
            <option value="600">Semi-Bold</option>
            <option value="700">Bold</option>
            <option value="800">Extra Bold</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Text Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={data.color || cardData?.headingColor || "#0f0f0f"}
            onChange={(e) => onChange({ ...data, color: e.target.value })}
            className="w-10 h-10 rounded cursor-pointer border border-gray-300"
          />
          <span className="text-xs text-gray-500">{data.color || "Theme default"}</span>
          {data.color && (
            <button
              onClick={() => onChange({ ...data, color: undefined })}
              className="text-xs text-orange-500 hover:text-orange-600 ml-auto"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Alignment</label>
        <div className="flex gap-1">
          {['left', 'center', 'right', 'justify'].map(align => (
            <button
              key={align}
              onClick={() => onChange({ ...data, alignment: align })}
              className={`flex-1 py-2 px-3 text-sm rounded border ${
                (data.alignment || 'left') === align 
                  ? 'border-orange-500 bg-orange-50 text-orange-600' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <i className={`fas fa-align-${align}`} />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Line Height</label>
        <select
          value={data.lineHeight || ""}
          onChange={(e) => onChange({ ...data, lineHeight: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
        >
          <option value="">Default</option>
          <option value="1">1 (Tight)</option>
          <option value="1.25">1.25</option>
          <option value="1.5">1.5</option>
          <option value="1.75">1.75</option>
          <option value="2">2 (Loose)</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Letter Spacing</label>
        <select
          value={data.letterSpacing || ""}
          onChange={(e) => onChange({ ...data, letterSpacing: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
        >
          <option value="">Default</option>
          <option value="-0.05em">Tighter</option>
          <option value="-0.025em">Tight</option>
          <option value="0">Normal</option>
          <option value="0.025em">Wide</option>
          <option value="0.05em">Wider</option>
          <option value="0.1em">Widest</option>
        </select>
      </div>
    </div>
  );
}

export function SpacingPanel({ data, onChange }: PanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Margin Top</label>
        <input
          type="range"
          min="0"
          max="80"
          value={parseInt(data.marginTop || "0")}
          onChange={(e) => onChange({ ...data, marginTop: e.target.value + "px" })}
          className="w-full"
        />
        <span className="text-xs text-gray-500">{data.marginTop || "0px"}</span>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Margin Bottom</label>
        <input
          type="range"
          min="0"
          max="80"
          value={parseInt(data.marginBottom || "0")}
          onChange={(e) => onChange({ ...data, marginBottom: e.target.value + "px" })}
          className="w-full"
        />
        <span className="text-xs text-gray-500">{data.marginBottom || "0px"}</span>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Padding</label>
        <input
          type="range"
          min="0"
          max="40"
          value={parseInt(data.padding || "0")}
          onChange={(e) => onChange({ ...data, padding: e.target.value + "px" })}
          className="w-full"
        />
        <span className="text-xs text-gray-500">{data.padding || "0px"}</span>
      </div>
    </div>
  );
}

export function BackgroundPanel({ data, onChange }: PanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={data.enableBackground || false}
            onChange={(e) => onChange({ ...data, enableBackground: e.target.checked })}
            className="rounded border-gray-300 w-4 h-4"
          />
          Enable Background
        </label>
      </div>

      {data.enableBackground && (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Background Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.backgroundColor || "#ffffff"}
                onChange={(e) => onChange({ ...data, backgroundColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border border-gray-300"
              />
              <span className="text-xs text-gray-500">{data.backgroundColor || "#ffffff"}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Border Radius</label>
            <input
              type="range"
              min="0"
              max="24"
              value={parseInt(data.borderRadius || "0")}
              onChange={(e) => onChange({ ...data, borderRadius: e.target.value + "px" })}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{data.borderRadius || "0px"}</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Border Width</label>
            <input
              type="range"
              min="0"
              max="4"
              value={parseInt(data.borderWidth || "0")}
              onChange={(e) => onChange({ ...data, borderWidth: e.target.value + "px" })}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{data.borderWidth || "0px"}</span>
          </div>

          {parseInt(data.borderWidth || "0") > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Border Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={data.borderColor || "#e5e7eb"}
                  onChange={(e) => onChange({ ...data, borderColor: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                />
                <span className="text-xs text-gray-500">{data.borderColor || "#e5e7eb"}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function ShadowPanel({ data, onChange }: PanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={data.enableShadow || false}
            onChange={(e) => onChange({ ...data, enableShadow: e.target.checked })}
            className="rounded border-gray-300 w-4 h-4"
          />
          Enable Shadow
        </label>
      </div>

      {data.enableShadow && (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Shadow Preset</label>
            <select
              value={data.shadowPreset || "md"}
              onChange={(e) => onChange({ ...data, shadowPreset: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
              <option value="xl">Extra Large</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {data.shadowPreset === "custom" && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Shadow Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={data.shadowColor || "#000000"}
                    onChange={(e) => onChange({ ...data, shadowColor: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Shadow Blur</label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={parseInt(data.shadowBlur || "10")}
                  onChange={(e) => onChange({ ...data, shadowBlur: e.target.value })}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{data.shadowBlur || "10"}px</span>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Shadow Opacity</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={parseInt(data.shadowOpacity || "25")}
                  onChange={(e) => onChange({ ...data, shadowOpacity: e.target.value })}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{data.shadowOpacity || "25"}%</span>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export function VisibilitySettingsPanel({ data, onChange }: PanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={data.visible !== false}
            onChange={(e) => onChange({ ...data, visible: e.target.checked })}
            className="rounded border-gray-300 w-5 h-5"
          />
          Element Visible
        </label>
        <p className="text-xs text-gray-500 mt-1 ml-7">Hide this element without deleting it</p>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={data.hideOnMobile || false}
            onChange={(e) => onChange({ ...data, hideOnMobile: e.target.checked })}
            className="rounded border-gray-300 w-4 h-4"
          />
          Hide on Mobile
        </label>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={data.hideOnDesktop || false}
            onChange={(e) => onChange({ ...data, hideOnDesktop: e.target.checked })}
            className="rounded border-gray-300 w-4 h-4"
          />
          Hide on Desktop
        </label>
      </div>
    </div>
  );
}

export function AdvancedSettingsPanel({ data, onChange }: PanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">CSS Classes</label>
        <Input
          value={data.cssClasses || ""}
          onChange={(e) => onChange({ ...data, cssClasses: e.target.value })}
          placeholder="custom-class another-class"
          className="text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">Add custom CSS classes</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Custom ID</label>
        <Input
          value={data.customId || ""}
          onChange={(e) => onChange({ ...data, customId: e.target.value })}
          placeholder="my-element-id"
          className="text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">Add a custom HTML ID</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Z-Index</label>
        <Input
          type="number"
          value={data.zIndex || ""}
          onChange={(e) => onChange({ ...data, zIndex: e.target.value })}
          placeholder="auto"
          className="text-sm"
        />
      </div>
    </div>
  );
}

export function AnimationPanel({ data, onChange }: PanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Entrance Animation</label>
        <select
          value={data.animation || "none"}
          onChange={(e) => onChange({ ...data, animation: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
        >
          <option value="none">None</option>
          <option value="fadeIn">Fade In</option>
          <option value="slideUp">Slide Up</option>
          <option value="slideDown">Slide Down</option>
          <option value="slideLeft">Slide Left</option>
          <option value="slideRight">Slide Right</option>
          <option value="zoomIn">Zoom In</option>
          <option value="bounce">Bounce</option>
        </select>
      </div>

      {data.animation && data.animation !== "none" && (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Animation Duration</label>
            <select
              value={data.animationDuration || "0.5s"}
              onChange={(e) => onChange({ ...data, animationDuration: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="0.3s">Fast (0.3s)</option>
              <option value="0.5s">Normal (0.5s)</option>
              <option value="0.8s">Slow (0.8s)</option>
              <option value="1s">Very Slow (1s)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Animation Delay</label>
            <select
              value={data.animationDelay || "0s"}
              onChange={(e) => onChange({ ...data, animationDelay: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="0s">None</option>
              <option value="0.1s">0.1s</option>
              <option value="0.2s">0.2s</option>
              <option value="0.3s">0.3s</option>
              <option value="0.5s">0.5s</option>
              <option value="1s">1s</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
}

export function HoverEffectsPanel({ data, onChange }: PanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={data.enableHover || false}
            onChange={(e) => onChange({ ...data, enableHover: e.target.checked })}
            className="rounded border-gray-300 w-4 h-4"
          />
          Enable Hover Effects
        </label>
      </div>

      {data.enableHover && (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Hover Effect</label>
            <select
              value={data.hoverEffect || "none"}
              onChange={(e) => onChange({ ...data, hoverEffect: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="none">None</option>
              <option value="scale">Scale Up</option>
              <option value="lift">Lift (Shadow)</option>
              <option value="glow">Glow</option>
              <option value="colorShift">Color Shift</option>
            </select>
          </div>

          {data.hoverEffect === "colorShift" && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Hover Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={data.hoverColor || "#3b82f6"}
                  onChange={(e) => onChange({ ...data, hoverColor: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
