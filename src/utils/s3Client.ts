import { S3Client } from "@aws-sdk/client-s3";

export const bucketName = "insight";

export const s3Client = new S3Client({
  region: "eu2",
  forcePathStyle: true,
  endpoint: "https://eu2.contabostorage.com",
  credentials: {
    accessKeyId: process.env.CONTABO_STORAGE_ACCESS_KEY!,
    secretAccessKey: process.env.CONTABO_STORAGE_SECRET_KEY!,
  },
});
