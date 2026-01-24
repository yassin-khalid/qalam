import React from "react";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Toaster } from "react-hot-toast";
import { TanStackDevtools } from "@tanstack/react-devtools";

import appCss from "../styles.css?url";
import { ClientRoot } from "@/lib/components/ClientRoot";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "قلم",
      },
      {
        name: "description",
        content: "قلم - منصة تعليمية رائدة",
      },
      {
        name: "keywords",
        content: "قلم, منصة تعليمية, رائدة",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "preconnect",
        href: "'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@100;200;300;400;500;600;700&display=swap'",
      },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/qalam-logo.svg",
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        sizes: "32x32",
        href: "/qalam-logo.svg",
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        sizes: "16x16",
        href: "/qalam-logo.svg",
      },
    ],
  }),

  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const isServer = typeof window === "undefined";


  return (
    <html lang="ar" dir="rtl" className="scroll-smooth">
      <head>
        <HeadContent />
      </head>
      <body className="bg-white dark:bg-slate-950 transition-colors duration-500">
        <NuqsAdapter>
          {isServer ? children : <ClientRoot>{children}</ClientRoot>}
          {/* {children} */}
        </NuqsAdapter>
        <Toaster position="bottom-right" />
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
