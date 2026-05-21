import { useDarkMode } from "@ff6wc/utils/useDarkMode";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "react-query";
import { Montserrat, Roboto, Roboto_Mono } from "@next/font/google";

import { cx } from "cva";
import { AppType } from "next/app";
import "~/styles/globals.css";

const montserrat = Montserrat({ subsets: ["latin"] });
const roboto = Roboto({ weight: ["500", "700", "400"], subsets: ["latin"] });
const robotoMono = Roboto_Mono({ weight: ["500"], subsets: ["latin"] });

const client = new QueryClient({});

type Props = {};

const App: AppType<Props> = ({ Component, ...rest }: AppProps<Props>) => {
  // const { store, props } = wrapper.useWrappedStore(rest);
  useDarkMode();
  return (
    <div
      className={cx(
        robotoMono.className,
        montserrat.className,
        roboto.className,
        "w-full flex flex-col h-full",
      )}
    >
      {/* <Provider store={store}> */}
      <QueryClientProvider client={client}>
        <Component />
      </QueryClientProvider>
      {/* </Provider> */}
    </div>
  );
};

export default App;
