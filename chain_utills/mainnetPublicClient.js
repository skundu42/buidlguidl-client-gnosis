import { createPublicClient, http } from "viem";
import { gnosis } from "viem/chains";

export const mainnetPublicClient = createPublicClient({
  chain: gnosis,
  transport: http("https://rpc.gnosischain.com"),
});
