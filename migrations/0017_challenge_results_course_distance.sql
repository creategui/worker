-- Actual GPS distance along the scored start-to-finish interval.
-- NULL preserves existing challenge results until they are re-submitted.
ALTER TABLE challenge_results ADD COLUMN course_distance_m REAL;
