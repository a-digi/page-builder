// path: src/components/page-builder/components/controls/DeleteButton.tsx
type Props = {
  onClick: () => void;
  className?: string;
};

export const DeleteButton = ({ onClick, className }: Props) => {
  const baseClasses = "pb-p-1.5 pb-rounded-md";
  const defaultColorClasses = "pb-text-red-500 pb-hover:bg-red-100 pb-hover:text-red-600";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${className || defaultColorClasses}`}
      title="Delete"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="pb-h-5 pb-w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  );
};
