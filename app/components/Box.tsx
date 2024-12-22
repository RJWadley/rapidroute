import { styled } from "@linaria/react"
import { AnimatePresence, motion } from "motion/react"

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
		<AnimatePresence mode="popLayout" initial={false}>
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

const Wrapper = styled(motion.div)`
	margin: 5px;
	background: #eeed;
	overflow: clip;
	position: relative;
`
