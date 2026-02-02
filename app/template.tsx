"use client";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		// iOS Safari: pinch zoom を止める（スクロールは止めない）
		document.addEventListener("gesturestart", (e) => e.preventDefault(), {
			passive: false,
		});
		document.addEventListener("gesturechange", (e) => e.preventDefault(), {
			passive: false,
		});
		document.addEventListener("gestureend", (e) => e.preventDefault(), {
			passive: false,
		});
	}, []);
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 1.05 }}
			transition={{ duration: 0.3, ease: "easeOut" }}
		>
			{children}
		</motion.div>
	);
}
