"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavBarProps = {
	userId?: string;
	className?: string;
};

export function NavBar({ className, userId }: NavBarProps) {
	const pathname = usePathname();
	const rootClassName = [
		"flex w-[340px] items-center gap-[4px] rounded-[333px] bg-[rgba(255,255,255,0.12)] p-[4px] backdrop-blur-[12px]",
		className ?? "",
	]
		.join(" ")
		.trim();
	const isRouteActive = (href: string) => {
		if (!pathname) {
			return false;
		}
		return pathname === href || pathname.startsWith(`${href}/`);
	};
	const isShake = isRouteActive("/app/shake");
	const isCollection = isRouteActive("/app/collections");
	const isProfile = isRouteActive("/app/profile");
	const profileHref = userId ? `/app/profile/${userId}` : "/app/profile";

	return (
		<nav className={rootClassName} aria-label="Bottom navigation">
			<NavLink
				href="/app/shake"
				isEnabled={isShake}
				activeIconUrl="/icons/icon-shake-active.svg"
				inactiveIconUrl="/icons/icon-shake-inactive.svg"
				label="Shake!"
			/>
			<NavLink
				href="/app/collections"
				isEnabled={isCollection}
				activeIconUrl="/icons/icon-collection-active.svg"
				inactiveIconUrl="/icons/icon-collection-inactive.svg"
				label="コレクション"
			/>
			<NavLink
				href={profileHref}
				isEnabled={isProfile}
				activeIconUrl="/icons/icon-profile-active.svg"
				inactiveIconUrl="/icons/icon-profile-inactive.svg"
				label="プロフィール"
			/>
		</nav>
	);
}

function NavLink({
	href,
	isEnabled,
	activeIconUrl,
	inactiveIconUrl,
	label,
}: {
	href: string;
	isEnabled: boolean;
	activeIconUrl: string;
	inactiveIconUrl: string;
	label: string;
}) {
	const showText = (value: string) => (
		<span className="whitespace-nowrap text-[16px] font-bold leading-normal text-[#ff7f11]">
			{value}
		</span>
	);
	return (
		<Link
			prefetch
			href={href}
			className={[
				"flex items-center justify-center overflow-hidden rounded-[999px] p-6 transition-[flex-basis,flex-grow,background-color] duration-300 ease-out",
				isEnabled
					? "min-h-px min-w-px basis-0 grow gap-2.5 bg-white"
					: "basis-18 shrink-0 grow-0 bg-[rgba(255,255,255,0.12)]",
			].join(" ")}
			aria-current={isEnabled ? "page" : undefined}
			aria-label={label}
		>
			<Image
				alt=""
				aria-hidden="true"
				className="h-6 w-6"
				width={24}
				height={24}
				src={isEnabled ? activeIconUrl : inactiveIconUrl}
			/>
			{isEnabled ? showText(label) : null}
		</Link>
	);
}
