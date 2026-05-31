"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Send,
  Globe,
  Zap,
  Shield,
  ChevronDown,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Clock,
  DollarSign,
} from "lucide-react";
import { PaymentForm } from "@/components/PaymentForm";
import { RouteVisualization } from "@/components/RouteVisualization";
import { AgentReasoning } from "@/components/AgentReasoning";
import { RouteComparison } from "@/components/RouteComparison";
import type { RoutingDecision } from "@/types";

export default function Home() {
  const [decision, setDecision] = useState<RoutingDecision | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streamedReasoning, setStreamedReasoning] = useState("");

  const handleRouteRequest = useCallback(
    async (intent: any) => {
      setIsLoading(true);
      setDecision(null);
      setStreamedReasoning("");

      try {
        const response = await fetch("/api/route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(intent),
        });

        const reader = response.body?.getReader();
        if (!reader) return;

        const decoder = new TextDecoder();
        let fullResponse = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") {
                try {
                  const parsed = JSON.parse(fullResponse);
                  setDecision(parsed);
                } catch {
                  setDecision(JSON.parse(fullResponse));
                }
                break;
              }
              try {
                const { chunk: char } = JSON.parse(data);
                fullResponse += char;
                setStreamedReasoning(fullResponse);
              } catch {
                fullResponse += data;
              }
            }
          }
        }
      } catch (error) {
        console.error("Routing failed:", error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 pt-24 pb-16 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            <span className="gradient-text">Agentic Liquidity</span>
            <br />
            <span className="text-white">Router</span>
          </h1>
          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
            Autonomous AI agent routing cross-border payments across African
            mobile money rails and onchain liquidity. Optimized for cost,
            speed, and reliability in real time.
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-12"
        >
          {[
            { icon: Globe, label: "Providers", value: "5+", desc: "Mobile Money" },
            { icon: Zap, label: "Settlement", value: "<4 min", desc: "Average" },
            { icon: Shield, label: "Confidence", value: "94%", desc: "Success Rate" },
            { icon: DollarSign, label: "Savings", value: "40%", desc: "vs Traditional" },
          ].map((stat, i) => (
            <div
              key={i}
              className="glass-card p-4 text-center"
            >
              <stat.icon className="w-5 h-5 text-accent mx-auto mb-2" />
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-muted">{stat.label}</div>
              <div className="text-xs text-muted">{stat.desc}</div>
            </div>
          ))}
        </motion.div>

        {/* Payment Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <PaymentForm onSubmit={handleRouteRequest} isLoading={isLoading} />
        </motion.div>
      </section>

      {/* Results Section */}
      <AnimatePresence>
        {(decision || isLoading) && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto px-4 pb-24"
          >
            {isLoading && !decision && (
              <div className="glass-card p-12 text-center">
                <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-4" />
                <p className="text-lg text-white font-medium">
                  Agent is analyzing routes...
                </p>
                <p className="text-muted mt-2">
                  Fetching real-time rates from MTN, Orange, M-Pesa, and onchain pools
                </p>
                {streamedReasoning && (
                  <div className="mt-6 max-w-2xl mx-auto text-left">
                    <AgentReasoning text={streamedReasoning} />
                  </div>
                )}
              </div>
            )}

            {decision && (
              <div className="space-y-8">
                <RouteVisualization decision={decision} />
                <RouteComparison decision={decision} />
                <AgentReasoning text={decision.reasoning || decision.agentReasoning || ""} />
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
