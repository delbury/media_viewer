import theme from '#/style/theme';
import { useCallback, useRef } from 'react';

// 预设的动画
const PRESET_ANIMATIONS = {
  rotate360: {
    frames: [{ transform: 'rotateZ(0deg)' }, { transform: 'rotateZ(360deg)' }],
    options: {
      easing: 'ease-in-out',
      duration: theme.transitions.duration.standard,
    },
  },
} satisfies Record<
  string,
  {
    frames: AnimateParamsKeys;
    options?: KeyframeAnimationOptions;
  }
>;
type PresetAnimations = keyof typeof PRESET_ANIMATIONS;

type AnimateParamsKeys = Parameters<Animatable['animate']>[0];

const createAnimation = (
  elm: HTMLElement,
  keys: AnimateParamsKeys,
  opts?: KeyframeAnimationOptions
) => {
  return elm.animate(keys, {
    duration: theme.transitions.duration.shorter,
    iterations: 1,
    ...opts,
  });
};

export const useElementAnimation = <T extends HTMLElement>() => {
  const domRef = useRef<T>(null);
  const animation = useRef<Animation>(null);

  const startByPreset = useCallback(
    (key: PresetAnimations) => {
      if (domRef.current) {
        if (animation.current) {
          animation.current.finish();
          animation.current = null;
        }
        const preset = PRESET_ANIMATIONS[key];
        const instance = createAnimation(domRef.current, preset.frames, preset.options);
        instance.onfinish = () => {
          animation.current = null;
        };
        animation.current = instance;
      }
    },
    [domRef]
  );

  return {
    domRef,
    startByPreset,
  };
};
