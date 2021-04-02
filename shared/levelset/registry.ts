'use strict';

import { randomArrIndex } from "../util";
import { Levelset } from "./levelset";

/**
 * @constructor
 */
export class Registry {
    public levelsets: Levelset[];
    public loaded: boolean;

    constructor() {
        this.levelsets = [];
        this.loaded = false;
    }

    register(levelset: Levelset) {
        this.levelsets.push(levelset);
    }

    preloadLevels(continueFn=() => {}) {
        let checkAllLoaded, loaded = 0;

        checkAllLoaded = function () {
            if (++loaded === this.levelsets.length) {
                this.loaded = true;
                continueFn();
            }
        }.bind(this);

        for (var i = 0, m = this.levelsets.length; i < m; i++) {
            this.levelsets[i].preload(checkAllLoaded);
        }
    }

    getLevelset(index: number): Levelset {
        return this.levelsets[index];
    }

    /**
     * @return {Array.<Array.<number|string>>}
     */
    getAsFieldValues() {
        var values = [];
        for (var i = 0, m = this.levelsets.length; i < m; i++) {
            values.push([i, this.levelsets[i].title.toUpperCase()]);
        }
        return values;
    }

    /**
     * @return {number}
     */
    getRandomLevelsetIndex() {
        return randomArrIndex(this.levelsets);
    }

}
