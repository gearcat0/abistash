# abistash

A small command-line utility to fetch contract ABIs from Etherscan's unified API and store them locally. This helps in managing ABIs for frequently interacted Ethereum contracts without having to keep track of individual files.

## Features

*   Utilizes Etherscan's new unified API (v2) for fetching ABIs.
*   Requires only **one** Etherscan API key for all supported chains.
*   Organizes ABIs by `chainId` and checksummed contract address.
*   Stores ABIs in `~/.cache/abistash` (or your system's equivalent cache directory).

## Installation

### Prerequisites

*   Node.js (LTS version recommended)
*   npm (Node.js package manager)

### From npm (Recommended)

```bash
npm install -g abistash
```

### From Source

1.  Clone the repository:

    ```bash
    git clone https://github.com/gearcat0/abistash
    cd abistash
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Link the executable (optional, but good for local development):

    ```bash
    npm link
    ```

## Usage

Before using `abistash`, you need to set your Etherscan API key as an environment variable.

### Setting Etherscan API Key (Unified API v2)

You can obtain your **single** Etherscan API key from the [Etherscan website](https://etherscan.io/apidashboard). This key will work across all supported chains that use the Etherscan API v2.

```bash
export ETHERSCAN_API_KEY=yourkey
```

`abistash [contract address] [optional chain ID or name, default is mainnet]`

### Examples

Fetch the ABI for USDT on Ethereum Mainnet:

```bash
abistash 0xdAC17F958D2ee523a2206206994597C13D831ec7 mainnet
```

You can also use the chain ID:

```bash
abistash 0xdAC17F958D2ee523a2206206994597C13D831ec7 1
```

If the chain ID or name is omitted, it defaults to Mainnet (chain ID 1).

## ABI Storage Location

ABIs are stored in a structured directory under your user's cache directory:

```
~/.cache/abistash/
├── <chainId>/
│   └── <checksummed_address>.json
└── ...
```

For example, the ABI for USDT on Ethereum Mainnet would be saved as:

```
~/.cache/abistash/1/0xdAC17F958D2ee523a2206206994597C13D831ec7.json
```

## Supported Networks

- Mainnet (Chain ID 1)
- Ropsten (Chain ID 3)
- Kovan (Chain ID 42)
- Rinkeby (Chain ID 4)
- Goerli (Chain ID 5)
- Sepolia (Chain ID 11155111)
- Binance Smart Chain Mainnet (Chain ID 56)
- Binance Smart Chain Testnet (Chain ID 97)
- Polygon Mainnet (Chain ID 137)
- Polygon Amoy Testnet (Chain ID 80002)
- Arbitrum One (Chain ID 42161)
- Arbitrum Nova (Chain ID 42170)
- Optimism Mainnet (Chain ID 10)
- Optimism Sepolia (Chain ID 11155420)
- Fantom Opera (Chain ID 250)
- Avalanche C-Chain (Chain ID 43114)
- Cronos Mainnet (Chain ID 25)

Supported chains are fetched automatically from Etherscan, so `abistash` will support even more chains without code changes, as Etherscan provides the necessary API endpoints.

If you encounter issues with a supported network or need support for an additional one not listed (and confirmed by Etherscan to be on v2 API), please open an issue or contribute!

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for bugs, feature requests, or improvements.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

