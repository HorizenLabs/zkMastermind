import { AccountProvider } from "../context/AccountContext";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import GameProvider from "../context/GameContext";
import GoogleAnalyticsTag from "../components/GoogleAnalyticsTag";
import theme from "../config/theme";
export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <GoogleAnalyticsTag />
      <AccountProvider>
        <GameProvider>
          <Component {...pageProps} />
            </GameProvider>
        </AccountProvider>
      </ChakraProvider>
  );
}
