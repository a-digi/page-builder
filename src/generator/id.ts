// path: src/components/page-builder/generator/id.tsx

export const generateIdString = (): string => {
  const randomPrefix = Math.floor(Math.random() * 10000 + Math.random() * 10000);
  const timestamp = Date.now();

  return `${randomPrefix}-${timestamp}`;
};
