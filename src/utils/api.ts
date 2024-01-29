import DocumentIntelligence from "@azure-rest/ai-document-intelligence";

const endpoint = process.env.NEXT_PUBLIC_DI_ENDPOINT;
if (!endpoint) throw new Error("Missing NEXT_PUBLIC_DI_ENDPOINT in .env");

const key = process.env.NEXT_PUBLIC_DI_KEY;
if (!key) throw new Error("Missing NEXT_PUBLIC_DI_KEY in .env");

export const apiClient = DocumentIntelligence(endpoint, { key });

export async function processInParallel(
  array: File[],
  asyncFunction: (item: any) => Promise<void>
) {
  const chunkSize = 1;

  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);

    await Promise.all(
      chunk.map(async (item) => {
        console.log("🔵", { key: i, name: item.name });

        const result = await asyncFunction(item);

        console.log("🟢", { key: i, name: item.name });

        return result;
      })
    );

    if (i + chunkSize < array.length) {
      await new Promise((resolve) => setTimeout(resolve, 1100));
    }
  }
}

export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
  });
