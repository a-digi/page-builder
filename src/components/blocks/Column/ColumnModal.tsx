// path: src/components/blocks/ColumnBlock/ColumnModal.tsx
import { useState } from "react";
import type { ColumnComponent, ColumnComponentProps } from "../../../types/components";
import ColumnSelector from "./ColumnSelector";

const SettingsModal: React.FC<{
  component: ColumnComponent;
  onClose: () => void;
  onUpdate: (props: Partial<ColumnComponentProps>) => void;
}> = ({ component, onClose, onUpdate }) => {
  const [numCols, setNumCols] = useState(component.props.numCols);
  const handleApply = () => {
    onUpdate({ numCols });
    onClose();
  };
  return (
    <div className="pb-fixed pb-inset-0 pb-bg-black pb-bg-opacity-50 pb-z-50 pb-flex pb-items-center pb-justify-center pb-p-4" onClick={onClose}>
      <div className="pb-bg-white pb-rounded-lg pb-shadow-xl pb-p-6 pb-w-full pb-max-w-md" onClick={e => e.stopPropagation()}>
        <h3 className="pb-text-lg pb-font-medium pb-leading-6 pb-text-gray-900 pb-mb-2">Column Block Settings</h3>
        <p className="pb-text-sm pb-text-gray-500 pb-mb-6">Select the number of columns for this block.</p>

        <ColumnSelector
          value={numCols}
          onChange={setNumCols}
          min={1}
          max={12}
        />

        <div className="pb-mt-8 pb-flex pb-justify-end pb-space-x-3">
          <button type="button" onClick={onClose} className="pb-py-2 pb-px-4 pb-border pb-border-gray-300 pb-rounded-md pb-shadow-sm pb-text-sm pb-font-medium pb-text-gray-700 pb-hover:bg-gray-50 pb-focus:outline-none pb-focus:ring-2 pb-focus:ring-offset-2 pb-focus:ring-blue-500">Cancel</button>
          <button type="button" onClick={handleApply} className="pb-inline-flex pb-justify-center pb-py-2 pb-px-4 pb-border pb-border-transparent pb-shadow-sm pb-text-sm pb-font-medium pb-rounded-md pb-text-white pb-bg-blue-600 pb-hover:bg-blue-700 pb-focus:outline-none pb-focus:ring-2 pb-focus:ring-offset-2 pb-focus:ring-blue-500">Apply</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
