"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChainDialog } from "@/components/shake/chain-dialog";
import { useMotionPermissionStore } from "@/components/shake/motion-permission-store";
import { ShakeMark } from "@/components/shake/shake-mark";
import { Wave } from "@/components/shake/wave";
import { ShakeBlock } from "@/components/shake-block";

const SHAKE_TARGET_COUNT = 20;

export function ShakeScreen() {
	const [remainingCount, setRemainingCount] = useState(SHAKE_TARGET_COUNT);
	const [hasStartedShaking, setHasStartedShaking] = useState(false);
	const completedRef = useRef(false);
	const { permissionState } = useMotionPermissionStore();
	const isShaking =
		permissionState === "granted" && hasStartedShaking && remainingCount > 0;

	const requestShakeCompletion = useCallback(async () => {
		alert("Shake complete.");
	}, []);

	const handleShake = useCallback(() => {
		setHasStartedShaking(true);
		setRemainingCount((prev) => {
			if (prev <= 0) {
				return prev;
			}
			return prev - 1;
		});
	}, []);

	useEffect(() => {
		if (remainingCount !== 0 || completedRef.current) {
			return;
		}
		completedRef.current = true;
		void requestShakeCompletion();
	}, [remainingCount, requestShakeCompletion]);

	return (
		<div className="relative min-h-screen w-full overflow-hidden">
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
				<ChainDialog type="first" />
			</div>
			<div className="absolute left-1/2 top-[47%] grid -translate-x-1/2 -translate-y-1/2 place-items-center">
				<Wave className="col-start-1 row-start-1 z-0" />
				<ShakeMark
					className="col-start-1 row-start-1 z-10 -rotate-10"
					isShaking={isShaking}
					remainingCount={remainingCount}
				/>
			</div>
		</div>
	);
}
