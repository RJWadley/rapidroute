import { theme } from "app/utils/theme"
import { AnimatePresence, motion } from "motion/react"
import { styled } from "restyle"

export default function Box({
	children,
	className,
	isVisible = true,
	animated = true,
}: {
	children: React.ReactNode
	className?: string
	isVisible?: boolean
	animated?: boolean
}) {
	return (
		<AnimatePresence mode="popLayout">
			{isVisible && (
				<Wrapper
					initial={animated ? { opacity: 0 } : false}
					animate={{ opacity: 1 }}
					exit={animated ? { opacity: 0 } : undefined}
					layout={animated}
					style={{ borderRadius: 28 }}
					className={className}
				>
					{children}
				</Wrapper>
			)}
		</AnimatePresence>
	)
}

const Wrapper = styled(motion.div, {
	margin: "5px",
	background: theme.cardBackground,
	color: theme.cardText,
	overflow: "clip",
	position: "relative",
})
