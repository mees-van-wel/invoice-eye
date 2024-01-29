"use client";

import { Group } from "@/components/Group";
import { Stack } from "@/components/Stack";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient, fileToBase64, processInParallel } from "@/utils/api";
import {
  AnalyzeResultOperationOutput,
  DocumentFieldOutput,
  getLongRunningPoller,
  isUnexpected,
} from "@azure-rest/ai-document-intelligence";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import { useState } from "react";

export default function Login() {
  const { setTheme, theme } = useTheme();
  const [files, setFiles] = useState<File[] | null>(null);
  const [fields, setFields] = useState<
    Record<string, DocumentFieldOutput> | undefined
  >();

  const changeHandler = (newFiles: File[] | null) => {
    if (!newFiles) return setFiles(null);
    setFiles(newFiles);
  };

  const updloadHandler = async () => {
    // TODO replace with popup
    if (!files?.length) return alert("No files selected!");

    processInParallel(files, async (item: File) => {
      const base64Source = await fileToBase64(item);

      const initialResponse = await apiClient
        .path("/documentModels/{modelId}:analyze", "prebuilt-invoice")
        .post({
          contentType: "application/json",
          body: { base64Source },
        });

      if (isUnexpected(initialResponse)) throw initialResponse.body.error;

      const poller = await getLongRunningPoller(apiClient, initialResponse);

      const analyzeResult = (
        (await poller.pollUntilDone()).body as AnalyzeResultOperationOutput
      ).analyzeResult;

      const documents = analyzeResult?.documents;
      const document = documents && documents[0];
      if (!document)
        throw new Error("Expected at least one document in the result.");

      if (document) setFields({ ...fields, ...document.fields });
      else throw new Error("Expected at least one receipt in the result.");
    });
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "500px",
        margin: "0 auto",
      }}
    >
      <Stack>
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Group>
                <p>Style:</p>
                {theme === "system" ? (
                  <p className="h-[1.2rem]">System</p>
                ) : theme === "dark" ? (
                  <p className="h-[1.2rem]">Dark</p>
                ) : (
                  <p className="h-[1.2rem]">Light</p>
                )}
              </Group>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Create project</CardTitle>
            <CardDescription>
              Deploy your new project in one-click.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Name of your project" />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="framework">Framework</Label>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Cancel</Button>
            <Button>Deploy</Button>
          </CardFooter>
        </Card> */}
        <Group>
          <Input
            type="file"
            onChange={(e) => {
              changeHandler(
                e.target.files
                  ? Array.from(e.target.files).map((file) => file)
                  : null
              );
            }}
            multiple
            style={{ cursor: "pointer" }}
          />
          {files?.length && <Button onClick={updloadHandler}>Upload</Button>}
        </Group>
        <h1>{files?.length}</h1>
        {fields && <code>{JSON.stringify(fields)}</code>}
      </Stack>
    </div>
  );
}
