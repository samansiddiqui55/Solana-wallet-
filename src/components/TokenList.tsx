
import { FC, useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { TokenInfo, getTokenBalance, formatAmount } from '@/lib/solana';
import { ScrollArea } from "@/components/ui/scroll-area";

interface TokenListProps {
  tokens: TokenInfo[];
  onSelectToken: (token: TokenInfo) => void;
  selectedToken: TokenInfo | null;
}

export const TokenList: FC<TokenListProps> = ({ tokens, onSelectToken, selectedToken }) => {
  const { publicKey, signTransaction } = useWallet();
  const [tokenBalances, setTokenBalances] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (publicKey && signTransaction && tokens.length > 0) {
      const fetchBalances = async () => {
        setIsLoading(true);
        const balanceMap: Record<string, number> = {};
        
        for (const token of tokens) {
          try {
            const balance = await getTokenBalance(
              { publicKey, signTransaction },
              token.tokenAddress
            );
            balanceMap[token.tokenAddress] = balance;
          } catch (error) {
            console.error(`Error fetching balance for ${token.tokenSymbol}:`, error);
          }
        }
        
        setTokenBalances(balanceMap);
        setIsLoading(false);
      };
      
      fetchBalances();
    }
  }, [publicKey, signTransaction, tokens]);

  const refreshBalances = async () => {
    if (!publicKey || !signTransaction || tokens.length === 0) return;
    
    setIsLoading(true);
    const balanceMap: Record<string, number> = {};
    
    for (const token of tokens) {
      try {
        const balance = await getTokenBalance(
          { publicKey, signTransaction },
          token.tokenAddress
        );
        balanceMap[token.tokenAddress] = balance;
      } catch (error) {
        console.error(`Error fetching balance for ${token.tokenSymbol}:`, error);
      }
    }
    
    setTokenBalances(balanceMap);
    setIsLoading(false);
    
    toast({
      title: "Balances Updated",
      description: "Your token balances have been refreshed",
    });
  };

  return (
    <Card className="border-2 border-muted shadow-lg w-full">
      <CardHeader className="pb-2">
        <div className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-xl">Your Tokens</CardTitle>
            <CardDescription>Manage your SPL tokens on Solana Devnet</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshBalances}
            disabled={isLoading || !publicKey || tokens.length === 0}
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {tokens.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            You haven't created any tokens yet. Use the Create Token form to get started.
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokens.map((token) => (
                  <TableRow key={token.tokenAddress} className={selectedToken?.tokenAddress === token.tokenAddress ? "bg-muted" : ""}>
                    <TableCell className="font-medium">{token.tokenName}</TableCell>
                    <TableCell>{token.tokenSymbol}</TableCell>
                    <TableCell>
                      {tokenBalances[token.tokenAddress] !== undefined ? 
                        formatAmount(tokenBalances[token.tokenAddress], token.decimals) : 
                        <span className="animate-pulse-opacity">Loading...</span>
                      }
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onSelectToken(token)}
                      >
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
