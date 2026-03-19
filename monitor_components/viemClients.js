import { createPublicClient, http } from "viem";
import { gnosis } from "viem/chains";
export const localClient = createPublicClient({
  name: "localClient",
  chain: gnosis,
  transport: http("http://localhost:8545"),
});

export const mainnetClient = createPublicClient({
  name: "mainnetClient",
  chain: gnosis,
  transport: http(`https://rpc.gnosischain.com`, {
    fetchOptions: {
      headers: {
        Origin: "buidlguidl-client",
      },
    },
  }),
});

export async function getEthSyncingStatus() {
  try {
    const syncingStatus = await localClient.request({
      method: "eth_syncing",
      params: [],
    });

    return syncingStatus;
  } catch (error) {
    debugToFile(`getEthSyncingStatus(): ${error}`);
    return false; // Return false to indicate not syncing when there's an error
  }
}
