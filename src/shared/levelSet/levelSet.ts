import { LevelConstructor } from "../level/types";

export class LevelSet extends Array<LevelConstructor> {
    constructor(public title: string, ...levels: LevelConstructor[]) {
        super(); // new Array();
        this.push(...levels);
    }
}
