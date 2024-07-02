import styles from "@/app/chatbot/page.module.css";
import ChatAdot from "./_components/ChatAdot";
import ServerSideWeblog from "../_classes/ServerSideWeblog";
import { headers } from "next/headers";

export default async function ChatBotPage() {
    ServerSideWeblog.saveConnectionUrl(headers(), '/chatbot');

    return (
        <div className={styles.wrapper}>
            <ChatAdot />
        </div>
    )
}