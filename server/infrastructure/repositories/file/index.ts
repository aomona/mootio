/**
 * Creates file repository functions
 * @param r2 - The R2 service
 * @param db - The database instance
 * @returns File repository functions
 */

import type { AwsClient } from "aws4fetch";
import { and, eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import type { Database } from "@/lib/db";
import type { BlobFile } from "@/server/objects/file";
import { toUploadedFile, type UploadedFile } from "@/server/objects/file";

export const createFileRepository = (
	r2: AwsClient,
	db: Database,
	url: string,
) => ({
	saveBlobFile: createSaveBlobFile(r2, db, url),
	deleteFileByKey: createDeleteFileByKey(r2, db, url),
});

/**
 * Creates a function to save a blob file to storage
 * @param r2 - The R2 service
 * @param db - The database instance
 * @returns A function to save a blob file
 */
const createSaveBlobFile =
	(r2: AwsClient, db: Database, url: string) =>
	async <T extends BlobFile>(file: T): Promise<UploadedFile<T>> => {
		const body = new Uint8Array(await file.blob.arrayBuffer());
		const size = body.byteLength;
		const uploadResponse = await r2.fetch(`${url}/${file.bucket}/${file.key}`, {
			method: "PUT",
			body,
			headers: {
				"Content-Type": file.contentType,
				"Content-Length": size.toString(),
			},
		});
		const resjson = await uploadResponse.text();
		console.log("Upload Response JSON:", resjson);

		await db.insert(schema.files).values({
			id: file.id,
			bucket: file.bucket,
			key: file.key,
			contentType: file.contentType,
			size,
			expiresAt:
				"expiresAt" in file && file.expiresAt instanceof Date
					? file.expiresAt
					: null,
			uploadedAt: new Date(),
		});

		return toUploadedFile({ file, size });
	};

const createDeleteFileByKey =
	(r2: AwsClient, db: Database, url: string) =>
	async (params: { bucket: string; key: string }) => {
		const { bucket, key } = params;
		const response = await r2.fetch(`${url}/${bucket}/${key}`, {
			method: "DELETE",
		});
		if (!response.ok && response.status !== 404) {
			throw new Error(`Failed to delete file: ${response.status}`);
		}
		await db
			.delete(schema.files)
			.where(and(eq(schema.files.bucket, bucket), eq(schema.files.key, key)));
	};
