"use client";
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import ScrollToPlugin from 'gsap/ScrollToPlugin';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

export default function ScrollContainer({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Set up scroller proxy with proper type handling
    ScrollTrigger.scrollerProxy(container, {
      scrollTop(value) {
        if (typeof value === 'number') {
          container.scrollTop = value;
        }
        return container.scrollTop;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight
        };
      }
    });

    // Configure container
    container.style.overflowY = 'scroll';
    container.style.height = '100vh';
    container.style.scrollSnapType = 'y mandatory';

    const sections = gsap.utils.toArray<HTMLElement>('.homepage-section');
    const section3 = document.getElementById('section-3');

    // Set up snap for sections 0-2
    sections.forEach((section, index) => {
      if (section !== section3) {
        ScrollTrigger.create({
          trigger: section,
          scroller: container,
          start: "top top",
          end: "bottom bottom",
          snap: {
            snapTo: index / (sections.length - 2),
            duration: { min: 0.6, max: 1.2 },
            ease: "power3.inOut"
          }
        });
      }
    });

    // Special handling for Section 3
    if (section3) {
      let lastScrollTime = 0;
      let lastScrollPosition = 0;

      const handleScroll = () => {
        if (isScrolling.current) return;

        const scrollTop = container.scrollTop;
        const sectionTop = section3.offsetTop;
        const isInSection3 = scrollTop >= sectionTop;

        if (isInSection3) {
          // Disable snap when in Section 3
          container.style.scrollSnapType = 'none';

          // Check for scroll up at top of Section 3
          const atTopOfSection3 = scrollTop <= sectionTop + 5;
          const scrollingUp = scrollTop < lastScrollPosition;

          if (atTopOfSection3 && scrollingUp) {
            const now = Date.now();
            if (now - lastScrollTime < 500) { // Double scroll up
              isScrolling.current = true;
              container.style.scrollSnapType = 'y mandatory';
              
              const section2 = sections[sections.indexOf(section3) - 1] as HTMLElement;
              gsap.to(container, {
                scrollTo: { y: section2, autoKill: false },
                duration: 0.8,
                ease: "power2.inOut",
                onComplete: () => {
                  isScrolling.current = false;
                }
              });
            }
            lastScrollTime = now;
          }
        } else {
          // Re-enable snap when not in Section 3
          container.style.scrollSnapType = 'y mandatory';
        }

        lastScrollPosition = scrollTop;
      };

      container.addEventListener('scroll', handleScroll);

      return () => {
        ScrollTrigger.getAll().forEach(t => t.kill());
        container.removeEventListener('scroll', handleScroll);
      };
    }

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="homepage-scroll-container"
      style={{
        scrollSnapType: 'y mandatory',
        msOverflowStyle: 'none',
        scrollbarWidth: 'none'
      }}
    >
      {children}
    </div>
  );
}