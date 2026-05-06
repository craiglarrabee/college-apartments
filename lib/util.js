export const hashStringAndCode = (str, code) => {
    const combined = str + code;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    // Ensure the hash is positive and get the last 6 digits
    const newCode = Math.abs(hash % 1000000).toString().padStart(6, '0');
    return newCode;
}

export const getSemesterFromDate = (date = new Date()) => {
    const month = date.getMonth() + 1; // 1-12
    const day = date.getDate();
    const year = date.getFullYear();

    // Spring: Jan 1 to May 10
    if ((month < 5) || (month === 5 && day <= 10)) {
        return `Spring ${year}`;
    }
    // Summer: May 11 to Aug 15
    if ((month > 5 || (month === 5 && day >= 11)) && (month < 8 || (month === 8 && day <= 15))) {
        return `Summer ${year}`;
    }
    // Fall: Aug 16 to Dec 31
    if ((month > 8 || (month === 8 && day >= 16))) {
        return `Fall ${year}`;
    }

    return `${year}`; // Fallback
};

export const getEstimatedSemesters = (date = new Date()) => {
    const month = date.getMonth() + 1; // 1-12
    const day = date.getDate();
    const year = date.getFullYear();

    // If we are close to the end of a semester (last 14 days), offer the next one too
    const current = getSemesterFromDate(date);
    const results = [current];

    // Spring ends May 10. If May 1 - May 10, offer Summer.
    if (month === 5 && day >= 1 && day <= 10) {
        results.push(`Summer ${year}`);
    }
    // Summer ends Aug 15. If Aug 1 - Aug 15, offer Fall.
    else if (month === 8 && day >= 1 && day <= 15) {
        results.push(`Fall ${year}`);
    }
    // Fall ends Dec 31. If Dec 15 - Dec 31, offer Spring of next year.
    else if (month === 12 && day >= 15) {
        results.push(`Spring ${year + 1}`);
    }

    return results;
};