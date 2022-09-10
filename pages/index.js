import Head from "next/head";
import Overlay from "../components/Overlay/Overlay";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>H.O.M.S.A. asistente personal</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Overlay>
        Test
      </Overlay>
        
    </div>
  );
}
