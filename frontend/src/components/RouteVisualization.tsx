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
                transition={{ delay: (i + 1)
