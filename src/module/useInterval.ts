import { useEffect, useState } from "react";

const useInterval = (func: () => void, interval: number) => {
  const [loop, setLoop] = useState(0);
  useEffect(() => {
    setLoop(window.setInterval(func, interval));
    return () => {
      setLoop(0);
      window.clearInterval(loop);
    };
  }, [func, interval]);
};

export default useInterval;
