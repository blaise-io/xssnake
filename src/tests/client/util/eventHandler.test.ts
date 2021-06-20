import * as test from "tape";
import { EventHandler } from "../../../client/util/eventHandler";

const FILE = __filename.split("/src/")[1] + ":";

test(`${FILE} adding and removing`, (t) => {
    const eventHandler = new EventHandler();
    const eventData = [];

    eventHandler.on("event", (...data) => {
        eventData.push(data);
    });

    eventHandler.trigger("event", 1, { e1: true });
    eventHandler.trigger("event", 2, { e2: true });
    eventHandler.trigger("other", "ignore me");
    eventHandler.off("event");
    eventHandler.trigger("event", 3, { e3: true });

    const expectedCalls = [
        [1, { e1: true }],
        [2, { e2: true }],
    ];

    t.isEquivalent(eventData, expectedCalls, "Called twice with expected data");
    t.end();

    eventHandler.destruct();
});

test(`${FILE} once`, (t) => {
    const eventHandler = new EventHandler();
    const eventData = [];

    eventHandler.once("event", (...data) => {
        eventData.push(data);
    });

    eventHandler.trigger("event", "data1");
    eventHandler.trigger("event", "data2");

    t.isEquivalent(eventData, [["data1"]], "Called once with expected data");
    t.end();

    eventHandler.destruct();
});

test(`${FILE} destruct`, (t) => {
    const eventHandler1 = new EventHandler();
    const eventHandler2 = new EventHandler();
    const eventData1 = [];
    const eventData2 = [];

    eventHandler1.on("event1", (...data) => {
        eventData1.push(data);
    });
    eventHandler1.on("event2", (...data) => {
        eventData1.push(data);
    });
    eventHandler2.on("event1", (...data) => {
        eventData2.push(data);
    });

    eventHandler1.trigger("event1", "data1");
    eventHandler1.trigger("event2", "data2");

    eventHandler2.trigger("event1", "data1");

    eventHandler1.destruct();
    eventHandler1.trigger("event1", "data1");
    eventHandler1.trigger("event2", "data2");

    eventHandler2.trigger("event1", "data2");

    t.isEquivalent(eventData1, [["data1"], ["data2"]], "Called twice then destructed");
    t.isEquivalent(eventData2, [["data1"], ["data2"]], "Other handler not destructed");
    t.end();

    eventHandler1.destruct();
    eventHandler2.destruct();
});

test(`${FILE} handle context`, (t) => {
    const eventHandler1 = new EventHandler();
    const eventHandler2 = new EventHandler();
    const eventData1 = [];
    const eventData2 = [];

    eventHandler1.on("event", (...data) => {
        eventData1.push(data);
    });
    eventHandler2.on("event", (...data) => {
        eventData2.push(data);
    });

    eventHandler1.trigger("event", "data");

    t.isEquivalent(eventData1, [["data"]], "Event handler 1 called");
    t.isEquivalent(eventData2, [], "Event handler 2 not called");
    t.end();

    eventHandler1.destruct();
    eventHandler2.destruct();
});
