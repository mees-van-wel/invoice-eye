"use client";

import { Fields } from "@/components/Fields";
import { Gutter } from "@/components/Gutter";
import { Polygon } from "@/components/Polygon";
import { FileObject, fileListState } from "@/components/providers";
import { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import styles from "./page.module.scss";

type PageParams = {
  params: {
    id: string;
  };
};

export default function View({ params }: PageParams) {
  const files = useRecoilValue(fileListState);
  const iframeRef = useRef(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const item: FileObject | undefined = files[params.id];

  useEffect(() => {
    // Reset the loaded state whenever the file changes
    setIframeLoaded(false);
  }, [item]);

  if (!item) {
    return <p>File not found.</p>;
  }

  const handleIframeLoad = () => {
    // Set loaded state to true when iframe finishes loading
    setIframeLoaded(true);
  };

  return (
    <div className={styles.container}>
      <Gutter />
      {!item ? (
        <p>Not Found</p>
      ) : (
        <>
          <Fields file={item} />
          <div className={styles.preview}>
            <iframe
              ref={iframeRef}
              src={`/api/pdf?fileId=${item.fileId}`}
              onLoad={handleIframeLoad}
              style={{
                width: "100%",
                minHeight: "400vh", // Set height to auto to take the full height of the content
                border: "none",
              }}
            />
            {iframeLoaded && <Polygon file={item} iframeRef={iframeRef} />}
          </div>
        </>
      )}
    </div>
  );

  // const files = useRecoilValue(fileListState);
  // const iframeRef = useRef<HTMLIFrameElement>(null);
  // const file = useMemo<FileObject | undefined>(
  //   () => files[params.id],
  //   [files, params.id]
  // );
  // return (
  //   <div className={styles.container}>
  //     <Gutter />
  //     {!file ? (
  //       <p>Not Found</p>
  //     ) : (
  //       <>
  //         <Fields file={file} />
  //         <div className={styles.preview}>
  //           <iframe
  //             ref={iframeRef}
  //             src="https://slicedinvoices.com/pdf/wordpress-pdf-invoice-plugin-sample.pdf"
  //             // src={URL.createObjectURL(file.file)}
  //             style={{
  //               width: "100%",
  //               height: "100%",
  //             }}
  //           />
  //           <Polygon file={file} iframeRef={iframeRef} />
  //         </div>
  //       </>
  //     )}
  //   </div>
  // );
}
