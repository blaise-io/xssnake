// Debug URL: client.html?debug=dialog
import { Dialog } from "../ui/dialog";

if (location.search.match(/debug=dialog/)) {
    window.setTimeout(function() {
        new Dialog(
            'HEADER TITLE',
            'Body text lol', {
            type: Dialog.TYPE.ALERT
        });
    }, 500);
}
