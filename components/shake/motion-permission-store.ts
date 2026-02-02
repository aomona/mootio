"use client";

import { useSyncExternalStore } from "react";

export type MotionPermissionState = "prompt" | "granted" | "denied";

type MotionPermissionSnapshot = {
	permissionState: MotionPermissionState;
	needsMotionPermission: boolean;
	requestPermission: ((source: "auto" | "user") => void) | null;
};

let snapshot: MotionPermissionSnapshot = {
	permissionState: "granted",
	needsMotionPermission: false,
	requestPermission: null,
};

const listeners = new Set<() => void>();

const emit = () => {
	for (const listener of listeners) {
		listener();
	}
};

const setSnapshot = (next: Partial<MotionPermissionSnapshot>) => {
	snapshot = { ...snapshot, ...next };
	emit();
};

export const motionPermissionStore = {
	subscribe: (listener: () => void) => {
		listeners.add(listener);
		return () => {
			listeners.delete(listener);
		};
	},
	getSnapshot: () => snapshot,
	getServerSnapshot: () => snapshot,
	setState: (
		state: Pick<
			MotionPermissionSnapshot,
			"permissionState" | "needsMotionPermission"
		>,
	) => {
		setSnapshot(state);
	},
	setRequestPermission: (
		requestPermission: MotionPermissionSnapshot["requestPermission"],
	) => {
		setSnapshot({ requestPermission });
	},
};

export const useMotionPermissionStore = () =>
	useSyncExternalStore(
		motionPermissionStore.subscribe,
		motionPermissionStore.getSnapshot,
		motionPermissionStore.getServerSnapshot,
	);
