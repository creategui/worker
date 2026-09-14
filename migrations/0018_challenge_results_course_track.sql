-- Publicly displayable GPS for the scored course interval only. Its presence
-- represents the athlete's explicit opt-in; do not add a separate consent flag.
ALTER TABLE challenge_results ADD COLUMN course_track_latlng TEXT;
