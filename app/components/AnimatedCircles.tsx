// app/components/AnimatedCircles.tsx

import { useEffect, useState } from 'react';

// Keyframes for the floating animation
const animationStyles = `
  @keyframes floatUpDown {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-25px);
    }
  }
`;

// Dynamically generated styles for each circle for a random effect
const circleStyles = `
  .circle-0 {
    width: 118px; height: 118px; top: 18%; left: 56%; animation-delay: 1.88s; animation-duration: 14.45s; opacity: 0.1;
  }
  .circle-1 {
    width: 48px; height: 48px; top: 55%; left: 38%; animation-delay: 4.43s; animation-duration: 8.68s; opacity: 0.15;
  }
  .circle-2 {
    width: 109px; height: 109px; top: 20%; left: 41%; animation-delay: 0.33s; animation-duration: 10.36s; opacity: 0.06;
  }
  .circle-3 {
    width: 90px; height: 90px; top: 0%; left: 51%; animation-delay: 0.47s; animation-duration: 12.29s; opacity: 0.18;
  }
  .circle-4 {
    width: 77px; height: 77px; top: 81%; left: 32%; animation-delay: 4.94s; animation-duration: 10.88s; opacity: 0.13;
  }
  .circle-5 {
    width: 104px; height: 104px; top: 63%; left: 46%; animation-delay: 1.6s; animation-duration: 12.42s; opacity: 0.17;
  }
  .circle-6 {
    width: 109px; height: 109px; top: 55%; left: 26%; animation-delay: 4.08s; animation-duration: 12.95s; opacity: 0.07;
  }
  .circle-7 {
    width: 88px; height: 88px; top: 82%; left: 61%; animation-delay: 2.17s; animation-duration: 13.2s; opacity: 0.17;
  }
  .circle-8 {
    width: 78px; height: 78px; top: 38%; left: 79%; animation-delay: 3.7s; animation-duration: 9.4s; opacity: 0.17;
  }
  .circle-9 {
    width: 55px; height: 55px; top: 24%; left: 47%; animation-delay: 1.67s; animation-duration: 12.17s; opacity: 0.07;
  }
  .circle-10 {
    width: 40px; height: 40px; top: 80%; left: 98%; animation-delay: 4.69s; animation-duration: 14.17s; opacity: 0.12;
  }
  .circle-11 {
    width: 104px; height: 104px; top: 38%; left: 53%; animation-delay: 2.39s; animation-duration: 11.6s; opacity: 0.09;
  }
  .circle-12 {
    width: 104px; height: 104px; top: 27%; left: 72%; animation-delay: 4.35s; animation-duration: 9.9s; opacity: 0.09;
  }
  .circle-13 {
    width: 76px; height: 76px; top: 59%; left: 66%; animation-delay: 4.44s; animation-duration: 11.48s; opacity: 0.17;
  }
  .circle-14 {
    width: 67px; height: 67px; top: 99%; left: 21%; animation-delay: 0.4s; animation-duration: 10.77s; opacity: 0.18;
  }
`;

const NUM_CIRCLES = 15;

export const AnimatedCircles = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Base class for all circles
  const baseCircleClass = "rounded-full absolute bg-[radial-gradient(circle_at_center,#5A9553_0%,transparent_80%)] animate-[floatUpDown_ease-in-out_infinite]";

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
      {isClient && (
        <>
          <style>{animationStyles}</style>
          <style>{circleStyles}</style>
        </>
      )}
      
      {Array.from({ length: NUM_CIRCLES }).map((_, index) => (
        <div key={index} className={`${baseCircleClass} circle-${index}`} />
      ))}
    </div>
  );
};