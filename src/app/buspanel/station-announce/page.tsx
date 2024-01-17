import styles from "@/app/buspanel/station-announce/page.module.css";
import BusAnnouncement from "./_components/BusAnnouncement";


export default async function ReserveBusPage() {
    // Render
    return (
        <div className={styles.wrapper}>
            <BusAnnouncement />
        </div>
    )
}