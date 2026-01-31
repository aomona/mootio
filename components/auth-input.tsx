import {
	type ComponentPropsWithoutRef,
	type HTMLInputTypeAttribute,
	useId,
} from "react";

export type AuthInputProps = Omit<ComponentPropsWithoutRef<"input">, "type"> & {
	label?: string;
	containerClassName?: string;
	labelClassName?: string;
	type?: HTMLInputTypeAttribute;
};

export function AuthInput({
	label,
	containerClassName,
	labelClassName,
	className,
	id,
	type = "text",
	...props
}: AuthInputProps) {
	const fallbackId = useId();
	const inputId = id ?? fallbackId;
	const rootClassName = [
		"flex w-full flex-col gap-[10px]",
		containerClassName ?? "",
	]
		.join(" ")
		.trim();
	const resolvedLabelClassName = [
		"px-[4px] text-[14px] font-medium leading-normal text-[#ccc]",
		labelClassName ?? "",
	]
		.join(" ")
		.trim();

	return (
		<div className={rootClassName}>
			{label ? (
				<label className={resolvedLabelClassName} htmlFor={inputId}>
					{label}
				</label>
			) : null}
			<input
				id={inputId}
				className={
					"w-full rounded-xl bg-[rgba(235,235,235,0.33)] p-4 text-[16px] font-medium leading-normal outline-none placeholder:text-[#ccc] disabled:cursor-not-allowed disabled:opacity-60 " +
					className
				}
				type={type}
				{...props}
			/>
		</div>
	);
}
