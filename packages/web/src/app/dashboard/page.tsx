import { Header } from "@/components/header/header";
import styles from "./page.module.css";

export default function DashboardPage() {
  return (
    <>
      <Header />
      <main className={styles.main}></main>
    </>
  );
}
