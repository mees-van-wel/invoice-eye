import { useRecoilState } from "recoil";
import { FileObject, hoverState } from "../providers";

type FieldsProps = {
  file: FileObject;
};

export const Fields = ({ file }: FieldsProps) => {
  const [hover, setHover] = useRecoilState(hoverState);

  return (
    <div
      style={{
        flex: 1,
        padding: "1rem",
        overflowY: "auto",
        height: "100vh",
      }}
    >
      {!file.fields ? (
        <p>Not Found</p>
      ) : (
        <table width="100%">
          <tbody>
            {Object.entries(file.fields)
              .filter(([_, value]) => !!value.content)
              .map(([key, value]) => (
                <tr
                  onMouseEnter={() => {
                    setHover(key);
                  }}
                  onMouseLeave={() => {
                    setHover(null);
                  }}
                  key={key}
                  style={{
                    // display: "flex",
                    // gap: "1rem",
                    // alignItems: "center",
                    // justifyContent: "space-between",
                    // padding: "0 1rem",
                    borderRadius: hover === key ? "0.5rem" : undefined,
                    borderBottom: "solid 1px hsl(var(--border))",
                    paddingBottom: "2rem",
                    boxShadow:
                      hover === key
                        ? "inset 0px 0px 20px 8px rgba(100,20,20,0.8)"
                        : undefined,
                  }}
                >
                  <td>
                    <p
                      style={{
                        fontWeight: "bold",
                        padding: "0.5rem",
                      }}
                    >
                      {key}
                    </p>
                  </td>
                  <td>
                    <div
                      style={{
                        backgroundColor: "rgba(255,255,255, 0.1)",
                        display: "inline-block",
                        padding: "0.25rem",
                        borderRadius: "0.25rem",
                        marginTop: "0.5rem",
                        marginBottom: "0.5rem",
                        fontSize: "0.8rem",
                      }}
                    >
                      {value.content}
                    </div>
                  </td>
                  <td>
                    <p
                      style={{
                        padding: "0.5rem",
                        fontSize: "0.8rem",
                      }}
                    >
                      {Math.round((value.confidence || 0) * 100)}%
                    </p>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
