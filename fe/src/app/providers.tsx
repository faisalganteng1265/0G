"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { ReactNode, useState } from "react";
import { WagmiProvider } from "wagmi";

import { zeroGGalileo, zeroGMainnet } from "@/lib/chains";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "0gide1-dev";

const wagmiConfig = getDefaultConfig({
  appName: "AIMentor.X",
  projectId: walletConnectProjectId,
  chains: [zeroGMainnet, zeroGGalileo],
  ssr: true,
});

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          theme={darkTheme({
            accentColor: "#2dd4bf",
            accentColorForeground: "#020617",
            borderRadius: "small",
            fontStack: "system",
            overlayBlur: "small",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
