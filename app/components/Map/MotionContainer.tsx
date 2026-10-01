import { extend } from "@pixi/react"
import {
	type SpringOptions,
	useMotionValueEvent,
	useSpring,
} from "motion/react"
import { Container } from "pixi.js"
import { type ComponentProps, type RefObject, useEffect, useRef } from "react"

extend({ Container })

const supportedValues = ["x", "y", "alpha"] as const

type SupportedValues = {
	[K in (typeof supportedValues)[number]]?: number
}

const err = (value: string) => {
	throw new Error(`MotionContainer: a value for ${value} is required`)
}

export function MotionContainer({
	initial,
	animate,
	options,
	ref,
	...containerProps
}: {
	initial?: SupportedValues
	animate?: SupportedValues
	options?: SpringOptions
	ref?: RefObject<Container | null>
} & ComponentProps<"pixiContainer">) {
	const internalRef = useRef<Container>(null)
	const containerRef = ref ?? internalRef

	/**
	 * create a spring for each supported value
	 * (hooks can't be called in a loop, so each value is listed out)
	 */
	const springProps = { initial, animate, options, containerRef }
	const springs = [
		useValueSpring("x", springProps),
		useValueSpring("y", springProps),
		useValueSpring("alpha", springProps),
	] satisfies { valueName: (typeof supportedValues)[number] }[]

	/**
	 * pass value changes to the spring
	 */
	useEffect(() => {
		for (const { valueName, spring, isAnimated } of springs) {
			const value = animate?.[valueName]
			if (containerRef.current?.renderable && isAnimated && value !== undefined)
				spring.set(value)
		}
	})

	return (
		<pixiContainer
			ref={containerRef}
			{...Object.fromEntries(
				springs.map(({ valueName, spring }) => [valueName, spring.get()]),
			)}
			{...containerProps}
		/>
	)
}

function useValueSpring(
	valueName: (typeof supportedValues)[number],
	{
		initial,
		animate,
		options,
		containerRef,
	}: {
		initial?: SupportedValues
		animate?: SupportedValues
		options?: SpringOptions
		containerRef: RefObject<Container | null>
	},
) {
	const initialValue = initial?.[valueName] ?? animate?.[valueName]
	const spring = useSpring(initialValue ?? 0, options)

	const isAnimated = animate?.[valueName] !== undefined

	useMotionValueEvent(spring, "change", (value) => {
		if (!isAnimated) return

		const container = containerRef.current
		if (container) container[valueName] = value
		if (container && valueName === "alpha") container.visible = value > 0
	})

	return { valueName, spring, isAnimated }
}
