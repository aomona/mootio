"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { ChainDialog } from "@/components/shake/chain-dialog";
import { ChainOverlay } from "@/components/shake/chain-overlay";
import { useMotionPermissionStore } from "@/components/shake/motion-permission-store";
import { ShakeCardOverlay } from "@/components/shake/shake-card-overlay";
import { ShakeCompleteOverlay } from "@/components/shake/shake-complete-overlay";
import { ShakeMark } from "@/components/shake/shake-mark";
import { Wave } from "@/components/shake/wave";
import { ShakeBlock } from "@/components/shake-block";
import { apiClient } from "@/lib/api-client";

const SHAKE_TARGET_COUNT = 20;

type ChainJoinedResponse = {
	joined: boolean;
	label: {
		count: number;
		top_user_name: string;
		top_user_icon: string;
		icons: string[];
	};
	users: {
		id: string;
		name: string;
		image: string;
		rank: number;
		is_following: boolean;
	}[];
	my_rank: number | null;
};

type ChainJoinResponse = {
	success: boolean;
	joined: boolean;
	card_id: string | null;
	awarded_trophy_ids: string[];
	messages?: string[];
};

const isInChainWindow = (now = new Date()) => {
	const offsetMs = 9 * 60 * 1000;
	const nowJst = new Date(now.getTime() + offsetMs);
	const hour = nowJst.getUTCHours();
	return hour >= 22 || hour < 4;
};

