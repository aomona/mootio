"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";

const DISPLAY_MODE_QUERY = "(display-mode: standalone)";
const subscribeNoop = () => () => {};

const getHydratedSnapshot = () => true;
const getServerHydratedSnapshot = () => false;

const getStandaloneSnapshot = () => {
	if (typeof window === "undefined") {
		return false;
	}

	const isDisplayModeStandalone = window.matchMedia(DISPLAY_MODE_QUERY).matches;
	const isNavigatorStandalone =
		(window.navigator as Navigator & { standalone?: boolean }).standalone ===
		true;

	return isDisplayModeStandalone || isNavigatorStandalone;
};

const subscribeStandalone = (onStoreChange: () => void) => {
	if (typeof window === "undefined") {
		return () => {};
	}

	const mediaQuery = window.matchMedia(DISPLAY_MODE_QUERY);
	const handler = () => {
		onStoreChange();
	};
	mediaQuery.addEventListener("change", handler);

	return () => {
		mediaQuery.removeEventListener("change", handler);
	};
};

export default function PwaGuard({ children }: { children: React.ReactNode }) {
	const isHydrated = useSyncExternalStore(
		subscribeNoop,
		getHydratedSnapshot,
		getServerHydratedSnapshot,
	);

	const isStandalone = useSyncExternalStore(
		subscribeStandalone,
		getStandaloneSnapshot,
		() => false,
	);

	if (!isHydrated) {
		return null;
	}

	return (
		<>
			{isStandalone ? (
				children
			) : (
				<div className="flex h-screen justify-center items-center">
					<div className="flex items-center flex-col p-4 m-4 rounded-2xl gap-2 bg-white/20 text-center text-white">
						<Image
							src="/images/shake/f2d5e329-0736-463e-817a-3b3269b6acc2.svg"
							alt="Logo"
							width={100}
							height={100}
							className="mb-3 shrink-0 w-25 h-25"
						/>
						<p className="text-2xl font-bold">
							アプリをインストールしてください
						</p>
						<div className="font-medium break-keep wrap-anywhere flex flex-col gap-2">
							<p>
								iPhoneの場合：
								<wbr />
								右下の⋯から共有を押し、
								<wbr />
								その他からホーム画面に追加を
								<wbr />
								タップします。
								<br />
								webアプリとして開くに
								<wbr />
								チェックが入っていることを確認し、
								<wbr />
								追加します。
								<br />
							</p>
							<p>
								Androidの場合：
								<wbr />
								画面右上の︙を押し、
								<wbr />
								ホーム画面に追加をタップします。
								<br />
								インストールボタンを
								<wbr />
								押します。
								<br />
							</p>
						</div>
						<p className="font-bold">
							ホーム画面から
							<wbr />
							Mootioのアイコンを押して始めます
						</p>
					</div>
				</div>
			)}
		</>
	);
}
