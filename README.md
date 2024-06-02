# Chain of Events

Chain of Events is a blockchain-based event management platform that leverages Ethereum smart contracts to provide a secure, transparent, and user-friendly experience for event organizers and attendees. This project utilizes Scaffold-ETH for rapid Ethereum dapp development, combining Hardhat for smart contract deployment and Next.js for the frontend.

**For Participants**:<br>

- We offer an easy to use application from which they can buy tickets and other consumables to an event.
- All items are tokenized as ERC721 NFTs, granting full ownership and the freedom to transfer assets securely.<br>
- Participants get to keep their NFTs after the event, maintaining the memory of the event forever, opening the door to future benefits and uses<br>
- Users get to participate in unique activities set up by organizers, such as lotteries, artist interactions, and exclusive behind-the-scenes experiences, with the sky being the limit.<br><br>

**For event organizers**:<br><br>

- Easily set up and manage your event. Register events, add various ticket types, and bring all sales on-chain.<br>
- Thanks to Chainlink Price Feeds, all prices are in USD to make the transition from Web2 smooth and intuitive.<br>
- Freely adjust prices, set mint limits, pause selling, control the total number of tickets sold or many other features. Use Chainlink Automation to schedule these updates seamlessly.<br>
  **The sky is the limit by using "Templates".**<br>
- Templates are smart contracts that use Chainlink products, like Automations or Functions, that can be attached to any event or asset. They enable everything from lotteries to dynamic changes in NFT characteristics based on off-chain events. <br>
- Anyone can create and share templates, expanding the functionality and versatility of events and opening the doors to limitless possibilities. Organizers can personalize their events to an unprecedented extent, providing unique experiences that were previously impossible.<br>
  **How are tickets or other consumables checked and validated?** <br>
  _Come Redeem function_<br>
- At the event, an authorized staff member, known as an "allowed person," will scan your digital wallet to view your event-related NFTs, such as tickets and consumables. They will then redeem the necessary NFTs directly in your wallet, marking them as used. Each redemption is securely recorded on the blockchain, ensuring a transparent and fraud-proof process.<br><br>

## Features

- **Event Management**: Organizers can create, manage, and customize events using ERC-721 tokens for tickets and consumables.
- **Chainlink Integration**: Utilizes Chainlink Price Feeds for real-time pricing and Chainlink VRF for verifiable randomness in event-related activities like lotteries.
- **NFTs for Tickets**: Tickets and other event-related items are managed as NFTs, ensuring ownership and transferability.
- **Templates System**: A flexible system allowing event organizers to attach customizable smart contract functionalities to events and tickets.

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v18.17)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart

To get started with Scaffold-ETH 2, follow the steps below:

1. Clone this repo & install dependencies

```
git clone https://github.com/scaffold-eth/scaffold-eth-2.git
cd scaffold-eth-2
yarn install
```

2. Run a local network in the first terminal:

```
yarn chain
```

This command starts a local Ethereum network using Hardhat. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in `hardhat.config.ts`.

3. On a second terminal, deploy the test contract:

```
yarn deploy
```

This command deploys a test smart contract to the local network. The contract is located in `packages/hardhat/contracts` and can be modified to suit your needs. The `yarn deploy` command uses the deploy script located in `packages/hardhat/deploy` to deploy the contract to the network. You can also customize the deploy script.

4. On a third terminal, start your NextJS app:

```
yarn start
```

Visit your app on: `http://localhost:3000`. You can interact with your smart contract using the `Debug Contracts` page. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.

**What's next**:

- Edit your smart contract `YourContract.sol` in `packages/hardhat/contracts`
- Edit your frontend homepage at `packages/nextjs/app/page.tsx`. For guidance on [routing](https://nextjs.org/docs/app/building-your-application/routing/defining-routes) and configuring [pages/layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts) checkout the Next.js documentation.
- Edit your deployment scripts in `packages/hardhat/deploy`
- Edit your smart contract test in: `packages/hardhat/test`. To run test use `yarn hardhat:test`

## Documentation

Visit our [docs](https://docs.scaffoldeth.io) to learn how to start building with Scaffold-ETH 2.

To know more about its features, check out our [website](https://scaffoldeth.io).

## Contributing to Scaffold-ETH 2

We welcome contributions to Scaffold-ETH 2!

Please see [CONTRIBUTING.MD](https://github.com/scaffold-eth/scaffold-eth-2/blob/main/CONTRIBUTING.md) for more information and guidelines for contributing to Scaffold-ETH 2.
