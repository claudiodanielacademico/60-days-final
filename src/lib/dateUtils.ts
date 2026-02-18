/**
 * Utility functions for date handling and seasonal rotation
 */

/**
 * Gets the day of the year (1-366)
 */
export const getDayOfYear = (date: Date = new Date()): number => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
};

/**
 * Gets the adjusted day of year for content rotation (1-365)
 * Handles Leap Year (Feb 29) by syncing it with Feb 28
 */
export const getContentVersionIndex = (date: Date = new Date()): number => {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-indexed
    const day = date.getDate();

    // Leap Year handling: If Feb 29, treat as Feb 28 (Day 59)
    if (month === 1 && day === 29) {
        return 59;
    }

    const doy = getDayOfYear(date);

    // If it's after Feb 29 in a leap year, subtract 1 to stay in 1-365 mapping
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    if (isLeap && doy > 60) {
        return doy - 1;
    }

    return Math.min(doy, 365);
};

/**
 * Normalizes a date to local midnight
 */
export const getLocalMidnight = (date: Date = new Date()): Date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};
