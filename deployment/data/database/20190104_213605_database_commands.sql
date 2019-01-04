ALTER TABLE "articles$article" ALTER COLUMN "fabulous" RENAME TO "praise";
ALTER TABLE "articles$article" ADD "commentlength" INT NULL;
UPDATE "articles$article"
 SET "commentlength" = 0;
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('dfae54cc-9e72-42f1-b37c-9382a72be74e', 
'3ebcc329-50f1-47b5-8a00-a450ecec62d2', 
'commentLength', 
'commentlength', 
3, 
0, 
'0', 
false);
UPDATE "mendixsystem$attribute"
 SET "entity_id" = '3ebcc329-50f1-47b5-8a00-a450ecec62d2', 
"attribute_name" = 'praise', 
"column_name" = 'praise', 
"type" = 4, 
"length" = 0, 
"default_value" = '0', 
"is_auto_number" = false
 WHERE "id" = 'd23e4911-3d85-46c9-96ae-d2ad9e819e17';
ALTER TABLE "articles$comment" ADD "system$changedby" BIGINT NULL;
CREATE INDEX "idx_articles$comment_system$changedby" ON "articles$comment" ("system$changedby" ASC,"id" ASC);
INSERT INTO "mendixsystem$association" ("id", 
"association_name", 
"table_name", 
"parent_entity_id", 
"child_entity_id", 
"parent_column_name", 
"child_column_name")
 VALUES ('ae7043b2-ff03-389e-9c2a-93cdb8625ddc', 
'System.changedBy', 
'system$changedby', 
'7eb5883e-0fe0-47d7-8c54-af39011b720d', 
'282e2e60-88a5-469d-84a5-ba8d9151644f', 
'id', 
'system$changedby');
INSERT INTO "mendixsystem$index" ("id", 
"table_id", 
"index_name")
 VALUES ('5be85990-34a6-3064-9786-a660b9814bdd', 
'7eb5883e-0fe0-47d7-8c54-af39011b720d', 
'idx_articles$comment_system$changedby');
INSERT INTO "mendixsystem$index_column" ("index_id", 
"column_id", 
"sort_order", 
"ordinal")
 VALUES ('5be85990-34a6-3064-9786-a660b9814bdd', 
'ae7043b2-ff03-389e-9c2a-93cdb8625ddc', 
false, 
0);
UPDATE "mendixsystem$version"
 SET "versionnumber" = '4.2', 
"lastsyncdate" = '20190104 21:36:02';
