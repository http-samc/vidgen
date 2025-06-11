"use client";

import useSWR from "swr";
import styles from "./page.module.css";
import Link from "next/link";
import { use } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, error, isLoading } = useSWR(`/api/job/${id}`, fetcher, {
    refreshInterval: 5000, // Refresh every 5 seconds
  });

  if (isLoading) return <div className={styles.container}>Loading...</div>;
  if (error)
    return <div className={styles.container}>Error loading job status</div>;
  if (!data) return <div className={styles.container}>No data available</div>;

  return (
    <div className={styles.container}>
      {!data.url && (
        <h1 style={{ fontFamily: "monospace" }}>
          Status: {data.state} ({data.progress}%)
        </h1>
      )}
      {data.url ? (
        <div className={styles.videoContainer}>
          <video
            src={data.url}
            width={300}
            controls
            autoPlay
            loop
            className={styles.video}
          />
          <Link href="/" className={styles.generateAnother}>
            Generate another video
          </Link>
        </div>
      ) : null}
    </div>
  );
}
