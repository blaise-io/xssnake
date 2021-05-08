# Level images

PNG images are used to define the walls, spawns and unreachable areas of a level.
Level images must be 63 pixels wide, 33 pixels high.

Animations and powerups are defined seperately.

## Pixel color table

Every pixel translates to a tile.

| Color name | RGB color       | Tile                                   |
|------------|-----------------|----------------------------------------|
| Black      | `  0,   0,   0` | Wall                                   |
| White      | `255, 255, 255` | Open Space                             |
| Red        | `255,   0,   0` | Spawn Player 1                         |
| Lime       | `  0, 255,   0` | Spawn Player 2                         |
| Blue       | `  0,   0, 255` | Spawn Player 3                         |
| Yellow     | `255, 255,   0` | Spawn Player 4                         |
| Turqoise   | `  0, 255, 255` | Spawn Player 5                         |
| Fuchsia    | `255,   0, 255` | Spawn Player 6                         |
| Dark Gray  | ` 99,  99,  99` | Player Direction at Spawn              |
| Light Gray | `222, 222, 222` | Exclude for Apple/Power-up Spawning    |

##  Requirements

 * Every level must contain all six Spawn Player pixels.
 * Next to each Spawn Player pixel should be *one* Player Direction pixel.
   This is the initital direction the player will move to.
 * All players should have an equal-ish chance to survive.
