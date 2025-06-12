/* eslint-disable @typescript-eslint/no-non-null-assertion */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { FaArrowCircleUp } from "react-icons/fa";

import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import { Textarea } from "@acme/ui/textarea";

import { useTRPC } from "~/trpc/react";

interface PromptInputProps {
  presets: { id: number; value: string }[];
}

const PromptInput = ({ presets }: PromptInputProps) => {
  const trpc = useTRPC();
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [preset, setPreset] = useState<string>(presets[0]!.value);
  const { mutateAsync: createVideo, isPending: isCreating } = useMutation(
    trpc.dashboard.createVideo.mutationOptions(),
  );

  const handleSubmit = () => {
    if (prompt && preset) {
      void createVideo({ prompt, preset: preset }).then((result) => {
        if (result.jobId) {
          router.push(`/dashboard/videos/${result.jobId}`);
        }
      });
    }
  };

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      {!isCreating ? (
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Enter your video prompt here..."
          className="min-h-20 border-none text-sm focus-visible:ring-0"
          rows={3}
        />
      ) : (
        <div className="h-20 w-full animate-pulse rounded-lg bg-gray-700/20"></div>
      )}

      <div className="flex items-center justify-between">
        <Select value={preset} onValueChange={setPreset}>
          <SelectTrigger className="w-fit gap-2 border-none !text-sm focus:ring-0 focus-visible:ring-0">
            <SelectValue placeholder="Preset" />
          </SelectTrigger>
          <SelectContent>
            {presets.map((preset) => (
              <SelectItem key={preset.id} value={preset.value}>
                {preset.value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          className={cn(
            "h-fit rounded-full border border-transparent !p-0 text-xl transition hover:opacity-80 enabled:border-primary",
            isCreating && "cursor-wait",
          )}
          disabled={!prompt || !preset}
          onClick={handleSubmit}
        >
          <FaArrowCircleUp className="p-px" />
        </Button>
      </div>
    </div>
  );
};

export default PromptInput;
