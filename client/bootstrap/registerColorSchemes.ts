import { ColorScheme, PixelShape } from "../ui/colorScheme";

export const colorSchemes: ColorScheme[] = [
    new ColorScheme(
        "My First LED Screen",
        "Without backlight in the sun",
        "#787",
        "#797",
        "#111",
        undefined,
        0.4
    ),
    new ColorScheme("VFD", "Party like it’s 1959", "#000", "#111", "#68F"),
    new ColorScheme("Terminal", "<MARQUEE>oh. :(</MARQUEE>", "#010", "#000", "#0f0"),
    new ColorScheme(
        "Public Transport",
        "I’m a bus",
        "#111",
        "#222",
        "#dc0",
        undefined,
        undefined,
        PixelShape.circular
    ),
    new ColorScheme("Vampire Campfire", "Bloody pixels", "#000", "#100", "#f00", 0.85),
    new ColorScheme("Panda", "(O)____(o)", "#000", "#111", "#fff"),
];
