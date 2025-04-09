
import { FC, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { mintToken, sendToken, TokenInfo } from '@/lib/solana';

interface TokenManagementProps {
  selectedToken: TokenInfo | null;
}

export const TokenManagement: FC<TokenManagementProps> = ({ selectedToken }) => {
  const { publicKey, signTransaction } = useWallet();
  const [mintAmount, setMintAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [isMinting, setIsMinting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleMintTokens = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!publicKey || !signTransaction || !selectedToken) {
      toast({
        title: "Cannot Mint Tokens",
        description: "Please connect your wallet and select a token",
        variant: "destructive",
      });
      return;
    }
    
    const amount = parseFloat(mintAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to mint",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsMinting(true);
      const wallet = { publicKey, signTransaction };
      
      toast({
        title: "Minting Tokens",
        description: "Please approve the transaction in your wallet",
      });
      
      const signature = await mintToken(wallet, selectedToken.tokenAddress, amount);
      
      toast({
        title: "Tokens Minted!",
        description: `Successfully minted ${amount} ${selectedToken.tokenSymbol}`,
        variant: "default",
      });
      
      setMintAmount('');
      
    } catch (error: any) {
      console.error("Error minting tokens:", error);
      toast({
        title: "Error Minting Tokens",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsMinting(false);
    }
  };

  const handleSendTokens = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!publicKey || !signTransaction || !selectedToken) {
      toast({
        title: "Cannot Send Tokens",
        description: "Please connect your wallet and select a token",
        variant: "destructive",
      });
      return;
    }
    
    if (!recipientAddress) {
      toast({
        title: "Missing Recipient",
        description: "Please enter a recipient address",
        variant: "destructive",
      });
      return;
    }
    
    const amount = parseFloat(sendAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to send",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSending(true);
      const wallet = { publicKey, signTransaction };
      
      toast({
        title: "Sending Tokens",
        description: "Please approve the transaction in your wallet",
      });
      
      const signature = await sendToken(wallet, selectedToken.tokenAddress, recipientAddress, amount);
      
      toast({
        title: "Tokens Sent!",
        description: `Successfully sent ${amount} ${selectedToken.tokenSymbol} to ${recipientAddress.slice(0, 4)}...${recipientAddress.slice(-4)}`,
        variant: "default",
      });
      
      setRecipientAddress('');
      setSendAmount('');
      
    } catch (error: any) {
      console.error("Error sending tokens:", error);
      toast({
        title: "Error Sending Tokens",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!selectedToken) {
    return (
      <Card className="border-2 border-muted shadow-lg w-full">
        <CardHeader>
          <CardTitle className="text-xl">Token Management</CardTitle>
          <CardDescription>Mint and send your SPL tokens</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-muted-foreground">
            Please select a token from your token list to manage it
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-muted shadow-lg w-full">
      <CardHeader>
        <CardTitle className="text-xl">
          Manage {selectedToken.tokenName} ({selectedToken.tokenSymbol})
        </CardTitle>
        <CardDescription>Mint or send your tokens on Solana Devnet</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="mint" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mint">Mint Tokens</TabsTrigger>
            <TabsTrigger value="send">Send Tokens</TabsTrigger>
          </TabsList>
          <TabsContent value="mint">
            <form onSubmit={handleMintTokens} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="mintAmount">Amount to Mint</Label>
                <Input
                  id="mintAmount"
                  type="number"
                  placeholder="100"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  disabled={isMinting}
                />
                <p className="text-xs text-muted-foreground">
                  How many tokens you want to mint to your wallet
                </p>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-solana-purple hover:opacity-90" 
                disabled={isMinting || !publicKey}
              >
                {isMinting ? "Minting..." : `Mint ${selectedToken.tokenSymbol}`}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="send">
            <form onSubmit={handleSendTokens} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="recipientAddress">Recipient Address</Label>
                <Input
                  id="recipientAddress"
                  placeholder="Solana address"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  disabled={isSending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sendAmount">Amount to Send</Label>
                <Input
                  id="sendAmount"
                  type="number"
                  placeholder="50"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  disabled={isSending}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-solana-purple hover:opacity-90" 
                disabled={isSending || !publicKey}
              >
                {isSending ? "Sending..." : `Send ${selectedToken.tokenSymbol}`}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
