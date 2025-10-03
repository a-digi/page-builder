// path: src/components/page-builder/components/blocks/ColumnBlock/ColumnSelector.tsx
const ColumnSelector: React.FC<{
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}> = ({ value, onChange, min = 1, max = 12 }) => {
  return (
    <div className="pb-space-y-4">
      <div className="pb-flex pb-items-center pb-space-x-4">
        <div className="pb-flex pb-items-center pb-justify-center pb-w-12 pb-h-10 pb-border pb-border-gray-300 pb-rounded-md pb-bg-gray-50">
          <span className="pb-text-gray-800 pb-font-medium">{value}</span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="pb-w-full pb-h-2 pb-bg-gray-200 pb-rounded-lg pb-appearance-none pb-cursor-pointer"
        />
      </div>
    </div>
  );
};

export default ColumnSelector;
