import { useEffect, useState } from "react";

const useFpsOptimization = (render: () => void) => {
  const [hz, setHz] = useState(1);
  useEffect(() => {
    const loop = window.setInterval(() => {
      const start = performance.now();
      render();
      const newHz = Math.floor((performance.now() - start) / 1000);
      if (hz !== newHz) setHz(newHz);
    }, 1000 / hz);
    return () => window.clearInterval(loop);
  }, [render, hz, setHz]);
};

export default useFpsOptimization;
