import type { GameMap, LocationId, MapTile, Position } from './types';

const layout = [
  'FFFFFFFFFFFF',
  'FGGGPPPGGGGF',
  'FGGBPPPBGLGF',
  'FGGGPPPGGLGF',
  'FPPPPPPPPPGF',
  'FGGGPGGGGGGF',
  'FGKBPSPCGGGF',
  'FGGGPGGGGGGF',
  'FPPPPPPPPPGF',
  'FGGGPPPGGGGF',
  'FGGGPPPGGGGF',
  'FFFFFFFFFFFF',
];

const locationBySymbol: Partial<Record<string, { location: LocationId; label: string }>> = {
  B: { location: 'workshop', label: 'Workshop' },
  K: { location: 'kitchen', label: 'Kitchen' },
  S: { location: 'square', label: 'Town Square' },
  C: { location: 'clinic', label: 'Clinic' },
  L: { location: 'lake', label: 'Lake' },
};

function tileFromSymbol(symbol: string, x: number, y: number): MapTile {
  if (symbol === 'F') return { x, y, type: 'forest', location: 'forest', walkable: false };
  if (symbol === 'P') return { x, y, type: 'path', walkable: true };
  if (symbol === 'W') return { x, y, type: 'water', location: 'lake', walkable: false };
  if (symbol === 'G') return { x, y, type: 'grass', walkable: true };

  if (symbol === 'B' || symbol === 'K' || symbol === 'S' || symbol === 'C') {
    const data = locationBySymbol[symbol]!;
    return { x, y, type: 'building', location: data.location, label: data.label, walkable: true };
  }

  if (symbol === 'L') {
    const data = locationBySymbol[symbol]!;
    return { x, y, type: 'water', location: data.location, label: data.label, walkable: false };
  }

  return { x, y, type: 'grass', walkable: true };
}

export function createVillageMap(): GameMap {
  const tiles = layout.flatMap((row, y) => row.split('').map((symbol, x) => tileFromSymbol(symbol, x, y)));

  return {
    width: layout[0].length,
    height: layout.length,
    tiles,
  };
}

export function getTileAt(map: GameMap, position: Position): MapTile | undefined {
  return map.tiles.find((tile) => tile.x === position.x && tile.y === position.y);
}

export function findLocationTile(map: GameMap, location: LocationId): MapTile | undefined {
  return map.tiles.find((tile) => tile.location === location && tile.walkable);
}

export function stepToward(map: GameMap, from: Position, to: Position): Position {
  const candidates: Position[] = [
    { x: from.x + Math.sign(to.x - from.x), y: from.y },
    { x: from.x, y: from.y + Math.sign(to.y - from.y) },
    { x: from.x - Math.sign(to.x - from.x), y: from.y },
    { x: from.x, y: from.y - Math.sign(to.y - from.y) },
  ];

  const valid = candidates.find((candidate) => {
    const tile = getTileAt(map, candidate);
    return tile?.walkable;
  });

  return valid ?? from;
}

export function randomWalkableNeighbor(map: GameMap, from: Position, seed: number): Position {
  const candidates: Position[] = [
    { x: from.x + 1, y: from.y },
    { x: from.x - 1, y: from.y },
    { x: from.x, y: from.y + 1 },
    { x: from.x, y: from.y - 1 },
  ].filter((candidate) => getTileAt(map, candidate)?.walkable);

  if (candidates.length === 0) return from;
  return candidates[Math.abs(seed) % candidates.length];
}
