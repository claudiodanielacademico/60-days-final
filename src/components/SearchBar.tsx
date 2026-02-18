import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SearchBarProps {
    onSearch?: (query: string) => void;
    placeholder?: string;
    autoFocus?: boolean;
    className?: string;
}

export const SearchBar = ({
    onSearch,
    placeholder = "Search: @username, 10-digit code, or keywords...",
    autoFocus = false,
    className,
}: SearchBarProps) => {
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        onSearch?.(value);
    };

    const handleClear = () => {
        setQuery("");
        onSearch?.("");
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && query.trim()) {
            // Navigate to search page with query
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <div
            className={cn(
                "relative flex items-center transition-all",
                isFocused && "ring-2 ring-primary/20 rounded-lg",
                className
            )}
        >
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />

            <Input
                ref={inputRef}
                value={query}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                className="pl-10 pr-10 h-10"
            />

            {query && (
                <button
                    onClick={handleClear}
                    className="absolute right-3 p-1 hover:bg-accent rounded-full transition-colors"
                >
                    <X className="h-3 w-3 text-muted-foreground" />
                </button>
            )}
        </div>
    );
};
