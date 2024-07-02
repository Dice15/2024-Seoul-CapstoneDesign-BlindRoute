import styles from "@/app/blindroute/page.module.css";
import PathFinder from "./_components/PathFinder";
import ServerSideWeblog from "../_classes/ServerSideWeblog";
import { headers } from "next/headers";

export default async function ChatBotPage() {
    ServerSideWeblog.saveConnectionUrl(headers(), '/blindroute');

    return (
        <div className={styles.wrapper}>
            <PathFinder />
        </div>
    )
}