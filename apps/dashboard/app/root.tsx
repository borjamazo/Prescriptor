import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Toaster } from "sonner";
import stylesheet from "~/tailwind.css?url";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap",
  },
  { rel: "stylesheet", href: stylesheet },
];

export async function loader({ request: _ }: LoaderFunctionArgs) {
  return {
    ENV: {
      SUPABASE_URL: process.env.SUPABASE_URL ?? "",
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ?? "",
    },
  };
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full bg-surface-50 text-surface-900 dark:bg-surface-950 dark:text-surface-100">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { ENV } = useLoaderData<typeof loader>();

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.ENV = ${JSON.stringify(ENV)}`,
        }}
      />
      <Toaster position="top-right" richColors closeButton />
      <Outlet />
    </>
  );
}

export function ErrorBoundary() {
  return (
    <html lang="es" className="h-full">
      <head>
        <title>Error</title>
        <Meta />
        <Links />
      </head>
      <body className="flex h-full items-center justify-center bg-surface-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-surface-900">500</h1>
          <p className="mt-2 text-surface-500">Algo salió mal. Inténtalo de nuevo.</p>
          <a
            href="/"
            className="mt-4 inline-block text-brand-600 underline hover:text-brand-700"
          >
            Volver al inicio
          </a>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
