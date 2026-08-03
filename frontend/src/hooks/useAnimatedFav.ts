import { useEffect } from "react";

export function useAnimatedFavicon() {
  useEffect(() => {
    const frames = Array.from(
      { length: 10 },
      (_, i) => `/favicon/favicon${i + 1}.png`
    );

    const favicon = document.querySelector(
      "link[rel='icon']"
    ) as HTMLLinkElement | null;

    if (!favicon) return;

    let current = 0;
    let direction = 1;

    const interval = window.setInterval(() => {
      favicon.href = `${frames[current]}?v=${Date.now()}`;

      if (current === frames.length - 1) {
        direction = -1;
      } else if (current === 0) {
        direction = 1;
      }

      current += direction;
    }, 100);

    return () => clearInterval(interval);
  }, []);
}