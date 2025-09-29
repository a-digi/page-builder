// path: src/components/blocks/ColumnBlock/ColumnSelector.tsx

const ColumnSelector: React.FC<{
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}> = ({ value, onChange, min = 1, max = 12 }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="flex items-center justify-center w-12 h-10 border border-gray-300 rounded-md bg-gray-50">
          <span className="text-gray-800 font-medium">{value}</span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
};

export default ColumnSelector;
