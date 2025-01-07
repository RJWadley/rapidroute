import probe from "probe-image-size"
import "server-only"

export async function loadImageDimensions(
	src: string,
): Promise<{ width: number; height: number; src: string }> {
	const { width, height } = await probe(src)

	return { width, height, src }
}
