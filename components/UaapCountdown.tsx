"use client";

import { useEffect, useState } from "react";

interface Props {
    uaapDate: string | null;
    eventName?: string;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
}

function calcTimeLeft(target: Date): TimeLeft {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: diff };
    return {
        total: diff,
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
    };
}

export default function UaapCountdown({ uaapDate, eventName = "UAAP" }: Props) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

    useEffect(() => {
        if (!uaapDate) return;
        const target = new Date(uaapDate);
        setTimeLeft(calcTimeLeft(target));

        const interval = setInterval(() => {
            const t = calcTimeLeft(target);
            setTimeLeft(t);
            if (t.total <= 0) clearInterval(interval);
        }, 1000);

        return () => clearInterval(interval);
    }, [uaapDate]);

    if (!uaapDate) return null;

    const targetDate = new Date(uaapDate);
    const formattedDate = targetDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    // Still loading (hydration)
    if (timeLeft === null) return null;

    const isOver = timeLeft.total <= 0;

    return (
        <div className={`countdown-banner${isOver ? " countdown-banner--over" : ""}`}>
            <div className="countdown-header">
                <span className="countdown-trophy">🏆</span>
                <div>
                    <div className="countdown-label">{isOver ? `${eventName} is Here!` : `Countdown to ${eventName}`}</div>
                    <div className="countdown-date">{formattedDate}</div>
                </div>
            </div>

            {isOver ? (
                <div className="countdown-over-msg">
                    🎉 The {eventName} event has started — good luck, Eagles! 🦅
                </div>
            ) : (
                <div className="countdown-units">
                    {[
                        { value: timeLeft.days, label: "Days" },
                        { value: timeLeft.hours, label: "Hours" },
                        { value: timeLeft.minutes, label: "Minutes" },
                        { value: timeLeft.seconds, label: "Seconds" },
                    ].map(({ value, label }) => (
                        <div key={label} className="countdown-unit">
                            <div className="countdown-unit-value">
                                {String(value).padStart(2, "0")}
                            </div>
                            <div className="countdown-unit-label">{label}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
