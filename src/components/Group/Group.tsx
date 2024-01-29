import styles from "./Group.module.scss";

export const Group = ({ children }: { children: React.ReactNode }) => (
  <div className={styles.root}>{children}</div>
);
