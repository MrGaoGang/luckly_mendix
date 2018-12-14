ALTER TABLE "demo$homeproject_projectimg" DROP CONSTRAINT "uniq_demo$homeproject_projectimg_demo$homeprojectid";
ALTER TABLE "demo$homeproject_projectimg" DROP CONSTRAINT "uniq_demo$homeproject_projectimg_demo$projectimgid";
DROP INDEX "idx_demo$homeproject_projectimg_demo$projectimg_demo$homeproject";
ALTER TABLE "demo$homeproject_projectimg" RENAME TO "1f4bcd7c459848cc8b08cb90cd228bf5";
DELETE FROM "mendixsystem$association" 
 WHERE "id" = '8d66b259-9840-43e5-b128-0b86763a3a03';
DELETE FROM "mendixsystem$unique_constraint" 
 WHERE "name" = 'uniq_demo$homeproject_projectimg_demo$homeprojectid';
DELETE FROM "mendixsystem$unique_constraint" 
 WHERE "name" = 'uniq_demo$homeproject_projectimg_demo$projectimgid';
CREATE TABLE "demo$projectimg_homeproject" (
	"demo$projectimgid" BIGINT NOT NULL,
	"demo$homeprojectid" BIGINT NOT NULL,
	PRIMARY KEY("demo$projectimgid","demo$homeprojectid"),
	CONSTRAINT "uniq_demo$projectimg_homeproject_demo$homeprojectid" UNIQUE ("demo$homeprojectid"),
	CONSTRAINT "uniq_demo$projectimg_homeproject_demo$projectimgid" UNIQUE ("demo$projectimgid"));
CREATE INDEX "idx_demo$projectimg_homeproject_demo$homeproject_demo$projectimg" ON "demo$projectimg_homeproject" ("demo$homeprojectid" ASC,"demo$projectimgid" ASC);
INSERT INTO "mendixsystem$association" ("id", 
"association_name", 
"table_name", 
"parent_entity_id", 
"child_entity_id", 
"parent_column_name", 
"child_column_name", 
"index_name")
 VALUES ('25fe7a5f-7bf6-4315-a57b-2ab0dd76e9e7', 
'Demo.ProjectImg_HomeProject', 
'demo$projectimg_homeproject', 
'989094d5-ce6c-41e0-a8d1-27dceb652fd9', 
'c51e20a6-590b-4ee7-ade9-1615226abe3b', 
'demo$projectimgid', 
'demo$homeprojectid', 
'idx_demo$projectimg_homeproject_demo$homeproject_demo$projectimg');
INSERT INTO "mendixsystem$unique_constraint" ("name", 
"table_id", 
"column_id")
 VALUES ('uniq_demo$projectimg_homeproject_demo$homeprojectid', 
'25fe7a5f-7bf6-4315-a57b-2ab0dd76e9e7', 
'3da7eff9-f8c5-32ee-9040-795ef62b868e');
INSERT INTO "mendixsystem$unique_constraint" ("name", 
"table_id", 
"column_id")
 VALUES ('uniq_demo$projectimg_homeproject_demo$projectimgid', 
'25fe7a5f-7bf6-4315-a57b-2ab0dd76e9e7', 
'035c77a2-5a5c-30a7-8680-f1d9bccd717a');
DROP TABLE "1f4bcd7c459848cc8b08cb90cd228bf5";
UPDATE "mendixsystem$version"
 SET "versionnumber" = '4.2', 
"lastsyncdate" = '20181214 20:50:54';