export function ShakeScreen() {
	const [remainingCount, setRemainingCount] = useState(SHAKE_TARGET_COUNT);
	const [hasStartedShaking, setHasStartedShaking] = useState(false);
	const [chainJoined, setChainJoined] = useState<ChainJoinedResponse | null>(
		null,
	);
	const [chainLoaded, setChainLoaded] = useState(false);
	const [chainScreenOpen, setChainScreenOpen] = useState(false);
	const [chainScreenOpenEpoch, setChainScreenOpenEpoch] = useState(0);
	const [forceResetEpoch, setForceResetEpoch] = useState(0);
	const [completionOverlayOpen, setCompletionOverlayOpen] = useState(false);
	const [completionOverlayAnimate, setCompletionOverlayAnimate] =
		useState(false);
	const [completionRank, setCompletionRank] = useState<number | null>(null);
	const [cardOverlayOpen, setCardOverlayOpen] = useState(false);
	const [cardOverlayAnimate, setCardOverlayAnimate] = useState(false);
	const [cardId, setCardId] = useState<string | null>(null);
	const remainingCountRef = useRef(SHAKE_TARGET_COUNT);
	const completedRef = useRef(false);
	const forceActiveRef = useRef(false);
	const { permissionState } = useMotionPermissionStore();
	const isShaking =
		permissionState === "granted" && hasStartedShaking && remainingCount > 0;

	const inTimeWindow = isInChainWindow();
	const isJoined = chainJoined?.joined ?? false;
	const isEmptyChain = chainLoaded && (chainJoined?.label.count ?? 0) === 0;
	const shouldForceChainScreen = inTimeWindow || isJoined;
	const shouldBlockInitialRender = !chainLoaded;

	const syncForceState = useCallback(() => {
		if (shouldForceChainScreen && !forceActiveRef.current) {
			forceActiveRef.current = true;
			setForceResetEpoch((prev) => prev + 1);
			return;
		}
		if (!shouldForceChainScreen && forceActiveRef.current) {
			forceActiveRef.current = false;
		}
	}, [shouldForceChainScreen]);

	const openChainScreen = useCallback(() => {
		setChainScreenOpen(true);
		setChainScreenOpenEpoch(forceResetEpoch);
	}, [forceResetEpoch]);

	const closeChainScreen = useCallback(() => {
		setChainScreenOpen(false);
	}, []);

	const loadChainJoined = useCallback(async () => {
		try {
			const response = await apiClient.api.chain.joined.$get();
			if (!response.ok) {
				return null;
			}
			const body = (await response
				.json()
				.catch(() => null)) as ChainJoinedResponse | null;
			return body;
		} catch {
			return null;
		}
	}, []);

	const requestShakeCompletion = useCallback(async () => {
		let awardedCardId: string | null = null;
		try {
			const response = await apiClient.api.chain.join.$post();
			if (response.ok) {
				const body = (await response
					.json()
					.catch(() => null)) as ChainJoinResponse | null;
				awardedCardId = body?.card_id ?? null;
			}
		} catch {
			// ignore
		}
		setCardId(awardedCardId);
		const updated = await loadChainJoined();
		if (updated) {
			setChainJoined(updated);
		}
		if (isInChainWindow() || updated?.joined) {
			if (!forceActiveRef.current) {
				forceActiveRef.current = true;
				setForceResetEpoch((prev) => prev + 1);
			}
		}
		setChainLoaded(true);
		setCompletionRank(updated?.my_rank ?? chainJoined?.my_rank ?? null);
		setCompletionOverlayAnimate(true);
		setCompletionOverlayOpen(true);
		closeChainScreen();
		setCardOverlayOpen(false);
	}, [chainJoined?.my_rank, closeChainScreen, loadChainJoined]);

	const handleShake = useCallback(() => {
		syncForceState();
		setHasStartedShaking(true);
		if (remainingCountRef.current <= 0) {
			return;
		}
		const next = remainingCountRef.current - 1;
		remainingCountRef.current = next;
		setRemainingCount(next);
		if (next !== 0 || completedRef.current) {
			return;
		}
		completedRef.current = true;
		void requestShakeCompletion();
	}, [requestShakeCompletion, syncForceState]);

	useEffect(() => {
		let ignore = false;

		const load = async () => {
			const body = await loadChainJoined();
			if (ignore) {
				return;
			}
			setChainJoined(body);
			setChainLoaded(true);
		};

		void load();

		return () => {
			ignore = true;
		};
	}, [loadChainJoined]);

	const manualChainOpen =
		chainScreenOpen && chainScreenOpenEpoch === forceResetEpoch;
	const showChainScreen =
		(shouldForceChainScreen || manualChainOpen) &&
		!completionOverlayOpen &&
		!cardOverlayOpen;

	const dialogType = (() => {
		if (!chainJoined || isEmptyChain) {
			return "first";
		}
		return "some";
	})();

	const dialogAvatars = (() => {
		if (!chainJoined?.label.icons) {
			return undefined;
		}
		const filtered = chainJoined.label.icons.filter((icon) => !!icon);
		if (filtered.length === 0) {
			return undefined;
		}
		return filtered.map((src) => ({ src }));
	})();

	const canToggleChainScreen =
		chainLoaded && !!chainJoined && !shouldForceChainScreen;
	const handleDialogClick = useCallback(() => {
		syncForceState();
		if (!canToggleChainScreen) {
			return;
		}
		if (manualChainOpen) {
			closeChainScreen();
			return;
		}
		openChainScreen();
	}, [
		canToggleChainScreen,
		closeChainScreen,
		manualChainOpen,
		openChainScreen,
		syncForceState,
	]);
	const handleOverlayClose = useCallback(() => {
		closeChainScreen();
	}, [closeChainScreen]);
	const handleCompletionOverlayDrawCard = useCallback(() => {
		setCompletionOverlayAnimate(true);
		setCompletionOverlayOpen(false);
		setCompletionRank(null);
		setCardOverlayAnimate(true);
		setCardOverlayOpen(true);
	}, []);
	const handleCardOverlayLike = useCallback(() => {
		syncForceState();
		setCardOverlayAnimate(true);
		setCardOverlayOpen(false);
		openChainScreen();
	}, [openChainScreen, syncForceState]);
	const chainScreenAnimate = manualChainOpen && !shouldForceChainScreen;
	const showBackButton = showChainScreen && canToggleChainScreen;
	const hideShakeScreen = showChainScreen;
	const resolvedCompletionRank = completionRank ?? chainJoined?.my_rank ?? null;

	if (shouldBlockInitialRender) {
		return null;
	}

	return (
		<div
			className={[
				"relative min-h-screen w-full",
				hideShakeScreen ? "" : "overflow-hidden",
			]
				.join(" ")
				.trim()}
		>
			{!hideShakeScreen ? (
				<>
					<ShakeBlock className="h-screen w-full" onShake={handleShake} />
					<div className="absolute top-[3%] left-1/2 -translate-x-1/2 z-10">
						<Image
							src="/icons/logo-black.svg"
							alt="Mootio"
							width={140}
							height={68}
							className="m-6 w-35 h-17"
							preload={true}
						/>
					</div>
					<div className=" absolute top-[18%] left-1/2 -translate-x-1/2 z-10">
						<button
							type="button"
							onClick={handleDialogClick}
							disabled={!canToggleChainScreen}
							aria-disabled={!canToggleChainScreen}
							className={[
								"border-0 bg-transparent p-0",
								canToggleChainScreen ? "cursor-pointer" : "cursor-default",
							]
								.join(" ")
								.trim()}
						>
							<ChainDialog
								type={dialogType}
								avatars={dialogAvatars}
								count={chainJoined?.label.count}
								topUserName={chainJoined?.label.top_user_name}
							/>
						</button>
					</div>
					<div className="absolute left-1/2 top-[47%] grid -translate-x-1/2 -translate-y-1/2 place-items-center">
						<Wave className="col-start-1 row-start-1 z-0" />
						<ShakeMark
							className="col-start-1 row-start-1 z-10 -rotate-10"
							isShaking={isShaking}
							remainingCount={remainingCount}
						/>
					</div>
				</>
			) : null}
			<ChainOverlay
				open={showChainScreen}
				animate={chainScreenAnimate}
				onClose={handleOverlayClose}
				onDialogToggle={handleDialogClick}
				showBackButton={showBackButton}
				canToggle={canToggleChainScreen}
				users={chainJoined?.users ?? []}
				myRank={chainJoined?.my_rank ?? null}
				label={chainJoined?.label}
				isEmpty={isEmptyChain}
			/>
			<ShakeCompleteOverlay
				open={completionOverlayOpen}
				animate={completionOverlayAnimate}
				rank={resolvedCompletionRank}
				onDrawCard={handleCompletionOverlayDrawCard}
			/>
			<ShakeCardOverlay
				open={cardOverlayOpen}
				animate={cardOverlayAnimate}
				cardId={cardId}
				onLike={handleCardOverlayLike}
			/>
		</div>
	);
}
