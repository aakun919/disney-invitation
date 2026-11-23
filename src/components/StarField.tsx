import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  amp: number;
  speed: number;
  phase: number;
  drift: number;
  gold: boolean;
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * 背景の星屑。微細な光点と控えめなきらめきを Canvas で描く。
 * - 操作対象ではない（pointer-events: none）
 * - prefers-reduced-motion: reduce では静止画1枚のみ
 * - タブ非表示中は描画を停止し、不要な再描画を防ぐ
 */
export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let stars: Star[] = [];
    let meteors: Meteor[] = [];
    let raf = 0;
    let disposed = false;
    let width = 0;
    let height = 0;
    let nextMeteorAt = performance.now() + rand(5000, 9000);

    const buildStars = () => {
      const count = Math.min(170, Math.round((width * height) / 9000));
      stars = Array.from({ length: count }, () => {
        const gold = Math.random() < 0.28;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          r: rand(0.4, 1.4),
          baseAlpha: rand(0.18, 0.55),
          amp: rand(0.08, 0.28),
          speed: rand(0.0006, 0.0022),
          phase: Math.random() * Math.PI * 2,
          drift: rand(0.008, 0.03),
          gold,
        };
      });
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildStars();
    };

    const spawnMeteor = () => {
      const fromLeft = Math.random() < 0.5;
      meteors.push({
        x: fromLeft ? rand(0, width * 0.4) : rand(width * 0.6, width),
        y: rand(0, height * 0.3),
        vx: (fromLeft ? 1 : -1) * rand(1.4, 2.4),
        vy: rand(0.9, 1.6),
        life: 0,
        maxLife: rand(45, 70),
      });
    };

    const drawFrame = (now: number, animate: boolean) => {
      ctx.clearRect(0, 0, width, height);
      for (const s of stars) {
        let alpha = s.baseAlpha;
        if (animate) {
          alpha += s.amp * Math.sin(now * s.speed + s.phase);
          s.y += s.drift;
          if (s.y > height + 4) s.y = -4;
        }
        ctx.globalAlpha = Math.max(0.04, alpha);
        ctx.fillStyle = s.gold ? "#e8d5a8" : "#f5f0e6";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (animate) {
        if (now > nextMeteorAt) {
          spawnMeteor();
          nextMeteorAt = now + rand(8000, 16000);
        }
        meteors = meteors.filter((m) => m.life < m.maxLife);
        for (const m of meteors) {
          m.life += 1;
          m.x += m.vx;
          m.y += m.vy;
          const fade = 1 - m.life / m.maxLife;
          const tail = 12;
          const grad = ctx.createLinearGradient(
            m.x,
            m.y,
            m.x - m.vx * tail,
            m.y - m.vy * tail,
          );
          grad.addColorStop(0, `rgba(232, 213, 168, ${0.45 * fade})`);
          grad.addColorStop(1, "rgba(232, 213, 168, 0)");
          ctx.globalAlpha = 1;
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(m.x - m.vx * tail, m.y - m.vy * tail);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      if (disposed) return;
      drawFrame(now, true);
      raf = requestAnimationFrame(loop);
    };

    /* reduced-motion の状態に合わせて描画モードを切り替える */
    const syncMotion = () => {
      cancelAnimationFrame(raf);
      if (motionQuery.matches) {
        drawFrame(0, false); // 静止画のみ
      } else {
        raf = requestAnimationFrame(loop);
      }
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        syncMotion();
      }
    };

    const onResize = () => {
      resize();
      if (motionQuery.matches) drawFrame(0, false);
    };

    resize();
    syncMotion();

    window.addEventListener("resize", onResize);
    motionQuery.addEventListener("change", syncMotion);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      motionQuery.removeEventListener("change", syncMotion);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="starfield" aria-hidden="true" />;
}
