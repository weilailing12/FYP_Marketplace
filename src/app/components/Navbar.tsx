import { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";

export function Navbar() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  
  const [localQuery, setLocalQuery] = useState(searchParams.get("q") || "");

  // Keep local query in sync with URL if URL changes
  useEffect(() => {
    setLocalQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setLocalQuery(query);
    
    // Live search ONLY if we are already on a searchable page
    if (location.pathname === '/marketplace' || location.pathname === '/clubmerch') {
      setSearchParams(query ? { q: query } : {}, { replace: true });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // If we're not on a searchable page, redirect to marketplace to show results
    if (location.pathname !== '/marketplace' && location.pathname !== '/clubmerch') {
      navigate(`/marketplace?q=${encodeURIComponent(localQuery)}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <button
            onClick={() => navigate("/marketplace")}
            className="text-2xl text-blue-600 cursor-pointer font-semibold hover:text-blue-700"
          >
            CampusTrade
          </button>

          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search items, categories..."
                className="pl-10"
                value={localQuery}
                onChange={handleSearchChange}
              />
            </form>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate("/create")}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Sell Item
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
