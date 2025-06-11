/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";

import React, { useState } from "react";
import { FaArrowCircleUp } from "react-icons/fa";

import { Button } from "@acme/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import { Textarea } from "@acme/ui/textarea";

const PromptInput = () => {
  const [prompt, setPrompt] = useState("");
  const [preset, setPreset] = useState<string | null>(null);

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value as string)}
        placeholder="Enter your video prompt here..."
        className="border-none text-sm focus-visible:ring-0"
        rows={3}
      />
      <div className="flex items-center justify-between">
        <Select value={preset ?? undefined} onValueChange={setPreset}>
          <SelectTrigger className="w-fit gap-2 border-none !text-sm focus:ring-0 focus-visible:ring-0">
            <SelectValue placeholder="Preset" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="family-guy">Family Guy</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          className="h-fit rounded-full !p-0 text-xl transition-colors hover:text-primary"
        >
          <FaArrowCircleUp />
        </Button>
      </div>
    </div>
  );
};

export default PromptInput;
