import { isAddress } from "viem";
import { mainnetPublicClient } from "./mainnetPublicClient.js";
// Validate and resolve addresses (ENS support)
export async function validateAndResolveAddresses(addresses) {
  const resolvedAddresses = [];
  const validAddresses = [];
  const failedAddresses = [];

  for (let i = 0; i < addresses.length; i++) {
    const addr = addresses[i];
    try {
      if (addr.endsWith(".eth")) {
        // Resolve ENS name (note: ENS resolution requires Ethereum mainnet access)
        const resolved = await mainnetPublicClient.getEnsAddress({
          name: addr,
        });
        if (!resolved) {
          console.error(`Could not resolve ENS name: ${addr}`);
          failedAddresses.push({
            index: i,
            address: addr,
            reason: "ENS resolution failed",
          });
          continue;
        }
        resolvedAddresses.push(resolved);
        validAddresses.push(i);
      } else {
        // Validate address format
        if (!isAddress(addr)) {
          console.error(`Invalid address format: ${addr}`);
          failedAddresses.push({
            index: i,
            address: addr,
            reason: "Invalid address format",
          });
          continue;
        }
        resolvedAddresses.push(addr);
        validAddresses.push(i);
      }
    } catch (error) {
      console.error(`Error validating address ${addr}:`, error.message);
      failedAddresses.push({ index: i, address: addr, reason: error.message });
    }
  }

  return { resolvedAddresses, validAddresses, failedAddresses };
}

