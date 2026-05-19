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
            <SessionProvider session={props.pageProps.session}>
              <FetchInterceptor />
              <Component {...props.pageProps} />
            </SessionProvider>
          </GoogleReCaptchaProvider>
        </QueryClientProvider>
      </Provider>
    </div>
  );
};

export default App;
