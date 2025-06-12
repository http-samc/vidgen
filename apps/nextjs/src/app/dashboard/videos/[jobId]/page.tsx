"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FaArrowLeft, FaClockRotateLeft } from "react-icons/fa6";

import { getRelativeTime } from "~/lib/getRelativeTime";
import { useTRPC } from "~/trpc/react";

const JobPage = () => {
  const trpc = useTRPC();
  const { jobId } = useParams();
  const [jobIsCompleted, setJobIsCompleted] = useState(false);

  const { data: job } = useQuery(
    trpc.dashboard.getVideo.queryOptions(
      { jobId: jobId as string },
      { enabled: !!jobId && !jobIsCompleted, refetchInterval: 2500 },
    ),
  );

  useEffect(() => {
    if (job?.state === "Completed") {
      setJobIsCompleted(true);
    }
  }, [job?.state]);

  if (!job) {
    return <div className="w-full animate-pulse rounded-lg bg-card"></div>;
  }

  if (!job.url) {
    return (
      <div className="mx-auto grid h-96 place-content-center rounded-lg border border-dashed bg-card p-4">
        <p className="animate-pulse font-mono">
          {job.state} ({job.progress}%)
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Link
          href="/dashboard/videos"
          className="group flex items-center space-x-1 text-xs text-muted-foreground"
        >
          <FaArrowLeft
            className="transition-transform group-hover:-translate-x-px"
            size={10}
          />
          <span>Back</span>
        </Link>
        <div className="flex items-center justify-between">
          <h3 className="max-w-lg text-3xl font-bold">{job.title}</h3>
          <p className="w-fit whitespace-nowrap rounded-full bg-muted px-2 py-0.5 font-mono text-sm">
            {job.preset}
          </p>
        </div>
        <p className="max-w-lg text-sm text-muted-foreground">
          {job.description}
        </p>
      </div>
      <div className="flex w-full items-center justify-between">
        {job.createdAt && (
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <FaClockRotateLeft size={10} />
            <p>{getRelativeTime(job.createdAt)}</p>
          </div>
        )}
      </div>
      <video
        src={job.url}
        className="mx-auto"
        width={300}
        controls
        autoPlay
        loop
      />
    </div>
  );
};

export default JobPage;
