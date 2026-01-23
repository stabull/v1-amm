## Overview
Stabull is a two-asset AMM designed for local stablecoins and RWAs, using a hybrid curve to deliver low slippage near fair value. Off-chain oracles anchor the curve’s center in value terms, improving capital efficiency and reducing slippage by concentrating liquidity around the oracle price.

## Oracle-centered pricing curve

Stabull uses oracles to define the "center" of the curve in value terms, not just raw reserve ratios. Each asset has an assimilator that converts token amounts into numeraire value using its oracle price. That means the pool’s ideal balance is defined around the oracle price, and the low-slippage region follows the oracle as it moves.

Practical intuition:

- If the pool is close to its ideal (e.g., 50/50 value by weight), you sit in the flat section of the hybrid curve and get low slippage near the oracle price.
- When trade pushes reserves away from that ideal, the fee surfaces steepen, and the swap price moves further from the oracle (higher slippage).
- If the off-chain oracle price changes (e.g., EUR/USD moves), the assimilators revalue balances in numeraire, shifting the curve center. The pool’s fair price moves toward the new oracle price even before trades, as long as reserves are not deeply imbalanced.

This is the key difference from UniswapV2: Uniswap prices purely from raw reserve ratios, while Stabull anchors the mid-point of its liquidity distribution to the oracle price and then penalizes deviations from that center.

 ## Hybrid AMM pricing logic overview

- [`Curve.sol`](/src/Curve.sol): Pool ERC20 + swap entrypoints; wires user-facing `originSwap/targetSwap` into `Swaps` and exposes current curve params; enforces guards (frozen/emergency) around pricing.
- [`Swaps.sol`](/src/Swaps.sol): Core swap flow; pulls oracle-priced balances via `Assimilators`, builds pre-/post-trade balance vectors, and calls `CurveMath.calculateTrade` to solve the hybrid curve; applies epsilon spread + protocol fee and emits trades; view functions reuse same math without state changes.
- [`CurveMath.sol`](/src/CurveMath.sol): Pricing engine for the hybrid constant-sum/product curve; computes imbalance fees (`omega/psi`) from `alpha/beta/delta`, enforces halts, and iteratively solves for output amount (Newton-like fixed-point loop) to satisfy the swap invariant.
- [`Assimilators.sol`](/src/Assimilators.sol): Abstraction layer that converts raw token amounts to/from “numeraire” amounts via per-asset assimilators; provides balance/intake/output helpers so pricing math works in a unified unit.
- [`assimilators/AssimilatorV2.sol`](/src/assimilators/AssimilatorV2.sol): Chainlink-oracle-backed assimilator; translates token amounts to numeraire using `latestRoundData` prices (oracle anchors flat region center) and handles token transfers during swaps.
- [`Storage.sol`](/src/Storage.sol): Defines curve parameters (`alpha/beta/delta/epsilon/lambda`), weights, assimilator registry, and oracle mapping used by pricing routines.
- [`Orchestrator.sol`](/src/Orchestrator.sol): Admin/initialization of pricing parameters and asset weights; validates fee envelope and sets assimilators that feed prices into swap math.

## Main swap flow (waterfall)

- `Curve.originSwap` / `Curve.targetSwap` (user entrypoint) → delegate to `Swaps.originSwap` / `Swaps.targetSwap`.
- `Swaps.*Swap` → fetch origin/target assimilators; short-circuit if same index; otherwise gather balances via `Assimilators.*` into `_oBals/_nBals`, and compute gross amounts/liquidity.
- `Swaps.*Swap` → call `CurveMath.calculateTrade` with original and new liquidity/balances plus input/output index to solve for trade output.
- `CurveMath.calculateTrade` → compute initial fee `omega`; iterate up to 32 times recomputing fee `psi` on tentative post-trade balances; update output with lambda-weighted adjustment until stable to 1e-13 scale; enforce halts and invariant.
- Back in `Swaps.*Swap` → apply spread `epsilon` and split fees into protocol portion; move tokens via `Assimilators.outputNumeraire` / `intakeNumeraire` and emit `Trade`.

## CurveMath mental model

`CurveMath.sol` is where the hybrid curve is enforced during a swap. It works in numeraire units (oracle-priced value) so the invariant reflects economic value rather than raw token units. The two key ideas are:

1) Fee surfaces (`omega` and `psi`) represent how imbalanced the pool is relative to its ideal, weight-based composition.
2) The swap output is the value that makes the post-trade state land on the invariant, subject to halts.

How it fits together:

- `calculateFee` builds a per-asset "micro fee" based on how far each balance is from its ideal weight band (`beta` width). Past that band, the fee grows with `delta` and is capped.
- `calculateTrade` uses those fees to solve for output:
  - Start with `outputAmt = -inputAmt`.
  - Compute `omega` from the old balances and `psi` from tentative new balances.
  - Adjust the output by the fee gap; `lambda` dampens how strongly the curve reacts when moving away from balance.
  - Repeat until the output converges (or revert if it does not).
  - Run `enforceHalts` (alpha bounds) and `enforceSwapInvariant` so trades cannot jump outside the safe region.

The result is a curve that behaves like constant-sum near the center (low slippage) and bends toward constant-product as balances drift out of band.