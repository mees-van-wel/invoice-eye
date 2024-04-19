import styles from "./Stack.module.scss";

export const Stack = ({ children }: { children: React.ReactNode }) => (
  <div className={styles.root}>{children}</div>
);
