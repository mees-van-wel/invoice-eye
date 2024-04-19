import { readFile } from "@/app/actions";
import { type NextRequest } from "next/server";
import { Readable } from "stream";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fileId = searchParams.get("fileId");

  if (!fileId) throw new Error("fileId is missing");

  const { Body, ContentLength } = await readFile(fileId);
  if (!Body) throw new Error("s3 Body is empty");
  if (!ContentLength) throw new Error("s3 ContentLength is empty");

  const readable = Readable.from(Body as Readable);

  // @ts-ignore
  return new Response(readable, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": ContentLength,
      "Content-Disposition": `inline; filename=${fileId}`,
    },
  });
}
