import type { ConversionOption } from "@/lib/conversionTypes";

type FormatSelectorProps = {
  options: ConversionOption[];
  selectedOptionId: string;
  onChange: (optionId: string) => void;
};

export function FormatSelector({
  options,
  selectedOptionId,
  onChange
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
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
