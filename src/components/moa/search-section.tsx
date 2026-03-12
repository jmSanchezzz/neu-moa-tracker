"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

type SearchSectionProps = {
  onSearch: (query: string) => void;
};

export function SearchSection({ onSearch }: SearchSectionProps) {
  const [query, setQuery] = useState("");

  const handleSearch = (q?: string) => {
    const finalQuery = q || query;
    onSearch(finalQuery);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by college, industry, company, or contact person..."
            className="pl-10 h-11"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          {query && (
            <button 
              className="absolute right-3 top-3" 
              onClick={() => { setQuery(""); handleSearch(""); }}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <Button size="lg" onClick={() => handleSearch()} className="bg-primary">
          Search
        </Button>
      </div>
    </div>
  );
}