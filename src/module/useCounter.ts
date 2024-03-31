import { useCallback, useState } from "react";

const useCounter = (): [number, () => void] => {
  const [count, setCount] = useState(0);
  const increment = useCallback(() => {
    setCount(count + 1);
  }, [count]);
  return [count, increment];
};

export default useCounter;
