/**
 * Skin Presets Utility
 * Provides preset-based styling for icon/label skins: gradient, minimal, framed, boxed, flat
 */

/**
 * Calculate contrast color (white or black) based on background color luminance
 */
function contrast(hex: string): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma < 140 ? "#fff" : "#111";
}

/**
 * Lighten or darken a hex color by percentage
 * @param hex - Base color in hex format
 * @param pct - Percentage to adjust (positive = lighter, negative = darker)
 */
function shade(hex: string, pct: number): string {
  const c = hex.replace("#", "");
  let r = parseInt(c.substr(0, 2), 16);
  let g = parseInt(c.substr(2, 2), 16);
  let b = parseInt(c.substr(4, 2), 16);
  
  const s = (v: number) => Math.max(0, Math.min(255, Math.round(v * (100 + pct) / 100)));
  r = s(r);
  g = s(g);
  b = s(b);
  
  const h = (v: number) => ("0" + v.toString(16)).slice(-2);
  return `#${h(r)}${h(g)}${h(b)}`;
}

export interface SkinStyles {
  icon: {
    background?: string;
    color?: string;
    border?: string;
    borderRight?: string;
  };
  label: {
    background?: string;
    color?: string;
    border?: string;
    borderBottom?: string;
  };
}

/**
 * Get preset styles for a specific skin type
 * @param skin - Skin type: 'gradient' | 'minimal' | 'framed' | 'boxed' | 'flat'
 * @param baseColor - Primary color for the skin (e.g., icon color)
 * @param matchLabelToIconSkin - Whether label should inherit icon styling
 */
export function getSkinStyles(
  skin: string,
  baseColor: string,
  matchLabelToIconSkin: boolean = false
): SkinStyles {
  const base = baseColor;
  const onBase = contrast(base);

  const styles: SkinStyles = {
    icon: {},
    label: {},
  };

  switch (skin) {
    case "gradient":
      {
        const grad = `linear-gradient(90deg, ${shade(base, -8)} 0%, ${base} 50%, ${shade(base, 10)} 100%)`;
        styles.icon.background = grad;
        styles.icon.color = onBase;
        styles.label.background = grad;
        styles.label.color = onBase;
      }
      break;

    case "minimal":
      styles.icon.background = shade(base, 35);
      styles.icon.color = onBase;
      styles.label.background = "#fff";
      styles.label.color = "#111";
      styles.label.borderBottom = `1px solid ${shade(base, 10)}`;
      break;

    case "framed":
      styles.icon.background = "#fff";
      styles.icon.color = base;
      styles.icon.border = `2px solid ${base}`;
      styles.icon.borderRight = "0"; // Join visually
      styles.label.background = "#fff";
      styles.label.color = base;
      styles.label.border = `2px solid ${base}`;
      break;

    case "boxed":
      styles.icon.background = base;
      styles.icon.color = onBase;
      styles.label.background = "#fff";
      styles.label.color = "#111";
      styles.label.border = `2px solid ${shade(base, -5)}`;
      break;

    case "flat":
      styles.icon.background = base;
      styles.icon.color = onBase;
      if (matchLabelToIconSkin) {
        styles.label.background = base;
        styles.label.color = onBase;
      } else {
        styles.label.background = "#fff";
        styles.label.color = base;
        styles.label.border = `2px solid ${base}`;
      }
      break;

    default:
      // Default/fallback styling
      styles.icon.background = base;
      styles.icon.color = onBase;
      styles.label.background = "#fff";
      styles.label.color = "#111";
      break;
  }

  return styles;
}
