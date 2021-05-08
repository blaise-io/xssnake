import { DIRECTION } from "../const";
import { PixelCollection } from "../pixelCollection";
import { PlayerSpawn } from "./playerSpawn";

const enum C {
    R = 16,
    G = 8,
    B = 0,
}

const enum COLOR_FUNCTION {
    WALL = (0 << C.R) | (0 << C.G) | (0 << C.B),
    BLANK = (255 << C.R) | (255 << C.G) | (255 << C.B),
    UNREACHABLE = (222 << C.R) | (222 << C.G) | (222 << C.B),
    SPAWN_DIRECTION = (99 << C.R) | (99 << C.G) | (99 << C.B),
    SPAWN_0 = (255 << C.R) | (0 << C.G) | (0 << C.B),
    SPAWN_1 = (0 << C.R) | (255 << C.G) | (0 << C.B),
    SPAWN_2 = (0 << C.R) | (0 << C.G) | (255 << C.B),
    SPAWN_3 = (255 << C.R) | (255 << C.G) | (0 << C.B),
    SPAWN_4 = (255 << C.R) | (0 << C.G) | (255 << C.B),
    SPAWN_5 = (0 << C.R) | (255 << C.G) | (255 << C.B),
}

export function parseLevelData(
    imageData: ImageData,
): {
    width: number;
    height: number;
    spawns: PlayerSpawn[];
    walls: PixelCollection;
    unreachables: PixelCollection;
} {
    const data = imageData.data;
    const walls = new PixelCollection();
    const unreachables = new PixelCollection();
    const directionCoordinates: Coordinate[] = [];
    const spawnCoordinates: Coordinate[] = new Array(6);

    for (let i = 0, m = data.length / 4; i < m; i++) {
        const coordinate = [i % imageData.width, Math.floor(i / imageData.width)] as Coordinate;
        switch ((data[i * 4] << C.R) | (data[i * 4 + 1] << C.G) | (data[i * 4 + 2] << C.B)) {
            case COLOR_FUNCTION.BLANK:
                break;
            case COLOR_FUNCTION.WALL:
                walls.add(...coordinate);
                break;
            case COLOR_FUNCTION.UNREACHABLE:
                unreachables.add(...coordinate);
                break;
            case COLOR_FUNCTION.SPAWN_DIRECTION:
                directionCoordinates.push(coordinate);
                break;
            case COLOR_FUNCTION.SPAWN_0:
                spawnCoordinates[0] = coordinate;
                break;
            case COLOR_FUNCTION.SPAWN_1:
                spawnCoordinates[1] = coordinate;
                break;
            case COLOR_FUNCTION.SPAWN_2:
                spawnCoordinates[2] = coordinate;
                break;
            case COLOR_FUNCTION.SPAWN_3:
                spawnCoordinates[3] = coordinate;
                break;
            case COLOR_FUNCTION.SPAWN_4:
                spawnCoordinates[4] = coordinate;
                break;
            case COLOR_FUNCTION.SPAWN_5:
                spawnCoordinates[5] = coordinate;
                break;
            default:
                console.error("Unknown color", { coordinate });
                throw new Error();
        }
    }

    if (spawnCoordinates.filter((c) => c).length !== 6) {
        console.error("Missing one or more spawns");
        throw new Error();
    }

    return {
        width: imageData.width,
        height: imageData.height,
        walls,
        unreachables,
        spawns: spawnCoordinates.map((coordinate) => {
            return new PlayerSpawn(
                coordinate,
                getDirectionForSpawn(coordinate, directionCoordinates),
            );
        }),
    };
}

function getDirectionForSpawn(spawn, spawnDirections) {
    for (let i = 0, m = spawnDirections.length; i < m; i++) {
        const horizontalDelta = spawnDirections[i][0] - spawn[0];
        const verticalDelta = spawnDirections[i][1] - spawn[1];

        if (Math.abs(horizontalDelta) === 1 && verticalDelta === 0) {
            return horizontalDelta === 1 ? DIRECTION.RIGHT : DIRECTION.LEFT;
        } else if (Math.abs(verticalDelta) === 1 && horizontalDelta === 0) {
            return verticalDelta === 1 ? DIRECTION.DOWN : DIRECTION.UP;
        }
    }

    console.error("Unknown direction", { spawn });
    throw new Error();
}
