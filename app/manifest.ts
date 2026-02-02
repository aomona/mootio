import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Mootio",
		short_name: "Mootio",
		description: "チェーンを繋いで、健康に",
		start_url: "/app/shake ",
		display: "standalone",
		background_color: "#ffffff",
		theme_color: "#C2E812",
		icons: [
			{
				sizes: "192x192",
				src: "icon192_rounded.png",
				type: "image/png",
			},
			{
				sizes: "512x512",
				src: "icon512_rounded.png",
				type: "image/png",
			},
		],
	};
}
