import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import Overlay from "../components/Overlay/Overlay";
import styles from "../styles/Home.module.css";

function Time() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setInterval(() => {
      setTime(new Date());
    }, 1000);
  }, []);

  return (
    <span>
      {time.toLocaleString("es-ES", {
        hour: "numeric",
        minute: "numeric",
      })}
    </span>
  );
}

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>/</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Overlay>
        <div className={styles.content}>
          <div className={styles.header}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="44"
              height="44"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="#2c3e50"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
              <path d="M9.172 15.172a4 4 0 0 1 5.656 0" />
              <path d="M6.343 12.343a8 8 0 0 1 11.314 0" />
              <path d="M3.515 9.515c4.686 -4.687 12.284 -4.687 17 0" />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="44"
              height="44"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="#2c3e50"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M15 8a5 5 0 0 1 0 8" />
              <path d="M17.7 5a9 9 0 0 1 0 14" />
              <path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a0.8 .8 0 0 1 1.5 .5v14a0.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" />
            </svg>
            <Time />
          </div>
          <Link href="/cmd">
            <button className={styles.desktopIcon}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="44"
                height="44"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="#2c3e50"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M8 9l3 3l-3 3" />
                <line x1="13" y1="15" x2="16" y2="15" />
                <rect x="3" y="4" width="18" height="16" rx="2" />
              </svg>
              <span>Consola</span>
            </button>
          </Link>
          <Link href="/map">
            <button className={styles.desktopIcon}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="44"
                height="44"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="#2c3e50"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <line x1="18" y1="6" x2="18" y2="6.01" />
                <path d="M18 13l-3.5 -5a4 4 0 1 1 7 0l-3.5 5" />
                <polyline points="10.5 4.75 9 4 3 7 3 20 9 17 15 20 21 17 21 15" />
                <line x1="9" y1="4" x2="9" y2="17" />
                <line x1="15" y1="15" x2="15" y2="20" />
              </svg>
              <span>Mapa</span>
            </button>
          </Link>
          <Link href="/files">
            <button className={styles.desktopIcon}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="44"
                height="44"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="#2c3e50"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M9 4h3l2 2h5a2 2 0 0 1 2 2v7a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2" />
                <path d="M17 17v2a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2h2" />
              </svg>
              <span>Archivos</span>
            </button>
          </Link>
        </div>
      </Overlay>
    </div>
  );
}
