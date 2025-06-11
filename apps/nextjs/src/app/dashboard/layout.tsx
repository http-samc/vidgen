import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react'
import { auth } from '~/auth/server';

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  return (
    <div>
      <h1>Dashboard</h1>
      {children}
    </div>
  )
}

export default DashboardLayout