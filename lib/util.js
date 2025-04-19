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