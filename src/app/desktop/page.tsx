import { headers } from "next/headers";
import ServerSideWeblog from "../_classes/ServerSideWeblog";
import styles from "./page.module.css";


export default async function Page() {
  ServerSideWeblog.saveConnectionUrl(headers(), '/desktop');

  return (
    <main className={styles.wrapper}>
      <h3 className={styles.main}>
        현재 서비스는
      </h3>
      <h3 className={styles.main}>
        데스트톱 환경을 지원하지 않습니다.
      </h3>
      <h3 className={styles.main}>
        f12(개발자 도구)를 열고, Ctrl + Shift + M(기기 툴바 전환)으로 모바일 환경으로 전환하면 이용할 수 있습니다.
      </h3>
    </main>
  );
}