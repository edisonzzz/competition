import { useEffect, useRef } from 'react';

export default function CyberMap() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // 攻击线条数据
    const attacks = [];
    const maxAttacks = 15;

    // 全球主要城市坐标（相对于画布）
    const locations = [
      { x: 0.15, y: 0.3, name: 'New York' },
      { x: 0.25, y: 0.4, name: 'London' },
      { x: 0.5, y: 0.35, name: 'Moscow' },
      { x: 0.65, y: 0.45, name: 'Beijing' },
      { x: 0.75, y: 0.5, name: 'Tokyo' },
      { x: 0.8, y: 0.7, name: 'Sydney' },
      { x: 0.45, y: 0.6, name: 'Dubai' },
      { x: 0.3, y: 0.75, name: 'Cape Town' }
    ];

    function createAttack() {
      const from = locations[Math.floor(Math.random() * locations.length)];
      let to = locations[Math.floor(Math.random() * locations.length)];
      while (to === from) {
        to = locations[Math.floor(Math.random() * locations.length)];
      }

      attacks.push({
        fromX: from.x * canvas.width,
        fromY: from.y * canvas.height,
        toX: to.x * canvas.width,
        toY: to.y * canvas.height,
        progress: 0,
        speed: 0.003 + Math.random() * 0.005,
        color: Math.random() > 0.5 ? '#ef4444' : '#3b82f6', // red for attack, blue for defense
        width: 2 + Math.random() * 2
      });
    }

    function drawMap() {
      // 清空画布
      ctx.fillStyle = 'rgba(10, 14, 39, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 绘制网格
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // 绘制城市节点
      locations.forEach(loc => {
        const x = loc.x * canvas.width;
        const y = loc.y * canvas.height;

        // 脉冲圈
        ctx.beginPath();
        ctx.arc(x, y, 8 + Math.sin(Date.now() * 0.003) * 3, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 节点
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#06b6d4';
        ctx.fill();

        // 节点光晕
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 15);
        gradient.addColorStop(0, 'rgba(6, 182, 212, 0.8)');
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - 15, y - 15, 30, 30);
      });

      // 绘制攻击线条
      attacks.forEach((attack, index) => {
        attack.progress += attack.speed;

        if (attack.progress >= 1) {
          attacks.splice(index, 1);
          return;
        }

        const currentX = attack.fromX + (attack.toX - attack.fromX) * attack.progress;
        const currentY = attack.fromY + (attack.toY - attack.fromY) * attack.progress;

        // 绘制轨迹
        const gradient = ctx.createLinearGradient(attack.fromX, attack.fromY, currentX, currentY);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.5, attack.color);
        gradient.addColorStop(1, attack.color + 'cc');

        ctx.beginPath();
        ctx.moveTo(attack.fromX, attack.fromY);
        ctx.lineTo(currentX, currentY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = attack.width;
        ctx.stroke();

        // 绘制头部光点
        ctx.beginPath();
        ctx.arc(currentX, currentY, 4, 0, Math.PI * 2);
        ctx.fillStyle = attack.color;
        ctx.fill();

        // 光晕效果
        const glowGradient = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, 10);
        glowGradient.addColorStop(0, attack.color + 'aa');
        glowGradient.addColorStop(1, attack.color + '00');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(currentX - 10, currentY - 10, 20, 20);
      });
    }

    // 添加新攻击
    const attackInterval = setInterval(() => {
      if (attacks.length < maxAttacks) {
        createAttack();
      }
    }, 500);

    // 动画循环
    const animate = () => {
      drawMap();
      requestAnimationFrame(animate);
    };

    animate();

    // 响应式调整
    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(attackInterval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="card relative overflow-hidden h-[400px]">
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-lg font-semibold text-gray-100 mb-1">Live Cyber Threat Map</h3>
        <p className="text-sm text-gray-400">Real-time attack and defense visualization</p>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ background: 'transparent' }}
      />
      <div className="absolute bottom-4 right-4 flex gap-4 text-xs z-10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-gray-400">Attack</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-gray-400">Defense</span>
        </div>
      </div>
    </div>
  );
}
