import type { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { requireSuperAdmin } from "~/lib/auth.server";
import { Sidebar } from "~/components/layout/Sidebar";

export async function loader({ request }: LoaderFunctionArgs) {
  const { profile, headers } = await requireSuperAdmin(request);
  return Response.json(
    { profile },
    { headers }
  );
}

export default function DashboardLayout() {
  const { profile } = useLoaderData<typeof loader>();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        adminName={profile.full_name ?? profile.email}
        adminEmail={profile.email}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
