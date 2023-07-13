# Stabull

## Table of Contents

- [Project Description](#project-description)
- [Technologies Used](#technologies-used)
- [Folder Structure](#folder-structure)
- [Install and Run](#install-and-run)
- [Documentation](#documentation)

## Project Description

Stabull is a decentralized finance (DeFi) exchange protocol designed to provide users with a seamless experience for adding and removing liquidity. It leverages oracles to obtain external price feeds, ensuring accurate and up-to-date token prices. Stabull's unique features include a bonus system and slippage adjustment mechanism to enhance the trading experience.

By using Stabull, users can easily participate in liquidity pools, provide liquidity to various token pairs, and earn rewards in the form of transaction fees. The protocol employs advanced smart contract technology to enable secure and transparent transactions while minimizing counterparty risk.

## Technologies Used

- Solidity
- Hardhat
- Foundry
- Oracle integration (e.g., Chainlink, Band Protocol)

## Folder Structure

A typical top-level directory layout:

├── build # Compiled files (alternatively `dist`)

├── docs # Documentation files (alternatively `doc`)

├── src # Source files (alternatively `lib` or `app`)

├── test # Automated tests (alternatively `spec` or `tests`)

├── tools # Tools and utilities

├── LICENSE

└── README.md

## Install and Run

To install and run the project, follow these steps:

1. Run `npm install` to install dependencies.
2. Run `npx hardhat compile` to compile all contracts.

## Test

To test the files, execute the following steps:

1. Run `npm hardhat test` to run the hardhat test cases.
2. Run `forge test` to run the foundry test cases.

## Deploy & Verify

To deploy and verify the contracts, execute the following steps:

1. Run `npm hardhat run --network <network name> scripts/deploy.ts` to deploy the assimilator factory, config, curveFactory and curve(if added in script).
2. Run `npx hardhat verify --network <network name> <address> <constructor arguments> `.

## Gas Report

To generate the gas report of test cases

1.  Run `forge test --gas-report` to generate the gas report.

## Contract Size

To generate the contracts sizes

1. Run `forge build --sizes` to generate the contract sizes.

## Documentation

- [Contracts overview](./Docs/ContractGuide.md)
- [Gas report](./gas-report.txt)
- [Contract sizes](./ContractSize.png)
