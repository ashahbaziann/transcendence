import { useEffect, useRef } from 'react';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
  BALL_RADIUS, PADDLE_WIDTH,
} from './game.constants';

const POWERUP_STYLES = {
  speed_up:   { color: '#EF9F27', glow: 'rgba(239,159,39,0.2)'  },
  slow_down:  { color: '#378ADD', glow: 'rgba(55,138,221,0.2)'  },
  big_paddle: { color: '#D4537E', glow: 'rgba(212,83,126,0.2)'  },
};

function drawLightning(ctx, r) {
  const s = r * 0.55;
  ctx.beginPath();
  ctx.moveTo( s * 0.2,  -s);
  ctx.lineTo(-s * 0.4,   s * 0.1);
  ctx.lineTo( s * 0.05,  s * 0.1);
  ctx.lineTo(-s * 0.2,   s);
  ctx.lineTo( s * 0.4,  -s * 0.1);
  ctx.lineTo( s * 0.0,  -s * 0.1);
  ctx.closePath();
  ctx.fill();
}

function drawSnowflake(ctx, r) {
  const s = r * 0.62;
  ctx.lineWidth = r * 0.18;
  ctx.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle) * s, Math.sin(angle) * s);
    ctx.stroke();
    const bx  = Math.cos(angle) * s * 0.55;
    const by  = Math.sin(angle) * s * 0.55;
    const bl  = s * 0.3;
    for (const da of [Math.PI / 4, -Math.PI / 4]) {
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + Math.cos(angle + da) * bl, by + Math.sin(angle + da) * bl);
      ctx.stroke();
    }
  }
}

function drawDoubleArrow(ctx, r) {
  const s  = r * 0.55;
  const hw = s * 0.45;
  const hs = s * 0.45;
  const sw = s * 0.2;
  ctx.beginPath();
  ctx.moveTo(0, -s); ctx.lineTo(hw, -s+hs); ctx.lineTo(sw, -s+hs);
  ctx.lineTo(sw, 0); ctx.lineTo(-sw, 0); ctx.lineTo(-sw, -s+hs);
  ctx.lineTo(-hw, -s+hs); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, s); ctx.lineTo(hw, s-hs); ctx.lineTo(sw, s-hs);
  ctx.lineTo(sw, 0); ctx.lineTo(-sw, 0); ctx.lineTo(-sw, s-hs);
  ctx.lineTo(-hw, s-hs); ctx.closePath(); ctx.fill();
}

