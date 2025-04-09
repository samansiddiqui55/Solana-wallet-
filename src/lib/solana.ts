
import { 
  Connection, 
  PublicKey, 
  Transaction, 
  sendAndConfirmTransaction, 
  Keypair, 
  SystemProgram, 
  clusterApiUrl 
} from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  createMint, 
  getOrCreateAssociatedTokenAccount, 
  mintTo, 
  transfer, 
  getAccount,
  getMint,
  createAssociatedTokenAccount 
} from '@solana/spl-token';

export const SOLANA_CONNECTION = new Connection(clusterApiUrl('devnet'), 'confirmed');

export interface TokenInfo {
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  mintAuthority: string;
  freezeAuthority: string | null;
  decimals: number;
  balance?: number;
}

export const shortenAddress = (address: string, chars = 4): string => {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

export const formatAmount = (amount: number, decimals: number): string => {
  return (amount / 10 ** decimals).toFixed(decimals);
};

export const createToken = async (
  wallet: any,
  tokenName: string,
  tokenSymbol: string,
  decimals: number = 9
): Promise<TokenInfo> => {
  try {
    const connection = SOLANA_CONNECTION;
    
    // Check if wallet is connected
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    // Create the mint account
    const mintAuthority = wallet.publicKey;
    const freezeAuthority = wallet.publicKey;
    
    // Prepare transaction for creating mint
    const mintKeypair = Keypair.generate();
    const mintTransaction = new Transaction();
    
    // Get lamports required for rent-exemption
    const lamports = await connection.getMinimumBalanceForRentExemption(82);
    
    // Create the mint instruction
    mintTransaction.add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: 82,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      })
    );
    
    // Serialize the transaction
    const serializedTransaction = mintTransaction.serialize({
      requireAllSignatures: false,
      verifySignatures: true,
    });
    
    // Request signing from wallet
    const signedTransaction = await wallet.signTransaction(mintTransaction);
    
    // Sign with mint keypair
    signedTransaction.partialSign(mintKeypair);
    
    // Send transaction
    await connection.sendRawTransaction(signedTransaction.serialize());
    
    // Now initialize the mint
    const tokenMint = await createMint(
      connection,
      { publicKey: wallet.publicKey, signTransaction: wallet.signTransaction },
      mintAuthority,
      freezeAuthority,
      decimals
    );

    return {
      tokenAddress: tokenMint.toString(),
      tokenName,
      tokenSymbol,
      mintAuthority: mintAuthority.toString(),
      freezeAuthority: freezeAuthority ? freezeAuthority.toString() : null,
      decimals,
    };
  } catch (error) {
    console.error('Error creating token:', error);
    throw error;
  }
};

export const mintToken = async (
  wallet: any,
  tokenAddress: string,
  amount: number
): Promise<string> => {
  try {
    const connection = SOLANA_CONNECTION;
    
    // Check if wallet is connected
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const mintPubkey = new PublicKey(tokenAddress);
    const tokenInfo = await getMint(connection, mintPubkey);
    const mintAuthority = wallet.publicKey;
    
    // Get or create the associated token account for the recipient
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      { publicKey: wallet.publicKey, signTransaction: wallet.signTransaction },
      mintPubkey,
      wallet.publicKey
    );
    
    // Calculate the real amount based on decimals
    const realAmount = amount * (10 ** tokenInfo.decimals);
    
    // Mint the tokens
    const signature = await mintTo(
      connection,
      { publicKey: wallet.publicKey, signTransaction: wallet.signTransaction },
      mintPubkey,
      tokenAccount.address,
      mintAuthority,
      realAmount
    );

    return signature;
  } catch (error) {
    console.error('Error minting token:', error);
    throw error;
  }
};

export const sendToken = async (
  wallet: any,
  tokenAddress: string,
  recipientAddress: string,
  amount: number
): Promise<string> => {
  try {
    const connection = SOLANA_CONNECTION;
    
    // Check if wallet is connected
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const mintPubkey = new PublicKey(tokenAddress);
    const tokenInfo = await getMint(connection, mintPubkey);
    const recipientPubkey = new PublicKey(recipientAddress);
    
    // Get the sender token account
    const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      { publicKey: wallet.publicKey, signTransaction: wallet.signTransaction },
      mintPubkey,
      wallet.publicKey
    );

    // Get or create the recipient token account
    const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      { publicKey: wallet.publicKey, signTransaction: wallet.signTransaction },
      mintPubkey,
      recipientPubkey
    );
    
    // Calculate the real amount based on decimals
    const realAmount = amount * (10 ** tokenInfo.decimals);
    
    // Send the tokens
    const signature = await transfer(
      connection,
      { publicKey: wallet.publicKey, signTransaction: wallet.signTransaction },
      senderTokenAccount.address,
      recipientTokenAccount.address,
      wallet.publicKey,
      realAmount
    );

    return signature;
  } catch (error) {
    console.error('Error sending token:', error);
    throw error;
  }
};

export const getTokenBalance = async (
  wallet: any,
  tokenAddress: string
): Promise<number> => {
  try {
    const connection = SOLANA_CONNECTION;
    
    // Check if wallet is connected
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const mintPubkey = new PublicKey(tokenAddress);
    
    // Get the token account
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      { publicKey: wallet.publicKey, signTransaction: wallet.signTransaction },
      mintPubkey,
      wallet.publicKey
    );
    
    // Get the account info
    const accountInfo = await getAccount(connection, tokenAccount.address);
    
    return Number(accountInfo.amount);
  } catch (error) {
    console.error('Error getting token balance:', error);
    return 0;
  }
};

export const getSolBalance = async (publicKey: PublicKey): Promise<number> => {
  try {
    const connection = SOLANA_CONNECTION;
    const balance = await connection.getBalance(publicKey);
    return balance / 10 ** 9; // Convert lamports to SOL
  } catch (error) {
    console.error('Error getting SOL balance:', error);
    return 0;
  }
};

export const getTokenAccountsForWallet = async (
  wallet: PublicKey
): Promise<{ token: PublicKey; tokenAccount: PublicKey }[]> => {
  try {
    const connection = SOLANA_CONNECTION;
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      wallet,
      { programId: TOKEN_PROGRAM_ID }
    );

    return tokenAccounts.value.map((account) => {
      const parsedInfo = account.account.data.parsed.info;
      return {
        token: new PublicKey(parsedInfo.mint),
        tokenAccount: account.pubkey,
      };
    });
  } catch (error) {
    console.error('Error getting token accounts:', error);
    return [];
  }
};
