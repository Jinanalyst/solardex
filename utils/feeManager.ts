import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { FEE_CONSTANTS } from '../constants/fees';

export class FeeManager {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  /**
   * Calculate the fee amount in SOL based on the transaction amount
   */
  calculateFee(amountInSOL: number): number {
    const feeAmount = (amountInSOL * FEE_CONSTANTS.FEE_BPS) / 10000;
    
    // Ensure fee is within bounds
    if (feeAmount < FEE_CONSTANTS.MIN_FEE_SOL) {
      return FEE_CONSTANTS.MIN_FEE_SOL;
    }
    if (feeAmount > FEE_CONSTANTS.MAX_FEE_SOL) {
      return FEE_CONSTANTS.MAX_FEE_SOL;
    }
    
    return feeAmount;
  }

  /**
   * Create a fee transfer instruction
   */
  async createFeeTransferInstruction(
    fromPubkey: PublicKey,
    amountInSOL: number
  ) {
    const feeAmount = this.calculateFee(amountInSOL);
    const lamports = feeAmount * LAMPORTS_PER_SOL;

    return SystemProgram.transfer({
      fromPubkey,
      toPubkey: FEE_CONSTANTS.FEE_RECIPIENT,
      lamports: Math.floor(lamports),
    });
  }

  /**
   * Add fee transfer to an existing transaction
   */
  async addFeeToTransaction(
    transaction: Transaction,
    fromPubkey: PublicKey,
    amountInSOL: number
  ): Promise<Transaction> {
    const feeInstruction = await this.createFeeTransferInstruction(
      fromPubkey,
      amountInSOL
    );
    
    transaction.add(feeInstruction);
    return transaction;
  }

  /**
   * Get the current SOL balance of the fee recipient
   */
  async getFeeRecipientBalance(): Promise<number> {
    const balance = await this.connection.getBalance(FEE_CONSTANTS.FEE_RECIPIENT);
    return balance / LAMPORTS_PER_SOL;
  }

  /**
   * Format fee amount for display
   */
  static formatFee(feeInSOL: number): string {
    return `${feeInSOL.toFixed(4)} SOL`;
  }
}
