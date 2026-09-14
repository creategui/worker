/**
 * A result's measured segment belongs to its course. When organisers merge
 * duplicate challenges with different courses, do not attach that measurement
 * to the target challenge as though it were measured there.
 */
export function preserveCourseMetricsOnMerge(
  sourceCourseId: unknown,
  targetCourseId: unknown,
): boolean {
  return typeof sourceCourseId === 'string'
    && sourceCourseId.length > 0
    && sourceCourseId === targetCourseId;
}
