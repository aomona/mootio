import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { users } from "@/db/schema";
import { db } from "@/lib/db";
import { createHonoApp } from "@/server/create-app";
import { createFileRepository } from "@/server/infrastructure/repositories/file";
import { getUserOrThrow } from "@/server/middleware/auth";
import { createBlobFile } from "@/server/objects/file";
import { buildPublicUrl, stripPublicUrl } from "@/server/utils/r2";

const updateUserSchema = z.object({
	name: z.string().min(1).optional(),
	bio: z.string().optional(),
});

const usersRoute = createHonoApp()
	.get("/:userId", async (c) => {
		await getUserOrThrow(c);
		const userId = c.req.param("userId");

		const [user] = await db
			.select({
				id: users.id,
				name: users.name,
				imagePath: users.imageUrl,
				bio: users.bio,
			})
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (!user) {
			throw new HTTPException(404, { message: "User not found" });
		}

		const { publicUrl } = c.get("r2");
		return c.json({
			id: user.id,
			name: user.name,
			bio: user.bio,
			image: buildPublicUrl(publicUrl, user.imagePath),
		});
	})
	.patch("/:userId", async (c) => {
		const { user } = await getUserOrThrow(c);
		const userId = c.req.param("userId");

		if (user.id !== userId) {
			throw new HTTPException(403, {
				message: "You can only update your own profile",
			});
		}

		const messages: string[] = [];
		const contentType = c.req.header("content-type") ?? "";
		const isForm =
			contentType.includes("multipart/form-data") ||
			contentType.includes("application/x-www-form-urlencoded");
		const isJson = contentType.includes("application/json");
		let name: string | undefined;
		let bio: string | undefined;
		let imageFile: File | null = null;

		if (isForm) {
			const formData = await c.req.raw.formData();
			const nameValue = formData.get("name");
			const bioValue = formData.get("bio");
			const imageValue = formData.get("image");
			if (typeof nameValue === "string") name = nameValue;
			if (typeof bioValue === "string") bio = bioValue;
			imageFile = imageValue instanceof File ? imageValue : null;
		} else if (isJson) {
			const payload = (await c.req.json()) as Record<string, unknown>;
			if (
				"imageUrl" in payload ||
				"iconUrl" in payload ||
				"icon_url" in payload
			) {
				return c.json(
					{
						success: false,
						updated: false,
						messages: ["Use multipart/form-data to upload profile images"],
					},
					400,
				);
			}
			const parsed = updateUserSchema.safeParse(payload);
			if (!parsed.success) {
				return c.json(
					{
						success: false,
						updated: false,
						messages: parsed.error.issues.map((issue) => issue.message),
					},
					400,
				);
			}
			name = parsed.data.name;
			bio = parsed.data.bio;
		} else {
			return c.json(
				{
					success: false,
					updated: false,
					messages: ["Unsupported Content-Type"],
				},
				415,
			);
		}

		const parsedFields = updateUserSchema.safeParse({ name, bio });
		if (!parsedFields.success) {
			return c.json(
				{
					success: false,
					updated: false,
					messages: parsedFields.error.issues.map((issue) => issue.message),
				},
				400,
			);
		}

		try {
			const updateData: Record<string, unknown> = {};
			let previousIconKey: string | null = null;
			let newIconKey: string | null = null;
			let fileRepository: ReturnType<typeof createFileRepository> | null = null;
			if (parsedFields.data.name !== undefined)
				updateData.name = parsedFields.data.name;
			if (parsedFields.data.bio !== undefined)
				updateData.bio = parsedFields.data.bio;
			if (imageFile && imageFile.size > 0) {
				const { publicUrl } = c.get("r2");
				const [existingUser] = await db
					.select({ iconPath: users.imageUrl })
					.from(users)
					.where(eq(users.id, userId))
					.limit(1);
				previousIconKey = stripPublicUrl(
					publicUrl,
					existingUser?.iconPath ?? null,
				);
				if (imageFile.type && !imageFile.type.startsWith("image/")) {
					return c.json(
						{
							success: false,
							updated: false,
							messages: ["Only image files are supported"],
						},
						400,
					);
				}
				const file = createBlobFile({
					blob: imageFile,
					bucket: "techjam2026winter",
					keyPrefix: `user-icons/${userId}`,
					contentType: imageFile.type || "application/octet-stream",
				});
				const { client, baseUrl } = c.get("r2");
				fileRepository = createFileRepository(client, c.get("db"), baseUrl);
				const savedFile = await fileRepository.saveBlobFile(file);
				newIconKey = savedFile.key;
				updateData.imageUrl = savedFile.key;
			}

			if (Object.keys(updateData).length === 0) {
				return c.json({
					success: true,
					updated: false,
					messages: ["No fields to update"],
				});
			}

			await db.update(users).set(updateData).where(eq(users.id, userId));
			if (fileRepository && previousIconKey && newIconKey) {
				if (previousIconKey !== newIconKey) {
					try {
						await fileRepository.deleteFileByKey({
							bucket: "techjam2026winter",
							key: previousIconKey,
						});
					} catch (deleteError) {
						console.warn("Failed to delete old icon:", deleteError);
					}
				}
			}

			return c.json({
				success: true,
				updated: true,
			});
		} catch (error) {
			messages.push(
				error instanceof Error ? error.message : "Unknown error occurred",
			);
			return c.json(
				{
					success: false,
					updated: false,
					messages,
				},
				500,
			);
		}
	});

export default usersRoute;
