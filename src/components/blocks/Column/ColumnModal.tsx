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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">Column Block Settings</h3>
        <p className="text-sm text-gray-500 mb-6">Select the number of columns for this block.</p>

        <ColumnSelector
          value={numCols}
          onChange={setNumCols}
          min={1}
          max={12}
        />

        <div className="mt-8 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Cancel</button>
          <button type="button" onClick={handleApply} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Apply</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
