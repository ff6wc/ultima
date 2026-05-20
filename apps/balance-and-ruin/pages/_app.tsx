import { useDarkMode } from "@ff6wc/utils/useDarkMode";
import { Montserrat, Open_Sans, Roboto, Roboto_Mono } from "@next/font/google";
import localFont from "@next/font/local";
import { cx } from "cva";
import type { AppProps } from "next/app";
import { AppType } from "next/app";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider } from "react-redux";

import { useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";

import { Schema } from "~/state/schemaSlice";
import { wrapper } from "~/state/store";
import "~/styles/globals.css";

export const montserrat = Montserrat();
export const roboto = Roboto({ weight: ["500", "700", "400"] });
export const robotoMono = Roboto_Mono({ weight: ["500"] });
export const openSans = Open_Sans({ weight: ["300", "400", "500"] });

const client = new QueryClient({});

/** Auth is only available when running with a Node.js server (local dev).
 *  On static exports (Cloudflare Pages) the /api/auth/* routes don't exist,
 *  so we disable the entire NextAuth SessionProvider to prevent 404 cascades. */
const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED === "true";

type Props = {
  schema: Schema;
};

const FetchInterceptor = () => {
  const { data: session } = useSession();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const accessToken = (session?.user as any)?.accessToken;
    const originalFetch = window.fetch;

    window.fetch = async (input, init) => {
      let url = "";
      if (typeof input === "string") {
        url = input;
      } else if (input instanceof URL) {
        url = input.toString();
      } else if (input && typeof input === "object" && "url" in input) {
        url = (input as any).url;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      if (apiUrl && url.startsWith(apiUrl) && accessToken) {
        init = init || {};
        const headers = new Headers(init.headers || {});
        if (!headers.has("Authorization")) {
          headers.set("Authorization", `Bearer ${accessToken}`);
        }
        init.headers = headers;
      }
      return originalFetch(input, init);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [session]);

  return null;
};

/** Wraps children in SessionProvider only when auth is enabled.
 *  On static deployments this renders children directly, avoiding
 *  NextAuth's /api/auth/session fetch that would 404. */
const AuthWrapper = ({ children, session }: { children: React.ReactNode; session?: any }) => {
  if (!AUTH_ENABLED) {
    return <>{children}</>;
  }
  return (
    <SessionProvider session={session}>
      <FetchInterceptor />
      {children}
    </SessionProvider>
  );
};

const App: AppType<Props> = ({ Component, ...rest }: AppProps<Props>) => {
  const { store, props } = wrapper.useWrappedStore(rest);

  useDarkMode();

  if (!process.env.NEXT_PUBLIC_RECAPTCHA_KEY) {
    console.warn("no recaptcha key found, flag generation may not work");
  }

  return (
    <div
      className={cx(
        openSans.className,
        "text-grey dark:text-white flex flex-col h-full",
      )}
    >
      <Provider store={store}>
        <QueryClientProvider client={client}>
          <GoogleReCaptchaProvider
            reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_KEY as string}
          >
            <AuthWrapper session={props.pageProps.session}>
              <Component {...props.pageProps} />
            </AuthWrapper>
          </GoogleReCaptchaProvider>
        </QueryClientProvider>
      </Provider>
    </div>
  );
};

export default App;

