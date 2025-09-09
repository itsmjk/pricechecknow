export type KeepaResult = {
  asin: string;
  currentPrice: number;
  thirtyDayAvg: number;
  thirtyDayHigh: number;
  thirtyDayLow: number;
  title: string;
  buyDecision: {
    icon: string;
    message: string;
  };
  affiliateUrl: string;
}
