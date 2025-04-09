
import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { TokenInfo } from '@/lib/solana';
import { WalletConnect } from '@/components/WalletConnect';
import { CreateToken } from '@/components/CreateToken';
import { TokenList } from '@/components/TokenList';
import { TokenManagement } from '@/components/TokenManagement';
import { TransactionHistory } from '@/components/TransactionHistory';
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { connected, publicKey } = useWallet();
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const { toast } = useToast();

  // Load tokens from localStorage when the component mounts
  useEffect(() => {
    if (connected && publicKey) {
      const savedTokensKey = `solana-tokens-${publicKey.toString()}`;
      const savedTokens = localStorage.getItem(savedTokensKey);
      
      if (savedTokens) {
        try {
          const parsedTokens = JSON.parse(savedTokens);
          setTokens(parsedTokens);
        } catch (error) {
          console.error('Error parsing saved tokens:', error);
        }
      }
      
      const savedTransactionsKey = `solana-transactions-${publicKey.toString()}`;
      const savedTransactions = localStorage.getItem(savedTransactionsKey);
      
      if (savedTransactions) {
        try {
          const parsedTransactions = JSON.parse(savedTransactions);
          // Convert string dates back to Date objects
          const transactionsWithDates = parsedTransactions.map((tx: any) => ({
            ...tx,
            timestamp: new Date(tx.timestamp)
          }));
          setTransactions(transactionsWithDates);
        } catch (error) {
          console.error('Error parsing saved transactions:', error);
        }
      }
    } else {
      // Reset state when wallet disconnects
      setTokens([]);
      setSelectedToken(null);
      setTransactions([]);
    }
  }, [connected, publicKey]);

  // Save tokens to localStorage when they change
  useEffect(() => {
    if (connected && publicKey && tokens.length > 0) {
      const tokensKey = `solana-tokens-${publicKey.toString()}`;
      localStorage.setItem(tokensKey, JSON.stringify(tokens));
    }
  }, [tokens, connected, publicKey]);

  // Save transactions to localStorage when they change
  useEffect(() => {
    if (connected && publicKey && transactions.length > 0) {
      const transactionsKey = `solana-transactions-${publicKey.toString()}`;
      localStorage.setItem(transactionsKey, JSON.stringify(transactions));
    }
  }, [transactions, connected, publicKey]);

  const handleTokenCreated = (newToken: TokenInfo) => {
    const updatedTokens = [...tokens, newToken];
    setTokens(updatedTokens);
    setSelectedToken(newToken);
    
    // Add a transaction record
    const newTransaction = {
      id: `create-${Date.now()}`,
      type: 'mint',
      amount: '0',
      symbol: newToken.tokenSymbol,
      address: newToken.tokenAddress,
      timestamp: new Date()
    };
    setTransactions([newTransaction, ...transactions]);
  };

  const handleSelectToken = (token: TokenInfo) => {
    setSelectedToken(token);
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-background">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-solana-gradient inline-block">
            Solana Token Vault
          </h1>
          <p className="mt-2 text-muted-foreground">
            Create, mint, and manage SPL tokens on Solana Devnet
          </p>
        </header>

        <WalletConnect />

        {connected && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CreateToken onTokenCreated={handleTokenCreated} />
            <TokenManagement selectedToken={selectedToken} />
          </div>
        )}

        {connected && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TokenList 
              tokens={tokens} 
              onSelectToken={handleSelectToken} 
              selectedToken={selectedToken}
            />
            <TransactionHistory transactions={transactions} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