function drawPowerUp(ctx, pu, t) {
  const style = POWERUP_STYLES[pu.type] || POWERUP_STYLES.speed_up;
  const pulse = 1 + 0.06 * Math.sin(t * 0.006 + pu.x);
  const r     = pu.r * pulse;

  ctx.save();
  ctx.translate(pu.x, pu.y);

  const grd = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 2.0);
  grd.addColorStop(0, style.glow);
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(0, 0, r * 2.0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.rotate(t * 0.002);
  ctx.strokeStyle = style.color;
  ctx.lineWidth   = 1.2;
  ctx.globalAlpha = 0.4;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.arc(0, 0, r + 5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  ctx.globalAlpha = 1;
  ctx.fillStyle   = style.color;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  const shine = ctx.createRadialGradient(-r * 0.25, -r * 0.25, 0, 0, 0, r);
  shine.addColorStop(0, 'rgba(255,255,255,0.2)');
  shine.addColorStop(1, 'rgba(0,0,0,0.1)');
  ctx.fillStyle = shine;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle   = '#fff';
  ctx.strokeStyle = '#fff';
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur  = 2;
  if (pu.type === 'speed_up')   drawLightning(ctx, r);
  if (pu.type === 'slow_down')  drawSnowflake(ctx, r);
  if (pu.type === 'big_paddle') drawDoubleArrow(ctx, r);
  ctx.shadowBlur = 0;

  ctx.restore();
}

export default function GameCanvas({
  gameState, powerUps = [], bgColor = '#111111',
  player1Name = 'Player 1', player2Name = 'Player 2',
}) {
  const canvasRef   = useRef(null);
  const stateRef    = useRef(gameState);
  const powerUpsRef = useRef(powerUps);
  const bgRef       = useRef(bgColor);
  const p1Ref       = useRef(player1Name);
  const p2Ref       = useRef(player2Name);
  const frameRef    = useRef(0);

  useEffect(() => { stateRef.current    = gameState;   }, [gameState]);
  useEffect(() => { powerUpsRef.current = powerUps;    }, [powerUps]);
  useEffect(() => { bgRef.current       = bgColor;     }, [bgColor]);
  useEffect(() => { p1Ref.current       = player1Name; }, [player1Name]);
  useEffect(() => { p2Ref.current       = player2Name; }, [player2Name]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    let animId;

    function draw() {
      const state     = stateRef.current;
      const activePUs = powerUpsRef.current;
      const bg        = bgRef.current;
      const t         = frameRef.current++;

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      if (!state) { animId = requestAnimationFrame(draw); return; }

      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth   = 1.5;
      ctx.strokeRect(1, 1, CANVAS_WIDTH - 2, CANVAS_HEIGHT - 2);

      ctx.strokeStyle = 'rgba(255,255,255,0.02)';
      ctx.lineWidth   = 1;
      for (let x = 80; x < CANVAS_WIDTH; x += 80) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); ctx.stroke();
      }
      for (let y = 80; y < CANVAS_HEIGHT; y += 80) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y); ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.setLineDash([10, 14]);
      ctx.lineWidth   = 1.5;
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH / 2, 0);
      ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font         = '500 12px Inter, system-ui, sans-serif';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle    = 'rgba(255,255,255,0.25)';
      ctx.fillText(p1Ref.current, CANVAS_WIDTH / 4,       8);
      ctx.fillText(p2Ref.current, (CANVAS_WIDTH / 4) * 3, 8);

      ctx.font      = '700 38px monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillText(state.left.score,  CANVAS_WIDTH / 4,       26);
      ctx.fillText(state.right.score, (CANVAS_WIDTH / 4) * 3, 26);
      ctx.textBaseline = 'alphabetic';
      ctx.textAlign    = 'start';

      ctx.save();
      ctx.globalAlpha = 0.08;
      const ballGlow = ctx.createRadialGradient(
        state.ball.x, state.ball.y, 0,
        state.ball.x, state.ball.y, BALL_RADIUS * 3
      );
      ballGlow.addColorStop(0, '#ffffff');
      ballGlow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = ballGlow;
      ctx.beginPath();
      ctx.arc(state.ball.x, state.ball.y, BALL_RADIUS * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(state.ball.x, state.ball.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.shadowColor = '#1D9E75';
      ctx.shadowBlur  = 8;
      ctx.fillStyle   = '#1D9E75';
      ctx.beginPath();
      ctx.roundRect(20, state.left.y, PADDLE_WIDTH, state.left.height, 4);
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = '#1D9E75';
      ctx.beginPath();
      ctx.roundRect(20, state.left.y, PADDLE_WIDTH, state.left.height, 4);
      ctx.fill();

      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.shadowColor = '#E24B4A';
      ctx.shadowBlur  = 8;
      ctx.fillStyle   = '#E24B4A';
      ctx.beginPath();
      ctx.roundRect(CANVAS_WIDTH - 20 - PADDLE_WIDTH, state.right.y, PADDLE_WIDTH, state.right.height, 4);
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = '#E24B4A';
      ctx.beginPath();
      ctx.roundRect(CANVAS_WIDTH - 20 - PADDLE_WIDTH, state.right.y, PADDLE_WIDTH, state.right.height, 4);
      ctx.fill();

      activePUs.forEach((pu) => drawPowerUp(ctx, pu, t));

      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      style={{ display: 'block', maxWidth: '100%', borderRadius: 8 }}
    />
  );
}