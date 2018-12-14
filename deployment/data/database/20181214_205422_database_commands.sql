DROP INDEX "idx_demo$homeproject_system$changedby";
DROP INDEX "idx_demo$homeproject_system$owner";
DELETE FROM "mendixsystem$attribute" 
 WHERE "id" = '98aa6554-0ee5-3751-8795-257ce5e0882b';
DELETE FROM "mendixsystem$attribute" 
 WHERE "id" = 'ad0a6f2d-018b-33b9-a8b7-3bfcb159f392';
DELETE FROM "mendixsystem$association" 
 WHERE "id" = '66a20d32-7be0-38ad-a22c-2a5552aa3fe6';
DELETE FROM "mendixsystem$association" 
 WHERE "id" = '7e439375-ad42-3dd2-a258-07c124c28bae';
DELETE FROM "mendixsystem$index" 
 WHERE "id" = '99a7f8eb-e05a-3151-ab66-afabe97a9e9a';
DELETE FROM "mendixsystem$index_column" 
 WHERE "index_id" = '99a7f8eb-e05a-3151-ab66-afabe97a9e9a';
DELETE FROM "mendixsystem$index" 
 WHERE "id" = '9cc2e564-ed00-388c-b8df-c2d478e21022';
DELETE FROM "mendixsystem$index_column" 
 WHERE "index_id" = '9cc2e564-ed00-388c-b8df-c2d478e21022';
UPDATE "mendixsystem$entity"
 SET "entity_name" = 'Demo.HomeProject', 
"table_name" = 'demo$homeproject', 
"superentity_id" = '37827192-315d-4ab6-85b8-f626f866ea76'
 WHERE "id" = 'c51e20a6-590b-4ee7-ade9-1615226abe3b';
INSERT INTO "system$filedocument" ("id", 
"submetaobjectname", 
"system$owner", 
"system$changedby", 
"createddate", 
"changeddate", 
"deleteafterdownload", 
"size", 
"hascontents", 
"fileid", 
"__filename__")
SELECT "id", 
'Demo.HomeProject', 
"system$owner", 
"system$changedby", 
"createddate", 
"changeddate", 
false, 
-1, 
false, 
NEXT VALUE FOR "system$filedocument_fileid_mxseq", 
NEXT VALUE FOR "system$filedocument___filename___mxseq"
 FROM "demo$homeproject"
 ORDER BY "id" ASC;
INSERT INTO "system$image" ("id", 
"submetaobjectname")
SELECT "id", 
'Demo.HomeProject'
 FROM "demo$homeproject"
 ORDER BY "id" ASC;
ALTER TABLE "demo$homeproject" DROP COLUMN "system$owner";
ALTER TABLE "demo$homeproject" DROP COLUMN "changeddate";
ALTER TABLE "demo$homeproject" DROP COLUMN "createddate";
ALTER TABLE "demo$homeproject" DROP COLUMN "system$changedby";
UPDATE "mendixsystem$version"
 SET "versionnumber" = '4.2', 
"lastsyncdate" = '20181214 20:54:20';
