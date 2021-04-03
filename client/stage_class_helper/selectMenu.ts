import { HEIGHT } from "../../shared/const";
import { Shape } from "../../shared/shape";
import { MENU_LEFT, MENU_TITLE_HEIGHT, MENU_TOP, MENU_WRAP } from "../const";
import { fontHeight, fontPixels, LINE_HEIGHT, LINE_HEIGHT_MENU } from "../ui/font";
import { zoom } from "../ui/transformClient";

export class SelectMenu {
  private _selected: number;
  private _options: any[];

  constructor(public header: string, public footer: string = "") {
      this.header = header || "";
      this.footer = footer || "";
      this._selected = 0;
      this._options = [];
  }

  addOption(value: any, next: any, title: string, description = "", callback = () => {}) {
      this._options.push({
          value: value,
          next: next,
          title: title.toUpperCase(),
          description: description,
          callback: callback
      });
  }

  /**
   * @return {number}
   */
  prev() {
      return this.select(this._selected - 1);
  }

  /**
   * @return {number}
   */
  next() {
      return this.select(this._selected + 1);
  }

  /**
   * @param {number} select
   * @return {number}
   */
  select(select) {
      const max = this._options.length - 1;

      if (typeof select !== "number") {
          select = 0;
      }
      if (select < 0) {
          select = max;
      } else if (select > max) {
          select = 0;
      }

      this._selected = select;
      this.getSelectedOption().callback(this._selected);
      return select;
  }

  /**
   * @return {Object}
   */
  getSelectedOption() {
      return this._options[this._selected];
  }

  /**
   * @return {Function}
   */
  getNextStage() {
      return this.getSelectedOption().next;
  }

  /**
   * @return {Shape}
   */
  getShape() {
      let x; let y; let header; let headerPixels; let shape; let desc;

      x = MENU_LEFT;
      y = MENU_TOP;

      // Header
      header = this.header;
      headerPixels = fontPixels(header);
      headerPixels = zoom(2, headerPixels, x, y);
      shape = new Shape(headerPixels);
      y += MENU_TITLE_HEIGHT;

      // Footer
      shape.add(fontPixels(
          this.footer, x, HEIGHT - 3 - fontHeight(this.footer)
      ));

      // Draw options
      for (let i = 0, m = this._options.length; i < m; i++) {
          var title; const active = (this._selected === i);
          title = this._options[i].title;
          shape.add(fontPixels(title, x, y, {invert: active}));
          y += LINE_HEIGHT_MENU;
      }

      // Help text line(s)
      if (this._options.length) {
          desc = this.getSelectedOption().description;
          y += LINE_HEIGHT;
          shape.add(fontPixels(desc, x, y, {wrap: MENU_WRAP}));
      }

      return shape;
  }

}
