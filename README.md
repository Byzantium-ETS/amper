# Amper - A Web Wallet for the Lightning Network

## Overview

Amper is a browser extension inspired by MetaMask that enables seamless interaction with the L402 protocol. It acts as a "web wallet" for managing macaroon tokens and facilitating payments over the Lightning Network. The wallet is designed to simplify the process of authenticating and paying for API services using the L402 standard.

## Features

- **Macaroon Token Management**: Store, retrieve, and manage macaroon tokens securely.
- **Lightning Wallet Integration**: Connect to a Lightning wallet to make payments and retrieve preimages.
- **L402 Protocol Support**: Handle the full L402 flow, including token minting, invoice payments, and token validation.
- **User-Friendly Interface**: A clean and intuitive UI for managing tokens, viewing payment history, and configuring wallet settings.
- **Secure Storage**: Encrypt sensitive data like tokens and preimages for enhanced security.

## Getting Started

### Prerequisites

- A Lightning wallet (e.g., LND, Phoenix, or any compatible wallet).
- A server implementing the L402 protocol (e.g., [lsat](https://github.com/Byzantium-ETS/lsat)).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Byzantium-ETS/amper.git
   cd amper
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load the extension into your browser:
   - Open your browser's extensions page.
   - Enable "Developer mode."
   - Click "Load unpacked" and select the `dist` folder.

## Usage

1. Connect your Lightning wallet in the settings page.
2. Use the wallet to pay for API services that support the L402 protocol.
3. Manage your macaroon tokens and view payment history in the dashboard.

## Project Structure

```
l402-wallet/
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Extension pages (popup, options, etc.)
│   ├── services/      # Business logic and API integrations
│   ├── styles/        # CSS and styling files
│   ├── utils/         # Utility functions
│   ├── assets/        # Static assets (images, icons, etc.)
├── README.md          # Project documentation
├── package.json       # Project dependencies and scripts
├── manifest.json      # Browser extension manifest
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push them to your fork.
4. Submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Resources

- [L402 Protocol Documentation](https://docs.lightning.engineering/the-lightning-network/l402)
- [LSAT Implementation](https://github.com/Byzantium-ETS/lsat)
- [Lightning Network Documentation](https://docs.lightning.engineering/)
