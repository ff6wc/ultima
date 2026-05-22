import { useDarkMode } from "@ff6wc/utils/useDarkMode";
import { Open_Sans } from "@next/font/google";
import { cx } from "cva";
import type { AppProps } from "next/app";
import { AppType } from "next/app";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider } from "react-redux";
import { Schema } from "~/state/schemaSlice";
import { makeStore, wrapper } from "~/state/store";
import "~/styles/globals.css";
import { AppSessionProvider } from "~/hooks/useAppSession";
import { ErrorBoundary } from "~/components/ErrorBoundary/ErrorBoundary";

export const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const client = new QueryClient({});

type Props = {
  schema: Schema;
};



export let singletonStore: any = null;

const App: AppType<Props> = ({ Component, ...rest }: AppProps<Props>) => {
  const { store, props } = wrapper.useWrappedStore(rest);
  singletonStore = store;

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
            <AppSessionProvider session={props.pageProps.session}>
              <ErrorBoundary>
                <Component {...props.pageProps} />
              </ErrorBoundary>
            </AppSessionProvider>
          </GoogleReCaptchaProvider>
        </QueryClientProvider>
      </Provider>
    </div>
  );
};

export default App;
