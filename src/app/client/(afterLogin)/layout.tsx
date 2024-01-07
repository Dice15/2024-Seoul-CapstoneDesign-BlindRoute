import styles from "./layout.module.css";

export default function Layout({ children }: { children: React.ReactNode }) {
    // Render
    return (
        <div className={styles.layout}>
            <div className={styles.auth_top_bar}>

            </div>
            <div className={styles.children}>
                {children}
            </div>
        </div>
    )
}