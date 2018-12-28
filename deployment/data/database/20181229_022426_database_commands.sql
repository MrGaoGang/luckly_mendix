ALTER TABLE "articles$article" ADD "changeddate" TIMESTAMP NULL;
ALTER TABLE "articles$article" ADD "fabulous" BIGINT NULL;
UPDATE "articles$article"
 SET "fabulous" = 0;
ALTER TABLE "articles$article" ADD "createddate" TIMESTAMP NULL;
ALTER TABLE "articles$article" ADD "system$owner" BIGINT NULL;
CREATE INDEX "idx_articles$article_system$owner" ON "articles$article" ("system$owner" ASC,"id" ASC);
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('8453800d-a1f6-35a0-b773-182fcfa91f35', 
'3ebcc329-50f1-47b5-8a00-a450ecec62d2', 
'changedDate', 
'changeddate', 
20, 
0, 
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
 VALUES ('d23e4911-3d85-46c9-96ae-d2ad9e819e17', 
'3ebcc329-50f1-47b5-8a00-a450ecec62d2', 
'Fabulous', 
'fabulous', 
4, 
0, 
'0', 
false);
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('f0ceec22-baeb-3220-923a-b47d55fdfe2f', 
'3ebcc329-50f1-47b5-8a00-a450ecec62d2', 
'createdDate', 
'createddate', 
20, 
0, 
'', 
false);
INSERT INTO "mendixsystem$association" ("id", 
"association_name", 
"table_name", 
"parent_entity_id", 
"child_entity_id", 
"parent_column_name", 
"child_column_name")
 VALUES ('78a45e1f-5428-3ff3-a603-aa695f718157', 
'System.owner', 
'system$owner', 
'3ebcc329-50f1-47b5-8a00-a450ecec62d2', 
'282e2e60-88a5-469d-84a5-ba8d9151644f', 
'id', 
'system$owner');
INSERT INTO "mendixsystem$index" ("id", 
"table_id", 
"index_name")
 VALUES ('2b475cf1-9238-3a9d-a00e-f54fd6c03c6e', 
'3ebcc329-50f1-47b5-8a00-a450ecec62d2', 
'idx_articles$article_system$owner');
INSERT INTO "mendixsystem$index_column" ("index_id", 
"column_id", 
"sort_order", 
"ordinal")
 VALUES ('2b475cf1-9238-3a9d-a00e-f54fd6c03c6e', 
'78a45e1f-5428-3ff3-a603-aa695f718157', 
false, 
0);
CREATE TABLE "articles$comment" (
	"id" BIGINT NOT NULL,
	"changeddate" TIMESTAMP NULL,
	"createddate" TIMESTAMP NULL,
	"commentcontent" VARCHAR_IGNORECASE(2147483647) NULL,
	"system$owner" BIGINT NULL,
	PRIMARY KEY("id"));
CREATE INDEX "idx_articles$comment_system$owner" ON "articles$comment" ("system$owner" ASC,"id" ASC);
INSERT INTO "mendixsystem$entity" ("id", 
"entity_name", 
"table_name")
 VALUES ('7eb5883e-0fe0-47d7-8c54-af39011b720d', 
'Articles.Comment', 
'articles$comment');
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('13a102b0-89cf-3eeb-99fe-e77190dc7fb7', 
'7eb5883e-0fe0-47d7-8c54-af39011b720d', 
'changedDate', 
'changeddate', 
20, 
0, 
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
 VALUES ('cf682b07-9006-386d-8b33-beae4a360f7c', 
'7eb5883e-0fe0-47d7-8c54-af39011b720d', 
'createdDate', 
'createddate', 
20, 
0, 
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
 VALUES ('3a5452a6-7c17-48e4-bb2b-4cd1c64dffec', 
'7eb5883e-0fe0-47d7-8c54-af39011b720d', 
'commentContent', 
'commentcontent', 
30, 
0, 
'', 
false);
INSERT INTO "mendixsystem$index" ("id", 
"table_id", 
"index_name")
 VALUES ('98f0d914-843d-39eb-a222-0eefad6fffbc', 
'7eb5883e-0fe0-47d7-8c54-af39011b720d', 
'idx_articles$comment_system$owner');
INSERT INTO "mendixsystem$index_column" ("index_id", 
"column_id", 
"sort_order", 
"ordinal")
 VALUES ('98f0d914-843d-39eb-a222-0eefad6fffbc', 
'e69b9bda-d2ed-3ba9-8b19-2a3d53876b93', 
false, 
0);
INSERT INTO "mendixsystem$association" ("id", 
"association_name", 
"table_name", 
"parent_entity_id", 
"child_entity_id", 
"parent_column_name", 
"child_column_name")
 VALUES ('e69b9bda-d2ed-3ba9-8b19-2a3d53876b93', 
'System.owner', 
'system$owner', 
'7eb5883e-0fe0-47d7-8c54-af39011b720d', 
'282e2e60-88a5-469d-84a5-ba8d9151644f', 
'id', 
'system$owner');
CREATE TABLE "articles$entity_article" (
	"articles$commentid" BIGINT NOT NULL,
	"articles$articleid" BIGINT NOT NULL,
	PRIMARY KEY("articles$commentid","articles$articleid"),
	CONSTRAINT "uniq_articles$entity_article_articles$commentid" UNIQUE ("articles$commentid"));
CREATE INDEX "idx_articles$entity_article_articles$article_articles$comment" ON "articles$entity_article" ("articles$articleid" ASC,"articles$commentid" ASC);
INSERT INTO "mendixsystem$association" ("id", 
"association_name", 
"table_name", 
"parent_entity_id", 
"child_entity_id", 
"parent_column_name", 
"child_column_name", 
"index_name")
 VALUES ('f37d60af-16cd-46e9-bb82-9db6d9a3eed7', 
'Articles.Entity_Article', 
'articles$entity_article', 
'7eb5883e-0fe0-47d7-8c54-af39011b720d', 
'3ebcc329-50f1-47b5-8a00-a450ecec62d2', 
'articles$commentid', 
'articles$articleid', 
'idx_articles$entity_article_articles$article_articles$comment');
INSERT INTO "mendixsystem$unique_constraint" ("name", 
"table_id", 
"column_id")
 VALUES ('uniq_articles$entity_article_articles$commentid', 
'f37d60af-16cd-46e9-bb82-9db6d9a3eed7', 
'861e9bb1-8a41-35de-899c-d4427c8ef05a');
UPDATE "mendixsystem$version"
 SET "versionnumber" = '4.2', 
"lastsyncdate" = '20181229 02:24:23';
