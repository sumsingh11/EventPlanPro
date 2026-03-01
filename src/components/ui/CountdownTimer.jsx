import React, { useState, useEffect } from 'react';
import { FiClock } from 'react-icons/fi';

/**
 * Displays a live countdown to an event given date + time strings.
 * variant="full"    → large block with days/hours/min/sec boxes (EventDetail)
 * variant="compact" → single-line badge (Dashboard cards)
 */
const CountdownTimer = ({ date, time, variant = 'full', color = null }) => {
    const [timeLeft, setTimeLeft] = useState(null);

    const computeTimeLeft = () => {
        if (!date) return null;
        const target = new Date(`${date}T${time || '00:00'}`);
        const diff = target - new Date();
        if (diff <= 0) return { passed: true };
        return {
            passed: false,
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((diff % (1000 * 60)) / 1000),
        };
    };

    useEffect(() => {
        setTimeLeft(computeTimeLeft());
        const id = setInterval(() => setTimeLeft(computeTimeLeft()), 1000);
        return () => clearInterval(id);
    }, [date, time]);

    if (!timeLeft) return null;

    if (variant === 'compact') {
        if (timeLeft.passed) {
            return (
                <span className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                    <FiClock size={12} /> Event passed
                </span>
            );
        }
        const label = timeLeft.days > 0
            ? `${timeLeft.days}d ${timeLeft.hours}h left`
            : `${timeLeft.hours}h ${timeLeft.minutes}m left`;
        const color = timeLeft.days === 0
            ? 'text-red-500 dark:text-red-400'
            : timeLeft.days <= 3
                ? 'text-orange-500 dark:text-orange-400'
                : 'text-blue-500 dark:text-blue-400';
        return (
            <span className={`inline-flex items-center gap-1 text-xs font-medium ${color}`}>
                <FiClock size={12} /> {label}
            </span>
        );
    }

    // Full variant
    if (timeLeft.passed) {
        return (
            <div className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-500 dark:text-gray-400">
                <FiClock size={16} />
                <span className="font-medium">This event has already passed.</span>
            </div>
        );
    }

    const urgency = timeLeft.days === 0
        ? 'from-red-500 to-rose-600'
        : timeLeft.days <= 3
            ? 'from-orange-400 to-amber-500'
            : 'from-blue-500 to-indigo-600';

    const units = [
        { label: 'Days', value: timeLeft.days },
        { label: 'Hours', value: timeLeft.hours },
        { label: 'Minutes', value: timeLeft.minutes },
        { label: 'Seconds', value: timeLeft.seconds },
    ];

    // If a custom event colour is given, use it directly; otherwise fall back to urgency gradient
    const boxStyle = color
        ? { background: `linear-gradient(135deg, ${color}cc, ${color})` }
        : null;
    const boxClass = color
        ? 'flex flex-col items-center justify-center py-3 rounded-xl text-white shadow'
        : `flex flex-col items-center justify-center py-3 rounded-xl bg-gradient-to-br ${urgency} text-white shadow`;

    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                <FiClock size={16} style={color ? { color } : undefined} className={color ? '' : 'text-blue-500'} />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Event Countdown</span>
            </div>
            <div className="grid grid-cols-4 gap-3">
                {units.map(({ label, value }) => (
                    <div
                        key={label}
                        className={boxClass}
                        style={boxStyle || undefined}
                    >
                        <span className="text-2xl font-bold tabular-nums leading-none">
                            {String(value).padStart(2, '0')}
                        </span>
                        <span className="text-[10px] uppercase tracking-widest mt-1 opacity-80">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CountdownTimer;
