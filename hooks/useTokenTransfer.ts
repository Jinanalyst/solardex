import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { notify } from '../utils/notifications';

export const useTokenTransfer = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(false);

  const sendToken = async (
    tokenMint: PublicKey,
    recipientAddress: string,
    amount: number
  ) => {
    if (!publicKey) throw new Error('Wallet not connected');
    setLoading(true);

    try {
      const recipient = new PublicKey(recipientAddress);
      
      // Get the token account of the sender
      const senderTokenAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        tokenMint,
        publicKey
      );

      // Get or create the token account of the recipient
      const recipientTokenAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        tokenMint,
        recipient
      );

      // Check if recipient token account exists
      const recipientAccountInfo = await connection.getAccountInfo(recipientTokenAccount);
      
      const transaction = new Transaction();

      // If recipient token account doesn't exist, create it
      if (!recipientAccountInfo) {
        transaction.add(
          Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            tokenMint,
            recipientTokenAccount,
            recipient,
            publicKey
          )
        );
      }

      // Add transfer instruction
      transaction.add(
        Token.createTransferInstruction(
          TOKEN_PROGRAM_ID,
          senderTokenAccount,
          recipientTokenAccount,
          publicKey,
          [],
          amount
        )
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      notify({ type: 'success', message: 'Transfer successful!' });
      return signature;
    } catch (error) {
      console.error('Error sending token:', error);
      notify({ type: 'error', message: 'Failed to send token' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendSOL = async (recipientAddress: string, amount: number) => {
    if (!publicKey) throw new Error('Wallet not connected');
    setLoading(true);

    try {
      const recipient = new PublicKey(recipientAddress);
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipient,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      notify({ type: 'success', message: 'SOL transfer successful!' });
      return signature;
    } catch (error) {
      console.error('Error sending SOL:', error);
      notify({ type: 'error', message: 'Failed to send SOL' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const buyToken = async (
    tokenMint: PublicKey,
    amount: number,
    price: number
  ) => {
    if (!publicKey) throw new Error('Wallet not connected');
    setLoading(true);

    try {
      // Calculate total cost in SOL
      const totalCost = amount * price;
      
      // Get the token account of the buyer
      const buyerTokenAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        tokenMint,
        publicKey
      );

      // Check if buyer token account exists
      const buyerAccountInfo = await connection.getAccountInfo(buyerTokenAccount);
      
      const transaction = new Transaction();

      // If buyer token account doesn't exist, create it
      if (!buyerAccountInfo) {
        transaction.add(
          Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            tokenMint,
            buyerTokenAccount,
            publicKey,
            publicKey
          )
        );
      }

      // Add payment instruction
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey('YOUR_TREASURY_ADDRESS'), // Replace with your treasury address
          lamports: totalCost * LAMPORTS_PER_SOL,
        })
      );

      // Add token transfer instruction
      transaction.add(
        Token.createMintToInstruction(
          TOKEN_PROGRAM_ID,
          tokenMint,
          buyerTokenAccount,
          publicKey,
          [],
          amount
        )
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      notify({ type: 'success', message: 'Token purchase successful!' });
      return signature;
    } catch (error) {
      console.error('Error buying token:', error);
      notify({ type: 'error', message: 'Failed to buy token' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendToken,
    sendSOL,
    buyToken,
    loading,
  };
};
