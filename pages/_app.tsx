import { ChakraProvider } from "@chakra-ui/react";
import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";
import type { AppProps } from "next/app";
import theme from "../config/theme";
import GameProvider from "../context/GameContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider desiredChainId={ChainId.Goerli}>
      <ChakraProvider theme={theme}>
        <GameProvider>
          <Component {...pageProps} />
        </GameProvider>
      </ChakraProvider>
    </ThirdwebProvider>
  );
}
