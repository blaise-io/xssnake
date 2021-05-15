import { Dialog, DialogType } from "../ui/dialog";

export function debugDialog(): void {
    new Dialog("HEADER TITLE", "Body text lol", {
        type: DialogType.CONFIRM,
        cancel: () => {
            console.debug("Cancel");
        },
        ok: () => {
            console.debug("OK");
        },
    });
}
