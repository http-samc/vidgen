import React from "react";
import Link from "next/link";
import { FaClockRotateLeft } from "react-icons/fa6";

import { getRelativeTime } from "~/lib/getRelativeTime";
import { getQueryClient, trpc } from "~/trpc/server";

const VideosPage = async () => {
  const videos = await getQueryClient().fetchQuery(
    trpc.dashboard.getVideos.queryOptions(),
  );

  return (
    <div className="space-y-4">
      {videos.map(({ id, title, description, createdAt }) => (
        <Link
          key={id}
          href={`/dashboard/videos/${id}`}
          className="flex w-full flex-col justify-between space-y-4 rounded-lg border p-4 transition-opacity hover:opacity-80 lg:flex-row lg:space-y-0"
        >
          <div className="max-w-lg space-y-2">
            <h4 className="text-lg font-medium">{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="flex h-fit items-center space-x-1.5 text-xs text-muted-foreground">
            <FaClockRotateLeft size={10} />
            <span>{getRelativeTime(createdAt)}</span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default VideosPage;
