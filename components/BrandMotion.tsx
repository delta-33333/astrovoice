'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Mouvement de marque, sans dépendance : révélation des sections au scroll
 * (IntersectionObserver, décalage en cascade) et parallaxe légère du ciel étoilé.
 * Désactivé si prefers-reduced-motion. Les éléments déjà visibles au chargement
 * ne sont jamais masqués (pas d'impact LCP, pas de layout shift : transform/opacity uniquement).
 */
const TARGETS = 'main section, main article > *, [data-reveal]';

export default function BrandMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) return;
    // Pas de mouvement dans l'interface de chat / d'appel.
    if (/\/(chat|call)(\/|$)/.test(pathname || '')) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-revealed');
          io.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );

    const vh = window.innerHeight;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(TARGETS));
    nodes.forEach((el) => {
      if (el.dataset.revealBound) return;
      el.dataset.revealBound = '1';
      const rect = el.getBoundingClientRect();
      if (rect.top < vh * 0.95) return; // visible au chargement : on ne touche à rien
      const siblings = el.parentElement ? Array.from(el.parentElement.children) : [];
      const index = Math.max(0, siblings.indexOf(el));
      el.style.setProperty('--reveal-delay', `${Math.min(index, 4) * 70}ms`);
      el.classList.add('reveal');
      io.observe(el);
    });

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        document.documentElement.style.setProperty('--sky-y', `${Math.round(window.scrollY)}px`);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
      nodes.forEach((el) => {
        el.classList.remove('reveal');
        el.classList.add('is-revealed');
      });
    };
  }, [pathname]);

  return null;
}
