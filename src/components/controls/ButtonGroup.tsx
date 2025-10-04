// path: src/components/controls/ButtonGroup.tsx
import React, { Children, cloneElement, isValidElement, type ReactNode } from 'react';

interface ButtonGroupProps {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  className,
  fullWidth = false,
}) => {
  const childArray = Children.toArray(children);

  const containerClasses = [
    'pb-items-center', 'pb-rounded-md', 'pb-shadow-sm',
    fullWidth ? 'pb-flex pb-w-full' : 'pb-inline-flex',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses} role="group">
      {Children.map(childArray, (child, index) => {
        if (!isValidElement(child)) {
          return child;
        }

        const classesToAdd: string[] = [
          'pb-rounded-none',
          'pb-hover:z-10', 'pb-focus:z-10',
        ];
        if (index === 0) classesToAdd.push('pb-rounded-l-md');
        if (index === childArray.length - 1) classesToAdd.push('pb-rounded-r-md');

        if (index > 0) classesToAdd.push('pb--ml-px');

        if (fullWidth) {
          classesToAdd.push('pb-grow pb-basis-0 pb-justify-center');
        }

        const element = child as React.ReactElement<{ className?: string }>;

        const combinedClasses = [
          element.props.className,
          ...classesToAdd
        ]
          .filter(Boolean)
          .join(' ');

        return cloneElement(element, {
          className: combinedClasses,
        });
      })}
    </div>
  );
};
