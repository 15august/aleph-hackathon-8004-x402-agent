"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Property {
  id?: string;
  title?: string;
  price?: number;
  currency?: string;
  expensas?: number;
  neighborhood?: string;
  ambientes?: number;
  dormitorios?: number;
  bathrooms?: number;
  sizeM2?: number;
  mainPhotoUrl?: string;
  url?: string;
  overallScore?: number;
  highlights?: string[];
  agentCommentary?: string;
  renovationType?: string;
}

interface SearchResultsProps {
  results: unknown[] | null;
  isLoading: boolean;
  query: string;
}

export function SearchResults({ results, isLoading, query }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="w-full animate-pulse">
            <CardContent className="p-0">
              <div className="flex gap-0">
                <div className="w-36 h-28 bg-gray-200 rounded-l-xl shrink-0" />
                <div className="p-4 flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center text-muted-foreground">
          No results found for &ldquo;{query}&rdquo;
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
      </p>
      {results.map((property, index) => (
        <PropertyCard key={index} property={property as Property} />
      ))}
    </div>
  );
}

function formatPrice(price: number, currency: string) {
  if (currency === "USD") return `USD ${price.toLocaleString()}`;
  if (currency === "ARS") return `ARS ${price.toLocaleString()}`;
  return `${currency} ${price.toLocaleString()}`;
}

function ScoreDot({ score }: { score: number }) {
  const color = score >= 8 ? "bg-green-500" : score >= 6 ? "bg-yellow-400" : "bg-red-400";
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${color} mr-1`} />
  );
}

function PropertyCard({ property }: { property: Property }) {
  const {
    title, price, currency = "USD", neighborhood, ambientes, sizeM2,
    mainPhotoUrl, url, overallScore, highlights, agentCommentary, expensas,
  } = property;

  const card = (
    <Card className="w-full hover:shadow-md transition-shadow overflow-hidden">
      <CardContent className="p-0">
        <div className="flex">
          {/* Photo */}
          {mainPhotoUrl ? (
            <div className="w-40 shrink-0 self-stretch">
              <img
                src={mainPhotoUrl}
                alt={title || "Property"}
                className="w-full h-full object-cover"
                style={{ minHeight: "120px", maxHeight: "200px" }}
              />
            </div>
          ) : (
            <div className="w-40 shrink-0 bg-gray-100 flex items-center justify-center" style={{ minHeight: "120px" }}>
              <span className="text-2xl">🏠</span>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 p-4 space-y-2 min-w-0">
            {/* Title + Score */}
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium leading-snug line-clamp-2 flex-1">{title}</p>
              {overallScore !== undefined && (
                <div className="shrink-0 flex items-center text-xs text-gray-500">
                  <ScoreDot score={overallScore} />
                  {overallScore}/10
                </div>
              )}
            </div>

            {/* Price */}
            {price !== undefined && (
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-semibold text-sm">
                  {formatPrice(price, currency)}
                </Badge>
                {expensas !== undefined && expensas > 0 && (
                  <span className="text-xs text-muted-foreground">+ ARS {expensas.toLocaleString()} exp.</span>
                )}
              </div>
            )}

            {/* Details */}
            <div className="flex gap-3 flex-wrap text-xs text-muted-foreground">
              {neighborhood && <span>📍 {neighborhood}</span>}
              {ambientes !== undefined && <span>🛏 {ambientes} amb.</span>}
              {sizeM2 !== undefined && <span>📐 {sizeM2} m²</span>}
            </div>

            {/* Highlights */}
            {highlights && highlights.length > 0 && (
              <ul className="space-y-0.5">
                {highlights.slice(0, 3).map((h, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                    <span className="text-green-500 shrink-0">✓</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Agent commentary */}
            {agentCommentary && (
              <p className="text-xs text-muted-foreground italic line-clamp-2">{agentCommentary}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block">
        {card}
      </a>
    );
  }
  return card;
}
