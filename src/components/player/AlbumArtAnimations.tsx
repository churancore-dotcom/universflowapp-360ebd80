import { memo, useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AlbumArtAnimationsProps {
  isPlaying: boolean;
  bassFrequency: number;
  midFrequency: number;
  highFrequency: number;
  songId: string;
}

// Generate a consistent animation type based on song ID
const getAnimationType = (songId: string): number => {
  let hash = 0;
  for (let i = 0; i < songId.length; i++) {
    const char = songId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash) % 18; // 18 different premium animation types
};

// Animation 1: Liquid Glass Flow - iOS 26 inspired
const LiquidGlassFlow = memo(({ bass, mid, high }: { bass: number; mid: number; high: number }) => {
  const [phase, setPhase] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPhase(p => (p + 2) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Soft ambient glow layers */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-[-40%] rounded-full"
          style={{
            background: `radial-gradient(ellipse ${60 + i * 15}% ${80 + i * 10}% at ${50 + Math.sin((phase + i * 60) * Math.PI / 180) * 20}% ${50 + Math.cos((phase + i * 40) * Math.PI / 180) * 15}%, 
              hsl(var(--primary) / ${0.25 + bass * 0.15 - i * 0.05}) 0%, 
              hsl(var(--primary) / ${0.12 - i * 0.03}) 50%,
              transparent 70%)`,
            filter: `blur(${40 + i * 20}px)`,
          }}
          animate={{
            scale: [1, 1.08 + bass * 0.06, 1],
            rotate: i % 2 === 0 ? phase * 0.3 : -phase * 0.2,
          }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
      ))}
      
      {/* Flowing light streaks */}
      <motion.div
        className="absolute inset-[-30%]"
        style={{
          background: `conic-gradient(from ${phase}deg at 50% 50%,
            transparent 0deg,
            hsl(var(--primary) / ${0.08 + mid * 0.08}) 45deg,
            transparent 90deg,
            hsl(var(--primary) / ${0.06 + high * 0.06}) 180deg,
            transparent 225deg,
            hsl(var(--primary) / ${0.1 + bass * 0.1}) 315deg,
            transparent 360deg)`,
          filter: 'blur(50px)',
        }}
        animate={{
          scale: [1, 1.05 + bass * 0.03, 1],
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
      
      {/* Soft center bloom */}
      <motion.div
        className="absolute inset-[5%] rounded-full"
        style={{
          background: `radial-gradient(circle at 50% 50%, 
            hsl(var(--primary) / ${0.2 + bass * 0.15}) 0%, 
            hsl(var(--primary) / 0.05) 60%,
            transparent 80%)`,
          filter: `blur(${25 + bass * 15}px)`,
        }}
        animate={{
          scale: [1, 1.12 + bass * 0.08, 1],
        }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      />
    </>
  );
});
LiquidGlassFlow.displayName = 'LiquidGlassFlow';

// Animation 2: Breathing Aura - Gentle pulsing halo
const BreathingAura = memo(({ bass, mid, high }: { bass: number; mid: number; high: number }) => {
  return (
    <>
      {/* Outer soft halos */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            inset: `${-15 - i * 12}%`,
            background: `radial-gradient(circle, 
              transparent 50%, 
              hsl(var(--primary) / ${0.08 - i * 0.015}) 70%,
              hsl(var(--primary) / ${0.04 - i * 0.008}) 85%,
              transparent 100%)`,
            filter: `blur(${20 + i * 10}px)`,
          }}
          animate={{
            scale: [1, 1.04 + bass * 0.04 + i * 0.01, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{ 
            duration: 0.5 + i * 0.1, 
            ease: 'easeInOut',
            delay: i * 0.05,
          }}
        />
      ))}
      
      {/* Inner glow pulse */}
      <motion.div
        className="absolute inset-[-5%] rounded-full"
        style={{
          background: `radial-gradient(circle, 
            hsl(var(--primary) / ${0.3 + bass * 0.2}) 0%, 
            hsl(var(--primary) / 0.1) 40%,
            transparent 65%)`,
          filter: `blur(${30 + bass * 20}px)`,
        }}
        animate={{
          scale: [1, 1.1 + bass * 0.1, 1],
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    </>
  );
});
BreathingAura.displayName = 'BreathingAura';

// Animation 3: Aurora Waves - Flowing color bands
const AuroraWaves = memo(({ bass, mid, high }: { bass: number; mid: number; high: number }) => {
  const [offset, setOffset] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setOffset(o => (o + 1) % 100);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Flowing aurora bands */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-[-50%]"
          style={{
            background: `linear-gradient(${120 + i * 40 + offset}deg, 
              transparent 20%,
              hsl(var(--primary) / ${0.12 + (i === 0 ? bass : i === 1 ? mid : high) * 0.1}) 35%,
              hsl(var(--primary) / ${0.18 + (i === 0 ? bass : i === 1 ? mid : high) * 0.12}) 50%,
              hsl(var(--primary) / ${0.1 + (i === 0 ? bass : i === 1 ? mid : high) * 0.08}) 65%,
              transparent 80%)`,
            filter: `blur(${45 + i * 15}px)`,
            transform: `translateY(${Math.sin((offset + i * 30) * Math.PI / 50) * 10}%)`,
          }}
          animate={{
            scale: [1, 1.03 + bass * 0.02, 1],
          }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
      ))}
      
      {/* Subtle shimmer overlay */}
      <motion.div
        className="absolute inset-[-20%]"
        style={{
          background: `radial-gradient(ellipse 100% 60% at 50% ${40 + Math.sin(offset * Math.PI / 25) * 15}%, 
            hsl(var(--primary) / ${0.15 + mid * 0.1}) 0%,
            transparent 60%)`,
          filter: 'blur(35px)',
        }}
        animate={{
          opacity: [0.6, 1, 0.6],
        }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      />
    </>
  );
});
AuroraWaves.displayName = 'AuroraWaves';

