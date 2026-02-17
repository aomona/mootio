"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";

import { useNotificationManager } from "@/hooks/use-notification-manager";

export default function NotificationOnboardingPage() {
	const router = useRouter();
	const { isSupported, subscription, error, subscribeToPush } =
		useNotificationManager();
	const [isLoading, setIsLoading] = useState(false);
	const [hasRequested, setHasRequested] = useState(false);
	const hasMounted = useSyncExternalStore(
		() => () => undefined,
		() => true,
		() => false,
	);

	useEffect(() => {
		if (hasRequested && subscription) {
			router.push("/app/shake");
		}
	}, [hasRequested, router, subscription]);

	const handleAllow = async () => {
		if (isLoading) return;
		setIsLoading(true);
		setHasRequested(true);
		if (!subscription) {
			await subscribeToPush();
		}
		setIsLoading(false);
	};

	const isDisabled = !isSupported || isLoading;
	const buttonLabel = subscription
		? "続ける"
		: isLoading
			? "許可中..."
			: "許可する";

	return (
		<div className="relative min-h-screen w-screen overflow-hidden">
			<Image
				alt=""
				src="/signup/bg-pattern.svg"
				className="pointer-events-none absolute left-1/2 top-87.5 w-105 -translate-x-1/2 -translate-y-1/2"
				width={420}
				height={420}
				priority
			/>
			<div className="relative z-10 mx-auto flex min-h-[852px] w-full flex-col items-center px-[24px] pb-[64px] pt-[64px]">
				<div
					aria-hidden="true"
					className="pointer-events-none absolute left-1/2 top-62.5 h-240 w-230 -translate-x-1/2 rounded-full bg-white"
				/>
				<div className="relative z-10 flex h-[237px] w-full items-center justify-center pb-15">
					<Image
						alt="Mootio"
						src="/signup/logo.svg"
						className="h-14 w-60"
						width={56}
						height={240}
						priority
					/>
				</div>
				<div className="relative z-10 flex h-[513px] w-full flex-col items-center justify-between overflow-hidden px-[24px] py-[64px]">
					<p className="text-[16px] font-bold leading-normal text-black">
						このアプリでは通知機能を使用します
					</p>
					<Image
						alt="通知アイコン"
						src="/onboarding/notification-01.svg"
						className="h-[179px] w-[179px]"
						width={179}
						height={179}
						priority
					/>
					<button
						type="button"
						onClick={handleAllow}
						disabled={isDisabled}
						className="relative w-full rounded-full border-2 bg-gradient-to-b from-[#c2e812] via-[#ff7f11] via-[50%] to-[#ee4266] py-[18px] text-[16px] font-bold leading-[22px] text-white shadow-[inset_0_0_24px_rgba(253,255,252,0.96)] transition disabled:cursor-not-allowed disabled:opacity-70"
					>
						{buttonLabel}
					</button>
				</div>
				<div className="relative z-10 mt-2 flex w-full flex-col items-center gap-2">
					{hasMounted && !isSupported ? (
						<p className="text-xs font-medium text-rose-600">
							このブラウザでは通知を利用できません
						</p>
					) : null}
					{error ? (
						<p className="text-sm font-medium text-rose-600" role="alert">
							{error}
						</p>
					) : null}
				</div>
			</div>
		</div>
	);
}
