import type { ConversionOption } from "@/lib/conversionTypes";

type FormatSelectorProps = {
  options: ConversionOption[];
  selectedOptionId: string;
  onChange: (optionId: string) => void;
  disabled?: boolean;
};

export function FormatSelector({
  options,
  selectedOptionId,
  onChange,
  disabled = false
}: FormatSelectorProps) {
  return (
    <div>
      <label htmlFor="format" className="mb-2 block text-sm font-medium text-slate-700">
        Output format
      </label>
      <select
        id="format"
        value={selectedOptionId}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled || options.length === 0}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
      >
        {options.length > 0 ? (
          options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))
        ) : (
          <option value="">No available formats</option>
        )}
      </select>
    </div>
  );
}
