"use client";

import { useState } from "react";
import styles from "../page.module.css";

interface VideoFormProps {
  createVideo: (prompt: string) => Promise<{
    success: boolean;
    jobId?: string;
    error?: string;
  }>;
}

export function VideoForm({ createVideo }: VideoFormProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await createVideo(prompt);
      if (result.success) {
        setPrompt("");
      } else {
        setError(result.error || "Failed to create video");
      }
    } catch (error) {
      console.error("Failed to create video:", error);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt here..."
        className={styles.textarea}
        rows={4}
      />
      {error && <div className={styles.error}>{error}</div>}
      <button
        onClick={handleSubmit}
        disabled={isLoading || !prompt.trim()}
        className={styles.button}
      >
        {isLoading ? "Generating..." : "Generate Video"}
      </button>
    </div>
  );
}
