ALTER TABLE "system$image" ADD "submetaobjectname" VARCHAR_IGNORECASE(255) NULL;
UPDATE "system$image"
 SET "submetaobjectname" = 'System.Image';
CREATE INDEX "idx_system$image_submetaobjectname" ON "system$image" ("submetaobjectname" ASC,"id" ASC);
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('272f49fe-6a64-3ede-a32d-344a34e57b9f', 
'37827192-315d-4ab6-85b8-f626f866ea76', 
'submetaobjectname', 
'submetaobjectname', 
30, 
255, 
'System.Image', 
false);
INSERT INTO "mendixsystem$index" ("id", 
"table_id", 
"index_name")
 VALUES ('00a9ec1c-4fab-368f-83d4-ffa8ff501c8c', 
'37827192-315d-4ab6-85b8-f626f866ea76', 
'idx_system$image_submetaobjectname');
INSERT INTO "mendixsystem$index_column" ("index_id", 
"column_id", 
"sort_order", 
"ordinal")
 VALUES ('00a9ec1c-4fab-368f-83d4-ffa8ff501c8c', 
'272f49fe-6a64-3ede-a32d-344a34e57b9f', 
false, 
0);
CREATE TABLE "demo$projectimg" (
	"id" BIGINT NOT NULL,
	PRIMARY KEY("id"));
INSERT INTO "mendixsystem$entity" ("id", 
"entity_name", 
"table_name", 
"superentity_id")
 VALUES ('989094d5-ce6c-41e0-a8d1-27dceb652fd9', 
'Demo.ProjectImg', 
'demo$projectimg', 
'37827192-315d-4ab6-85b8-f626f866ea76');
CREATE TABLE "demo$homeproject" (
	"id" BIGINT NOT NULL,
	"title" VARCHAR_IGNORECASE(200) NULL,
	"descript" VARCHAR_IGNORECASE(2147483647) NULL,
	"url" VARCHAR_IGNORECASE(200) NULL,
	"status" VARCHAR_IGNORECASE(9) NULL,
	PRIMARY KEY("id"));
INSERT INTO "mendixsystem$entity" ("id", 
"entity_name", 
"table_name")
 VALUES ('c51e20a6-590b-4ee7-ade9-1615226abe3b', 
'Demo.HomeProject', 
'demo$homeproject');
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('db419cbf-3a1c-451b-96fe-863822a9232e', 
'c51e20a6-590b-4ee7-ade9-1615226abe3b', 
'title', 
'title', 
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
 VALUES ('8b7fe12d-88da-495e-9824-31d77aa00839', 
'c51e20a6-590b-4ee7-ade9-1615226abe3b', 
'descript', 
'descript', 
30, 
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
 VALUES ('427f7445-3c2a-4010-abb5-5638fc5f4357', 
'c51e20a6-590b-4ee7-ade9-1615226abe3b', 
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
 VALUES ('0812568c-fb6c-4a26-93fc-b59c78563ba4', 
'c51e20a6-590b-4ee7-ade9-1615226abe3b', 
'status', 
'status', 
40, 
9, 
'', 
false);
CREATE TABLE "demo$homeproject_projectimg" (
	"demo$homeprojectid" BIGINT NOT NULL,
	"demo$projectimgid" BIGINT NOT NULL,
	PRIMARY KEY("demo$homeprojectid","demo$projectimgid"),
	CONSTRAINT "uniq_demo$homeproject_projectimg_demo$projectimgid" UNIQUE ("demo$projectimgid"),
	CONSTRAINT "uniq_demo$homeproject_projectimg_demo$homeprojectid" UNIQUE ("demo$homeprojectid"));
CREATE INDEX "idx_demo$homeproject_projectimg_demo$projectimg_demo$homeproject" ON "demo$homeproject_projectimg" ("demo$projectimgid" ASC,"demo$homeprojectid" ASC);
INSERT INTO "mendixsystem$association" ("id", 
"association_name", 
"table_name", 
"parent_entity_id", 
"child_entity_id", 
"parent_column_name", 
"child_column_name", 
"index_name")
 VALUES ('8d66b259-9840-43e5-b128-0b86763a3a03', 
'Demo.HomeProject_ProjectImg', 
'demo$homeproject_projectimg', 
'c51e20a6-590b-4ee7-ade9-1615226abe3b', 
'989094d5-ce6c-41e0-a8d1-27dceb652fd9', 
'demo$homeprojectid', 
'demo$projectimgid', 
'idx_demo$homeproject_projectimg_demo$projectimg_demo$homeproject');
INSERT INTO "mendixsystem$unique_constraint" ("name", 
"table_id", 
"column_id")
 VALUES ('uniq_demo$homeproject_projectimg_demo$projectimgid', 
'8d66b259-9840-43e5-b128-0b86763a3a03', 
'8afb9b74-41dc-398f-8413-0a0329ad71ef');
INSERT INTO "mendixsystem$unique_constraint" ("name", 
"table_id", 
"column_id")
 VALUES ('uniq_demo$homeproject_projectimg_demo$homeprojectid', 
'8d66b259-9840-43e5-b128-0b86763a3a03', 
'e1a29cc0-0b7d-330d-9a5e-9951d0a0c71a');
UPDATE "mendixsystem$version"
 SET "versionnumber" = '4.2', 
"lastsyncdate" = '20181214 20:27:11';
