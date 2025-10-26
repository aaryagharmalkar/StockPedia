import { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';

const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = '132, 0, 255';
const MOBILE_BREAKPOINT = 768;

const cardData = [
  { color: '#060010', title: 'Analytics', description: 'Track user behavior', label: 'Insights' },
  { color: '#060010', title: 'Dashboard', description: 'Centralized data view', label: 'Overview' },
  { color: '#060010', title: 'Collaboration', description: 'Work together seamlessly', label: 'Teamwork' },
  { color: '#060010', title: 'Automation', description: 'Streamline workflows', label: 'Efficiency' },
  { color: '#060010', title: 'Integration', description: 'Connect favorite tools', label: 'Connectivity' },
  { color: '#060010', title: 'Security', description: 'Enterprise-grade protection', label: 'Protection' }
];

// Helper to detect mobile
const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
};

// ParticleCard handles tilt, magnetism, particle & click effects
const ParticleCard = ({
  children,
  className = '',
  disableAnimations = false,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = true,
  clickEffect = true,
  enableMagnetism = true
}) => {
  const cardRef = useRef(null);
  const isHoveredRef = useRef(false);

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return;
    const el = cardRef.current;

    const handleMouseMove = e => {
      if (!enableTilt && !enableMagnetism) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;
        gsap.to(el, { rotateX, rotateY, duration: 0.1, ease: 'power2.out', transformPerspective: 1000 });
      }

      if (enableMagnetism) {
        const magnetX = (x - centerX) * 0.05;
        const magnetY = (y - centerY) * 0.05;
        gsap.to(el, { x: magnetX, y: magnetY, duration: 0.3, ease: 'power2.out' });
      }
    };

    const handleMouseLeave = () => {
      if (enableTilt) gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.3, ease: 'power2.out' });
      if (enableMagnetism) gsap.to(el, { x: 0, y: 0, duration: 0.3, ease: 'power2.out' });
    };

    const handleClick = e => {
      if (!clickEffect) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      );

      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor},0.4) 0%, rgba(${glowColor},0.2) 30%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 1000;
      `;
      el.appendChild(ripple);
      gsap.fromTo(ripple, { scale: 0, opacity: 1 }, { scale: 1, opacity: 0, duration: 0.8, ease: 'power2.out', onComplete: () => ripple.remove() });
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);
    el.addEventListener('click', handleClick);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
      el.removeEventListener('click', handleClick);
    };
  }, [disableAnimations, enableTilt, enableMagnetism, clickEffect, glowColor]);

  return (
    <div ref={cardRef} className={`${className} relative overflow-hidden`}>
      {children}
    </div>
  );
};

// Spotlight effect following mouse
const GlobalSpotlight = ({ gridRef, enabled = true, spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS, glowColor = DEFAULT_GLOW_COLOR, disableAnimations = false }) => {
  const spotlightRef = useRef(null);
  useEffect(() => {
    if (!enabled || disableAnimations || !gridRef.current) return;

    const spotlight = document.createElement('div');
    spotlight.style.cssText = `
      position: fixed;
      width: 800px;
      height: 800px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor},0.15) 0%,
        rgba(${glowColor},0.08) 15%,
        rgba(${glowColor},0.04) 25%,
        rgba(${glowColor},0.02) 40%,
        rgba(${glowColor},0.01) 65%,
        transparent 70%
      );
      z-index: 200;
      opacity: 0;
      transform: translate(-50%,-50%);
      mix-blend-mode: screen;
    `;
    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    const handleMouseMove = e => {
      if (!spotlightRef.current) return;
      gsap.to(spotlightRef.current, { left: e.clientX, top: e.clientY, opacity: 0.6, duration: 0.1, ease: 'power2.out' });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      spotlightRef.current?.remove();
    };
  }, [gridRef, enabled, spotlightRadius, glowColor, disableAnimations]);
  return null;
};

const BentoCardGrid = ({ children, gridRef }) => (
  <div className="bento-section grid gap-2 p-3 max-w-[54rem] select-none relative" ref={gridRef}>
    {children}
  </div>
);

// Main MagicBento component
const MagicBento = ({
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,
  enableTilt = false,
  glowColor = DEFAULT_GLOW_COLOR,
  clickEffect = true,
  enableMagnetism = true
}) => {
  const gridRef = useRef(null);
  const isMobile = useMobileDetection();
  const shouldDisableAnimations = disableAnimations || isMobile;

  return (
    <>
      <style>
        {`
          .card {
            border-radius: 20px;
            border: 1px solid #392e4e;
            background: #060010;
            color: #fff;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease-in-out;
          }
          .card--border-glow::after {
            content: '';
            position: absolute;
            inset: 0;
            padding: 6px;
            background: radial-gradient(200px circle at 50% 50%, rgba(${glowColor},0.8), transparent 60%);
            border-radius: inherit;
            pointer-events: none;
            z-index: 1;
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          .card--border-glow:hover::after { opacity: 1; }
          .text-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
          .text-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        `}
      </style>

      {enableSpotlight && (
        <GlobalSpotlight gridRef={gridRef} enabled={enableSpotlight} spotlightRadius={spotlightRadius} glowColor={glowColor} disableAnimations={shouldDisableAnimations} />
      )}

      <BentoCardGrid gridRef={gridRef}>
        <div className="card-responsive grid gap-2">
          {cardData.map((card, index) => (
            <ParticleCard
              key={index}
              className={`card flex flex-col justify-between p-5 ${enableBorderGlow ? 'card--border-glow' : ''}`}
              disableAnimations={shouldDisableAnimations}
              particleCount={particleCount}
              glowColor={glowColor}
              enableTilt={enableTilt}
              clickEffect={clickEffect}
              enableMagnetism={enableMagnetism}
            >
              <div className="card__header flex justify-between gap-3 relative text-white">
                <span className="card__label text-base">{card.label}</span>
              </div>
              <div className="card__content flex flex-col relative text-white">
                <h3 className={`card__title font-normal text-base m-0 mb-1 ${textAutoHide ? 'text-clamp-1' : ''}`}>{card.title}</h3>
                <p className={`card__description text-xs leading-5 opacity-90 ${textAutoHide ? 'text-clamp-2' : ''}`}>{card.description}</p>
              </div>
            </ParticleCard>
          ))}
        </div>
      </BentoCardGrid>
    </>
  );
};

export default MagicBento;
