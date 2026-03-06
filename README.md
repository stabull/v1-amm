# Stabull

## Table of Contents

- [Project Description](#project-description)
- [Technologies Used](#technologies-used)
- [Folder Structure](#folder-structure)
- [Install and Run](#install-and-run)
- [Documentation](#documentation)

## Project Description

Stabull is a two-asset AMM designed for local stablecoins and RWAs, using a hybrid curve to deliver low slippage near fair value. Off-chain oracles anchor the curve’s center in value terms, improving capital efficiency and reducing slippage by concentrating liquidity around the oracle price.

By using Stabull, users can easily participate in liquidity pools, provide liquidity to various token pairs, and earn rewards in the form of swap fees and liquidity incentives. 

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

## Test & Coverage

To test the files, execute the following steps:

1. Run `npm hardhat test` to run the hardhat test cases.
2. Run `forge test` to run the foundry test cases.
3. RUn `forge coverage` to get the coverage of test cases.

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
- [Curve concepts](./Docs/CurveConcepts.md)
- [Gas report](./gas-report.txt)
- [Contract sizes](./Docs/ContractSize.png)
- [Test coverage](./Docs/TestCoverage.png)
