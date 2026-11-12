/**
 * Geometry for the Map Room. Loaded only with the Map Room chunk.
 * Base outlines: us-atlas (U.S. Census Bureau cartographic boundaries).
 */
import { geoAlbers, geoArea, geoPath } from 'd3-geo';
import type { Feature, FeatureCollection, Geometry, LineString, Polygon } from 'geojson';
import { feature, merge } from 'topojson-client';
import type { GeometryCollection, MultiPolygon as TopoMultiPolygon, Polygon as TopoPolygon, Topology } from 'topojson-specification';
import us from 'us-atlas/states-10m.json';
import { US_1800 } from '../../unit/map';

type StatesTopology = Topology<{ states: GeometryCollection<{ name: string }> }>;
const topo = us as unknown as StatesTopology;
const NOT_LOWER_48 = new Set(['02', '15', '60', '66', '69', '72', '78']);

const allStates = feature(topo, topo.objects.states) as FeatureCollection<Geometry, { name: string }>;
const lower48 = allStates.features.filter((f) => !NOT_LOWER_48.has(String(f.id)));

export const WIDTH = 975;
export const HEIGHT = 610;

export const projection = geoAlbers()
  .parallels([29.5, 45.5])
  .rotate([96, 0])
  .fitExtent(
    [
      [16, 16],
      [WIDTH - 16, HEIGHT - 16],
    ],
    { type: 'FeatureCollection', features: lower48 },
  );

const path = geoPath(projection);

export interface StateShape {
  id: string;
  name: string;
  d: string;
  centroid: [number, number];
}

export const STATES: StateShape[] = lower48.map((f) => ({
  id: String(f.id),
  name: f.properties.name,
  d: path(f) ?? '',
  centroid: path.centroid(f) as [number, number],
}));

export const STATE_BY_ID = new Map(STATES.map((s) => [s.id, s]));

export const TERRITORY_1800 =
  path(
    merge(
      topo,
      topo.objects.states.geometries.filter((g) => US_1800.includes(String(g.id))) as Array<TopoPolygon | TopoMultiPolygon>,
    ),
  ) ?? '';

type LngLat = [number, number];

/** A polygon path, with its ring wound the way d3-geo expects (small area, not the whole globe). */
export function polygonPath(ring: LngLat[]): string {
  const closed = ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1] ? ring : [...ring, ring[0]];
  let f: Feature<Polygon> = { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [closed] } };
  if (geoArea(f) > 2 * Math.PI) {
    f = { ...f, geometry: { type: 'Polygon', coordinates: [closed.slice().reverse()] } };
  }
  return path(f) ?? '';
}

export function linePath(coords: LngLat[]): string {
  const f: Feature<LineString> = { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } };
  return path(f) ?? '';
}

export function project(p: LngLat): [number, number] {
  return (projection(p) ?? [0, 0]) as [number, number];
}
