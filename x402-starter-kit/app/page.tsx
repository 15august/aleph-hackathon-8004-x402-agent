"use client";

import { useState } from "react";
import { createThirdwebClient } from "thirdweb";
import { ConnectButton, useActiveWallet } from "thirdweb/react";
import { wrapFetchWithPayment } from "thirdweb/x402";
import { TransactionLog, LogEntry } from "@/components/transaction-log";
import { SearchResults } from "@/components/search-results";
import { Button } from "@/components/ui/button";
import { createNormalizedFetch } from "@/lib/payment";
import { AVALANCHE_FUJI_CHAIN_ID } from "@/lib/constants";

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

const SEARCH_PRICE_BIGINT = BigInt(10000); // $0.01 USDC

export default function Home() {
  const wallet = useActiveWallet();
  const [query, setQuery] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [results, setResults] = useState<unknown[] | null>(null);
  const [searchedQuery, setSearchedQuery] = useState("");

  const addLog = (message: string, type: LogEntry["type"], extra?: Pick<LogEntry, "txHash" | "amount">) => {
    setLogs((prev) => [...prev, { message, type, timestamp: new Date(), ...extra }]);
  };

  const updateLastLog = (type: LogEntry["type"], message?: string) => {
    setLogs((prev) => {
      if (!prev.length) return prev;
      const last = { ...prev[prev.length - 1], type };
      if (message) last.message = message;
      return [...prev.slice(0, -1), last];
    });
  };

  const pollJob = async (jobId: string) => {
    setIsPolling(true);
    addLog("Searching properties...", "info");

    const maxAttempts = 30;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const res = await fetch(`/api/search/${jobId}`);
        const data = await res.json();

        if (data.status === "completed" || data.results || data.listings || data.properties) {
          const items = data.results || data.listings || data.properties || [];
          updateLastLog("success", `Found ${items.length} result${items.length !== 1 ? "s" : ""}`);
          setResults(items);
          break;
        } else if (data.status === "failed" || data.error) {
          updateLastLog("error", `Search failed: ${data.error || "unknown error"}`);
          break;
        }
        // still pending, continue polling
      } catch {
        // network error, retry
      }
    }
    setIsPolling(false);
  };

  const handleSearch = async () => {
    if (!wallet || !query.trim()) return;

    setIsSearching(true);
    setResults(null);
    setLogs([]);
    setSearchedQuery(query.trim());

    try {
      addLog("Requesting payment authorization...", "info");

      const normalizedFetch = createNormalizedFetch(AVALANCHE_FUJI_CHAIN_ID);
      const fetchWithPay = wrapFetchWithPayment(normalizedFetch, client, wallet, {
        maxValue: SEARCH_PRICE_BIGINT,
      });

      const response = await fetchWithPay(`/api/search?q=${encodeURIComponent(query.trim())}`);

      let data: Record<string, unknown> = {};
      try {
        data = await response.json();
      } catch {
        updateLastLog("error", "Payment failed");
        addLog(`Server error (status ${response.status})`, "error");
        return;
      }

      if (!response.ok) {
        updateLastLog("error", "Payment failed");
        const errMsg = String(data.errorMessage || data.error || `HTTP ${response.status}`);
        addLog(`Payment error: ${errMsg}`, "error");
        return;
      }

      updateLastLog("success", "Payment settled");
      const payment = data.payment as { transaction?: string; network?: string; payer?: string } | undefined;
      if (payment?.transaction) {
        addLog("Transaction confirmed", "success", {
          txHash: payment.transaction,
          amount: "$0.01 USDC",
        });
      }

      const jobId = data.jobId || data.job_id || data.id;
      if (jobId) {
        await pollJob(String(jobId));
      } else {
        const items = (data.results || data.listings || data.properties) as unknown[] | undefined;
        if (items && items.length > 0) {
          addLog(`Found ${items.length} result${items.length !== 1 ? "s" : ""}`, "success");
          setResults(items);
        } else {
          addLog("No results returned", "error");
        }
      }
    } catch (error) {
      updateLastLog("error");
      addLog(error instanceof Error ? error.message : "Unknown error", "error");
    } finally {
      setIsSearching(false);
    }
  };

  if (!wallet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-6 p-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Property Search</h1>
            <p className="text-muted-foreground">Pay $0.01 USDC per search via x402</p>
            <p className="text-sm text-muted-foreground mt-1">Avalanche Fuji Testnet</p>
          </div>
          <ConnectButton client={client} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Property Search</h1>
          <p className="text-muted-foreground">AI-powered apartment search · $0.01 USDC per query</p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <ConnectButton client={client} />
          </div>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            What are you looking for?
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isSearching && !isPolling && handleSearch()}
              placeholder="2 ambientes en Palermo, Buenos Aires"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSearching || isPolling}
            />
            <Button
              onClick={handleSearch}
              disabled={isSearching || isPolling || !query.trim()}
              className="shrink-0"
            >
              {isSearching || isPolling ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Searching...
                </span>
              ) : (
                "Search — $0.01 USDC"
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Each search costs $0.01 USDC paid via x402 protocol on Avalanche Fuji Testnet
          </p>
        </div>

        {/* Transaction Log */}
        {logs.length > 0 && <TransactionLog logs={logs} />}

        {/* Results */}
        {(results !== null || isPolling) && (
          <SearchResults
            results={results}
            isLoading={isPolling}
            query={searchedQuery}
          />
        )}
      </div>
    </div>
  );
}
