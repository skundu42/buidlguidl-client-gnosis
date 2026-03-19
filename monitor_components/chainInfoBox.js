import blessed from "blessed";
import { localClient } from "./viemClients.js";
import { owner } from "../commandLineOptions.js";
import { debugToFile } from "../helpers.js";

let chainInfoBox;

export function createChainInfoBox(grid) {
  let nRows = 5;
  if (owner !== null) {
    nRows = 3;
  }
  chainInfoBox = grid.set(2, 7, nRows, 1, blessed.box, {
    label: "Chain Info",
    stroke: "cyan",
    fill: "white",
    border: {
      type: "line",
      fg: "cyan",
    },
    wrap: false,
    tags: true,
  });

  return chainInfoBox;
}

// WXDAI and GNO contract addresses on Gnosis Chain
const WXDAI_CONTRACT_ADDRESS = "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d";
const GNO_CONTRACT_ADDRESS = "0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb";

// ABI to interact with the balanceOf function in an ERC-20 contract
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
];

// SushiSwap GNO/WXDAI pool on Gnosis Chain
const addressToCheck = "0x321704900D52F44180068cAA73778d5Cd60695A6";

function formatBalance(balance, decimals = 18) {
  return (BigInt(balance) / BigInt(10 ** decimals)).toString();
}

async function getGnoPrice(blockNumber) {
  try {
    const wxdaiBalance = await localClient.readContract({
      address: WXDAI_CONTRACT_ADDRESS,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [addressToCheck],
      blockNumber: blockNumber,
    });

    const gnoBalance = await localClient.readContract({
      address: GNO_CONTRACT_ADDRESS,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [addressToCheck],
      blockNumber: blockNumber,
    });

    const ratio = formatBalance(wxdaiBalance) / formatBalance(gnoBalance);
    const roundedRatio = ratio.toFixed(2);

    return roundedRatio;
  } catch (error) {
    debugToFile(`Error fetching token balances: ${error}`);
    return null;
  }
}

async function getBatchBlockInfo() {
  try {
    const nBlocks = Math.floor((chainInfoBox.height - 3) / 5);

    const currentBlockNumber = await localClient.getBlockNumber();

    if (currentBlockNumber === 0n) {
      return {
        blockNumbers: [],
        transactionCounts: [],
        gasPrices: [],
        gnoPrices: [],
      };
    }

    // Create an array of block numbers for the most current block and the previous blocks
    const blockNumbers = [];
    for (let i = 0; i < nBlocks; i++) {
      const blockNumber = currentBlockNumber - BigInt(i);
      if (blockNumber < 0n) break; // Stop if block number is out of range
      blockNumbers.push(blockNumber);
    }

    // Fetch the blocks concurrently using Promise.all
    const blocks = await Promise.all(
      blockNumbers.map((blockNumber) =>
        localClient.getBlock({
          blockNumber: blockNumber,
        })
      )
    );

    // Extract transaction counts, gas prices, and GNO prices from the blocks
    const transactionCounts = blocks.map((block) => block.transactions.length);
    const gasPrices = blocks.map(
      (block) => (Number(block.baseFeePerGas) / 10 ** 9).toFixed(4) // Convert gas prices to Gwei
    );

    // Fetch GNO prices concurrently for each block
    const gnoPrices = await Promise.all(
      blockNumbers.map((blockNumber) => getGnoPrice(blockNumber))
    );

    return { blockNumbers, transactionCounts, gasPrices, gnoPrices };
  } catch (error) {
    debugToFile(`getBatchBlockInfo(): ${error}`);
    return {
      blockNumbers: [],
      transactionCounts: [],
      gasPrices: [],
      gnoPrices: [],
    };
  }
}

export async function populateChainInfoBox() {
  try {
    const { blockNumbers, transactionCounts, gasPrices, gnoPrices } =
      await getBatchBlockInfo();

    // Check if all arrays are empty
    if (
      blockNumbers.length === 0 &&
      transactionCounts.length === 0 &&
      gasPrices.length === 0 &&
      gnoPrices.length === 0
    ) {
      chainInfoBox.setContent("INITIALIZING...");
      return;
    }

    // Get the width of the chainInfoBox to properly format the separator line
    const boxWidth = chainInfoBox.width - 2; // Adjusting for border padding
    const separator = "-".repeat(boxWidth);

    let content = "";
    content += separator + "\n";

    for (let i = 0; i < blockNumbers.length; i++) {
      content += `{center}{bold}{green-fg}${blockNumbers[
        i
      ].toLocaleString()}{/green-fg}{/bold}{/center}\n`;
      content += `{bold}{blue-fg}GNO $:{/blue-fg}{/bold} ${gnoPrices[i]}\n`;
      content += `{bold}{blue-fg}GAS:{/blue-fg}{/bold}   ${gasPrices[i]}\n`;
      content += `{bold}{blue-fg}# TX:{/blue-fg}{/bold}  ${transactionCounts[i]}\n`;
      content += separator;

      if (i < blockNumbers.length - 1) {
        content += "\n";
      }
    }

    chainInfoBox.setContent(content);
  } catch (error) {
    debugToFile(`populateChainInfoBox(): ${error}`);
  }
}
