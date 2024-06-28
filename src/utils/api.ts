import DocumentIntelligence from "@azure-rest/ai-document-intelligence";

const endpoint = "https://westeurope.api.cognitive.microsoft.com";

const key = process.env.NEXT_PUBLIC_DI_KEY;
if (!key) throw new Error("Missing NEXT_PUBLIC_DI_KEY in .env");

export const apiClient = DocumentIntelligence(endpoint, { key });

export async function processInParallel(
  array: File[],
  asyncFunction: (item: File, index: number) => Promise<void>
) {
  const chunkSize = 1;

  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);

    await Promise.all(chunk.map(async (item) => asyncFunction(item, i)));

    if (i + chunkSize < array.length)
      await new Promise((resolve) => setTimeout(resolve, 1100));
  }
}

export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
  });
