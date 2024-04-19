import styles from "./Group.module.scss";

export const Group = ({
  children,
  gap = "1rem",
}: {
  children: React.ReactNode;
  gap?: React.CSSProperties["gap"];
}) => (
  <div className={styles.root} style={{ gap }}>
    {children}
  </div>
);
