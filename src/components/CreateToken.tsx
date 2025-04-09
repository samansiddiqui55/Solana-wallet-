
import { FC, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createToken, TokenInfo } from '@/lib/solana';

interface CreateTokenProps {
  onTokenCreated: (token: TokenInfo) => void;
}

export const CreateToken: FC<CreateTokenProps> = ({ onTokenCreated }) => {
  const { publicKey, signTransaction } = useWallet();
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [decimals, setDecimals] = useState('9'); // Default SPL token decimals
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!publicKey || !signTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a token",
        variant: "destructive",
      });
      return;
    }
    
    if (!tokenName || !tokenSymbol) {
      toast({
        title: "Missing Information",
        description: "Please provide both token name and symbol",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsCreating(true);
      const decimalsNumber = parseInt(decimals, 10);
      
      const wallet = { publicKey, signTransaction };
      
      toast({
        title: "Creating Token",
        description: "Please approve the transaction in your wallet",
      });
      
      const newToken = await createToken(wallet, tokenName, tokenSymbol, decimalsNumber);
      
      toast({
        title: "Token Created!",
        description: `Your token ${tokenSymbol} was successfully created`,
        variant: "default",
      });
      
      onTokenCreated(newToken);
      
      // Reset form
      setTokenName('');
      setTokenSymbol('');
      setDecimals('9');
      
    } catch (error: any) {
      console.error("Error creating token:", error);
      toast({
        title: "Error Creating Token",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="border-2 border-muted shadow-lg w-full">
      <CardHeader>
        <CardTitle className="text-xl">Create Token</CardTitle>
        <CardDescription>Create your own SPL token on Solana Devnet</CardDescription>
      </CardHeader>
      <form onSubmit={handleCreateToken}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tokenName">Token Name</Label>
            <Input
              id="tokenName"
              placeholder="My Awesome Token"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              disabled={isCreating}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tokenSymbol">Token Symbol</Label>
            <Input
              id="tokenSymbol"
              placeholder="MAT"
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value)}
              disabled={isCreating}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="decimals">Decimals</Label>
            <Input
              id="decimals"
              type="number"
              placeholder="9"
              value={decimals}
              onChange={(e) => setDecimals(e.target.value)}
              min="0"
              max="9"
              disabled={isCreating}
            />
            <p className="text-xs text-muted-foreground">
              Precision for your token. Most tokens use 9 decimals.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-solana-purple hover:opacity-90" 
            disabled={isCreating || !publicKey}
          >
            {isCreating ? "Creating..." : "Create Token"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
