"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, X } from "lucide-react";
import { intelligentMOASearch } from "@/ai/flows/intelligent-moa-search";
import { Badge } from "@/components/ui/badge";

type SearchSectionProps = {
  onSearch: (query: string) => void;
};

export function SearchSection({ onSearch }: SearchSectionProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearchingAI, setIsSearchingAI] = useState(false);

  const handleSearch = (q?: string) => {
    const finalQuery = q || query;
    onSearch(finalQuery);
    setSuggestions([]);
  };

  const getAISuggestions = async () => {
    if (!query || query.length < 3) return;
    
    setIsSearchingAI(true);
    try {
      const result = await intelligentMOASearch({ query });
      setSuggestions(result.results);
    } catch (error) {
      console.error("AI Search Error:", error);
    } finally {
      setIsSearchingAI(false);
    }
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
              onClick={() => { setQuery(""); handleSearch(""); setSuggestions([]); }}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <Button size="lg" onClick={() => handleSearch()} className="bg-primary">
          Search
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-11 w-11 border-primary/20 text-primary hover:bg-primary/5"
          onClick={getAISuggestions}
          disabled={isSearchingAI}
        >
          <Sparkles className={`h-5 w-5 ${isSearchingAI ? 'animate-pulse' : ''}`} />
        </Button>
      </div>

      {suggestions.length > 0 && (
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 mb-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            AI Suggested Search Terms
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, idx) => (
              <Badge 
                key={idx} 
                variant="secondary" 
                className="cursor-pointer hover:bg-secondary/80 px-3 py-1"
                onClick={() => { setQuery(s); handleSearch(s); }}
              >
                {s}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}