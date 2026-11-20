import React from 'react';
import { useKeyboardState } from 'react-native-keyboard-controller';
import Animated, { FadeInDown, FadeOutDown, ReduceMotion } from 'react-native-reanimated';
import { cn } from '@/src/utils/tailwind';

interface FormFooterProps {
   children: React.ReactNode;
   className?: string;
   gap?: 'sm' | 'md';
}

const GAPS = { sm: 'gap-2', md: 'gap-3' } as const;

/**
 * Pinned action area under a form (Save…). It slides away while the keyboard is open: otherwise it floats
 * right above the keyboard, eats the little room left and covers the field being typed in.
 */
export function FormFooter({ children, className, gap }: FormFooterProps) {
   const keyboardVisible = useKeyboardState(s => s.isVisible);
   if (keyboardVisible) return null;
   return (
      <Animated.View
         entering={FadeInDown.duration(220).reduceMotion(ReduceMotion.System)}
         exiting={FadeOutDown.duration(140).reduceMotion(ReduceMotion.System)}
         className={cn('px-5 pt-2 pb-7', gap && GAPS[gap], className)}>
         {children}
      </Animated.View>
   );
}
