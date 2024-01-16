import styles from "@/app/buspanel/page.module.css"
import Link from "next/link";

export default async function BuspanelPage() {
    // Render
    return (
        <div className={styles.wrapper}>
            <Link href={"./buspanel/station-announce"} className={styles.start}>
                시작하기
            </Link>
        </div>
    )
}