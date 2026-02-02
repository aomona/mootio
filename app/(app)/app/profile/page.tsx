"use client";
import { ProfileCard } from "@/components/profile-card";
import { authClient } from "@/lib/auth-client";

export default function HomePage() {
	const { data: session } = authClient.useSession();

	const mockProfile = {
		bio: "Product designer focused on music and community.",
		avatarSrc: "/icon512_rounded.png",
		avatarAlt: "Profile avatar",
		followersCount: 1280,
		followingCount: 312,
	};

	return (
		<div className=" relative w-screen">
			<div className=" flex flex-col items-center pt-10 pb-5 text-black">
				<h2 className="font-bold text-lg">自分のプロフィール</h2>
			</div>
			<ProfileCard
				type="mine"
				{...mockProfile}
				name={session?.user.name || ""}
				className=" mx-auto"
			/>
		</div>
	);
}
