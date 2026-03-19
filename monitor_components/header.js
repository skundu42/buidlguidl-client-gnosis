import blessed from "blessed";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { debugToFile } from "../helpers.js";
import { execSync, exec } from "child_process";
import { getPublicIPAddress } from "../getSystemStats.js";
import { owner } from "../commandLineOptions.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function createHeader(grid, screen, messageForHeader) {
  // Store branch info once on startup
  let currentBranch = "unknown";
  let commitHash = "unknown";

  // Function to get the local IP address
  async function getIPAddress() {
    while (true) {
      const interfaces = os.networkInterfaces();
      for (const iface in interfaces) {
        for (const alias of interfaces[iface]) {
          if (alias.family === "IPv4" && !alias.internal) {
            return alias.address;
          }
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  // Function to get git branch info once on startup
  function initializeBranchInfo() {
    try {
      currentBranch = execSync("git rev-parse --abbrev-ref HEAD")
        .toString()
        .trim();
    } catch (error) {
      debugToFile(`Error getting current branch: ${error}`);
      currentBranch = "unknown";
    }

    try {
      commitHash = execSync("git rev-parse HEAD").toString().trim();
    } catch (error) {
      debugToFile(`Error getting current commit hash: ${error}`);
      commitHash = "unknown";
    }
  }

  // Function to update header content
  function updateHeaderContent() {
    if (owner !== null) {
      bigText.setContent(
        `{center}{bold}B u i d l G u i d l  C l i e n t  (Gnosis){/bold}{/center}\n` +
          `{center}Branch: ${currentBranch} (${commitHash}){/center}\n` +
          `{center}{cyan-fg} ${owner}{/cyan-fg}{/center}\n` +
          `{center}{cyan-fg}${messageForHeader}{/cyan-fg}{/center}`
      );
    } else {
      bigText.setContent(
        `{center}{bold}B u i d l G u i d l  C l i e n t  (Gnosis){/bold}{/center}\n` +
          `{center}Branch: ${currentBranch} (${commitHash}){/center}\n` +
          `{center}{cyan-fg}${messageForHeader}{/cyan-fg}{/center}`
      );
    }
    screen.render();
  }

  let pic, logo;
  try {
    pic = grid.set(0, 0, 1, 2, blessed.box, {
      border: false,
      valign: "top",
      padding: { top: 0, bottom: 0, left: 0, right: 0 },
      align: "center",
    });

    const renderLogo = () => {
      const logoHeight = pic.height * 1.1; // Use the height of the pic box
      const logoWidth = logoHeight + logoHeight * 1.5; // Adjust width as needed
      const leftPosition = Math.floor((pic.width - logoWidth) / 2);

      // If logo already exists, remove it before adding a new one
      if (logo) {
        pic.remove(logo);
      }

      logo = blessed.image({
        parent: pic,
        file: path.join(__dirname, "pixelBgLogo.png"),
        type: "ansi", // or "overlay" depending on your terminal capabilities
        width: logoWidth,
        height: logoHeight,
        left: leftPosition,
        top: -1,
      });

      pic.screen.render(); // Rerender the screen after updating the logo
    };

    // Initial render
    renderLogo();

    // Listen for resize events and rerender the logo
    pic.screen.on("resize", () => {
      renderLogo();
    });
  } catch (err) {
    debugToFile(`pic: ${err}`);
  }

  const bigText = grid.set(0, 2, 1, 5, blessed.box, {
    content: `{center}{bold}B u i d l G u i d l  C l i e n t  (Gnosis){/bold}{/center}\n{center}{cyan-fg}${messageForHeader}{/cyan-fg}{/center}`,
    tags: true,
    align: "center",
    valign: "top",
    style: {
      fg: "white",
      border: {
        fg: "cyan",
      },
    },
  });

  let ipAddressBoxContent = `{center}{bold}Local IP: Fetching...{/bold}\n{center}{bold}Public IP: Fetching...{/bold}{/center}`;

  // Create the IP address box
  const ipAddressBox = grid.set(0, 7, 1, 2, blessed.box, {
    content: ipAddressBoxContent,
    tags: true,
    align: "center",
    valign: "top",
    style: {
      fg: "white",
      border: {
        fg: "cyan",
      },
    },
  });

  // Update the IP address fetching part
  Promise.all([getIPAddress(), getPublicIPAddress()]).then(
    ([localIP, publicIP]) => {
      ipAddressBoxContent = `{center}{bold}Local IP: ${localIP}{/bold}\n{center}{bold}Public IP: ${publicIP}{/bold}{/center}`;
      ipAddressBox.setContent(ipAddressBoxContent);
      screen.render();
    }
  );

  // Initialize branch info once on startup
  initializeBranchInfo();

  updateHeaderContent();

  return { pic, bigText, ipAddressBox };
}
