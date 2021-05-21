import * as test from "tape";
import { Shape } from "../../../shared/shape";
import { State } from "../../state";
import { lifetime } from "../../ui/shapeClient";

test("Lifetime effect", async (t) => {
    const shape = new Shape();
    lifetime(shape, 10, 100);

    State.shapes = { x: shape };

    t.strictEquals(shape.flags.enabled, false, "Not enabled yet");
    t.isEquivalent(State.shapes, { x: shape }, "Shape registered");

    shape.effects.lifetime(5);
    t.strictEquals(shape.flags.enabled, false, "Still not enabled yet");
    t.isEquivalent(State.shapes, { x: shape }, "Shape registered");

    shape.effects.lifetime(5);
    t.strictEquals(shape.flags.enabled, true, "Enabled");
    t.isEquivalent(State.shapes, { x: shape }, "Shape registered");

    shape.effects.lifetime(80);
    t.strictEquals(shape.flags.enabled, true, "Still enabled");
    t.isEquivalent(State.shapes, { x: shape }, "Shape registered");

    shape.effects.lifetime(10);
    t.isEquivalent(State.shapes, {}, "Deregisters itself");
});
