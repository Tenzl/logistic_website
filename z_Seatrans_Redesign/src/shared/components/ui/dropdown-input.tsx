import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";

interface Option {
  label: string;
  value: number;
}

interface Props {
  options: Option[];
  value: number | null;
  onChange: (v: number | null) => void;
  placeholder?: string;
}

export function DropdownInput({ options, value, onChange, placeholder = "Select..." }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (opt: Option) => {
    onChange(opt.value);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} className="relative w-full md:w-1/2">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full px-3 py-2 border rounded bg-white flex items-center justify-between hover:border-gray-400 transition-all"
      >
        <span className={selected ? "text-gray-900" : "text-gray-400"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full bg-white border rounded shadow-lg mt-1 animate-fadeIn">
          <div className="p-2 border-b">
            <input
              className="w-full px-3 py-1.5 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">No results</div>
            ) : (
              filtered.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt)}
                  className={`px-3 py-2 flex justify-between items-center cursor-pointer hover:bg-blue-50 ${
                    value === opt.value ? "bg-blue-50 text-blue-600" : ""
                  }`}
                >
                  <span>{opt.label}</span>
                  {value === opt.value && <Check className="h-4 w-4" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
