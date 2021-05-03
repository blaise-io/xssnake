export function isStrOfLen(data: unknown, len: number): boolean {
    return typeof data === "string" && data.length === len;
}

export function isArrayOfLen(data: unknown, len: number): boolean {
    return data instanceof Array && data.length === len;
}

/**
 * @deprecated
 * Sanitizer / Sanitize user input.
 * @param {?=} value
 * @constructor
 */
export class Sanitizer {
    private _value: any;
    private _json: any;
    private _valid: boolean;

    constructor(value: unknown) {
        this._value = value;
        this._valid = true;
    }

    /**
     * @param {string} type
     * @return {Sanitizer}
     */
    assertType(type) {
        if (typeof this._value !== type) {
            this._log("assertType", this._value, type);
            this._valid = false;
        }
        return this;
    }

    /**
     * @return {Sanitizer}
     */
    assertArray() {
        if (!(this._value instanceof Array)) {
            this._log("assertArray", this._value);
            this._valid = false;
        }
        return this;
    }

    /**
     * @return {Sanitizer}
     */
    assertJSON() {
        if (this._valid) {
            // Don't parse if already invalid
            try {
                this._json = JSON.parse(this._value);
            } catch (err) {
                this._log("assertJSON", this._value);
                this._valid = false;
            }
        }
        return this;
    }

    /**
     * @param {Array} arr
     * @return {Sanitizer}
     */
    assertInArray(arr) {
        if (-1 === arr.indexOf(this._value)) {
            this._log("assertInArray", this._value, arr);
            this._valid = false;
        }
        return this;
    }

    assertBetween(min: number, max: number): Sanitizer {
        if (typeof this._value !== "number") {
            this._log("assertRange type", this._value);
            this._valid = false;
        } else if (this._value < min || this._value > max) {
            this._log("assertRange range", this._value, min, max);
            this._valid = false;
        }
        return this;
    }

    /**
     *
     * @return {Sanitizer}
     */
    assertIntAsBoolean() {
        return this.assertBetween(0, 1);
    }

    assertStringOfLength(min: number, max?: number): Sanitizer {
        max = typeof max === "undefined" ? min : max;
        if (typeof this._value !== "string") {
            this._log("assertStringOfLength type", this._value);
            this._valid = false;
        } else if (!this._assertLength(min, max)) {
            this._log("assertStringOfLength length", this._value, min, max);
            this._valid = false;
        }
        return this;
    }

    /**
     * @param {number} min
     * @param {number} max
     * @return {Sanitizer}
     */
    assertArrayLengthBetween(min, max): Sanitizer {
        if (!(this._value instanceof Array)) {
            this._log("assertArrayOfLength type", this._value);
            this._valid = false;
        } else if (!this._assertLength(min, max)) {
            this._log("assertArrayOfLength length", this._value, min, max);
            this._valid = false;
        }
        return this;
    }

    _assertLength(min: number, max: number): boolean {
        return this._value.length >= min && this._value.length <= max;
    }

    valid(): boolean {
        return this._valid;
    }

    getValueOr<Type>(def?: Type): unknown | Type {
        return this._valid ? this._value : def;
    }

    /**
     * @param {*=} def
     * @return {?}
     */
    json(def) {
        return this._valid ? this._json : def;
    }

    private _log(message: string, value: unknown, ...varArgs: unknown[]): void {
        console.warn("Validation Error", message, JSON.stringify(value), varArgs);
    }
}
