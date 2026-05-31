"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Send,
  ArrowRightLeft,
  ChevronDown,
  Loader2,
} from "lucide-react";

const CURRENCIES = ["USDC", "USDT", "XOF", "XAF", "NGN", "GHS", "KES", "UGX", "ZAR", "USD", "EUR"];
const COUNTRIES = [
  "Nigeria", "Ghana", "Kenya", "Uganda", "South Africa",
  "Cote d'Ivoire", "Senegal", "Cameroon", "Tanzania", "Rwanda",
];
const PROVIDERS = ["MTN Mobile Money", "Orange Money", "M-Pesa", "Wave", "Moov Money"];

interface PaymentFormProps {
  onSubmit: (intent: any) => void;
  isLoading: boolean;
}

export function PaymentForm({ onSubmit, isLoading }: PaymentFormProps) {
  const [amount, setAmount] = useState("500");
  const [fromCurrency, setFromCurrency] = useState("USDC");
  const [toCurrency, setToCurrency] = useState("XOF");
  const [fromCountry, setFromCountry] = useState("Nigeria");
  const [toCountry, setToCountry] = useState("Cote d'Ivoire");
  const [destinationProvider, setDestinationProvider] = useState("Orange Money");
  const [destinationAccount, setDestinationAccount] = useState("+2250700000000");
  const [optimizeFor, setOptimizeFor] = useState<"lowestCost" | "fastestSettlement" | "mostReliable">("lowestCost");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      amount: parseFloat(amount),
      fromCurrency,
      toCurrency,
      fromCountry,
      toCountry,
      destinationType: {
        type: "mobileMoney",
        provider: destinationProvider,
        account: destinationAccount,
      },
      optimizeFor,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 max-w-2xl mx-auto">
      <div className="space-y-6">
        {/* Amount + Currency Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="block text-xs text-muted uppercase tracking-wider mb-2">
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white font-mono text-lg focus:border-accent focus:outline-none transition-colors"
              placeholder="500"
              min="1"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-2">
              Currency
            </label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-3 text-white font-mono focus:border-accent focus:outline-none transition-colors appearance-none"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* From → To */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-xs text-muted uppercase tracking-wider mb-2">
              From Country
            </label>
            <select
              value={fromCountry}
              onChange={(e) => setFromCountry(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-3 text-white text-sm focus:border-accent focus:outline-none transition-colors appearance-none"
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="pt-6">
            <ArrowRightLeft className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-muted uppercase tracking-wider mb-2">
              To Country
            </label>
            <select
              value={toCountry}
              onChange={(e) => setToCountry(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-3 text-white text-sm focus:border-accent focus:outline-none transition-colors appearance-none"
            >
              {COUNTRIES.filter((c) => c !== fromCountry).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Destination */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-2">
              Destination Currency
            </label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-3 text-white font-mono focus:border-accent focus:outline-none transition-colors appearance-none"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-2">
              Provider
            </label>
            <select
              value={destinationProvider}
              onChange={(e) => setDestinationProvider(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-3 text-white text-sm focus:border-accent focus:outline-none transition-colors appearance-none"
            >
              {PROVIDERS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Destination Account */}
        <div>
          <label className="block text-xs text-muted uppercase tracking-wider mb-2">
            Destination Account
          </label>
          <input
            type="text"
            value={destinationAccount}
            onChange={(e) => setDestinationAccount(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white font-mono text-sm focus:border-accent focus:outline-none transition-colors"
            placeholder="+2250700000000"
            required
          />
        </div>

        {/* Optimize For */}
        <div>
          <label className="block text-xs text-muted uppercase tracking-wider mb-3">
            Optimize For
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "lowestCost", label: "Lowest Cost", icon: "" },
              { value: "fastestSettlement", label: "Fastest", icon: "" },
              { value: "mostReliable", label: "Most Reliable", icon: "" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setOptimizeFor(opt.value as any)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  optimizeFor === opt.value
                    ? "bg-accent text-white border-accent"
                    : "bg-background text-muted border-border hover:border-accent/50"
                } border`}
              >
                <span className="mr-1">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-accent hover:bg-accent-hover disabled:bg-accent/50 text-white font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing Routes...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Find Optimal Route
            </>
          )}
        </button>
      </div>
    </form>
  );
}
