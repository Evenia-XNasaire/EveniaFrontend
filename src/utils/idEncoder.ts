const OFFSET = 87531;

export const encodeId = (id: number | string): string => {
    if (!id) return '';
    const num = Number(id);
    if (isNaN(num)) return String(id);
    return 'EV' + (num * 3 + OFFSET).toString(36).toUpperCase();
};

export const decodeId = (encoded: string): string => {
    if (!encoded) return '';
    if (!encoded.startsWith('EV')) return encoded;
    const str = encoded.substring(2);
    const num = parseInt(str, 36);
    if (isNaN(num)) return encoded;
    return String((num - OFFSET) / 3);
};
