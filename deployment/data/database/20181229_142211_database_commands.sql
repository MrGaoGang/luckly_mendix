DROP INDEX "idx_articles$article_system$owner";
DELETE FROM "mendixsystem$attribute" 
 WHERE "id" = '8453800d-a1f6-35a0-b773-182fcfa91f35';
DELETE FROM "mendixsystem$attribute" 
 WHERE "id" = 'f0ceec22-baeb-3220-923a-b47d55fdfe2f';
DELETE FROM "mendixsystem$association" 
 WHERE "id" = '78a45e1f-5428-3ff3-a603-aa695f718157';
DELETE FROM "mendixsystem$index" 
 WHERE "id" = '2b475cf1-9238-3a9d-a00e-f54fd6c03c6e';
DELETE FROM "mendixsystem$index_column" 
 WHERE "index_id" = '2b475cf1-9238-3a9d-a00e-f54fd6c03c6e';
UPDATE "mendixsystem$entity"
 SET "entity_name" = 'Articles.Article', 
"table_name" = 'articles$article', 
"superentity_id" = '37827192-315d-4ab6-85b8-f626f866ea76'
 WHERE "id" = '3ebcc329-50f1-47b5-8a00-a450ecec62d2';
INSERT INTO "system$filedocument" ("id", 
"submetaobjectname", 
"system$owner", 
"createddate", 
"changeddate", 
"deleteafterdownload", 
"size", 
"hascontents", 
"fileid", 
"__filename__")
SELECT "id", 
'Articles.Article', 
"system$owner", 
"createddate", 
"changeddate", 
false, 
-1, 
false, 
NEXT VALUE FOR "system$filedocument_fileid_mxseq", 
NEXT VALUE FOR "system$filedocument___filename___mxseq"
 FROM "articles$article"
 ORDER BY "id" ASC;
INSERT INTO "system$image" ("id", 
"submetaobjectname")
SELECT "id", 
'Articles.Article'
 FROM "articles$article"
 ORDER BY "id" ASC;
ALTER TABLE "articles$article" DROP COLUMN "system$owner";
ALTER TABLE "articles$article" DROP COLUMN "changeddate";
ALTER TABLE "articles$article" DROP COLUMN "createddate";
UPDATE "mendixsystem$version"
 SET "versionnumber" = '4.2', 
"lastsyncdate" = '20181229 14:22:09';
