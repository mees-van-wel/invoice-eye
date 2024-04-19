"use client";

import { EyeOpenIcon, SymbolIcon, UploadIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import slugify from "slugify";
import { FileObject, fileListState } from "../providers";
import { useRecoilState } from "recoil";
import dayjs from "dayjs";
import { Group } from "../common/Group";
import styles from "./Gutter.module.scss";
import { Input } from "../ui/input";
import { useState } from "react";
import { apiClient, fileToBase64, processInParallel } from "@/utils/api";
import { v4 as uuidv4 } from "uuid";
import {
  AnalyzeResultOperationOutput,
  getLongRunningPoller,
  isUnexpected,
} from "@azure-rest/ai-document-intelligence";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { uploadFile } from "@/app/actions";
import clsx from "clsx";

export const Gutter = () => {
  const [files, setFiles] = useRecoilState(fileListState);
  const [uploads, setUploads] = useState<File[]>([]);
  const pathname = usePathname();

  const updloadHandler = async () => {
    // TODO replace with popup
    if (!uploads?.length) return alert("No files selected!");

    const itemsToProcess: FileObject[] = uploads.map((file) => {
      const id = uuidv4();
      const now = new Date();
      const twentyFourHoursLater = new Date(
        now.getTime() + 24 * 60 * 60 * 1000
      );
      const datetimeStamp = twentyFourHoursLater.getTime();

      return {
        id,
        date: new Date(),
        fileName: file.name,
        fileId:
          (file.name
            ? `${slugify(file.name.split(".pdf")[0])}_${id}_${datetimeStamp}`
            : id) + ".pdf",
        fields: null,
      };
    });

    setFiles({
      ...files,
      ...itemsToProcess.reduce((acc, item) => {
        return {
          ...acc,
          [item.id]: item,
        };
      }, {}),
    });

    processInParallel(uploads, async (file, index) => {
      const item = itemsToProcess[index];
      const base64Source = await fileToBase64(file);

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

      if (document?.fields) {
        await uploadFile(item.fileId, base64Source);

        setFiles((currentFiles) => {
          const current = currentFiles[item.id];

          return {
            ...currentFiles,
            [item.id]: { ...current, fields: document.fields },
          };
        });
      } else throw new Error("Expected at least one receipt in the result.");
    });
  };

  const changeHandler = (newUpdloads: File[] | null) => {
    setUploads(newUpdloads || []);
  };

  return (
    <aside className={styles.root}>
      <Sheet
        onOpenChange={() => {
          setUploads([]);
        }}
      >
        <SheetTrigger>
          <Button
            style={{
              minWidth: "3rem",
              minHeight: "3rem",
              borderRadius: "100%",
            }}
          >
            <UploadIcon />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Upload files</SheetTitle>
          </SheetHeader>
          <div className={styles.drawerContent}>
            <Group>
              <Input
                type="file"
                multiple
                onChange={(e) => {
                  changeHandler(
                    e.target.files ? Array.from(e.target.files) : null
                  );
                }}
              />
              {!!uploads.length && (
                <SheetClose>
                  <Button onClick={updloadHandler}>Scan</Button>
                </SheetClose>
              )}
            </Group>
            {uploads.map((file, index) => (
              <p
                key={file.name}
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {`${index + 1}. ${file.name}`}
              </p>
            ))}
          </div>
        </SheetContent>
      </Sheet>
      <div>
        {Object.entries(
          Object.values(files).reduce<Record<number, FileObject[]>>(
            (acc, current) => {
              const hour = current.date.getHours();

              if (acc[hour]) acc[hour] = [...acc[hour], current];
              else acc[hour] = [current];

              return acc;
            },
            {}
          )
        )
          .sort((a, b) => b[0] - a[0])
          .map(([hour, items]) => (
            <div key={hour}>
              <div className={styles.hour}>
                <p>
                  {hour}:00 - {parseInt(hour) + 1}:00
                </p>
                <span className={styles.hourLine} />
              </div>
              {Object.values(items)
                ?.sort((a, b) => b.date.getTime() - a.date.getTime())
                .map(({ id, date, fileName, fields }) => (
                  <Card
                    key={id}
                    className={clsx("w-[300px]", styles.card)}
                    style={{
                      padding: "1rem",
                    }}
                  >
                    <CardHeader
                      style={{
                        padding: 0,
                      }}
                    >
                      <Group>
                        <div>
                          <CardTitle
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: "140px",
                            }}
                          >
                            {fileName}
                          </CardTitle>
                          <CardDescription>
                            {dayjs(date).format("YYYY-MM-DD HH:mm")}
                          </CardDescription>
                        </div>
                        <Link href={`/${id}`}>
                          <Button
                            variant={
                              pathname.includes(id) ? undefined : "secondary"
                            }
                            disabled={!fields}
                          >
                            <Group gap="0.5rem">
                              {fields ? (
                                <>
                                  <EyeOpenIcon />
                                  <p>View</p>
                                </>
                              ) : (
                                <>
                                  <SymbolIcon className="animate-spin" />
                                  <p>Loading...</p>
                                </>
                              )}
                            </Group>
                          </Button>
                        </Link>
                      </Group>
                    </CardHeader>
                  </Card>
                ))}
            </div>
          ))}
      </div>
    </aside>
  );
};
