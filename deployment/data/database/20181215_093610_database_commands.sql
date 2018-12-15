CREATE TABLE "demo$searchitem" (
	"id" BIGINT NOT NULL,
	"changeddate" TIMESTAMP NULL,
	"category" VARCHAR_IGNORECASE(200) NULL,
	"createddate" TIMESTAMP NULL,
	"system$changedby" BIGINT NULL,
	PRIMARY KEY("id"));
CREATE INDEX "idx_demo$searchitem_system$changedby" ON "demo$searchitem" ("system$changedby" ASC,"id" ASC);
INSERT INTO "mendixsystem$entity" ("id", 
"entity_name", 
"table_name")
 VALUES ('74459a84-6e57-4c4b-9446-404da620133d', 
'Demo.SearchItem', 
'demo$searchitem');
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('732ec18e-2a24-326d-ae38-852e9a3704f2', 
'74459a84-6e57-4c4b-9446-404da620133d', 
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
 VALUES ('bb32c9a6-8892-49df-bb1d-3467dcf41a5c', 
'74459a84-6e57-4c4b-9446-404da620133d', 
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
 VALUES ('d3d63960-ca2d-3dd6-888c-1dff08854c0f', 
'74459a84-6e57-4c4b-9446-404da620133d', 
'createdDate', 
'createddate', 
20, 
0, 
'', 
false);
INSERT INTO "mendixsystem$index" ("id", 
"table_id", 
"index_name")
 VALUES ('fdab7594-46a2-31e1-8595-63d7b4918cf5', 
'74459a84-6e57-4c4b-9446-404da620133d', 
'idx_demo$searchitem_system$changedby');
INSERT INTO "mendixsystem$index_column" ("index_id", 
"column_id", 
"sort_order", 
"ordinal")
 VALUES ('fdab7594-46a2-31e1-8595-63d7b4918cf5', 
'c04f3ebe-1edd-36bf-b02d-485763515c45', 
false, 
0);
INSERT INTO "mendixsystem$association" ("id", 
"association_name", 
"table_name", 
"parent_entity_id", 
"child_entity_id", 
"parent_column_name", 
"child_column_name")
 VALUES ('c04f3ebe-1edd-36bf-b02d-485763515c45', 
'System.changedBy', 
'system$changedby', 
'74459a84-6e57-4c4b-9446-404da620133d', 
'282e2e60-88a5-469d-84a5-ba8d9151644f', 
'id', 
'system$changedby');
UPDATE "mendixsystem$version"
 SET "versionnumber" = '4.2', 
"lastsyncdate" = '20181215 09:36:09';
