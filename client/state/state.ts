export class State {
    private static _shapes: any; // TODO: {str: Shape}

    public static get shapes() {
        if (!State._shapes) {
            console.log("Create!");
            State._shapes = [];
        } else {
            console.log("Get existing?");
        }
        return State._shapes;
    }
}
