"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Clock, DollarSign, TrendingUp } from "lucide-react";
import type { RoutingDecision } from "@/types";

interface Props {
  decision: RoutingDecision;
}

export function RouteVisualization({ decision }: Props) {
  const route = decision.recommendedRoute;

  return (
    <div className="glass-card p-6 md:p-8">
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-green" />
        Recommended Route
      </h2>

      {/* Route Flow */}
      <div className="flex items-center justify-center gap-0 mb-8 overflow-x-auto py-4">
        {route.hops.map((hop, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2 }}
            className="flex items-center gap-0"
          >
            {/* Source Node */}
            <div className="flex-shrink-0 bg-surface border border-border rounded-xl px-4 py-3 text-center min-w-[80px]">
              <div className="text-lg font-bold text-white">{hop.from}</div>
              <div className="text-xs text-muted mt-1">
                {i === 0 ? "You send" : "Converted"}
              </div>
            </div>

            {/* Arrow + Source */}
            <div className="flex flex-col items-center mx-2 min-w-[100px]">
              <ArrowRight className="w-4 h-4 text-accent mb-1" />
              <div className="text-xs text-accent font-medium text-center">
                {hop.source}
              </div>
              <div className="text-xs text-muted mt-1">
                Rate: {hop.rate}
              </div>
              <div className="text-xs text-muted">
                Fee: ${hop.fee.toFixed(2)}
              </div>
            </div>

            {/* Destination Node */}
            {i === route.hops.length - 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (i + 1) * 0.2 }}
                className="flex-shrink-0 bg-surface border border-gold/50 rounded-xl px-4 py-3 text-center min-w-[80px]"
              >
                <div className="text-lg font-bold text-gold">{hop.to}</div>
                <div className="text-xs text-muted mt-1">Recipient gets</div>
              </motion.div>
            )}
          </motion.div>
        ))}

        {/* Show final currency if single hop */}
        {route.hops.length === 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="flex-shrink-0 bg-surface border border-gold/50 rounded-xl px-4 py-3 text-center min-w-[80px]"
          >
            <div className="text-lg font-bold text-gold">
              {route.hops[route.hops.length - 1].to}
            </div>
            <div className="text-xs text-muted mt-1">Recipient gets</div>
          </motion.div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-background rounded-lg p-4 text-center">
          <DollarSign className="w-4 h-4 text-accent mx-auto mb-2" />
          <div className="text-lg font-bold text-white">
            {route.totalFeePercent.toFixed(1)}%
          </div>
          <div className="text-xs text-muted">Total Fee</div>
        </div>
        <div className="bg-background rounded-lg p-4 text-center">
          <Clock className="w-4 h-4 text-gold mx-auto mb-2" />
          <div className="text-lg font-bold text-white">
            {Math.floor(route.estimatedSettlementSeconds / 60)}m {route.estimatedSettlementSeconds % 60}s
          </div>
          <div className="text-xs text-muted">Settlement</div>
        </div>
        <div className="bg-background rounded-lg p-4 text-center">
          <TrendingUp className="w-4 h-4 text-green mx-auto mb-2" />
          <div className="text-lg font-bold text-white">
            {(route.confidenceScore * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-muted">Confidence</div>
        </div>
        <div className="bg-background rounded-lg p-4 text-center">
          <DollarSign className="w-4 h-4 text-white mx-auto mb-2" />
          <div className="text-lg font-bold text-white">
            ${route.totalFeeAbsolute.toFixed(2)}
          </div>
          <div className="text-xs text-muted">Absolute Fee</div>
        </div>
      </div>
    </div>
  );
}
