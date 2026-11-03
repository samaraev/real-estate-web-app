import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

const propertyTypes = ["All Types", "Penthouse", "Waterfront", "Modernist", "Estate", "Townhouse", "Condo"];
const priceRanges = [
  { label: "Any Price", min: 0, max: Infinity },
  { label: "Under $2M", min: 0, max: 2000000 },
  { label: "$2M – $5M", min: 2000000, max: 5000000 },
  { label: "$5M – $10M", min: 5000000, max: 10000000 },
  { label: "$10M+", min: 10000000, max: Infinity },
];
const bedOptions = ["Any Beds", "1+", "2+", "3+", "4+", "5+"];
const locations = ["All Locations", "Pacific Heights", "Marina District", "Nob Hill", "Sea Cliff", "Russian Hill", "Presidio Heights"];

export default function PropertyFilters({ filters, onChange, total }) {
  const updateFilter = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onChange({ type: "All Types", price: "Any Price", beds: "Any Beds", location: "All Locations", search: "" });
  };

  const hasFilters = filters.type !== "All Types" || filters.price !== "Any Price" || 
    filters.beds !== "Any Beds" || filters.location !== "All Locations" || filters.search;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            value={filters.search || ""}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-10 bg-transparent border-border font-body text-sm h-12"
          />
        </div>
        
        <Select value={filters.location} onValueChange={(v) => updateFilter("location", v)}>
          <SelectTrigger className="w-[180px] bg-transparent border-border font-body text-sm h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-[6px]">
            {locations.map((l) => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.type} onValueChange={(v) => updateFilter("type", v)}>
          <SelectTrigger className="w-[160px] bg-transparent border-border font-body text-sm h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-[6px]">
            {propertyTypes.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.price} onValueChange={(v) => updateFilter("price", v)}>
          <SelectTrigger className="w-[160px] bg-transparent border-border font-body text-sm h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-[6px]">
            {priceRanges.map((p) => (
              <SelectItem key={p.label} value={p.label}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.beds} onValueChange={(v) => updateFilter("beds", v)}>
          <SelectTrigger className="w-[120px] bg-transparent border-border font-body text-sm h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-[6px]">
            {bedOptions.map((b) => (
              <SelectItem key={b} value={b}>{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <p className="font-body text-sm text-muted-foreground">
          {total} {total === 1 ? "property" : "properties"} found
        </p>
        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1 font-body text-xs tracking-label uppercase text-muted-foreground hover:text-foreground transition-colors">
            <X size={12} /> Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}

export { priceRanges };