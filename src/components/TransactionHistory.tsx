
import { FC } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpRight, ArrowDownLeft, Plus } from "lucide-react";

interface Transaction {
  id: string;
  type: 'mint' | 'send' | 'receive';
  amount: string;
  symbol: string;
  address: string;
  timestamp: Date;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export const TransactionHistory: FC<TransactionHistoryProps> = ({ transactions }) => {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'mint':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'send':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'receive':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'mint':
        return 'text-green-500';
      case 'send':
        return 'text-red-500';
      case 'receive':
        return 'text-green-500';
      default:
        return '';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="border-2 border-muted shadow-lg w-full">
      <CardHeader>
        <CardTitle className="text-xl">Transaction History</CardTitle>
        <CardDescription>Recent token transactions on Solana Devnet</CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No transactions yet. Create, mint, or send tokens to see your transaction history.
          </div>
        ) : (
          <ScrollArea className="h-[220px]">
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-muted last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="bg-secondary p-2 rounded-full">
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div>
                      <p className="font-medium capitalize">{tx.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {tx.type === 'mint' ? 'Created' : tx.type === 'send' ? 'Sent to' : 'Received from'}{' '}
                        {formatAddress(tx.address)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${getTransactionColor(tx.type)}`}>
                      {tx.type === 'send' ? '-' : '+'}{tx.amount} {tx.symbol}
                    </p>
                    <p className="text-sm text-muted-foreground">{formatTime(tx.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
