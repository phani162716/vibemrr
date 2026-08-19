export type VerifyMetrics = {
  mrrInr: number;
  revenue30dInr: number;
  allTimeInr: number;
  activeSubs: number;
  customers: number;
  momGrowth: number;
};

export type VerifyInput = {
  provider: string;
  keyId?: string;
  keySecret: string;
};
