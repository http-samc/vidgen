import Link from "next/link";

import AuthButton from "~/components/auth-button";

export default function HomePage() {
  return (
    <main className="grid h-screen w-full place-content-center gap-4">
      <div className="w-64 space-y-2">
        <h1 className="text-4xl font-bold">VidGen</h1>
        <p className="text-lg text-muted-foreground">
          AI generated short-form videos by{" "}
          <Link
            target="_blank"
            className="underline decoration-dotted"
            href="https://smrth.dev"
          >
            smrth
          </Link>
          .
        </p>
      </div>
      <AuthButton />
    </main>
  );
}
