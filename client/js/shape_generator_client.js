'use strict';

/**
 * Extend ShapeGenerator with client-end only methods.
 */
xss.util.extend(xss.ShapeGenerator.prototype, /** @lends xss.ShapeGenerator.prototype */ {

    /**
     * @param {string} text
     * @param {number} x
     * @param {number} y
     * @param {number} side
     * @return {xss.Shape}
     */
    tooltip: function(text, x, y, side) {
        var width, shape, hw, line = xss.shapegen.line;

        width = xss.font.width(text);

        switch (side) {
            case 0:
                shape = xss.font.shape(text, x - width - 6, y - 4);
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
                shape = xss.font.shape(text, x - hw, y - 13);
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
                shape = xss.font.shape(text, x + 8, y - 4);
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
                shape = xss.font.shape(text, x - hw, y + 6);
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
    },

    /**
     * @return {xss.Shape}
     */
    innerBorder: function() {
        var w = xss.WIDTH - 1,
            h = xss.HEIGHT - 1;
        return new xss.Shape(
            this.line(2, h - 25, w - 2, h - 25),
            this.line(2, h - 26, w - 2, h - 26)
        );
    },

    /**
     * @return {Object.<string, xss.Shape>}
     */
    outerBorder: function() {
        var shapes = {},
            w = xss.WIDTH - 1,
            h = xss.HEIGHT - 1;

        // Splitting this up or it spans too big of an area
        shapes.top = new xss.Shape(
            this.line(1, 0, w - 1, 0),
            this.line(0, 1, w, 1)
        );

        shapes.right = new xss.Shape(
            this.line(w, 2, w, h - 2),
            this.line(w - 1, 2, w - 1, h - 2)
        );

        shapes.bottom = new xss.Shape(
            this.line(1, h, w - 1, h),
            this.line(0, h - 1, w, h - 1)
        );

        shapes.left = new xss.Shape(
            this.line(0, 2, 0, h - 2),
            this.line(1, 2, 1, h - 2)
        );

        return shapes;
    },

    /**
     * @param {xss.LevelData} data
     * @return {xss.Shape}
     */
    level: function(data) {
        var shape = new xss.Shape(data.walls);
        shape.setGameTransform();
        return shape;
    },

    /**
     * @return {xss.Shape}
     */
    header: function() {
        var x, y, shape, welcome = xss.font.pixels('<XSSNAKE>');

        x = xss.MENU_LEFT - 2;
        y = xss.MENU_TOP - 34;

        shape = new xss.Shape(xss.transform.zoomX4(welcome, x, y, true));
        x += 2;
        y += 28;
        shape.add(this.line(x, y, x + xss.MENU_WIDTH, y));

        return shape;
    },

    /**
     * @param {xss.Coordinate} location
     * @param {number=} direction
     * @param {number=} intensity
     */
    explosion: function(location, direction, intensity) {
        var pixel, shape, to, duration, w, d, rand;

        w = 10;
        d = 20;
        rand = xss.util.randomRange;

        intensity = intensity || 16;
        while (intensity--) {
            switch (direction) {
                case xss.DIRECTION_LEFT:
                    to = [rand(-w,d), rand(-w,w)];
                    break;
                case xss.DIRECTION_UP:
                    to = [rand(-w,w), rand(-d,w)];
                    break;
                case xss.DIRECTION_RIGHT:
                    to = [rand(-d,w), rand(-w,w)];
                    break;
                case xss.DIRECTION_DOWN:
                    to = [rand(-w,w), rand(-w,d)];
                    break;
                default:
                    to = [rand(-d,d), rand(-d,d)];
            }

            pixel = new xss.PixelCollection().add(location[0], location[1]);
            duration = Math.pow(rand(1, 10), 3);

            shape = new xss.Shape(pixel);
            shape.animate({to: to, duration: duration}).lifetime(0, duration);
            xss.shapes[xss.NS_EXPLOSION + xss.util.randomStr(3)] = shape;
        }
    }

});
