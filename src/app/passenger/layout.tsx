import styles from "@/app/passenger/layout.module.css";

interface RootLayoutProps {
    children: React.ReactNode;
};

export default function PassengerLayout({ children }: RootLayoutProps) {
    // Render
    return (
        <div className={styles.wrapper}>
            <div className={styles.title}>
                Blind Route
            </div>
            <div className={styles.contents}>
                {children}
            </div>
        </div>
    )
}