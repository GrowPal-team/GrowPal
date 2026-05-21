import Image, { type ImageProps } from "next/image"
import { resolvePublicUrl } from "@/lib/asset-path"

type PublicImageProps = Omit<ImageProps, "src"> & {
  src: string
}

/** next/image wrapper — applies GitHub Pages base path to local /images and /Web assets. */
export function PublicImage({ src, ...props }: PublicImageProps) {
  return <Image src={resolvePublicUrl(src)} {...props} />
}
