/**
 * @extends {ShapeGenerator}
 * @constructor
 */
ClientShapeGenerator = function() {
    ShapeGenerator.call(this);
};

extend(ClientShapeGenerator.prototype, ShapeGenerator.prototype);
extend(ClientShapeGenerator.prototype, /** @lends {ShapeGenerator.prototype} */ {

    /**
     * @param {string} text
     * @param {number} x
     * @param {number} y
     * @param {number} direction
     * @return {Shape}
     */
    tooltip(text, x, y, direction) {
        var width, shape, hw, line = line.bind(shapegen);

        width = fontWidth(text);

        switch (direction) {
            case 0:
                shape = font(text, x - width - 6, y - 4);
                // Left
                shape.add(line(x - width - 9, y - 5, x - width - 9, y + 3));
                // Top
                shape.add(line(x - width - 8, y - 6, x - 6, y - 6));
                // Bottoms
                shape.add(line(x - width - 9, y + 4, x - 5, y + 4));
                shape.add(line(x - width - 8, y + 5, x - 6, y + 5));
                // Top 1px
                shape.add(line(x - 5, y - 5, x - 5, y - 5));
                // Pointer
                shape.add(line(x - 5, y - 4, x - 2, y - 1));
                shape.add(line(x - 5, y + 2, x - 2, y - 1));
                shape.add(line(x - 5, y + 3, x - 2, y));
                break;
            case 1:
                hw = Math.ceil(width / 2);
                shape = font(text, x - hw, y - 13);
                // Top
                shape.add(line(x - hw - 2, y - 15, x + hw + 1, y - 15));
                // Left
                shape.add(line(x - hw - 3, y - 5, x - hw - 3, y - 14));
                // Bottoms
                shape.add(line(x + -hw - 2, y - 4, x + hw + 1, y - 4));
                shape.add(line(x + -hw - 2, y - 5, x + hw + 1, y - 5));
                // Right
                shape.add(line(x + hw + 2, y - 5, x + hw + 2, y - 14));
                // Pointer
                shape.add(line(x - 1, y - 1, x - 4, y - 4));
                shape.add(line(x - 1, y - 2, x - 4, y - 5));
                shape.add(line(x, y - 1, x + 3, y - 4));
                shape.add(line(x, y - 2, x + 3, y - 5));
                shape.remove(line(x - 3, y - 4, x + 3, y - 4));
                shape.remove(line(x - 3, y - 5, x + 3, y - 5));
                break;
            case 2:
                shape = font(text, x + 8, y - 4);
                // Right
                shape.add(line(x + width + 9, y - 5, x + width + 9, y + 3));
                // Top
                shape.add(line(x + width + 8, y - 6, x + 6, y - 6));
                // Bottom
                shape.add(line(x + width + 9, y + 4, x + 5, y + 4));
                shape.add(line(x + width + 8, y + 5, x + 6, y + 5));
                // Top 1px
                shape.add(line(x + 5, y - 5, x + 5, y - 5));
                // Pointer
                shape.add(line(x + 5, y - 4, x + 2, y - 1));
                shape.add(line(x + 5, y + 2, x + 2, y - 1));
                shape.add(line(x + 5, y + 3, x + 2, y));
                break;
            case 3:
                hw = Math.ceil(width / 2);
                shape = font(text, x - hw, y + 6);
                // Top
                shape.add(line(x + -hw - 2, y + 4, x + hw + 1, y + 4));
                // Left
                shape.add(line(x - hw - 3, y + 5, x - hw - 3, y + 14));
                // Bottoms
                shape.add(line(x - hw - 2, y + 14, x + hw + 1, y + 14));
                shape.add(line(x - hw - 2, y + 15, x + hw + 1, y + 15));
                // Right
                shape.add(line(x + hw + 2, y + 5, x + hw + 2, y + 14));
                // Pointer
                shape.add(line(x - 1, y + 1, x - 4, y + 4));
                shape.add(line(x, y + 1, x + 3, y + 4));
                shape.remove(line(x - 3, y + 4, x + 3, y + 4));
                break;
        }
        shape.isOverlay = true;
        shape.bbox();
        return shape;
    }

    /**
     * @param {string} text
     * @param {Coordinate} part
     * @param {number} direction
     * @return {Shape}
     */
    tooltipName(text, part, direction) {
        var x, y, t = GAME_TILE, d = GAME_TILE * 2.5;

        x = part[0] * t;
        y = part[1] * t;

        switch (direction) {
            case DIRECTION_LEFT:  y += t; x -= t; break;
            case DIRECTION_UP:    y -= t; x += t; break;
            case DIRECTION_RIGHT: y += t; x += d; break;
            case DIRECTION_DOWN:  y += d; x += t; break;
        }

        return tooltip(text, x, y, direction);
    }

    /**
     * @param {string} label
     * @param {Coordinate} coordinate
     * @param {number} duration
     * @param {number=} amount
     */
    showAction(label, coordinate, duration, amount) {
        amount = amount || 3;

        var rand = function() {
            return randomRange(-12, 12);
        };

        for (var s = 0; s <= duration * amount; s += duration) {
            var shape, name;
            shape = font(
                label,
                coordinate[0] * GAME_TILE + rand(),
                coordinate[1] * GAME_TILE + rand()
            );
            name = NS_ACTION + randomStr();
            State.shapes[name] = shape.lifetime(s, s + duration);
        }
    }

    /**
     * @return {Shape}
     */
    innerBorder() {
        var w = WIDTH - 1,
            h = HEIGHT - 1;
        return new Shape(
            this.line(2, h - 25, w - 2, h - 25),
            this.line(2, h - 26, w - 2, h - 26)
        );
    }

    /**
     * @param {function(string, Shape)} callbackFn
     */
    outerBorder(callbackFn) {
        var shapes = {}, w, h;

        w = WIDTH - 1;
        h = HEIGHT - 1;

        // Splitting this up or it spans too big of an area
        shapes.outerBorderTop = new Shape(
            this.line(1, 0, w - 1, 0),
            this.line(0, 1, w, 1)
        );

        shapes.outerBorderRight = new Shape(
            this.line(w, 2, w, h - 2),
            this.line(w - 1, 2, w - 1, h - 2)
        );

        shapes.outerBorderBottom = new Shape(
            this.line(1, h, w - 1, h),
            this.line(0, h - 1, w, h - 1)
        );

        shapes.outerBorderLeft = new Shape(
            this.line(0, 2, 0, h - 2),
            this.line(1, 2, 1, h - 2)
        );

        for (var k in shapes) {
            if (shapes.hasOwnProperty(k)) {
                callbackFn(k, shapes[k]);
            }
        }
    }

    /**
     * @return {Shape}
     */
    header() {
        var x, y, shape, welcome = fontPixels('<XSSNAKE>');

        x = MENU_LEFT - 2;
        y = MENU_TOP - 34;

        shape = new Shape(zoom(4, welcome, x, y));
        x += 2;
        y += 28;
        shape.add(this.line(x, y, x + MENU_WIDTH, y));

        return shape;
    }

    /**
     * @param {Coordinate} location
     * @param {number=} direction
     * @param {number=} intensity
     */
    explosion(location, direction, intensity) {
        var pixel, shape, to, duration, w, d, rand;

        w = 10;
        d = 20;
        rand = randomRange;

        intensity = intensity || 16;
        while (intensity--) {
            switch (direction) {
                case DIRECTION_LEFT:
                    to = [rand(-w, d), rand(-w, w)];
                    break;
                case DIRECTION_UP:
                    to = [rand(-w, w), rand(-d, w)];
                    break;
                case DIRECTION_RIGHT:
                    to = [rand(-d, w), rand(-w, w)];
                    break;
                case DIRECTION_DOWN:
                    to = [rand(-w, w), rand(-w, d)];
                    break;
                default:
                    to = [rand(-d, d), rand(-d, d)];
            }

            pixel = new PixelCollection().add(location[0], location[1]);
            duration = Math.pow(rand(1, 10), 3);

            shape = new Shape(pixel);
            shape.animate({to: to, duration: duration}).lifetime(0, duration);
            State.shapes[NS_EXPLOSION + randomStr(3)] = shape;
        }
    }

});
