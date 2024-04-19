"use server";

import { bucketName, s3Client } from "@/utils/s3Client";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

export const uploadFile = (fileId: string, fileData: string) =>
  s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: `uploaded-pdfs/${fileId}`,
      Body: Buffer.from(fileData, "base64"),
    })
  );

export const readFile = async (fileId: string) =>
  s3Client.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: `uploaded-pdfs/${fileId}`,
    })
  );

export const deleteOldFiles = async () => {
  const folder = "uploaded-pdfs/";
  const deletedFileIds: string[] = [];
  const currentFileIds: string[] = [];

  const { Contents } = await s3Client.send(
    new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: folder,
    })
  );

  await Promise.all(
    Contents?.map(async ({ Key }) => {
      if (Key === folder) return;

      const keyParts = Key?.split("_");
      const timeStamp = keyParts?.at(-1)?.split(".")[0];
      const id = keyParts?.at(-2);
      if (!timeStamp || !id) return;

      const deleteOn = parseInt(timeStamp);
      const now = Date.now();

      if (now > deleteOn) {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: bucketName,
            Key,
          })
        );

        deletedFileIds.push(id);
      } else currentFileIds.push(id);
    }) || []
  );

  return { deletedFileIds, currentFileIds };
};
