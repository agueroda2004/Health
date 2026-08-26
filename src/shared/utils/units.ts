export type WeightUnit = "kg" | "lb";
export type DistanceUnit = "km" | "miles";

const KG_PER_LB = 0.45359237;

export function toKg(weight: number, unit: WeightUnit): number {
  return unit === "kg" ? weight : weight * KG_PER_LB;
}

export function fromKg(weightKg: number, unit: WeightUnit): number {
  return unit === "kg" ? weightKg : weightKg / KG_PER_LB;
}

export function toKm(distance: number, unit: DistanceUnit): number {
  return unit === "km" ? distance : distance * 1.609344;
}

export function fromKm(distanceKm: number, unit: DistanceUnit): number {
  return unit === "km" ? distanceKm : distanceKm / 1.609344;
}

export function formatWeight(weight: number, unit: WeightUnit): string {
  const value = fromKg(weight, unit);
  const rounded = Number.isInteger(value) ? value : value.toFixed(1);
  return `${rounded} ${unit}`;
}

export function formatDistance(distanceKm: number, unit: DistanceUnit): string {
  const value = fromKm(distanceKm, unit);
  const rounded = Number.isInteger(value) ? value : value.toFixed(2);
  return `${rounded} ${unit}`;
}