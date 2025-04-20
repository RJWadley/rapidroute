import * as motion from "motion/react-client"
import { styled } from "restyle"

export default function Keyframes({ background }: { background: string }) {
	return (
		<div>
			<Wrapper
				style={{ backgroundColor: background }}
				animate={{
					scale: [1, 2, 2, 1, 1],
					rotate: [0, 0, 180, 180, 0],
					borderRadius: ["0%", "0%", "50%", "50%", "0%"],
				}}
				transition={{
					duration: 2,
					ease: "easeInOut",
					times: [0, 0.2, 0.5, 0.8, 1],
					repeat: Number.POSITIVE_INFINITY,
					repeatDelay: 1,
				}}
			/>
		</div>
	)
}

const Wrapper = styled(motion.div, {
	width: 100,
	height: 100,
	border: "1px solid black",
	borderRadius: 5,
	margin: 50,
	position: "relative",
	zIndex: 1,
})
