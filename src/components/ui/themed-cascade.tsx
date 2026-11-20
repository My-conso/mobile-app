import React from 'react';
import type { ViewProps } from 'react-native';
import Animated, { Easing, FadeInDown, ReduceMotion } from 'react-native-reanimated';

interface CascadeProps extends ViewProps {
   /** Position in the cascade: each item starts 70 ms after the previous one */
   index?: number;
   /** Extra delay in ms before the cascade starts */
   delay?: number;
   className?: string;
}

/** Entrance used everywhere: rises 14 px while fading in (380 ms), staggered by 70 ms. Opacity and transform only. */
export function Cascade({ index = 0, delay = 0, ...props }: CascadeProps) {
   return (
      <Animated.View
         entering={FadeInDown.delay(delay + index * 70)
            .duration(380)
            .easing(Easing.out(Easing.cubic))
            .withInitialValues({ opacity: 0, transform: [{ translateY: 14 }] })
            .reduceMotion(ReduceMotion.System)}
         {...props}
      />
   );
}
