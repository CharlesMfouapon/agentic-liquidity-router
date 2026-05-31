export interface PaymentIntent {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  fromCountry: string;
  toCountry: string;
  destinationType: DestinationType;
  optimizeFor: "lowestCost" | "fastestSettlement" | "mostReliable";
  maxSettlementSeconds?: number;
}

export interface DestinationType {
  type: "mobileMoney" | "bankAccount" | "wallet";
  provider?: string;
  account: string;
}

export interface RouteHop {
  from: string;
  to: string;
  source: string;
  rate: number;
  fee: number;
}

export interface PaymentRoute {
  hops: RouteHop[];
  totalFeePercent: number;
  totalFeeAbsolute: number;
  estimatedSettlementSeconds: number;
  confidenceScore: number;
}

export interface RoutingDecision {
  recommendedRoute: PaymentRoute;
  alternatives: PaymentRoute[];
  riskFactors: string[];
  reasoning: string;
  agentReasoning?: string;
}
