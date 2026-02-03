"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { authClient } from "@/lib/auth-client";

export default function ProfileIndexPage() {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();

	useEffect(() => {
		if (isPending) {
			return;
		}
		const userId = session?.user?.id;
		if (!userId) {
			return;
		}
		router.replace(`/app/profile/${userId}`);
	}, [isPending, router, session?.user?.id]);

	return (
		<div className="mx-auto w-[345px] pt-20 text-center text-sm text-black/70">
			プロフィールを読み込み中...
		</div>
	);
}
