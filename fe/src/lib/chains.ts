import { defineChain } from "viem";

export const zeroGMainnet = defineChain({
  id: 16661,
  name: "0G Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "0G",
    symbol: "0G",
  },
  rpcUrls: {
    default: {
      http: ["https://evmrpc.0g.ai"],
    },
  },
  blockExplorers: {
    default: {
      name: "0G ChainScan",
      url: "https://chainscan.0g.ai",
    },
  },
});

export const zeroGGalileo = defineChain({
  id: 16602,
  name: "0G Galileo Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "0G",
    symbol: "0G",
  },
  rpcUrls: {
    default: {
      http: ["https://evmrpc-testnet.0g.ai"],
    },
  },
  blockExplorers: {
    default: {
      name: "0G Galileo ChainScan",
      url: "https://chainscan-galileo.0g.ai",
    },
  },
  testnet: true,
});
