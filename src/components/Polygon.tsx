import { RefObject, useCallback, useMemo } from "react";
import { FileObject, hoverState } from "./providers";
import { useRecoilValue } from "recoil";

type PreviewProps = {
  file: FileObject;
  iframeRef: RefObject<HTMLIFrameElement>;
};

const padding = 8;
const dpi = 94;

export const Polygon = ({ file, iframeRef }: PreviewProps) => {
  const hover = useRecoilValue(hoverState);

  const convertInchesToPixels = useCallback(
    (inches: number) => inches * dpi,
    []
  );

  const polygonStyles = useMemo(() => {
    if (!hover || !file.fields || !iframeRef.current) return null;

    const polygon = file.fields[hover].boundingRegions?.[0].polygon;
    if (!polygon) return null;

    return {
      left: `${convertInchesToPixels(polygon[0]) - padding / 2}px`,
      top: `${convertInchesToPixels(polygon[1]) - padding / 2 + 44}px`,
      width: `${convertInchesToPixels(polygon[4] - polygon[0]) + padding}px`,
      height: `${convertInchesToPixels(polygon[5] - polygon[1]) + padding}px`,
    };
  }, [convertInchesToPixels, file.fields, hover, iframeRef]);

  // const getPolygonStyles = (polygon: number[]) => ({
  //   left: `${convertInchesToPixels(polygon[0]) - padding}px`,
  //   top: `${convertInchesToPixels(polygon[1]) - padding + 56}px`,
  //   width: `${convertInchesToPixels(polygon[4] - polygon[0]) + padding / 2}px`,
  //   height: `${convertInchesToPixels(polygon[5] - polygon[1]) + padding / 2}px`,
  // });

  // return Object.entries(file.fields || {}).map(([key, value]) => {
  //   const polygon = value.boundingRegions?.[0].polygon;
  //   if (!polygon) return null;

  //   return (
  //     <div
  //       key={key}
  //       style={{
  //         position: "absolute",
  //         pointerEvents: "none",
  //         border: "1px solid red",
  //         color: "red",
  //         fontSize: "8px",
  //         ...getPolygonStyles(polygon),
  //       }}
  //     />
  //   );
  // });

  return polygonStyles ? (
    <div
      style={{
        position: "absolute",
        pointerEvents: "none",
        border: "2px solid red",
        borderRadius: "4px",
        ...polygonStyles,
      }}
    />
  ) : null;
};
