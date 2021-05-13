type RegistryTopic = string;
type RegistryItem = { listener: CallableFunction; context: number; domEvent: string };

const registry: Record<RegistryTopic, RegistryItem[]> = {};
const globalContext = 0;
let localContext = 1;

export class EventHandler {
    constructor(private context: number = localContext++) {}

    on(id: RegistryTopic, listener: CallableFunction): void {
        const domEvent = `on${id}` in document ? id : "";
        if (!registry[id]) {
            registry[id] = [];
        }
        registry[id].push({
            listener,
            domEvent: domEvent,
            context: this.context,
        });
        if (domEvent) {
            document.addEventListener(id, listener as EventListener);
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

    off(id: RegistryTopic): void {
        if (registry[id]) {
            this.removeFromRegistry([registry[id]]);
        }
    }

    destruct(): void {
        this.removeFromRegistry(Object.values(registry));
    }

    trigger(id: RegistryTopic, ...data: unknown[]): void {
        (registry[id] || []).forEach((callbackItem: RegistryItem) => {
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
