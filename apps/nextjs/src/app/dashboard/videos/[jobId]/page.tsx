"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

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
    <div className="mx-auto max-w-sm space-y-4 p-4">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold">{job.title}</h3>
        <p className="text-sm text-muted-foreground">{job.description}</p>
      </div>
      <video src={job.url} width={300} controls autoPlay loop />
    </div>
  );
};

export default JobPage;
