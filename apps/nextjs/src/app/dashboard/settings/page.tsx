"use client";

import React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@acme/ui/button";

import { authClient } from "~/auth/client";

const SettingsPage = () => {
  const router = useRouter();
  return (
    <div className="flex w-full justify-center">
      <Button
        variant="outline"
        onClick={() => {
          void authClient.signOut();
          router.push("/");
        }}
      >
        Sign out
      </Button>
    </div>
  );
};

export default SettingsPage;
