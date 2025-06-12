import React from "react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "~/auth/server";
import Navigation from "~/components/navigation";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  return (
    <main className="min-h-screen w-full lg:p-12">
      <div className="mx-auto w-full max-w-4xl space-y-6 p-4 lg:p-12">
        <div className="w-full space-y-2 border-b pb-4">
          <div className="flex w-full items-center justify-between">
            <h3 className="font-mono text-2xl font-bold tracking-wider">
              VidGen
            </h3>
            <Link href="/dashboard/settings">
              <Image
                src={`${session.user.image}`}
                alt="user"
                width={32}
                height={32}
                className="rounded-full"
              />
            </Link>
          </div>
          <Navigation />
        </div>
        {children}
      </div>
    </main>
  );
};

export default DashboardLayout;
