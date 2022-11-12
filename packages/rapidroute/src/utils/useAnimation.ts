import { DependencyList, EffectCallback, useEffect } from "react"

import gsap from "gsap"

/**
 * A utility hook that abstracts away the react boilerplate of gsap animation.
 * This hook will take care of cleaning up the animation and clearing inline styles when the component is unmounted or when the dependencies change.
 * ```tsx
 * useAnimation(() => {
 *   gsap.to(wrapperEl, {
 *     duration: 1,
 *     x: 100,
 *   })
 * }, [wrapperEl])
 *  ```
 * @param createAnimations - function that creates the animations
 * @param deps - any dependencies that should cause the animations to be re-created
 */
const useAnimation = (
  createAnimations: EffectCallback,
  deps: DependencyList = [],
  options?: {
    scope?: string | object | Element | null
    kill?: boolean
  }
) => {
  useEffect(() => {
    // create animations using a gsap context so they can be reverted easily
    const ctx = gsap.context(createAnimations, options?.scope || undefined)
    return () => {
      if (options?.kill) {
        ctx.kill()
      } else ctx.revert()
    }

    // have to spread deps here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.kill, options?.scope, ...deps])
}

export default useAnimation
