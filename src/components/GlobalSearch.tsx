import { useState, useEffect, useRef } from "react";
import { Search, X, Users, GraduationCap, BookOpen, FileText, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  type: "student" | "teacher" | "class" | "exam";
  name: string;
  subtitle: string;
}

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Search function
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsLoading(true);
      const searchQuery = `%${query.toLowerCase()}%`;
      
      try {
        const [studentsRes, teachersRes, classesRes, examsRes] = await Promise.all([
          supabase
            .from("students")
            .select("id, name, roll_no, classes(name)")
            .ilike("name", searchQuery)
            .limit(5),
          supabase
            .from("teachers")
            .select("id, name, subject, email")
            .ilike("name", searchQuery)
            .limit(5),
          supabase
            .from("classes")
            .select("id, name, room, teachers(name)")
            .ilike("name", searchQuery)
            .limit(5),
          supabase
            .from("exams")
            .select("id, name, subject, classes(name)")
            .ilike("name", searchQuery)
            .limit(5),
        ]);

        const allResults: SearchResult[] = [];

        studentsRes.data?.forEach((s) => {
          allResults.push({
            id: s.id,
            type: "student",
            name: s.name,
            subtitle: `${s.roll_no ? `Roll: ${s.roll_no}` : "Student"} • ${(s.classes as any)?.name || "No class"}`,
          });
        });

        teachersRes.data?.forEach((t) => {
          allResults.push({
            id: t.id,
            type: "teacher",
            name: t.name,
            subtitle: `${t.subject || "Teacher"} • ${t.email || "No email"}`,
          });
        });

        classesRes.data?.forEach((c) => {
          allResults.push({
            id: c.id,
            type: "class",
            name: c.name,
            subtitle: `${c.room ? `Room: ${c.room}` : "Class"} • ${(c.teachers as any)?.name || "No teacher assigned"}`,
          });
        });

        examsRes.data?.forEach((e) => {
          allResults.push({
            id: e.id,
            type: "exam",
            name: e.name,
            subtitle: `${e.subject || "Exam"} • ${(e.classes as any)?.name || "All classes"}`,
          });
        });

        setResults(allResults);
        setSelectedIndex(0);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setQuery("");
    }
  };

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setQuery("");
    
    switch (result.type) {
      case "student":
        navigate("/students");
        break;
      case "teacher":
        navigate("/teachers");
        break;
      case "class":
        navigate("/classes");
        break;
      case "exam":
        navigate("/exams");
        break;
    }
  };

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "student":
        return Users;
      case "teacher":
        return GraduationCap;
      case "class":
        return BookOpen;
      case "exam":
        return FileText;
    }
  };

  const getTypeColor = (type: SearchResult["type"]) => {
    switch (type) {
      case "student":
        return "bg-primary/10 text-primary";
      case "teacher":
        return "bg-success/10 text-success";
      case "class":
        return "bg-warning/10 text-warning";
      case "exam":
        return "bg-info/10 text-info";
    }
  };

  return (
    <div ref={containerRef} className="relative max-w-md flex-1">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Search students, teachers, classes..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10 h-10 bg-muted/50 border-0 focus-visible:ring-1"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : results.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No results found for "{query}"</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {results.map((result, index) => {
                const Icon = getIcon(result.type);
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors",
                      index === selectedIndex && "bg-muted/50"
                    )}
                  >
                    <div className={cn("p-2 rounded-lg shrink-0", getTypeColor(result.type))}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{result.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                    </div>
                    <span className="text-xs text-muted-foreground capitalize shrink-0">
                      {result.type}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
