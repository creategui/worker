import { describe, expect, it } from 'vitest';
import { calculateCourseTime, type TrackPoint } from '../src/course-time';
import { clipTimedCourseSegment, courseSegmentDistanceM } from '../src/course-segment';

const distance = (a: { lat: number; lon: number }, b: { lat: number; lon: number }) => {
  const rad = Math.PI / 180;
  const h = Math.sin((b.lat - a.lat) * rad / 2) ** 2
    + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin((b.lon - a.lon) * rad / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(h));
};

describe('timed course segments', () => {
  it('clips original GPS points to exact scored endpoints without mutating them', () => {
    const track: TrackPoint[] = [
      { lat: 0, lon: 0, time: 0 },
      { lat: 0, lon: 0.01, time: 10 },
      { lat: 0, lon: 0.02, time: 20 },
    ];
    const original = structuredClone(track);

    const segment = clipTimedCourseSegment(track, 5, 15);

    expect(segment).toEqual([
      { lat: 0, lon: 0.005, time: 5 },
      { lat: 0, lon: 0.01, time: 10 },
      { lat: 0, lon: 0.015, time: 15 },
    ]);
    expect(track).toEqual(original);
    expect(courseSegmentDistanceM(segment!, distance)).toBeCloseTo(1111.95, 0);
  });

  it('uses the actual scored start rather than a later candidate start passage', () => {
    const start = [{ lat: 0, lon: 0 }, { lat: 1, lon: 0 }, { lat: 0.5, lon: 1 }];
    const finish = [{ lat: 2, lon: 0 }, { lat: 3, lon: 0 }, { lat: 2.5, lon: 1 }];
    const track: TrackPoint[] = [
      { lat: 0.5, lon: 0.3, time: 0 },
      { lat: 1.5, lon: 0.3, time: 1 },
      { lat: 0.5, lon: 0.3, time: 2 },
      { lat: 1.5, lon: 0.3, time: 3 },
      { lat: 1.8, lon: 0.3, time: 4 },
      { lat: 2.5, lon: 0.3, time: 5 },
      { lat: 3.5, lon: 0.3, time: 6 },
    ];

    const result = calculateCourseTime({ id: 'multi-attempt', polygons: [
      { name: 'Start', order: 0, points: start },
      { name: 'Finish', order: 1, points: finish },
    ] }, track, distance);

    expect(result.valid).toBe(true);
    // The second candidate start passage is at 3s. Gate interpolation places
    // the actual scored first exit earlier, around 0.3s.
    expect(result.startSecond).toBeLessThan(1);
    expect(result.endSecond).toBeLessThan(5);
    expect(result.endSecond! - result.startSecond!).toBeCloseTo(result.timeS, 5);
  });
});
