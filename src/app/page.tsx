import styles from "@/app/page.module.css";
import AuthButton from "@/app/_components/AuthButton";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import Link from "next/link";
import { getServerSession } from "next-auth";


export default async function AppRoot() {
  // Const
  const isAuth = (await getServerSession(authOptions)) !== null;


  // Render
  return (
    <div className={styles.wrapper}>
      <Link href={"./passenger"} className={styles.linkOps}><button className={styles.btnOps}>사용자 앱</button></Link>
      <Link href={"./buspanel"} className={styles.linkOps}><button className={styles.btnOps}>버스 내부 IoT</button></Link>
      <AuthButton
        isAuth={isAuth}
        authButtons={{
          signInButton: <button className={styles.btnOps}>로그인</button>,
          signOutButton: <button className={styles.btnOps}>로그아웃</button>
        }}
      />
    </div>
  )
}