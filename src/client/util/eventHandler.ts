type RegistryTopic = string;
type RegistryItem = { listener: CallableFunction; context: symbol; domEvent?: string };

const registry: Record<RegistryTopic, RegistryItem[]> = {};
const globalContext = Symbol();

export class EventHandler {
    constructor(private context = Symbol()) {}

    on(topic: RegistryTopic, listener: CallableFunction): void {
        const domEvent = `on${topic}` in document ? topic : undefined;
        if (!registry[topic]) {
            registry[topic] = [];
        }
        registry[topic].push({
            listener,
            domEvent: domEvent,
            context: this.context,
        });
        if (domEvent) {
            document.addEventListener(topic, listener as EventListener);
        }
    }

    private removeFromRegistry(registryItemsArray: RegistryItem[][]) {
        registryItemsArray.forEach((registryItems: RegistryItem[]) => {
            registryItems.forEach((registryItem: RegistryItem, index) => {
                if (this.context === registryItem.context) {
                    const [callbackItem] = registryItems.splice(index, 1);
                    if (callbackItem.domEvent) {
                        document.removeEventListener(
                            callbackItem.domEvent,
                            callbackItem.listener as EventListener,
                        );
                    }
                }
            });
        });
    }

    off(topic: RegistryTopic): void {
        if (topic in registry) {
            this.removeFromRegistry([registry[topic]]);
        }
    }

    destruct(): void {
        this.removeFromRegistry(Object.values(registry));
    }

    trigger(topic: RegistryTopic, ...data: unknown[]): void {
        registry[topic]?.forEach((callbackItem: RegistryItem) => {
            if (
                !callbackItem.domEvent &&
                (this.context === globalContext || this.context === callbackItem.context)
            ) {
                callbackItem.listener(...data);
            }
        });
    }
}

export const globalEventHandler = new EventHandler(globalContext);
