const MANILA_TIME_ZONE = "Asia/Manila";

function manilaParts(date: Date) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: MANILA_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        weekday: "short",
    }).formatToParts(date);
    const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value || "";
    return { year: value("year"), month: value("month"), day: value("day"), weekday: value("weekday") };
}

export function getScheduledTrainingDay(now = new Date()) {
    const current = manilaParts(now);
    const currentKey = `${current.year}-${current.month}-${current.day}`;
    const currentDate = new Date(`${currentKey}T12:00:00+08:00`);
    if (current.weekday === "Sun") currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    const scheduled = manilaParts(currentDate);
    const dateKey = `${scheduled.year}-${scheduled.month}-${scheduled.day}`;
    return {
        dateKey,
        date: new Date(`${dateKey}T12:00:00+08:00`),
        start: new Date(`${dateKey}T00:00:00+08:00`),
        end: new Date(`${dateKey}T23:59:59.999+08:00`),
    };
}

export function trainingCancellationKey(dateKey: string) {
    return `training_cancelled:${dateKey}`;
}
