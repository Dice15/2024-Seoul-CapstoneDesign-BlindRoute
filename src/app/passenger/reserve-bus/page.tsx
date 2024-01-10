import styles from "@/app/passenger/reserve-bus/page.module.css";
import ReserveBus from "./_components/ReserveBus";

export default async function ReserveBusPage() {
    // Render
    return (
        <div className={styles.wrapper}>
            <ReserveBus />
        </div>
    )
}