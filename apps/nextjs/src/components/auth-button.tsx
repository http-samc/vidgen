"use client";

import { authClient } from "~/auth/client";
import { FaGithub } from "react-icons/fa";
import { Button } from "@acme/ui/button";
import { useState, useEffect } from "react";
import type { Session } from "better-auth";

const AuthButton = () => {
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    void authClient.getSession().then(session => {
      if (session.data?.session) {
        setSession(session.data.session);
      }
    });
  }, []);

  return (
    <Button variant="outline" className="space-x-2" onClick={() => {
      void authClient.signIn.social({
        provider: "github",
        callbackURL: "/dashboard"
      });
    }}>
      {!session ? (<><FaGithub /> <span>Sign up</span></>)
         : "Dashboard"}
    </Button>
  )
}

export default AuthButton