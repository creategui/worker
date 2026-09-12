import type { TrackPoint } from './course-time';

export type Haversine = (
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
) => number;

/**
 * Return a copy of the original GPS stream limited to the interval that was
 * actually scored. Boundary points are interpolated so the displayed path and
 * calculated distance share the exact scoring interval, while the source
 * stream remains unchanged.
 */
export function clipTimedCourseSegment(
  track: TrackPoint[],
  startSecond: number,
  endSecond: number,
): TrackPoint[] | null {
  if (
    track.length < 2
    || !Number.isFinite(startSecond)
    || !Number.isFinite(endSecond)
    || startSecond >= endSecond
    || startSecond < track[0].time
    || endSecond > track[track.length - 1].time
  ) {
    return null;
  }

  const pointAt = (second: number): TrackPoint | null => {
    for (let i = 0; i < track.length; i++) {
      const point = track[i];
      if (point.time === second) return { ...point };
      if (point.time > second) {
        const previous = track[i - 1];
        if (!previous || point.time <= previous.time) return null;
        const ratio = (second - previous.time) / (point.time - previous.time);
        return {
          lat: previous.lat + (point.lat - previous.lat) * ratio,
          lon: previous.lon + (point.lon - previous.lon) * ratio,
          time: second,
        };
      }
    }
    return null;
  };

  const start = pointAt(startSecond);
  const end = pointAt(endSecond);
  if (!start || !end) return null;

  return [
    start,
    ...track.filter((point) => point.time > startSecond && point.time < endSecond).map((point) => ({ ...point })),
    end,
  ];
}

export function courseSegmentDistanceM(segment: TrackPoint[], haversine: Haversine): number | null {
  if (segment.length < 2) return null;
  let distanceM = 0;
  for (let i = 1; i < segment.length; i++) {
    distanceM += haversine(segment[i - 1], segment[i]);
  }
  return Number.isFinite(distanceM) ? distanceM : null;
}
