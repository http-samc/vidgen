"use client";

import useSWR from "swr";
import styles from "./page.module.css";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function JobPage({ params }: { params: { id: string } }) {
  const { data, error, isLoading } = useSWR(`/api/job/${params.id}`, fetcher, {
    refreshInterval: 5000, // Refresh every 5 seconds
  });

  if (isLoading) return <div className={styles.container}>Loading...</div>;
  if (error)
    return <div className={styles.container}>Error loading job status</div>;
  if (!data) return <div className={styles.container}>No data available</div>;

  return (
    <div className={styles.container}>
      <h1 style={{ fontFamily: "monospace" }}>
        Status: {data.state} ({data.progress}%)
      </h1>
      {data.url ? <video src={data.url} autoPlay loop /> : null}
    </div>
  );
}
