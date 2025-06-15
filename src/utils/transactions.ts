export interface Transaction {
  id: number;
  type: 'send' | 'receive';
  amount: string;
  description: string;
  date: string;
  icon: 'arrow-up' | 'arrow-down';
  recipient?: string;
  sender?: string;
  hash: string;
  status: 'completed' | 'pending';
}

const USDC = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
const ETHERSCAN_API_KEY = "N5FS2S9UUJ68SX2IGUKKNBF8W8W56A8B9H";

export async function fetchUsdcTransactions(address: string): Promise<Transaction[]> {
  if (!address) return [];

  const url = `https://api-sepolia.etherscan.io/api?module=account&action=tokentx&contractaddress=${USDC}&address=${address}&page=1&offset=10&sort=desc&apikey=${ETHERSCAN_API_KEY}`;
  const resp = await fetch(url);
  const data = await resp.json();
  if (data.status !== "1" || !data.result) return [];

  return data.result.map((tx: any, i: number) => {
    // direction
    const outgoing = tx.from.toLowerCase() === address.toLowerCase();
    // value to float (6 decimals)
    const value = Number(tx.value) / 1e6;
    // time
    const date = new Date(Number(tx.timeStamp) * 1000);
    // example: 'Today, 10:23 AM' or 'Yesterday, 4:01 PM' or 'Jun 8, 2025'
    const now = new Date();
    let dateStr;
    const diffDays = (now.setHours(0,0,0,0) - date.setHours(0,0,0,0)) / 86400000;
    if (diffDays === 0) {
      dateStr = `Today, ${date.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      dateStr = `Yesterday, ${date.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      dateStr = date.toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' });
    }

    return {
      id: i + 1,
      type: outgoing ? 'send' : 'receive',
      amount: `${outgoing ? '-' : '+'}$${value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      description: outgoing ? `To ${tx.to.slice(0, 6)}...${tx.to.slice(-4)}` : `From ${tx.from.slice(0, 6)}...${tx.from.slice(-4)}`,
      date: dateStr,
      icon: outgoing ? 'arrow-up' : 'arrow-down',
      recipient: outgoing ? tx.to : undefined,
      sender: !outgoing ? tx.from : undefined,
      hash: tx.hash,
      status: 'completed' as const,
    };
  });
} 