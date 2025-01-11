import { extend } from "@pixi/react"
import {
	useMotionValueEvent,
	useSpring,
	type SpringOptions,
} from "motion/react"
import { Container } from "pixi.js"
import { useEffect, useRef, type ComponentProps, type RefObject } from "react"

extend({ Container })

const supportedValues = [
	{ key: "x", fallback: undefined },
	{ key: "y", fallback: undefined },
	{ key: "alpha", fallback: 1 },
] as const

type SupportedValues = {
	[K in (typeof supportedValues)[number]["key"]]?: number
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
	initial?: Partial<SupportedValues>
	animate?: Partial<SupportedValues>
	options?: SpringOptions
	ref?: RefObject<Container | null>
} & ComponentProps<"pixiContainer">) {
	const internalRef = useRef<Container>(null)
	const containerRef = ref ?? internalRef

	const getInitialValue = (key: keyof SupportedValues, fallback?: number) => {
		return (
			initial?.[key] ??
			animate?.[key] ??
			containerProps[key] ??
			fallback ??
			err(key)
		)
	}

	const springs = supportedValues.map(({ key, fallback }) => {
		const spring = useSpring(getInitialValue(key, fallback), options)

		useMotionValueEvent(spring, "change", (value) => {
			const container = containerRef.current
			if (container) container[key] = value
			if (container && key === "alpha") container.visible = value > 0
		})

		return { key, spring, fallback }
	})

	useEffect(() => {
		for (const { key, spring, fallback } of springs) {
			const value = animate?.[key] ?? fallback ?? undefined
			if (containerRef.current?.renderable && value !== undefined)
				spring.set(value)
		}
	})

	return (
		<pixiContainer
			{...containerProps}
			ref={containerRef}
			{...Object.fromEntries(
				springs.map(({ key, spring }) => [key, spring.get()]),
			)}
		/>
	)
}
