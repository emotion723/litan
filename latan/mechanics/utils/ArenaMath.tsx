// src/mechanics/utils/ArenaMath.ts
import { Vector2 } from '../../types/types';

export function sub(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function add(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function mul(a: Vector2, k: number): Vector2 {
  return { x: a.x * k, y: a.y * k };
}

export function length(v: Vector2): number {
  return Math.hypot(v.x, v.y);
}

export function normalize(v: Vector2): Vector2 {
  const len = length(v) || 1;
  return { x: v.x / len, y: v.y / len };
}

export function distance(a: Vector2, b: Vector2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function angleFromTo(a: Vector2, b: Vector2): number {
  return Math.atan2(b.y - a.y, b.x - a.x);
}
