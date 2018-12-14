ALTER TABLE "demo$projectimg" RENAME TO "76e7a5fe8ff04d34b12086b12589c72c";
ALTER TABLE "demo$projectimg_homeproject" DROP CONSTRAINT "uniq_demo$projectimg_homeproject_demo$homeprojectid";
ALTER TABLE "demo$projectimg_homeproject" DROP CONSTRAINT "uniq_demo$projectimg_homeproject_demo$projectimgid";
DROP INDEX "idx_demo$projectimg_homeproject_demo$homeproject_demo$projectimg";
ALTER TABLE "demo$projectimg_homeproject" RENAME TO "91ebbce0a9b0439b8d575d4ca9172df6";
ALTER TABLE "demo$homeproject" ADD "recommandlevel" BIGINT NULL;
UPDATE "demo$homeproject"
 SET "recommandlevel" = 2;
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('258534a2-4f6c-4d1c-a9fe-0f0267451938', 
'c51e20a6-590b-4ee7-ade9-1615226abe3b', 
'recommandLevel', 
'recommandlevel', 
4, 
0, 
'2', 
false);
DELETE FROM "mendixsystem$entity" 
 WHERE "id" = '989094d5-ce6c-41e0-a8d1-27dceb652fd9';
DELETE FROM "mendixsystem$entityidentifier" 
 WHERE "id" = '989094d5-ce6c-41e0-a8d1-27dceb652fd9';
DELETE FROM "mendixsystem$sequence" 
 WHERE "attribute_id" IN (SELECT "id"
 FROM "mendixsystem$attribute"
 WHERE "entity_id" = '989094d5-ce6c-41e0-a8d1-27dceb652fd9');
DELETE FROM "mendixsystem$attribute" 
 WHERE "entity_id" = '989094d5-ce6c-41e0-a8d1-27dceb652fd9';
DELETE FROM "mendixsystem$association" 
 WHERE "id" = '25fe7a5f-7bf6-4315-a57b-2ab0dd76e9e7';
DELETE FROM "mendixsystem$unique_constraint" 
 WHERE "name" = 'uniq_demo$projectimg_homeproject_demo$homeprojectid';
DELETE FROM "mendixsystem$unique_constraint" 
 WHERE "name" = 'uniq_demo$projectimg_homeproject_demo$projectimgid';
DELETE FROM "system$image" 
 WHERE "id" IN (SELECT "id"
 FROM "76e7a5fe8ff04d34b12086b12589c72c");
DELETE FROM "system$thumbnail_image" 
 WHERE "system$imageid" IN (SELECT "id"
 FROM "76e7a5fe8ff04d34b12086b12589c72c");
DELETE FROM "system$filedocument" 
 WHERE "id" IN (SELECT "id"
 FROM "76e7a5fe8ff04d34b12086b12589c72c");
DROP TABLE "76e7a5fe8ff04d34b12086b12589c72c";
DROP TABLE "91ebbce0a9b0439b8d575d4ca9172df6";
UPDATE "mendixsystem$version"
 SET "versionnumber" = '4.2', 
"lastsyncdate" = '20181214 21:08:46';
