import { HASH } from "../const";

/* #key:val;key2:other to {key: "val", key2: "other"} */
export function hashGetAll(): Record<string, string> {
    const split = location.hash.split(/[#;]/g).filter((v) => v);
    return split.reduce((previous, addValue) => {
        const [key, value] = addValue.split(":");
        return Object.assign(previous, key && value ? { [key]: value } : {});
    }, {});
}

export function getHash(key: HASH): string {
    return hashGetAll()[key] || "";
}

export function setHash(key: HASH, value: string): void {
    const record = hashGetAll();
    record[key] = value;
    const hash = Object.entries(record).map(([k, v]) => `${k}:${v}`);
    location.replace(`#${hash.join(";")}`);
}

export function clearHash(): void {
    history.replaceState(null, "", location.pathname + location.search);
}
