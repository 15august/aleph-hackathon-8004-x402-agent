"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Property {
  title?: string;
  address?: string;
  location?: string;
  price?: string | number;
  rooms?: string | number;
  area?: string | number;
  description?: string;
  url?: string;
  image?: string;
  // generic fallback
  [key: string]: unknown;
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
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2 mb-1" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
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

function PropertyCard({ property }: { property: Property }) {
  const title = property.title || property.address || property.location || "Property";
  const price = property.price ? String(property.price) : null;
  const rooms = property.rooms ? String(property.rooms) : null;
  const area = property.area ? String(property.area) : null;
  const description = property.description;
  const url = property.url ? String(property.url) : null;

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-medium leading-tight">
            {url ? (
              <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-700">
                {title}
              </a>
            ) : title}
          </CardTitle>
          {price && (
            <Badge variant="outline" className="shrink-0 bg-blue-50 text-blue-700 border-blue-200 font-semibold">
              {price}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-1">
        <div className="flex gap-3 flex-wrap">
          {rooms && (
            <span className="text-xs text-muted-foreground">
              🛏 {rooms} rooms
            </span>
          )}
          {area && (
            <span className="text-xs text-muted-foreground">
              📐 {area}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
