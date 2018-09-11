ALTER TABLE "demo$employee" RENAME TO "demo$pages";
ALTER TABLE "demo$pages" DROP COLUMN "zipcode";
ALTER TABLE "demo$pages" DROP COLUMN "city";
ALTER TABLE "demo$pages" DROP COLUMN "email";
ALTER TABLE "demo$pages" DROP COLUMN "longitude";
ALTER TABLE "demo$pages" DROP COLUMN "employeeid";
ALTER TABLE "demo$pages" DROP COLUMN "countrycode";
ALTER TABLE "demo$pages" DROP COLUMN "latitude";
ALTER TABLE "demo$pages" DROP COLUMN "name";
ALTER TABLE "demo$pages" ADD "gettype" VARCHAR_IGNORECASE(7) NULL;
ALTER TABLE "demo$pages" ADD "pagesize" INT NULL;
UPDATE "demo$pages"
 SET "pagesize" = 10;
ALTER TABLE "demo$pages" ADD "nowpage" BIGINT NULL;
UPDATE "demo$pages"
 SET "nowpage" = 1;
DELETE FROM "mendixsystem$attribute" 
 WHERE "id" = '15fb0373-df95-4769-ab1f-284ce2f913ba';
DELETE FROM "mendixsystem$attribute" 
 WHERE "id" = '42c3f72e-9a03-4eef-ac78-0b67cd851bdd';
DELETE FROM "mendixsystem$attribute" 
 WHERE "id" = '6317b0df-6568-442f-828f-0b834dc409df';
DELETE FROM "mendixsystem$attribute" 
 WHERE "id" = '7e313791-667f-474b-b85b-c96794698d1e';
DELETE FROM "mendixsystem$attribute" 
 WHERE "id" = '92d8c0a0-6627-4ed8-8ebd-923a45b97870';
DELETE FROM "mendixsystem$attribute" 
 WHERE "id" = '9664f4c1-8dbe-45b8-9325-d1e38aa79a09';
DELETE FROM "mendixsystem$attribute" 
 WHERE "id" = 'c11a36b9-3b98-4f2e-9594-d4338446551a';
DELETE FROM "mendixsystem$attribute" 
 WHERE "id" = 'f49c446e-6e3c-46f1-9dda-6a352e51dbec';
UPDATE "mendixsystem$entity"
 SET "entity_name" = 'Demo.Pages', 
"table_name" = 'demo$pages', 
"superentity_id" = NULL
 WHERE "id" = 'fa1ba09b-c276-48f7-9660-ac564498c38b';
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('fd17cbcc-4bee-4580-8d33-2e746e79bee4', 
'fa1ba09b-c276-48f7-9660-ac564498c38b', 
'pageSize', 
'pagesize', 
3, 
0, 
'10', 
false);
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('c109b088-b0ae-464f-a068-e826053ab415', 
'fa1ba09b-c276-48f7-9660-ac564498c38b', 
'GetType', 
'gettype', 
40, 
7, 
'', 
false);
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('472aedd1-1aba-4f8e-9411-cd417a6912ac', 
'fa1ba09b-c276-48f7-9660-ac564498c38b', 
'nowPage', 
'nowpage', 
4, 
0, 
'1', 
false);
CREATE TABLE "demo$gank" (
	"id" BIGINT NOT NULL,
	"showtype" VARCHAR_IGNORECASE(200) NULL,
	"source" VARCHAR_IGNORECASE(200) NULL,
	"used" BOOLEAN NULL,
	"url" VARCHAR_IGNORECASE(200) NULL,
	"who" VARCHAR_IGNORECASE(200) NULL,
	"desc" VARCHAR_IGNORECASE(200) NULL,
	PRIMARY KEY("id"));
INSERT INTO "mendixsystem$entity" ("id", 
"entity_name", 
"table_name")
 VALUES ('3adb8e0d-c19f-4c27-a9cd-654e75b9247f', 
'Demo.Gank', 
'demo$gank');
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('2e3ed3ff-72e8-4bef-b691-456d589df2d2', 
'3adb8e0d-c19f-4c27-a9cd-654e75b9247f', 
'showType', 
'showtype', 
30, 
200, 
'', 
false);
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('22ba98f0-7117-4a8c-b8f0-63e79e40c133', 
'3adb8e0d-c19f-4c27-a9cd-654e75b9247f', 
'source', 
'source', 
30, 
200, 
'', 
false);
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('3ad87aa8-b1d2-46e1-abf5-d108af217248', 
'3adb8e0d-c19f-4c27-a9cd-654e75b9247f', 
'used', 
'used', 
10, 
0, 
'false', 
false);
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('6b64c962-bce3-4219-aeda-c93c9f58b8f4', 
'3adb8e0d-c19f-4c27-a9cd-654e75b9247f', 
'url', 
'url', 
30, 
200, 
'', 
false);
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('90ba0581-b8e3-4e82-8dbd-66d7b0a709f6', 
'3adb8e0d-c19f-4c27-a9cd-654e75b9247f', 
'who', 
'who', 
30, 
200, 
'', 
false);
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('8da96616-5f52-4cb9-8e45-f4e1c09e0f99', 
'3adb8e0d-c19f-4c27-a9cd-654e75b9247f', 
'desc', 
'desc', 
30, 
200, 
'', 
false);
UPDATE "mendixsystem$version"
 SET "versionnumber" = '4.2', 
"lastsyncdate" = '20180906 00:17:37';
