// path: src/components/controls/SettingsButton.tsx
type Props = {
  onClick: () => void;
  className?: string;
};

export const SettingsButton = ({ onClick, className }: Props) => {
  const baseClasses = "pb-p-1.5 pb-rounded-md pb-cursor-pointer";
  const defaultColorClasses = "pb-text-gray-500 pb-hover:bg-gray-100 pb-hover:text-blue-600";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${className || defaultColorClasses}`}
      title="Settings"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="pb-h-5 pb-w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>
  );
};
