
import { FC, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { shortenAddress, getSolBalance } from '@/lib/solana';
import { Badge } from '@/components/ui/badge';

export const WalletConnect: FC = () => {
  const { connected, publicKey } = useWallet();
  const [solBalance, setSolBalance] = useState<number | null>(null);
  
  useEffect(() => {
    if (connected && publicKey) {
      const fetchBalance = async () => {
        const balance = await getSolBalance(publicKey);
        setSolBalance(balance);
      };
      
      fetchBalance();
      const interval = setInterval(fetchBalance, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    } else {
      setSolBalance(null);
    }
  }, [connected, publicKey]);

  return (
    <Card className="border-2 border-muted shadow-lg w-full">
      <CardHeader className="pb-2">
        <div className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-xl">Wallet</CardTitle>
            <CardDescription>Connect your Solana wallet</CardDescription>
          </div>
          {connected && publicKey && (
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              Connected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col">
            {connected && publicKey ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">Address:</span>
                  <span className="font-mono text-sm bg-secondary px-2 py-1 rounded">
                    {shortenAddress(publicKey.toString())}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">Balance:</span>
                  {solBalance !== null ? (
                    <span className="font-mono text-sm">
                      {solBalance.toFixed(4)} SOL
                    </span>
                  ) : (
                    <span className="animate-pulse-opacity font-mono text-sm">Loading...</span>
                  )}
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                Connect your wallet to manage tokens
              </div>
            )}
          </div>
          <WalletMultiButton />
        </div>
      </CardContent>
    </Card>
  );
};
