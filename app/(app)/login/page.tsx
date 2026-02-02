"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { AuthInput } from "@/components/auth-input";
import { signInWithEmail } from "@/lib/auth-actions";

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsLoading(true);
		setError(null);

		const result = await signInWithEmail({
			email,
			password,
		});

		if (!result.success) {
			setError(result.error ?? "ログインに失敗しました");
			setIsLoading(false);
			return;
		}

		router.push("/app/shake");
	};

	return (
		<div className="relative min-h-screen w-screen overflow-hidden">
			<div
				aria-hidden="true"
				className="pointer-events-none absolute left-1/2 top-62.5 h-240 w-230 -translate-x-1/2 rounded-full bg-white"
			/>
			<Image
				alt=""
				src={"/signup/bg-pattern.svg"}
				className="pointer-events-none absolute left-1/2 top-87.5 w-105 -translate-x-1/2 -translate-y-1/2"
				width={420}
				height={420}
			/>
			<div className="relative z-10 mx-auto flex min-h-[852px] w-full flex-col items-center px-[24px] pb-[64px] pt-[64px]">
				<div className="flex h-[237px] w-full items-center justify-center pb-15">
					<Image
						alt="Mootio"
						src={"/signup/logo.svg"}
						className="h-14 w-60"
						width={56}
						height={240}
					/>
				</div>
				<div className="flex w-full flex-col items-center gap-[24px]">
					<h1 className="text-[16px] font-bold leading-normal text-black">
						ログイン
					</h1>
					<form onSubmit={handleSubmit} className="w-full">
						<div className="flex flex-col gap-[10px]">
							<AuthInput
								label="メール"
								placeholder="mail.example.com"
								type="email"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								autoComplete="email"
								required
								className="text-[14px] text-black"
							/>
							<AuthInput
								label="パスワード"
								placeholder="************"
								type="password"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								autoComplete="current-password"
								required
								className="text-[14px] text-black"
							/>
						</div>
						<button
							type="submit"
							disabled={isLoading}
							className="relative mt-[24px] w-full rounded-full border-2 bg-gradient-to-b from-[#c2e812] via-[#ff7f11] via-[50%] to-[#ee4266] py-[18px] text-[16px] font-bold leading-[22px] text-white shadow-[inset_0_0_24px_rgba(253,255,252,0.96)] transition disabled:cursor-not-allowed disabled:opacity-70"
						>
							{isLoading ? "ログイン中..." : "ログインする"}
						</button>
					</form>
					{error ? (
						<p className="text-sm font-medium text-rose-600" role="alert">
							{error}
						</p>
					) : null}
					<p className="text-sm text-zinc-600">
						アカウントをお持ちでないですか？{" "}
						<Link href="/signup" className="font-semibold text-black">
							アカウントを作成
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
