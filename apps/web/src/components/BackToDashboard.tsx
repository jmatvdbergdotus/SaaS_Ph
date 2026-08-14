"use client";

import Link from "next/link";
import { useLanguage } from "../lib/language";
import styles from "./BackToDashboard.module.css";

export function BackToDashboard() {
  const { t } = useLanguage();

  return (
    <nav className={styles.container} aria-label={t("common.backToDashboard")}>
      <Link href="/" className={styles.link}>
        <span className={styles.icon} aria-hidden="true">&larr;</span>
        <span>{t("common.backToDashboard")}</span>
      </Link>
    </nav>
  );
}
