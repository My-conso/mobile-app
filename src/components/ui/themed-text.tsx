import { cn } from '@/src/utils/tailwind';
import React from 'react';
import { Text, TextProps } from 'react-native';

export type TextVariant =
   | 'h1'
   | 'h2'
   | 'h3'
   | 'body-large'
   | 'body'
   | 'body-small'
   | 'caption'
   | 'overline'
   | 'button'
   | 'label';

export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type TextColor =
   | 'default'
   | 'secondary'
   | 'muted'
   | 'faint'
   | 'inverse'
   | 'primary'
   | 'accent'
   | 'danger'
   | 'success'
   | 'warning'
   | 'info';
export type TextAlign = 'left' | 'center' | 'right' | 'justify';
export type TextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize';

export interface ThemedTextProps extends TextProps {
   /** Text content */
   children: React.ReactNode;

   /** Typography variant */
   variant?: TextVariant;

   /** Font weight */
   weight?: TextWeight;

   /** Text color */
   color?: TextColor;

   /** Figure: Space Grotesk with tabular digits (all numbers shown big) */
   numeric?: boolean;

   /** Text alignment */
   align?: TextAlign;

   /** Text transform */
   transform?: TextTransform;

   /** Number of lines before truncating */
   numberOfLines?: number;

   /** Whether text should be underlined */
   underline?: boolean;

   /** Whether text should be italic */
   italic?: boolean;

   /** Letter spacing */
   tracking?: 'tighter' | 'tight' | 'normal' | 'wide' | 'wider';

   /** Line height */
   leading?: 'none' | 'tight' | 'normal' | 'relaxed' | 'loose';

   /** Custom className */
   className?: string;

   /** Test ID */
   testID?: string;
}

// Variant = size (+ default weight). The font family is resolved separately: Inter for texts,
// Space Grotesk for figures, one family per weight (custom fonts have no real font-weight).
const variantStyles: Record<TextVariant, { size: string; weight: TextWeight }> = {
   h1: { size: 'text-3xl', weight: 'bold' },
   h2: { size: 'text-[22px]', weight: 'bold' },
   h3: { size: 'text-lg', weight: 'semibold' },
   'body-large': { size: 'text-[17px]', weight: 'normal' },
   body: { size: 'text-[15px]', weight: 'normal' },
   'body-small': { size: 'text-sm', weight: 'normal' },
   caption: { size: 'text-[13px]', weight: 'normal' },
   overline: { size: 'text-xs uppercase tracking-wider', weight: 'medium' },
   button: { size: 'text-base', weight: 'semibold' },
   label: { size: 'text-[13px]', weight: 'normal' },
};

// Inter (texts)
const textFamily: Record<TextWeight, string> = {
   normal: 'font-sans',
   medium: 'font-sans-medium',
   semibold: 'font-sans-semibold',
   bold: 'font-sans-semibold',
};

// Space Grotesk (figures)
const numericFamily: Record<TextWeight, string> = {
   normal: 'font-display',
   medium: 'font-display',
   semibold: 'font-display-semibold',
   bold: 'font-display-bold',
};

// Text colors using your CSS variables
const colorStyles = {
   default: 'text-foreground',
   secondary: 'text-foreground-secondary',
   muted: 'text-foreground-muted',
   faint: 'text-foreground-faint',
   inverse: 'text-foreground-inverse',
   primary: 'text-primary',
   accent: 'text-accent',
   danger: 'text-danger',
   success: 'text-success',
   warning: 'text-warning',
   info: 'text-info',
};

// Text alignment
const alignStyles = {
   left: 'text-left',
   center: 'text-center',
   right: 'text-right',
   justify: 'text-justify',
};

// Text transform
const transformStyles = {
   none: '',
   uppercase: 'uppercase',
   lowercase: 'lowercase',
   capitalize: 'capitalize',
};

// Letter spacing
const trackingStyles = {
   tighter: 'tracking-tighter',
   tight: 'tracking-tight',
   normal: 'tracking-normal',
   wide: 'tracking-wide',
   wider: 'tracking-wider',
};

// Line height
const leadingStyles = {
   none: 'leading-none',
   tight: 'leading-tight',
   normal: 'leading-normal',
   relaxed: 'leading-relaxed',
   loose: 'leading-loose',
};

/**
 * A themed text component with various styles and states.
 *
 * @param {string} children - Text content
 * @param {TextVariant} variant - Text variant (default: 'body')
 * @param {TextWeight} weight - Text weight (optional)
 * @param {TextColor} color - Text color (default: 'default')
 * @param {TextAlign} align - Text alignment (default: 'left')
 * @param {TextTransform} transform - Text transform (default: 'none')
 * @param {number} numberOfLines - Maximum number of lines to show (optional)
 * @param {boolean} underline - Show underline (default: false)
 * @param {boolean} italic - Make text italic (default: false)
 * @param {string} tracking - Text tracking (default: 'normal')
 * @param {string} leading - Text leading (default: undefined)
 * @param {string} className - Additional class names for the container (optional)
 * @param {string} testID - Test ID for the component (optional)
 */
/** Tailwind classes of a text (shared with figures that animate on the UI thread, see AnimatedNumber). */
export function textClassName({
   variant = 'body',
   weight,
   color = 'default',
   numeric = false,
   className = '',
}: Pick<ThemedTextProps, 'variant' | 'weight' | 'color' | 'numeric' | 'className'>): string {
   return cn(
      variantStyles[variant].size,
      (numeric || variant === 'h1' || variant === 'h2' ? numericFamily : textFamily)[
         weight ?? variantStyles[variant].weight
      ],
      numeric && 'tabular-nums',
      colorStyles[color],
      className
   );
}

export const ThemedText: React.FC<ThemedTextProps> = ({
   children,
   variant = 'body',
   weight,
   color = 'default',
   numeric = false,
   align = 'left',
   transform = 'none',
   numberOfLines,
   underline = false,
   italic = false,
   tracking = 'normal',
   leading,
   className = '',
   testID,
   ...props
}) => {
   // Combine all classes
   const textClasses = cn(
      // Size, then the font family for the effective weight
      variantStyles[variant].size,
      // Titles (h1, h2) and figures are Kanit italic; running text is Inter, never italic
      (numeric || variant === 'h1' || variant === 'h2' ? numericFamily : textFamily)[
         weight ?? variantStyles[variant].weight
      ],
      numeric && 'tabular-nums',

      // Color
      colorStyles[color],

      // Alignment
      alignStyles[align],

      // Transform
      transformStyles[transform],

      // Tracking
      trackingStyles[tracking],

      // Leading (if provided, overrides variant leading)
      leading && leadingStyles[leading],

      // Decoration
      underline && 'underline',
      italic && 'italic',

      // Custom classes
      className
   );

   return (
      <Text className={textClasses} numberOfLines={numberOfLines} testID={testID} {...props}>
         {children}
      </Text>
   );
};
