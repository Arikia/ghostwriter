# Decentralizing the Future of Digital Publishing

## Project Overview

**Ghost Writer** is a blockchain-based content licensing system that enables decentralized marketplaces for journalism. Smart contracts automate the content licensing process which facilitates secure micropayments for per-article access. The licenses are stored on the Solana blockchain and the text is encrypted and stored off-chain in Arweave. This process creates an immutable record of ownership, access, and usage of journalistic works and unlocks new monetization and distribution streams for journalists. The CTRL+X Ghost Writer accepts content from a Ghost CMS export file in json format, parses the file into discrete articles, and enables the author to declare ownership mint the license as an NFT, and enter the freshly minted assets into a marketplace where they can accept direct payments from readers via web3 transactions. 

**CTRL+X** supports the development of public benefit infrastructure that empowers journalists to continue their vital work while expanding public access to journalistic content. By leveraging content licensing technology, CTRL+X helps maintain the historical record, fosters collaboration among journalists, and enhances monetization opportunities for their work.

### Problem Statement

Journalists face significant challenges in maintaining ownership of their content due to the phenomenon known as Platform Collapse, leading to:

- **Limited distribution**
- **Poor monetization**
- **Disappearing content** (e.g., link rot, memory holing)

These issues contribute to an environment where misinformation can easily proliferate and create a chilling effect within the journalism field.

### Solution

CTRL+X content licensing software provides immutable rights to authors, enabling buyer/seller transactions on a per-article basis through a blockchain-based solution for digital rights management. This allows authors to:

- Enhance distribution of their articles across multiple platforms
- Better monetize their published works
- Future-proof their content against platform collapse

### Why Now?

- The demand for quality journalism is higher than ever.
- Journalism needs sustainable **infrastructure** to thrive.
- More journalists are operating independently, giving them increased legal leverage to negotiate rights with corporate media institutions.
- Without open and sustainable infrastructure, we risk heading toward a digital information collapse.
- Current Web2 for-profit platform technology cannot support the ongoing transition in digital journalism.

## How to Run the Project

To start the development server, use one of the following commands:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Tech Stack

- **Next.js** - React framework for building user interfaces and use api routes to create the Solana actions for Blink.
- **TypeScript** - For type safety and code clarity.
- **Metaplex** - OS NFT protocol for minting and managing NFTs.
- **Arweave** - Decentralized Web3 storage.
- **Phantom Wallet** - A popular NFT wallet for Solana-based assets.
- **SolFlare** - Another popular NFT wallet for Solana-based assets.


## Team

- **Arikia Millikan** - Journalism industry expert, Conceptual Lead, Project Lead, Founder of CTRL+X UG, Writer.
- **Hyun-Kyung (Julie) Yi** - Lead Developer, Full-Stack Developer.
