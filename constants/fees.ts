import { PublicKey } from '@solana/web3.js';

export const FEE_CONSTANTS = {
  FEE_RECIPIENT: new PublicKey('6zkf4DviZZkpWVEh53MrcQV6vGXGpESnNXgAvU6KpBUH'),
  // Fee percentage in basis points (0.3%)
  FEE_BPS: 30,
  // Minimum fee in SOL
  MIN_FEE_SOL: 0.001,
  // Maximum fee in SOL
  MAX_FEE_SOL: 1.0,
};
