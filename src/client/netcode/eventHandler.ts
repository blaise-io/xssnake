import { Message } from "../../shared/room/types";

type Topic = string;
type Messages = Message[] | unknown[];
type Callback = CallableFunction;
type CallBackWithContext = [Callback, context];
type context = number;

const topics: Record<Topic, CallBackWithContext[]> = {};

const contextGlobal = 0;
let contextPointer = 1;

export class EventHandler {
    constructor(private context: context = contextPointer++) {}

    on(id: Topic, fn: Callback): void {
        const callbackWithContext: CallBackWithContext = [fn, this.context];
        if (!topics[id]) {
            topics[id] = [callbackWithContext];
        } else {
            topics[id].push(callbackWithContext);
        }
    }

    off(id?: Topic): void {
        const topicsArray: CallBackWithContext[][] = id
            ? [topics[id]] || []
            : Object.values(topics) || [];
        topicsArray.forEach((topic: CallBackWithContext[]) => {
            topic.forEach((callbackWithContext, index, topicWorkingCopy) => {
                if (this.context === callbackWithContext[1]) {
                    topicWorkingCopy.splice(index, 1);
                }
            });
        });
    }

    document = {
        on: this.onDom,
        off: this.offDom,
    };

    private onDom(event: keyof DocumentEventMap, fn: Callback) {
        document.addEventListener(event, fn as EventListener);
        this.on(event, fn);
    }

    private offDom(event: keyof DocumentEventMap) {
        const nativeEvents: EventListener[] = [];
        topics[event].forEach((fn: CallBackWithContext) => {
            if (this.context === fn[1]) {
                nativeEvents.push(fn[0] as EventListener);
            }
        });
        nativeEvents.forEach((handler) => {
            document.removeEventListener(event, handler);
        });
        this.off(event);
    }

    destruct(): void {
        this.off();
    }

    trigger(id: Topic, ...messages: Messages): void {
        (topics[id] || []).forEach((l) => {
            if (this.context === contextGlobal || this.context === l[1]) {
                l[0](...messages);
            }
        });
    }
}

export const globalEventHandler = new EventHandler(0);
