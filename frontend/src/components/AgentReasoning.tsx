"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  text: string;
}

export function AgentReasoning({ text }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return null;

  const preview = text.slice(0, 200);
  const hasMore = text.length > 200;

  return (
    <div className="glass-card p-6 md:p-8">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-accent" />
          Agent Reasoning
        </h2>
        {hasMore && (
          <div className="text-muted">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
        )}
      </button>

      <AnimatePresence>
        <motion.div
          initial={{ height: "auto" }}
          animate={{ height: "auto" }}
          className="mt-4"
        >
          <div className="prose prose-invert max-w-none">
            <p className="text-muted leading-relaxed whitespace-pre-wrap text-sm">
              {isExpanded ? text : preview}
              {hasMore && !isExpanded && (
                <span className="text-accent ml-1 cursor-pointer">
                  ...Read more
                </span>
              )}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
