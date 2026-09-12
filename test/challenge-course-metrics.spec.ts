import { describe, expect, it } from 'vitest';
import { preserveCourseMetricsOnMerge } from '../src/challenge-course-metrics';

describe('preserveCourseMetricsOnMerge', () => {
  it('keeps a measured course segment only when source and target use the same course', () => {
    expect(preserveCourseMetricsOnMerge('84', '84')).toBe(true);
    expect(preserveCourseMetricsOnMerge('84', '85')).toBe(false);
    expect(preserveCourseMetricsOnMerge(null, '84')).toBe(false);
  });
});
