export function isStrOfLen(data: unknown, length: number): boolean {
    return typeof data === "string" && data.length === length;
}

export function isStrOfMaxLen(data: unknown, maxlength: number): boolean {
    return typeof data === "string" && data.length <= maxlength;
}

export function isArrayOfLen(data: unknown, len: number): boolean {
    return data instanceof Array && data.length === len;
}
