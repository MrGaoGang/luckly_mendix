CREATE TABLE "articles$articelcategory" (
	"id" BIGINT NOT NULL,
	"changeddate" TIMESTAMP NULL,
	"category" VARCHAR_IGNORECASE(200) NULL,
	"createddate" TIMESTAMP NULL,
	"usecount" VARCHAR_IGNORECASE(200) NULL,
	"system$owner" BIGINT NULL,
	PRIMARY KEY("id"));
CREATE INDEX "idx_articles$articelcategory_system$owner" ON "articles$articelcategory" ("system$owner" ASC,"id" ASC);
INSERT INTO "mendixsystem$entity" ("id", 
"entity_name", 
"table_name")
 VALUES ('a9611e02-26ad-4ffa-a5f5-ac7cdacbfff2', 
'Articles.ArticelCategory', 
'articles$articelcategory');
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('591b0277-26be-3bbb-9b4f-c1b135db970e', 
'a9611e02-26ad-4ffa-a5f5-ac7cdacbfff2', 
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
 VALUES ('41c4fa6b-893c-4eaa-8eda-821b510fbca6', 
'a9611e02-26ad-4ffa-a5f5-ac7cdacbfff2', 
'Category', 
'category', 
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
 VALUES ('3637d8ae-f076-3d7f-862d-80f6ade2e5c1', 
'a9611e02-26ad-4ffa-a5f5-ac7cdacbfff2', 
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
 VALUES ('b839ebce-711f-48d9-a0b7-2292bfe8980d', 
'a9611e02-26ad-4ffa-a5f5-ac7cdacbfff2', 
'useCount', 
'usecount', 
30, 
200, 
'', 
false);
INSERT INTO "mendixsystem$index" ("id", 
"table_id", 
"index_name")
 VALUES ('144d1c31-d7c6-3244-a5e4-bf7c331b07b2', 
'a9611e02-26ad-4ffa-a5f5-ac7cdacbfff2', 
'idx_articles$articelcategory_system$owner');
INSERT INTO "mendixsystem$index_column" ("index_id", 
"column_id", 
"sort_order", 
"ordinal")
 VALUES ('144d1c31-d7c6-3244-a5e4-bf7c331b07b2', 
'40e6a6d0-f3b4-3277-baac-e5d7db07f501', 
false, 
0);
INSERT INTO "mendixsystem$association" ("id", 
"association_name", 
"table_name", 
"parent_entity_id", 
"child_entity_id", 
"parent_column_name", 
"child_column_name")
 VALUES ('40e6a6d0-f3b4-3277-baac-e5d7db07f501', 
'System.owner', 
'system$owner', 
'a9611e02-26ad-4ffa-a5f5-ac7cdacbfff2', 
'282e2e60-88a5-469d-84a5-ba8d9151644f', 
'id', 
'system$owner');
CREATE TABLE "articles$article_articelcategory" (
	"articles$articleid" BIGINT NOT NULL,
	"articles$articelcategoryid" BIGINT NOT NULL,
	PRIMARY KEY("articles$articleid","articles$articelcategoryid"));
CREATE INDEX "idx_articles$article_articelcategory_articles$articelcategory_articles$article" ON "articles$article_articelcategory" ("articles$articelcategoryid" ASC,"articles$articleid" ASC);
INSERT INTO "mendixsystem$association" ("id", 
"association_name", 
"table_name", 
"parent_entity_id", 
"child_entity_id", 
"parent_column_name", 
"child_column_name", 
"index_name")
 VALUES ('d95785d8-a5c3-4a41-8d69-b3b7a0e22911', 
'Articles.Article_ArticelCategory', 
'articles$article_articelcategory', 
'3ebcc329-50f1-47b5-8a00-a450ecec62d2', 
'a9611e02-26ad-4ffa-a5f5-ac7cdacbfff2', 
'articles$articleid', 
'articles$articelcategoryid', 
'idx_articles$article_articelcategory_articles$articelcategory_articles$article');
UPDATE "mendixsystem$version"
 SET "versionnumber" = '4.2', 
"lastsyncdate" = '20181229 01:14:06';
