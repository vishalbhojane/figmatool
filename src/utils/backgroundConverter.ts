// Types for Figma background data
export interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface FigmaGradientStop {
  color: FigmaColor;
  position: number;
}

export interface FigmaGradientHandlePosition {
  x: number;
  y: number;
}

export interface FigmaSolidBackground {
  type: 'SOLID';
  blendMode: string;
  color: FigmaColor;
  opacity?: number;
}

export interface FigmaGradientBackground {
  type: 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND';
  blendMode: string;
  gradientHandlePositions: FigmaGradientHandlePosition[];
  gradientStops: FigmaGradientStop[];
  opacity?: number;
}

export type FigmaBackground = FigmaSolidBackground | FigmaGradientBackground;

// Helper function to convert Figma color to CSS rgba
export function figmaColorToRgba(color: FigmaColor, opacity?: number): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = opacity !== undefined ? opacity : color.a;
  
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// Helper function to calculate gradient angle from handle positions
function calculateGradientAngle(handlePositions: FigmaGradientHandlePosition[]): number {
  if (handlePositions.length < 2) return 0;
  
  const start = handlePositions[0];
  const end = handlePositions[1];
  
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  
  // Convert to CSS angle (0deg = top, 90deg = right)
  let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  angle = (angle + 90) % 360;
  
  return Math.round(angle);
}

// Helper function to convert gradient stops to CSS format
function gradientStopsToCSS(stops: FigmaGradientStop[]): string {
  return stops
    .sort((a, b) => a.position - b.position)
    .map(stop => {
      const color = figmaColorToRgba(stop.color);
      const position = Math.round(stop.position * 100);
      return `${color} ${position}%`;
    })
    .join(', ');
}

// Helper function to convert blend mode to CSS mix-blend-mode
function convertBlendMode(blendMode: string): string {
  const blendModeMap: Record<string, string> = {
    'NORMAL': 'normal',
    'MULTIPLY': 'multiply',
    'SCREEN': 'screen',
    'OVERLAY': 'overlay',
    'DARKEN': 'darken',
    'LIGHTEN': 'lighten',
    'COLOR_DODGE': 'color-dodge',
    'COLOR_BURN': 'color-burn',
    'HARD_LIGHT': 'hard-light',
    'SOFT_LIGHT': 'soft-light',
    'DIFFERENCE': 'difference',
    'EXCLUSION': 'exclusion',
    'HUE': 'hue',
    'SATURATION': 'saturation',
    'COLOR': 'color',
    'LUMINOSITY': 'luminosity',
    'PASS_THROUGH': 'normal'
  };
  
  return blendModeMap[blendMode] || 'normal';
}

// Main function to convert single background to CSS
export function convertSingleBackgroundToCSS(background: FigmaBackground): {
  background: string;
  mixBlendMode?: string;
} {
  const blendMode = convertBlendMode(background.blendMode);
  
  if (background.type === 'SOLID') {
    const color = figmaColorToRgba(background.color, background.opacity);
    return {
      background: color,
      ...(blendMode !== 'normal' && { mixBlendMode: blendMode })
    };
  }
  
  if (background.type === 'GRADIENT_LINEAR') {
    const angle = calculateGradientAngle(background.gradientHandlePositions);
    const stops = gradientStopsToCSS(background.gradientStops);
    const gradient = `linear-gradient(${angle}deg, ${stops})`;
    
    return {
      background: gradient,
      ...(blendMode !== 'normal' && { mixBlendMode: blendMode })
    };
  }
  
  // Handle other gradient types (radial, angular, diamond) - simplified implementation
  if (background.type.startsWith('GRADIENT_')) {
    const stops = gradientStopsToCSS(background.gradientStops);
    let gradient: string;
    
    switch (background.type) {
      case 'GRADIENT_RADIAL':
        gradient = `radial-gradient(circle, ${stops})`;
        break;
      case 'GRADIENT_ANGULAR':
        gradient = `conic-gradient(${stops})`;
        break;
      case 'GRADIENT_DIAMOND':
        // Diamond gradients don't have direct CSS equivalent, fallback to radial
        gradient = `radial-gradient(ellipse, ${stops})`;
        break;
      default:
        gradient = `linear-gradient(0deg, ${stops})`;
    }
    
    return {
      background: gradient,
      ...(blendMode !== 'normal' && { mixBlendMode: blendMode })
    };
  }
  
  return { background: 'transparent' };
}

// Main function to convert Figma backgrounds to CSS
export function convertFigmaBackgroundToCSS(
  backgrounds: FigmaBackground[] | undefined,
  fallbackColor?: FigmaColor
): {
  background?: string;
  backgroundImage?: string;
  mixBlendMode?: string;
  backgroundBlendMode?: string;
} {
  // Handle empty or undefined backgrounds
  if (!backgrounds || backgrounds.length === 0) {
    if (fallbackColor) {
      return { background: figmaColorToRgba(fallbackColor) };
    }
    return { background: 'transparent' };
  }
  
  // Single background
  if (backgrounds.length === 1) {
    return convertSingleBackgroundToCSS(backgrounds[0]);
  }
  
  // Multiple backgrounds - create layered backgrounds
  const backgroundLayers: string[] = [];
  const blendModes: string[] = [];
  
  backgrounds.forEach((bg, index) => {
    const converted = convertSingleBackgroundToCSS(bg);
    backgroundLayers.push(converted.background);
    
    if (converted.mixBlendMode && converted.mixBlendMode !== 'normal') {
      blendModes.push(converted.mixBlendMode);
    }
  });
  
  // For multiple backgrounds, we use background-image for layering
  const result: any = {};
  
  if (backgroundLayers.length > 1) {
    // First background becomes the base background-color if it's a solid color
    const firstBg = backgrounds[0];
    if (firstBg.type === 'SOLID') {
      result.background = figmaColorToRgba(firstBg.color, firstBg.opacity);
      // Remove the first layer from background-image since it's now background-color
      backgroundLayers.shift();
    }
    
    if (backgroundLayers.length > 0) {
      result.backgroundImage = backgroundLayers.join(', ');
    }
  } else {
    result.background = backgroundLayers[0];
  }
  
  // Handle blend modes for multiple backgrounds
  if (blendModes.length > 0) {
    result.backgroundBlendMode = blendModes.join(', ');
  }
  
  return result;
}

// Utility function to extract background from Figma node data
export function extractBackgroundFromFigmaNode(node: any): {
  background?: string;
  backgroundImage?: string;
  mixBlendMode?: string;
  backgroundBlendMode?: string;
} {
  // Try to get background from 'background' property first, then 'fills'
  const backgrounds = node.background || node.fills;
  const backgroundColor = node.backgroundColor;
  
  return convertFigmaBackgroundToCSS(backgrounds, backgroundColor);
}

// Helper function for common use cases
export function getFigmaNodeCSS(node: any): Record<string, string> {
  const backgroundCSS = extractBackgroundFromFigmaNode(node);
  const cssProperties: Record<string, string> = {};
  
  Object.entries(backgroundCSS).forEach(([key, value]) => {
    if (value) {
      // Convert camelCase to kebab-case for CSS properties
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      cssProperties[cssKey] = value;
    }
  });
  
  return cssProperties;
} 