// Animation 4: Depth Pulse - 3D depth illusion
const DepthPulse = memo(({ bass, mid, high }: { bass: number; mid: number; high: number }) => {
  return (
    <>
      {/* Layered depth rings */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-[24px]"
          style={{
            inset: `${-5 - i * 8}%`,
            background: `linear-gradient(135deg, 
              hsl(var(--primary) / ${0.04 + i * 0.02}) 0%,
              transparent 50%,
              hsl(var(--primary) / ${0.02 + i * 0.01}) 100%)`,
            boxShadow: `inset 0 0 ${30 + i * 10}px hsl(var(--primary) / ${0.05 - i * 0.008})`,
            filter: `blur(${8 + i * 6}px)`,
          }}
          animate={{
            scale: [1, 1.02 + bass * 0.02 + i * 0.005, 1],
            opacity: [0.5 + i * 0.08, 1, 0.5 + i * 0.08],
          }}
          transition={{ 
            duration: 0.35, 
            ease: 'easeOut',
            delay: i * 0.03,
          }}
        />
      ))}
      
      {/* Soft spotlight */}
      <motion.div
        className="absolute inset-[-15%] rounded-full"
        style={{
          background: `radial-gradient(circle at 50% 40%, 
            hsl(var(--primary) / ${0.25 + bass * 0.2}) 0%, 
            transparent 50%)`,
          filter: `blur(${35 + bass * 20}px)`,
        }}
        animate={{
          scale: [1, 1.08 + bass * 0.06, 1],
        }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      />
    </>
  );
});
DepthPulse.displayName = 'DepthPulse';

