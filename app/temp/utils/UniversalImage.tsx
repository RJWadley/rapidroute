import Image from "next/image";
import type { ComponentProps } from "react";

type NextImageProps = ComponentProps<typeof Image>;

type Source = NextImageProps["src"];

export type UniversalImageProps = Omit<NextImageProps, "src"> & {
	src: Source | null | undefined;
} & ComponentProps<"a">;

export default function UniversalImage({
	src,
	alt,
	...props
}: UniversalImageProps) {
	if (!src) return null;

	// imported images come through as objects
	if (typeof src !== "string") return <Image {...props} src={src} alt={alt} />;

	// eslint-disable-next-line @next/next/no-img-element
	return <img {...props} src={src} alt={alt} />;
}
