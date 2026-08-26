import { Children, isValidElement, useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "../utils/cn";

type OptionElement = {
  value?: unknown;
  disabled?: boolean;
  children?: ReactNode;
};

type ParsedOption = {
  value: string;
  label: ReactNode;
  disabled: boolean;
};

function parseOptions(children: ReactNode): ParsedOption[] {
  const result: ParsedOption[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement<OptionElement>(child) && child.type === "option") {
      result.push({
        value: String(child.props.value ?? ""),
        label: child.props.children,
        disabled: Boolean(child.props.disabled),
      });
    }
  });
  return result;
}

type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

export function Select({
  value,
  onChange,
  children,
  placeholder = "Seleccionar…",
  disabled = false,
  className,
  "aria-label": ariaLabel,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const options = parseOptions(children);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => setIsOpen((o) => !o)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-2xl border-2 px-4 text-base font-medium outline-none transition disabled:opacity-50",
          isOpen
            ? "border-primary bg-white"
            : "border-zinc-200 bg-zinc-50 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600",
          "h-12",
          className,
        )}
      >
        <span
          className={cn(
            "truncate text-left",
            selected ? "text-zinc-800 dark:text-zinc-100" : "text-zinc-400",
          )}
        >
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={cn("h-5 w-5 shrink-0 text-zinc-400 transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 animate-scale-in overflow-auto rounded-2xl border border-zinc-200 bg-white p-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={opt.value === value}
              disabled={opt.disabled}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition",
                opt.value === value
                  ? "bg-primary-100 text-primary-700 dark:bg-primary-900/60 dark:text-primary-300"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
                opt.disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
              )}
            >
              <span className="truncate">{opt.label}</span>
              {opt.value === value && <Check className="h-4 w-4 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}