// Animation 5: Silk Ripple - Smooth fabric-like motion
const SilkRipple = memo(({ bass, mid, high }: { bass: number; mid: number; high: number }) => {
  const [ripple, setRipple] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setRipple(r => (r + 3) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Silk waves */}
      {[0, 1, 2, 3].map((i) => {
        const waveOffset = Math.sin((ripple + i * 45) * Math.PI / 180);
        return (
          <motion.div
            key={i}
            className="absolute inset-[-35%] rounded-full"
            style={{
              background: `radial-gradient(ellipse ${70 + waveOffset * 15}% ${60 + waveOffset * 10}% at ${50 + waveOffset * 10}% ${50 + waveOffset * 8}%, 
                hsl(var(--primary) / ${0.1 + (i % 2 === 0 ? bass : mid) * 0.08}) 0%,
                transparent 70%)`,
              filter: `blur(${40 + i * 12}px)`,
            }}
            animate={{
              scale: [1, 1.04 + bass * 0.03, 1],
            }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        );
      })}
      
      {/* Center warmth */}
      <motion.div
        className="absolute inset-[0%] rounded-full"
        style={{
          background: `radial-gradient(circle, 
            hsl(var(--primary) / ${0.2 + bass * 0.15}) 0%, 
            hsl(var(--primary) / 0.05) 50%,
            transparent 70%)`,
          filter: `blur(${28 + bass * 18}px)`,
        }}
        animate={{
          scale: [1, 1.1 + bass * 0.08, 1],
        }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      />
    </>
  );
});
SilkRipple.displayName = 'SilkRipple';

// Animation 6: Vinyl Glow - Spinning vinyl with subtle glow
const VinylGlow = memo(({ bass, mid, high }: { bass: number; mid: number; high: number }) => {
  const [rotation, setRotation] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(r => (r + 1.5) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Vinyl grooves effect */}
      <motion.div
        className="absolute inset-[-25%] rounded-full"
        style={{
          background: `repeating-radial-gradient(circle at 50% 50%,
            transparent 0px,
            transparent 8px,
            hsl(var(--primary) / ${0.03 + bass * 0.02}) 9px,
            transparent 10px)`,
          filter: 'blur(2px)',
          transform: `rotate(${rotation}deg)`,
        }}
      />
      
      {/* Spinning highlight */}
      <motion.div
        className="absolute inset-[-20%] rounded-full"
        style={{
          background: `conic-gradient(from ${rotation}deg at 50% 50%,
            transparent 0deg,
            hsl(var(--primary) / ${0.08 + mid * 0.06}) 30deg,
            transparent 60deg,
            transparent 180deg,
            hsl(var(--primary) / ${0.06 + high * 0.05}) 210deg,
            transparent 240deg)`,
          filter: 'blur(30px)',
        }}
        animate={{
          scale: [1, 1.03 + bass * 0.02, 1],
        }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
      />
      
      {/* Center label glow */}
      <motion.div
        className="absolute inset-[20%] rounded-full"
        style={{
          background: `radial-gradient(circle, 
            hsl(var(--primary) / ${0.25 + bass * 0.2}) 0%, 
            hsl(var(--primary) / 0.08) 60%,
            transparent 80%)`,
          filter: `blur(${20 + bass * 15}px)`,
        }}
        animate={{
          scale: [1, 1.15 + bass * 0.1, 1],
        }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      />
    </>
  );
});
VinylGlow.displayName = 'VinylGlow';

// Animation 7: Prism Refraction - Light splitting effect
const PrismRefraction = memo(({ bass, mid, high }: { bass: number; mid: number; high: number }) => {
  const [angle, setAngle] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setAngle(a => (a + 1) % 360);
    }, 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Refracted light beams */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-[-40%]"
          style={{
            background: `linear-gradient(${angle + i * 30}deg, 
              transparent 30%,
              hsl(var(--primary) / ${0.06 + (i === 0 ? bass : i === 1 ? mid : high) * 0.06}) 45%,
              hsl(var(--primary) / ${0.1 + (i === 0 ? bass : i === 1 ? mid : high) * 0.08}) 50%,
              hsl(var(--primary) / ${0.06 + (i === 0 ? bass : i === 1 ? mid : high) * 0.06}) 55%,
              transparent 70%)`,
            filter: `blur(${35 + i * 10}px)`,
          }}
          animate={{
            opacity: [0.6, 1, 0.6],
          }}
          transition={{ duration: 0.5, ease: 'easeInOut', delay: i * 0.1 }}
        />
      ))}
      
      {/* Center prism glow */}
      <motion.div
        className="absolute inset-[-10%] rounded-full"
        style={{
          background: `radial-gradient(circle, 
            hsl(var(--primary) / ${0.22 + bass * 0.18}) 0%, 
            hsl(var(--primary) / 0.08) 50%,
            transparent 70%)`,
          filter: `blur(${30 + bass * 20}px)`,
        }}
        animate={{
          scale: [1, 1.1 + bass * 0.08, 1],
        }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      />
    </>
  );
});
PrismRefraction.displayName = 'PrismRefraction';

