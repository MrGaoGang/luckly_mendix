CREATE TABLE "demo$gankimage" (
	"id" BIGINT NOT NULL,
	"image" VARCHAR_IGNORECASE(200) NULL,
	PRIMARY KEY("id"));
INSERT INTO "mendixsystem$entity" ("id", 
"entity_name", 
"table_name")
 VALUES ('6e22a89f-94d8-4e7a-873b-168c278cf219', 
'Demo.GankImage', 
'demo$gankimage');
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('77078a07-2f9d-4547-9aec-7e5faf70728a', 
'6e22a89f-94d8-4e7a-873b-168c278cf219', 
'image', 
'image', 
30, 
200, 
'', 
false);
CREATE TABLE "demo$gankimage_gank" (
	"demo$gankimageid" BIGINT NOT NULL,
	"demo$gankid" BIGINT NOT NULL,
	PRIMARY KEY("demo$gankimageid","demo$gankid"),
	CONSTRAINT "uniq_demo$gankimage_gank_demo$gankimageid" UNIQUE ("demo$gankimageid"));
CREATE INDEX "idx_demo$gankimage_gank_demo$gank_demo$gankimage" ON "demo$gankimage_gank" ("demo$gankid","demo$gankimageid");
INSERT INTO "mendixsystem$association" ("id", 
"association_name", 
"table_name", 
"parent_entity_id", 
"child_entity_id", 
"parent_column_name", 
"child_column_name", 
"index_name")
 VALUES ('799cfc08-efec-4023-b838-b4d3d73d1b11', 
'Demo.GankImage_Gank', 
'demo$gankimage_gank', 
'6e22a89f-94d8-4e7a-873b-168c278cf219', 
'3adb8e0d-c19f-4c27-a9cd-654e75b9247f', 
'demo$gankimageid', 
'demo$gankid', 
'idx_demo$gankimage_gank_demo$gank_demo$gankimage');
INSERT INTO "mendixsystem$unique_constraint" ("name", 
"table_id", 
"column_id")
 VALUES ('uniq_demo$gankimage_gank_demo$gankimageid', 
'799cfc08-efec-4023-b838-b4d3d73d1b11', 
'cc381f02-9d05-35e0-9bc2-5d795d411c03');
UPDATE "mendixsystem$version"
 SET "versionnumber" = '4.2', 
"lastsyncdate" = '20180907 08:25:45';
