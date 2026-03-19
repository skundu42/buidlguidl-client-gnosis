# 📡 BuidlGuidl Client (Gnosis Chain)
This project will download client executables, start an execution + consensus client pair for Gnosis Chain, and provide a terminal dashboard view of client and machine info.

&nbsp;
&nbsp;
## Hardware Requirements
Gnosis Chain has lower hardware requirements than Ethereum mainnet.

- Node operation doesn't require too much CPU power. A modern dual-core processor is sufficient.
- 16 GB of RAM is recommended (32 GB provides plenty of overhead).
- You will need at least a 1 TB NVMe SSD that includes a DRAM cache and DOES NOT use a Quad-level cell (QLC) architecture. This [SSD List GitHub Gist](https://gist.github.com/yorickdowne/f3a3e79a573bf35767cd002cc977b038) has a nice list of SSDs that have been tested and confirmed to work for running nodes.

&nbsp;
&nbsp;
## Dependencies
For Linux & MacOS:
- node (https://nodejs.org/en)
- yarn (https://yarnpkg.com/migration/overview)
- GNU Make (https://www.gnu.org/software/make/)

Additional MacOS Specifics:
- gnupg (https://gnupg.org/)
- Perl-Digest-SHA (https://metacpan.org/pod/Digest::SHA)

Hint: See the one line command below if you don't want to install the dependencies manually.

&nbsp;
&nbsp;
## Quickstart
To get a full Gnosis Chain node started using a Reth + Lighthouse client pair:
  ```bash
  git clone https://github.com/BuidlGuidl/buidlguidl-client-gnosis.git
  cd buidlguidl-client-gnosis
  yarn install
  node index.js
  ```

&nbsp;
&nbsp;

By default, client executables, databases, and logs will be established within buidlguidl-client-gnosis/ethereum_clients. After initialization steps, the script displays a terminal view with scrolling client logs and some plots showing some machine and chain stats. Full client logs are located in ethereum_clients/reth/logs and ethereum_clients/lighthouse/logs. Exiting the terminal view (control-c or q) will also gracefully close your clients (can take 15 seconds or so).

&nbsp;
&nbsp;

## Startup Options

Use the --archive flag to perform an archive sync for the execution client:
  ```bash
  node index.js --archive
  ```

Omitting the --archive flag will make the execution clients perform a pruned sync.

&nbsp;
&nbsp;

You can opt in to the BuidlGuidl distributed RPC system and earn [BuidlGuidl Bread](https://bread.buidlguidl.com/) for serving RPC requests to the BuidlGuidl network by passing your address to the --owner (-o) option:
  ```bash
  node index.js --owner <your address>
  ```

&nbsp;
You can also opt-in to receive Telegram alerts for client crashes when --owner is set. To do so, message /start to @BG_Client_Alert_Bot on Telegram.

&nbsp;
&nbsp;

If you want to specify a non-standard location for the ethereum_clients directory, pass a --directory (-d) option to index.js:
  ```bash
  node index.js --directory path/for/directory/containing/ethereum_clients
  ```

&nbsp;
&nbsp;

If you want to use a Geth + Prysm client pair, pass those as --executionclient (-e) and --consensusclient (-c) options to index.js:
  ```bash
  node index.js --executionclient geth --consensusclient prysm
  ```

&nbsp;
&nbsp;

Pass the --update option to update the execution and consensus clients to the latest versions (that have been tested with the BG Client):
  ```bash
  node index.js --update
  ```

&nbsp;
&nbsp;

Use the --help (-h) option to see all command line options:
  ```bash
  node index.js --help

  -e, --executionclient <client>            Specify the execution client ('reth' or 'geth')
                                            Default: reth

  -c, --consensusclient <client>            Specify the consensus client ('lighthouse' or 'prysm')
                                            Default: lighthouse

       --archive                            Perform an archive sync for the execution client

  -ep, --executionpeerport <port>           Specify the execution peer port (must be a number)
                                            Default: 30303

  -cp, --consensuspeerports <port>,<port>   Specify the consensus peer ports (must be two comma-separated numbers)
                                            lighthouse defaults: 9000,9001. prysm defaults: 12000,13000

  -cc, --consensuscheckpoint <url>          Specify a custom consensus checkpoint server URL
                                            If not provided, the fastest and most current checkpoint server will be automatically
                                            selected from Gnosis Chain public checkpoint servers

  -d, --directory <path>                    Specify gnosis client executable, database, and logs directory
                                            Default: buidlguidl-client-gnosis/ethereum_clients

  -o, --owner <address>                     Specify an owner address to opt in to the points system, distributed RPC network, and Telegram alerts
                                            To set up Telegram alerts for clients crashes, message /start to @BG_Client_Alert_Bot on Telegram

      --update                              Update the execution and consensus clients to the latest version.

  -h, --help                                Display this help message and exit
  ```

&nbsp;
&nbsp;
## Common Questions and Issues
The consensus clients (Lighthouse and Prysm) require a checkpoint sync server URL to initiate sync. Connection to checkpoint servers can fail depending on your location. If the consensus client fails to start the sync and you see an error message in the Lighthouse/Prysm logs like this:

```bash
INFO Starting checkpoint sync                remote_url: https://checkpoint.gnosis.gateway.fm/, service: beacon
CRIT Failed to start beacon node             reason: Error loading checkpoint state from remote: HttpClient(, kind: timeout, detail: operation timed out)
INFO Internal shutdown received              reason: Failed to start beacon node
INFO Shutting down..                         reason: Failure("Failed to start beacon node")
Failed to start beacon node
```

You will need to specify a different checkpoint server URL using the --consensuscheckpoint (-cc) option. See https://docs.gnosischain.com/ for more information on Gnosis Chain checkpoint sync servers.

&nbsp;
&nbsp;

The consensus client logs can output many warnings while syncing. These warnings can be ignored and will resolve after the execution client has synced.
