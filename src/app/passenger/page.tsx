import styles from "@/app/passenger/page.module.css";
import Link from "next/link";

export default async function PassengerPage() {
    // Render
    return (
        <div className={styles.wrapper}>
            <Link href={"./passenger"} className={styles.start}>
                예약하기
            </Link>
        </div>
    )
}