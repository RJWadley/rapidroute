import type { ResolvedLogo } from "app/data/logos"
import { styled } from "restyle"

/**
 * whether we can show a square icon for this logo
 */
export const hasIcon = (logo: ResolvedLogo | undefined) =>
	Boolean(
		logo?.icon ||
			logo?.cropIcon ||
			(logo?.logo && logo.logo.width / logo.logo.height <= 1.5),
	)

/**
 * a square icon, cropped from the logo if needed
 */
export function LogoIcon({
	logo,
	name,
	size = 44,
}: {
	logo: ResolvedLogo | undefined
	name: string
	size?: number
}) {
	if (!logo || !hasIcon(logo)) return null

	const image = logo.icon ?? logo.logo
	if (!image) return null

	const crop = !logo.icon && logo.cropIcon

	return (
		<Chip style={{ width: size, height: size, padding: crop ? 0 : 4 }}>
			<Image
				src={image.url}
				alt={`${name} logo`}
				loading="lazy"
				style={{
					width: "100%",
					height: "100%",
					objectFit: crop ? "cover" : "contain",
					objectPosition: crop ? "left" : "center",
				}}
			/>
		</Chip>
	)
}

/**
 * the full logo, fit within a box
 */
export function LogoFull({
	logo,
	name,
	maxWidth = 160,
	height = 44,
}: {
	logo: ResolvedLogo | undefined
	name: string
	maxWidth?: number
	height?: number
}) {
	const image = logo?.logo ?? logo?.icon
	if (!image) return null

	return (
		<Chip style={{ padding: 6 }}>
			{/* sized in pixels so the chip can shrink-wrap the image */}
			<Image
				src={image.url}
				alt={`${name} logo`}
				loading="lazy"
				style={{
					height: height - 12,
					width: "auto",
					maxWidth: maxWidth - 12,
					objectFit: "contain",
				}}
			/>
		</Chip>
	)
}

/**
 * logos are drawn for light backgrounds, so they always sit on white
 */
const Chip = styled("div", {
	background: "white",
	borderRadius: 8,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	overflow: "clip",
	flexShrink: 0,
	boxSizing: "border-box",
})

const Image = styled("img", {
	display: "block",
})
