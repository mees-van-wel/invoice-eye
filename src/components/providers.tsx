"use client";

import { RecoilRoot, atom, useRecoilState } from "recoil";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes/dist/types";
import type { DocumentFieldOutput } from "@azure-rest/ai-document-intelligence";
import { useEffect, useRef, useState } from "react";
import { deleteOldFiles } from "@/app/actions";
import superjson from "superjson";

export type FileObject = {
  id: string;
  date: Date;
  fileName: string;
  fileId: string;
  fields: Record<string, DocumentFieldOutput> | null;
};

export type FileListState = Record<string, FileObject>;

export const fileListState = atom<FileListState>({
  key: "FileList",
  default: {},
});

export const hoverState = atom<string | null>({
  key: "Hover",
  default: null,
});

const pw = "v5>zE";

export function Providers({ children, ...props }: ThemeProviderProps) {
  const hasRun = useRef(false);
  const [authtenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    const storedAuthtenticated = localStorage.getItem("authtenticated");
    if (storedAuthtenticated === pw) return setAuthenticated(true);

    const password = prompt("Enter the password");
    if (password !== pw) return alert("Invalid password");

    localStorage.setItem("authtenticated", pw);
    setAuthenticated(true);
  }, []);

  if (!authtenticated) return null;

  return (
    <RecoilRoot>
      <NextThemesProvider {...props}>
        <LocalStorageProvider>{children}</LocalStorageProvider>
      </NextThemesProvider>
    </RecoilRoot>
  );
}

const LocalStorageProvider = ({ children }: { children: React.ReactNode }) => {
  const [fileList, setFileList] = useRecoilState(fileListState);
  const running = useRef(false);

  useEffect(() => {
    if (running.current) return;
    running.current = true;

    if (Object.keys(fileList).length) {
      running.current = false;
      return localStorage.setItem("fileList", superjson.stringify(fileList));
    }

    const storedFileListRaw = localStorage.getItem("fileList");
    const storedFileList = storedFileListRaw
      ? (superjson.parse(storedFileListRaw) as FileListState)
      : {};

    deleteOldFiles().then(({ deletedFileIds, currentFileIds }) => {
      deletedFileIds.forEach((id) => {
        delete storedFileList[id];
      });

      Object.values(storedFileList)
        .filter(({ id }) => !currentFileIds.includes(id))
        .forEach(({ id }) => {
          delete storedFileList[id];
        });

      if (Object.keys(storedFileList).length) setFileList(storedFileList);
      running.current = false;
    });
  }, [fileList, setFileList]);

  return <div>{children}</div>;
};
