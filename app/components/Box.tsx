import { theme } from "app/utils/theme"
import { AnimatePresence, motion } from "motion/react"
import { styled } from "restyle"

export default function Box({
	children,
	className,
	isVisible = true,
}: {
	children: React.ReactNode
	className?: string
	isVisible?: boolean
}) {
	return (
		<AnimatePresence mode="popLayout">
			{isVisible && (
				<Wrapper
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					layout
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
