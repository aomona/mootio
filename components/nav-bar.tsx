"use client";

import Head from "next/head";
import Image from "next/image";
import { useState } from "react";

type NavBarProps = {
	className?: string;
	state?: "shake" | "collection" | "profile";
	defaultState?: "shake" | "collection" | "profile";
	onStateChange?: (state: "shake" | "collection" | "profile") => void;
};

export function NavBar({
	className,
	state,
	defaultState = "shake",
	onStateChange,
}: NavBarProps) {
	const isControlled = state !== undefined && onStateChange !== undefined;
	const [internalState, setInternalState] = useState(
		() => state ?? defaultState,
	);
	const activeState = isControlled ? state : internalState;
	const rootClassName = [
		"flex w-[340px] items-center gap-[4px] rounded-[333px] bg-[rgba(255,255,255,0.12)] p-[4px] backdrop-blur-[12px]",
		className ?? "",
	]
		.join(" ")
		.trim();
	const isShake = activeState === "shake";
	const isCollection = activeState === "collection";
	const isProfile = activeState === "profile";
	const showText = (value: string) => (
		<span className="whitespace-nowrap text-[16px] font-bold leading-normal text-[#ff7f11]">
			{value}
		</span>
	);

	const handleChange = (nextState: "shake" | "collection" | "profile") => {
		if (!isControlled) {
			setInternalState(nextState);
		}
		onStateChange?.(nextState);
	};

	return (
		<nav className={rootClassName} aria-label="Bottom navigation">
			<Head>
				<link rel="preload" href="/icons/icon-shake-active.svg" as="image" />
				<link rel="preload" href="/icons/icon-shake-inactive.svg" as="image" />
				<link
					rel="preload"
					href="/icons/icon-collection-active.svg"
					as="image"
				/>
				<link
					rel="preload"
					href="/icons/icon-collection-inactive.svg"
					as="image"
				/>
				<link rel="preload" href="/icons/icon-profile-active.svg" as="image" />
				<link
					rel="preload"
					href="/icons/icon-profile-inactive.svg"
					as="image"
				/>
			</Head>
			<button
				type="button"
				className={[
					"flex items-center justify-center overflow-hidden rounded-[999px] p-6 transition-[flex-basis,flex-grow,background-color] duration-300 ease-out",
					isShake
						? "min-h-px min-w-px basis-0 grow gap-2.5 bg-white"
						: "basis-18 shrink-0 grow-0 bg-[rgba(255,255,255,0.12)]",
				].join(" ")}
				aria-pressed={isShake}
				onClick={() => handleChange("shake")}
			>
				<Image
					alt=""
					className="h-6 w-6"
					src={
						isShake
							? "/icons/icon-shake-active.svg"
							: "/icons/icon-shake-inactive.svg"
					}
					width={24}
					height={24}
				/>
				{isShake ? showText("Shake!") : null}
			</button>
			<button
				type="button"
				className={[
					"flex items-center justify-center overflow-hidden rounded-[999px] p-6 transition-[flex-basis,flex-grow,background-color] duration-300 ease-out",
					isCollection
						? "min-h-px min-w-px basis-0 grow gap-2.5 bg-white"
						: "basis-18 shrink-0 grow-0 bg-[rgba(255,255,255,0.12)]",
				].join(" ")}
				aria-pressed={isCollection}
				onClick={() => handleChange("collection")}
			>
				<Image
					alt=""
					className="h-6 w-6"
					width={24}
					height={24}
					src={
						isCollection
							? "/icons/icon-collection-active.svg"
							: "/icons/icon-collection-inactive.svg"
					}
				/>
				{isCollection ? showText("コレクション") : null}
			</button>
			<button
				type="button"
				className={[
					"flex items-center justify-center overflow-hidden rounded-[999px] p-6 transition-[flex-basis,flex-grow,background-color] duration-300 ease-out",
					isProfile
						? "min-h-px min-w-px basis-0 grow gap-2.5 bg-white"
						: "basis-18 shrink-0 grow-0 bg-[rgba(255,255,255,0.12)]",
				].join(" ")}
				aria-pressed={isProfile}
				onClick={() => handleChange("profile")}
			>
				<Image
					alt=""
					className="h-6 w-6"
					width={24}
					height={24}
					src={
						isProfile
							? "/icons/icon-profile-active.svg"
							: "/icons/icon-profile-inactive.svg"
					}
				/>
				{isProfile ? showText("プロフィール") : null}
			</button>
		</nav>
	);
}
