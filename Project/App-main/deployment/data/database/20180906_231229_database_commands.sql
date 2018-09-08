ALTER TABLE "demo$gank" ADD "images" VARCHAR_IGNORECASE(200) NULL;
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('f8fb7f69-fc66-4154-8faf-8a18dda4cde2', 
'3adb8e0d-c19f-4c27-a9cd-654e75b9247f', 
'images', 
'images', 
30, 
200, 
'', 
false);
CREATE TABLE "demo$gankimages" (
	"id" BIGINT NOT NULL,
	"images" VARCHAR_IGNORECASE(200) NULL,
	PRIMARY KEY("id"));
INSERT INTO "mendixsystem$entity" ("id", 
"entity_name", 
"table_name")
 VALUES ('79531b6d-c4a4-40a9-b970-6a476a256ec3', 
'Demo.GankImages', 
'demo$gankimages');
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('bb4e4f82-dbb4-485a-ae53-83bb9900c9b9', 
'79531b6d-c4a4-40a9-b970-6a476a256ec3', 
'images', 
'images', 
30, 
200, 
'', 
false);
CREATE TABLE "demo$entity_gank" (
	"demo$gankimagesid" BIGINT NOT NULL,
	"demo$gankid" BIGINT NOT NULL,
	PRIMARY KEY("demo$gankimagesid","demo$gankid"),
	CONSTRAINT "uniq_demo$entity_gank_demo$gankimagesid" UNIQUE ("demo$gankimagesid"));
CREATE INDEX "idx_demo$entity_gank_demo$gank_demo$gankimages" ON "demo$entity_gank" ("demo$gankid","demo$gankimagesid");
INSERT INTO "mendixsystem$association" ("id", 
"association_name", 
"table_name", 
"parent_entity_id", 
"child_entity_id", 
"parent_column_name", 
"child_column_name", 
"index_name")
 VALUES ('c739a299-4745-4ee1-9828-bbd7e3782ab2', 
'Demo.Entity_Gank', 
'demo$entity_gank', 
'79531b6d-c4a4-40a9-b970-6a476a256ec3', 
'3adb8e0d-c19f-4c27-a9cd-654e75b9247f', 
'demo$gankimagesid', 
'demo$gankid', 
'idx_demo$entity_gank_demo$gank_demo$gankimages');
INSERT INTO "mendixsystem$unique_constraint" ("name", 
"table_id", 
"column_id")
 VALUES ('uniq_demo$entity_gank_demo$gankimagesid', 
'c739a299-4745-4ee1-9828-bbd7e3782ab2', 
'522147f0-5e6f-3a05-8d13-d39d5c96ca03');
UPDATE "mendixsystem$version"
 SET "versionnumber" = '4.2', 
"lastsyncdate" = '20180906 23:10:35';
