import {
    DOM_EVENT_KEYDOWN, KEY_BACKSPACE, KEY_DOWN, KEY_ENTER, KEY_ESCAPE, KEY_LEFT, KEY_RIGHT, KEY_UP,
    NS_STAGES
} from "../const";
import { State } from "../state/state";

export class FormStage {

  /** @type {Form} */
  form = null

  getShape() {
      return this.form.getShape();
  }

  getData() {
      return {};
  }

  /**
   * @param {Function} data
   * @return {Function}
   * @private
   */
  getNextStage(data) {
      return data;
  }

  construct() {
      State.events.on(DOM_EVENT_KEYDOWN, NS_STAGES, this._handleKeys.bind(this));
  }

  destruct() {
      State.events.off(DOM_EVENT_KEYDOWN, NS_STAGES);
      State.shapes.stage = null;
  }

  _handleKeys(ev) {
      if (State.keysBlocked) {
          return;
      }
      switch (ev.keyCode) {
      case KEY_BACKSPACE:
      case KEY_ESCAPE:
          State.flow.previousStage();
          break;
      case KEY_ENTER:
          var next = this.getNextStage(this.form.getData());
          State.flow.switchStage(next);
          break;
      case KEY_UP:
          this.form.selectField(-1);
          State.audio.play('menu');
          State.flow.refreshShapes();
          break;
      case KEY_DOWN:
          this.form.selectField(1);
          State.audio.play('menu');
          State.flow.refreshShapes();
          break;
      case KEY_LEFT:
          this.form.selectOption(-1);
          State.audio.play('menu_alt');
          State.flow.refreshShapes();
          break;
      case KEY_RIGHT:
          this.form.selectOption(1);
          State.audio.play('menu_alt');
          State.flow.refreshShapes();
          break;
      }
  }

}
