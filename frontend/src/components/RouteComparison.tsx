"use client";

import { motion } from "framer-motion";
import { TrendingUp, Clock, DollarSign, Shield } from "lucide-react";
import type { RoutingDecision, PaymentRoute } from "@/types";

interface Props {
  decision: RoutingDecision;
}

export function RouteComparison({ decision }: Props) {
  const allRoutes = [decision.recommendedRoute, ...decision.alternatives];

  return (
    <div className="glass-card p-6 md:p-8">
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-gold" />
        Route Comparison
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-muted font-medium uppercase tracking-wider text-xs">
                Route
              </th>
              <th className="text-right py-3 px-4 text-muted font-medium uppercase tracking-wider text-xs">
                Fee %
              </th>
              <th className="text-right py-3 px-4 text-muted font-medium uppercase tracking-wider text-xs">
                Fee $
              </th>
              <th className="text-right py-3 px-4 text-muted font-medium uppercase tracking-wider text-xs">
                Time
              </th>
              <th className="text-right py-3 px-4 text-muted font-medium uppercase tracking-wider text-xs">
                Confidence
              </th>
            </tr>
          </thead>
          <tbody>
            {allRoutes.map((route, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className={`border-b border-border/50 ${
                  i === 0 ? "bg-accent/5" : ""
                }`}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {i === 0 && (
                      <span className="bg-accent text-white text-xs px-2 py-0.5 rounded-full font-medium">
                        Best
                      </span>
                    )}
                    <span className="text-white font-medium">
                      {route.hops.map((h) => h.source).join(" → ")}
                    </span>
                  </div>
                  <div className="text-xs text-muted mt-0.5">
                    {route.hops.map((h) => `${h.from}→${h.to}`).join(" | ")}
                  </div>
                </td>
                <td className="py-3 px-4 text-right text-white font-mono">
                  {route.totalFeePercent.toFixed(2)}%
                </td>
                <td className="py-3 px-4 text-right text-white font-mono">
                  ${route.totalFeeAbsolute.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-right text-white font-mono">
                  {Math.floor(route.estimatedSettlementSeconds / 60)}m {route.estimatedSettlementSeconds % 60}s
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Shield
                      className={`w-4 h-4 ${
                        route.confidenceScore > 0.9
                          ? "text-green"
                          : route.confidenceScore > 0.7
                          ? "text-gold"
                          : "text-accent"
                      }`}
                    />
                    <span className="text-white font-mono">
                      {(route.confidenceScore * 100).toFixed(0)}%
                    </span>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Risk Factors */}
      {decision.riskFactors.length > 0 && (
        <div className="mt-6 p-4 bg-background rounded-lg border border-border">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-gold" />
            Risk Factors
          </h3>
          <ul className="space-y-2">
            {decision.riskFactors.map((risk, i) => (
              <li key={i} className="text-sm text-muted flex items-start gap-2">
                <span className="text-accent mt-1">•</span>
                {risk}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
