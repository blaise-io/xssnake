export function randomRange(min: number, max: number): number {
    return min + Math.floor(Math.random() * (max - min + 1));
}

export function getRandomItemFrom<Type>(arr: Type[]): Type {
    return arr[randomArrIndex(arr)];
}

export function randomArrIndex(arr: unknown[]): number {
    return randomRange(0, arr.length - 1);
}

export function randomStr(len = 3): string {
    return Math.random().toString(36).substr(2, len);
}

/**
 * Ensure an index is within bounds of given array.
 * Indexes cycle, after last comes first, before first comes last.
 */
export function indexCarousel(index: number, len: number): number {
    if (index >= len) {
        return 0;
    } else if (index < 0) {
        return len - 1;
    }
    return index;
}

export function average(numbers: number[]): number {
    let total = 0;
    const m = numbers.length;
    for (let i = 0; i < m; i++) {
        total += numbers[i];
    }
    return m ? total / m : 0;
}

/**
 * Delta between two coordinates.
 */
export function delta(a: Coordinate, b: Coordinate): number {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

/**
 * Check whether two coordinates are the same.
 */
export function eq(a: Coordinate, b: Coordinate): boolean {
    return a[0] === b[0] && a[1] === b[1];
}

/**
 * Faster sorting function.
 * http://jsperf.com/javascript-sort/
 */
export function sort(arr: number[]): number[] {
    for (let i = 1; i < arr.length; i++) {
        const tmp = arr[i];
        let index = i;
        while (arr[index - 1] > tmp) {
            arr[index] = arr[index - 1];
            --index;
        }
        arr[index] = tmp;
    }
    return arr;
}

export function benchmark(iterations: number, fn: () => void, label = ""): void {
    let i = iterations;
    const start = +new Date();
    while (i--) {
        fn();
    }
    const duration = +new Date() - start;
    console.log(label || "Benchmark", {
        x: iterations,
        avg: duration / iterations,
        total: duration,
    });
}

export function getRandomName(): string {
    return (
        getRandomItemFrom([
            "Ant",
            "Bat",
            "Bear",
            "Bird",
            "Cat",
            "Cow",
            "Crab",
            "Croc",
            "Deer",
            "Dodo",
            "Dog",
            "Duck",
            "Emu",
            "Fish",
            "Fly",
            "Fox",
            "Frog",
            "Goat",
            "Hare",
            "Ibis",
            "Kiwi",
            "Lion",
            "Lynx",
            "Miao",
            "Mole",
            "Moth",
            "Mule",
            "Oger",
            "Pig",
            "Pika",
            "Poke",
            "Puma",
            "Puss",
            "Rat",
            "Seal",
            "Snek",
            "Swan",
            "Wasp",
            "Wolf",
            "Yak",
            "Zeb",
        ]) + `.${randomRange(10, 99)}`
    );
}

/**
 * Placeholder for i18n.
 */
export function _(str: string): string {
    return str;
}

/**
 * No operation fn.
 */
export const noop = (): void => {};
