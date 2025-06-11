import { UTApi } from "uploadthing/server";
import { readFile } from "fs/promises";

const utapi = new UTApi();

export async function uploadVideoToUploadThing(videoPath: string, id: string) {
  const fileBuffer = await readFile(videoPath);
  const file = new File([fileBuffer], `${id}.mp4`, { type: "video/mp4" });
  const uploadedFile = await utapi.uploadFiles(file);

  if (!uploadedFile.data) {
    throw new Error("Failed to upload video to UploadThing");
  }

  return uploadedFile.data.ufsUrl;
}
