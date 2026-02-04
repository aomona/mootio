"use client";

import { CollectionScreen } from "@/components/collection/collection-screen";
import { authClient } from "@/lib/auth-client";

export default function CollectionsPage() {
	const { data: session, isPending } = authClient.useSession();
	const userId = session?.user?.id ?? "";

	if (isPending) {
		return (
			<div className="mx-auto w-[345px] pt-20 text-center text-sm text-black/70">
				読み込み中...
			</div>
		);
	}

	return <CollectionScreen userId={userId} />;
}