// Animation 8: Nebula Cloud - Soft cosmic clouds
const NebulaCloud = memo(({ bass, mid, high }: { bass: number; mid: number; high: number }) => {
  const [drift, setDrift] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDrift(d => (d + 0.5) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Drifting cloud layers */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-[-45%]"
          style={{
            background: `radial-gradient(ellipse ${100 + Math.sin(drift * 0.1 + i) * 20}% ${80 + Math.cos(drift * 0.08 + i) * 15}% at ${45 + Math.sin(drift * 0.05 + i * 2) * 15}% ${50 + Math.cos(drift * 0.06 + i) * 10}%, 
              hsl(var(--primary) / ${0.12 + (i === 0 ? bass : i === 1 ? mid : high) * 0.1}) 0%,
              hsl(var(--primary) / ${0.05}) 50%,
              transparent 70%)`,
            filter: `blur(${50 + i * 15}px)`,
          }}
          animate={{
            scale: [1, 1.03 + bass * 0.02, 1],
          }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
        />
      ))}
      
      {/* Soft star points */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${25 + i * 18}%`,
            top: `${20 + (i * 23) % 60}%`,
            background: 'white',
            filter: 'blur(1px)',
          }}
          animate={{
            opacity: [0.2, 0.6 + high * 0.4, 0.2],
            scale: [0.8, 1.2 + high * 0.3, 0.8],
          }}
          transition={{ duration: 0.6, delay: i * 0.15 }}
        />
      ))}
      
      {/* Core glow */}
      <motion.div
        className="absolute inset-[5%] rounded-full"
        style={{
          background: `radial-gradient(circle, 
            hsl(var(--primary) / ${0.2 + bass * 0.15}) 0%, 
            transparent 60%)`,
          filter: `blur(${25 + bass * 18}px)`,
        }}
        animate={{
          scale: [1, 1.12 + bass * 0.08, 1],
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    </>
  );
});
NebulaCloud.displayName = 'NebulaCloud';

// Animation 9: Crystal Shimmer - Faceted gem reflections
const CrystalShimmer = memo(({ bass, mid, high }: { bass: number; mid: number; high: number }) => {
  const [shimmer, setShimmer] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setShimmer(s => (s + 2) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Faceted reflections */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            inset: '0%',
            background: `linear-gradient(${shimmer + i * 60}deg, 
              transparent 40%,
              hsl(var(--primary) / ${0.08 + (i % 2 === 0 ? bass : mid) * 0.06}) 48%,
              hsl(var(--primary) / ${0.12 + (i % 2 === 0 ? bass : mid) * 0.08}) 50%,
              hsl(var(--primary) / ${0.08 + (i % 2 === 0 ? bass : mid) * 0.06}) 52%,
              transparent 60%)`,
            filter: `blur(${15 + i * 5}px)`,
          }}
          animate={{
            opacity: [0.4, 0.9, 0.4],
          }}
          transition={{ duration: 0.4, delay: i * 0.06 }}
        />
      ))}
      
      {/* Bright center */}
      <motion.div
        className="absolute inset-[10%] rounded-full"
        style={{
          background: `radial-gradient(circle, 
            hsl(var(--primary) / ${0.28 + bass * 0.2}) 0%, 
            hsl(var(--primary) / 0.1) 50%,
            transparent 70%)`,
          filter: `blur(${22 + bass * 16}px)`,
        }}
        animate={{
          scale: [1, 1.1 + bass * 0.08, 1],
        }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      />
    </>
  );
});
CrystalShimmer.displayName = 'CrystalShimmer';

// Animation 10: Ocean Depth - Deep water light effect
const OceanDepth = memo(({ bass, mid, high }: { bass: number; mid: number; high: number }) => {
  const [wave, setWave] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setWave(w => (w + 1.5) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Caustic light patterns */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-[-30%]"
          style={{
            background: `radial-gradient(ellipse ${80 + Math.sin(wave * 0.1 + i * 2) * 30}% ${70 + Math.cos(wave * 0.12 + i) * 25}% at ${50 + Math.sin(wave * 0.08 + i * 3) * 20}% ${40 + Math.cos(wave * 0.07 + i * 2) * 15}%, 
              hsl(var(--primary) / ${0.15 + (i === 0 ? bass : mid) * 0.12}) 0%,
              transparent 60%)`,
            filter: `blur(${40 + i * 12}px)`,
          }}
          animate={{
            scale: [1, 1.04 + bass * 0.03, 1],
          }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
        />
      ))}
      
      {/* Light rays from above */}
      <motion.div
        className="absolute inset-[-20%]"
        style={{
          background: `linear-gradient(${175 + Math.sin(wave * 0.05) * 10}deg, 
            hsl(var(--primary) / ${0.1 + high * 0.08}) 0%,
            transparent 40%)`,
          filter: 'blur(35px)',
        }}
        animate={{
          opacity: [0.5, 0.9, 0.5],
        }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />
      
      {/* Deep glow */}
      <motion.div
        className="absolute inset-[5%] rounded-full"
        style={{
          background: `radial-gradient(circle at 50% 60%, 
            hsl(var(--primary) / ${0.22 + bass * 0.18}) 0%, 
            transparent 65%)`,
          filter: `blur(${28 + bass * 18}px)`,
        }}
        animate={{
          scale: [1, 1.1 + bass * 0.08, 1],
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    </>
  );
});
OceanDepth.displayName = 'OceanDepth';

// Animation 11: Ember Glow - Warm ember pulses
const EmberGlow = memo(({ bass, mid, high }: { bass: number; mid: number; high: number }) => {
  return (
    <>
      {/* Warm gradient layers */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            inset: `${-10 - i * 15}%`,
            background: `radial-gradient(circle, 
              hsl(var(--primary) / ${0.18 - i * 0.04 + bass * 0.1}) 0%,
              hsl(var(--primary) / ${0.08 - i * 0.02}) 50%,
              transparent 70%)`,
            filter: `blur(${35 + i * 15}px)`,
          }}
          animate={{
            scale: [1, 1.06 + bass * 0.05 + i * 0.01, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{ 
            duration: 0.4, 
            ease: 'easeInOut',
            delay: i * 0.08,
          }}
        />
      ))}
      
      {/* Flickering core */}
      <motion.div
        className="absolute inset-[0%] rounded-full"
        style={{
          background: `radial-gradient(circle, 
            hsl(var(--primary) / ${0.35 + bass * 0.25}) 0%, 
            hsl(var(--primary) / 0.12) 45%,
            transparent 65%)`,
          filter: `blur(${25 + bass * 18}px)`,
        }}
        animate={{
          scale: [1, 1.12 + bass * 0.1, 1.02, 1.08 + mid * 0.06, 1],
          opacity: [0.8, 1, 0.85, 1, 0.8],
        }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />
    </>
  );
});
EmberGlow.displayName = 'EmberGlow';

// Animation 12: Frost Crystal - Icy crystalline patterns
const FrostCrystal = memo(({ bass, mid, high }: { bass: number; mid: number; high: number }) => {
  const [frost, setFrost] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setFrost(f => (f + 1) % 360);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Ice crystal rays */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 origin-left"
          style={{
            width: `${60 + bass * 30}%`,
            height: '2px',
            background: `linear-gradient(90deg, 
              hsl(var(--primary) / ${0.2 + (i % 2 === 0 ? bass : mid) * 0.15}) 0%,
              hsl(var(--primary) / 0.05) 70%,
              transparent 100%)`,
            transform: `rotate(${frost + i * 60}deg)`,
            filter: 'blur(3px)',
          }}
          animate={{
            opacity: [0.4, 0.9, 0.4],
            scaleX: [0.8, 1 + bass * 0.15, 0.8],
          }}
          transition={{ duration: 0.5, delay: i * 0.05 }}
        />
      ))}
      
      {/* Soft halo */}
      <motion.div
        className="absolute inset-[-25%] rounded-full"
        style={{
          background: `radial-gradient(circle, 
            hsl(var(--primary) / ${0.15 + bass * 0.12}) 0%,
            hsl(var(--primary) / 0.04) 50%,
            transparent 70%)`,
          filter: `blur(${40 + bass * 20}px)`,
        }}
        animate={{
          scale: [1, 1.08 + bass * 0.06, 1],
        }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />
    </>
  );
});
FrostCrystal.displayName = 'FrostCrystal';

// Animation 13: Solar Flare - Sun-like energy bursts
const SolarFlare = memo(({ bass, mid, high }: { bass: number; mid: number; high: number }) => {
  return (
    <>
      {/* Corona layers */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            inset: `${-20 - i * 12}%`,
            background: `radial-gradient(circle, 
              transparent 30%,
              hsl(var(--primary) / ${0.1 - i * 0.02 + bass * 0.08}) 50%,
              hsl(var(--primary) / ${0.05 - i * 0.01}) 70%,
              transparent 85%)`,
            filter: `blur(${30 + i * 15}px)`,
          }}
          animate={{
            scale: [1, 1.08 + bass * 0.06 + i * 0.02, 1],
          }}
          transition={{ 
            duration: 0.4, 
            ease: 'easeOut',
            delay: i * 0.06,
          }}
        />
      ))}
      
      {/* Bright core */}
      <motion.div
        className="absolute inset-[-5%] rounded-full"
        style={{
          background: `radial-gradient(circle, 
            hsl(var(--primary) / ${0.4 + bass * 0.25}) 0%, 
            hsl(var(--primary) / 0.15) 40%,
            transparent 60%)`,
          filter: `blur(${22 + bass * 18}px)`,
        }}
        animate={{
          scale: [1, 1.15 + bass * 0.1, 1],
        }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      />
    </>
  );
});
SolarFlare.displayName = 'SolarFlare';

// Animation 14: Smoke Drift - Ethereal smoke wisps
const SmokeDrift = memo(({ bass, mid, high }: { bass: number; mid: number; high: number }) => {
  const [drift, setDrift] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDrift(d => (d + 0.8) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Drifting smoke wisps */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-[-40%]"
          style={{
            background: `radial-gradient(ellipse ${90 + Math.sin(drift * 0.08 + i * 1.5) * 30}% ${70 + Math.cos(drift * 0.1 + i) * 20}% at ${40 + Math.sin(drift * 0.06 + i * 2.5) * 25}% ${55 + Math.cos(drift * 0.05 + i * 1.8) * 18}%, 
              hsl(var(--primary) / ${0.1 + (i % 2 === 0 ? bass : mid) * 0.08}) 0%,
              transparent 60%)`,
            filter: `blur(${45 + i * 12}px)`,
          }}
          animate={{
            scale: [1, 1.03 + bass * 0.02, 1],
          }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      ))}
      
      {/* Soft core */}
      <motion.div
        className="absolute inset-[5%] rounded-full"
        style={{
          background: `radial-gradient(circle, 
            hsl(var(--primary) / ${0.18 + bass * 0.14}) 0%, 
            transparent 60%)`,
          filter: `blur(${28 + bass * 18}px)`,
        }}
        animate={{
          scale: [1, 1.1 + bass * 0.08, 1],
        }}
        transition={{ duration: 0.32, ease: 'easeOut' }}
      />
    </>
  );
});
SmokeDrift.displayName = 'SmokeDrift';

// Animation 15: Galaxy Spiral - Rotating galaxy arms
const GalaxySpiral = memo(({ bass, mid, high }: { bass: number; mid: number; high: number }) => {
  const [rotation, setRotation] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(r => (r + 0.6) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Spiral arms */}
      {[0, 1].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-[-35%]"
          style={{
            background: `conic-gradient(from ${rotation + i * 180}deg at 50% 50%,
              transparent 0deg,
              hsl(var(--primary) / ${0.06 + bass * 0.05}) 20deg,
              hsl(var(--primary) / ${0.1 + mid * 0.08}) 40deg,
              hsl(var(--primary) / ${0.06 + bass * 0.05}) 60deg,
              transparent 80deg,
              transparent 180deg,
              hsl(var(--primary) / ${0.05 + high * 0.04}) 200deg,
              hsl(var(--primary) / ${0.08 + mid * 0.06}) 220deg,
              hsl(var(--primary) / ${0.05 + high * 0.04}) 240deg,
              transparent 260deg)`,
            filter: `blur(${40 + i * 10}px)`,
          }}
          animate={{
            scale: [1, 1.04 + bass * 0.03, 1],
          }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
      ))}
      
      {/* Galactic core */}
      <motion.div
        className="absolute inset-[10%] rounded-full"
        style={{
          background: `radial-gradient(circle, 
            hsl(var(--primary) / ${0.3 + bass * 0.2}) 0%, 
            hsl(var(--primary) / 0.1) 50%,
            transparent 70%)`,
          filter: `blur(${25 + bass * 18}px)`,
        }}
        animate={{
          scale: [1, 1.12 + bass * 0.08, 1],
        }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      />
    </>
  );
});
GalaxySpiral.displayName = 'GalaxySpiral';

// Animation 16: Moonlight Haze - Soft lunar glow
const MoonlightHaze = memo(({ bass, mid, high }: { bass: number; mid: number; high: number }) => {
  return (
    <>
      {/* Soft lunar halo layers */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            inset: `${-8 - i * 10}%`,
            background: `radial-gradient(circle, 
              transparent ${40 + i * 5}%,
              hsl(var(--primary) / ${0.06 - i * 0.01 + bass * 0.04}) ${55 + i * 5}%,
              transparent ${70 + i * 5}%)`,
            filter: `blur(${18 + i * 8}px)`,
          }}
          animate={{
            scale: [1, 1.03 + bass * 0.02, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{ 
            duration: 0.5, 
            ease: 'easeInOut',
            delay: i * 0.04,
          }}
        />
      ))}
      
      {/* Bright moon glow */}
      <motion.div
        className="absolute inset-[-5%] rounded-full"
        style={{
          background: `radial-gradient(circle, 
            hsl(var(--primary) / ${0.25 + bass * 0.18}) 0%, 
            hsl(var(--primary) / 0.08) 50%,
            transparent 70%)`,
          filter: `blur(${28 + bass * 18}px)`,
        }}
        animate={{
          scale: [1, 1.1 + bass * 0.08, 1],
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    </>
  );
});
MoonlightHaze.displayName = 'MoonlightHaze';

// Animation 17: Thunder Pulse - Soft electrical pulses
const ThunderPulse = memo(({ bass, mid, high }: { bass: number; mid: number; high: number }) => {
  const [flash, setFlash] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setFlash(f => (f + 1) % 60);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  const isFlashing = flash < 3 || (flash > 20 && flash < 23);

  return (
    <>
      {/* Ambient storm clouds */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-[-35%]"
          style={{
            background: `radial-gradient(ellipse 90% 70% at ${45 + i * 10}% ${50 + i * 5}%, 
              hsl(var(--primary) / ${0.1 + (i === 0 ? bass : mid) * 0.08}) 0%,
              transparent 60%)`,
            filter: `blur(${45 + i * 12}px)`,
          }}
          animate={{
            scale: [1, 1.04 + bass * 0.03, 1],
          }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
        />
      ))}
      
      {/* Lightning flash */}
      <motion.div
        className="absolute inset-[-20%] rounded-full"
        style={{
          background: `radial-gradient(circle, 
            hsl(var(--primary) / ${isFlashing ? 0.4 + bass * 0.3 : 0.15 + bass * 0.1}) 0%,
            transparent 60%)`,
          filter: `blur(${30 + bass * 20}px)`,
        }}
        animate={{
          scale: isFlashing ? [1, 1.2 + bass * 0.15, 1] : [1, 1.08 + bass * 0.06, 1],
        }}
        transition={{ duration: isFlashing ? 0.1 : 0.35, ease: 'easeOut' }}
      />
    </>
  );
});
ThunderPulse.displayName = 'ThunderPulse';

// Animation 18: Zen Flow - Minimal, peaceful movement
const ZenFlow = memo(({ bass, mid, high }: { bass: number; mid: number; high: number }) => {
  const [flow, setFlow] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setFlow(f => (f + 0.5) % 100);
    }, 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Flowing zen circles */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            inset: `${-15 - i * 12}%`,
            border: `1px solid hsl(var(--primary) / ${0.08 + (i === 0 ? bass : i === 1 ? mid : high) * 0.06})`,
            filter: `blur(${6 + i * 4}px)`,
          }}
          animate={{
            scale: [1, 1.03 + bass * 0.02, 1],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{ 
            duration: 0.6 + i * 0.15, 
            ease: 'easeInOut',
            delay: i * 0.1,
          }}
        />
      ))}
      
      {/* Soft ambient glow */}
      <motion.div
        className="absolute inset-[-20%]"
        style={{
          background: `radial-gradient(ellipse 80% 80% at 50% ${48 + Math.sin(flow * 0.1) * 5}%, 
            hsl(var(--primary) / ${0.12 + bass * 0.1}) 0%,
            transparent 60%)`,
          filter: `blur(${40 + bass * 18}px)`,
        }}
        animate={{
          scale: [1, 1.05 + bass * 0.04, 1],
        }}
        transition={{ duration: 0.45, ease: 'easeInOut' }}
      />
      
      {/* Center breath */}
      <motion.div
        className="absolute inset-[8%] rounded-full"
        style={{
          background: `radial-gradient(circle, 
            hsl(var(--primary) / ${0.18 + bass * 0.14}) 0%, 
            transparent 65%)`,
          filter: `blur(${25 + bass * 16}px)`,
        }}
        animate={{
          scale: [1, 1.1 + bass * 0.08, 1],
        }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />
    </>
  );
});
ZenFlow.displayName = 'ZenFlow';

const AlbumArtAnimations = memo(({ isPlaying, bassFrequency, midFrequency, highFrequency, songId }: AlbumArtAnimationsProps) => {
  const animationType = useMemo(() => getAnimationType(songId), [songId]);

  if (!isPlaying) return null;

  const props = { bass: bassFrequency, mid: midFrequency, high: highFrequency };

  switch (animationType) {
    case 0:
      return <LiquidGlassFlow {...props} />;
    case 1:
      return <BreathingAura {...props} />;
    case 2:
      return <AuroraWaves {...props} />;
    case 3:
      return <DepthPulse {...props} />;
    case 4:
      return <SilkRipple {...props} />;
    case 5:
      return <VinylGlow {...props} />;
    case 6:
      return <PrismRefraction {...props} />;
    case 7:
      return <NebulaCloud {...props} />;
    case 8:
      return <CrystalShimmer {...props} />;
    case 9:
      return <OceanDepth {...props} />;
    case 10:
      return <EmberGlow {...props} />;
    case 11:
      return <FrostCrystal {...props} />;
    case 12:
      return <SolarFlare {...props} />;
    case 13:
      return <SmokeDrift {...props} />;
    case 14:
      return <GalaxySpiral {...props} />;
    case 15:
      return <MoonlightHaze {...props} />;
    case 16:
      return <ThunderPulse {...props} />;
    case 17:
      return <ZenFlow {...props} />;
    default:
      return <LiquidGlassFlow {...props} />;
  }
});

AlbumArtAnimations.displayName = 'AlbumArtAnimations';

export default AlbumArtAnimations;
