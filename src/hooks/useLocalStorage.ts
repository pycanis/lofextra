import { useEffect, useState } from "react";

const getStorageValue = <T extends string>(key: string, defaultValue: T): T => {
  const saved = localStorage.getItem(key);

  return saved !== null ? JSON.parse(saved) : defaultValue;
};

export const useLocalStorage = <T extends string>(
  key: string,
  defaultValue: T
) => {
  const [value, setValue] = useState<T>(() =>
    getStorageValue(key, defaultValue)
  );

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
};
