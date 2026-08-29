import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function CompetitionTimer() {
  const [timeLeft, setTimeLeft] = useState(null);
  const [status, setStatus] = useState('loading'); // loading, active, ended, not-started

  // 设置比赛时间（可以从API获取，这里先写死）
  const competitionEndTime = new Date('2026-12-31T23:59:59').getTime();
  const competitionStartTime = new Date('2026-01-01T00:00:00').getTime();

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();

      if (now < competitionStartTime) {
        setStatus('not-started');
        setTimeLeft(competitionStartTime - now);
      } else if (now > competitionEndTime) {
        setStatus('ended');
        setTimeLeft(0);
      } else {
        setStatus('active');
        setTimeLeft(competitionEndTime - now);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms) => {
    if (!ms) return '00:00:00';

    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    if (days > 0) {
      return `${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (status === 'loading') {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
      status === 'active' ? 'bg-green-50 text-green-700' :
      status === 'ended' ? 'bg-red-50 text-red-700' :
      'bg-yellow-50 text-yellow-700'
    }`}>
      <Clock className="w-4 h-4" />
      <div className="text-sm font-medium">
        {status === 'active' && (
          <>
            <span className="hidden sm:inline">Time Remaining: </span>
            <span className="font-mono">{formatTime(timeLeft)}</span>
          </>
        )}
        {status === 'ended' && 'Competition Ended'}
        {status === 'not-started' && (
          <>
            <span className="hidden sm:inline">Starts in: </span>
            <span className="font-mono">{formatTime(timeLeft)}</span>
          </>
        )}
      </div>
    </div>
  );
}
