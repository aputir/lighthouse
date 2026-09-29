CREATE UNIQUE INDEX "crew_members_crew_user_idx" ON "crew_members" USING btree ("crew_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "enrollments_course_user_idx" ON "enrollments" USING btree ("course_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "assessments_mission_user_idx" ON "assessments" USING btree ("mission_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "landmark_states_course_landmark_idx" ON "landmark_states" USING btree ("course_id","landmark_index");--> statement-breakpoint
CREATE UNIQUE INDEX "landmark_thresholds_course_landmark_idx" ON "landmark_thresholds" USING btree ("course_id","landmark_index");