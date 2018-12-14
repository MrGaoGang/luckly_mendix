CREATE TABLE "demo$homeproject_image" (
	"demo$homeprojectid" BIGINT NOT NULL,
	"system$imageid" BIGINT NOT NULL,
	PRIMARY KEY("demo$homeprojectid","system$imageid"),
	CONSTRAINT "uniq_demo$homeproject_image_system$imageid" UNIQUE ("system$imageid"),
	CONSTRAINT "uniq_demo$homeproject_image_demo$homeprojectid" UNIQUE ("demo$homeprojectid"));
CREATE INDEX "idx_demo$homeproject_image_system$image_demo$homeproject" ON "demo$homeproject_image" ("system$imageid" ASC,"demo$homeprojectid" ASC);
INSERT INTO "mendixsystem$association" ("id", 
"association_name", 
"table_name", 
"parent_entity_id", 
"child_entity_id", 
"parent_column_name", 
"child_column_name", 
"index_name")
 VALUES ('39cafe0a-c34d-41a7-aa2e-97111d823730', 
'Demo.HomeProject_Image', 
'demo$homeproject_image', 
'c51e20a6-590b-4ee7-ade9-1615226abe3b', 
'37827192-315d-4ab6-85b8-f626f866ea76', 
'demo$homeprojectid', 
'system$imageid', 
'idx_demo$homeproject_image_system$image_demo$homeproject');
INSERT INTO "mendixsystem$unique_constraint" ("name", 
"table_id", 
"column_id")
 VALUES ('uniq_demo$homeproject_image_system$imageid', 
'39cafe0a-c34d-41a7-aa2e-97111d823730', 
'3b862668-34ee-37e8-b87b-24abbddccda2');
INSERT INTO "mendixsystem$unique_constraint" ("name", 
"table_id", 
"column_id")
 VALUES ('uniq_demo$homeproject_image_demo$homeprojectid', 
'39cafe0a-c34d-41a7-aa2e-97111d823730', 
'd1e0c631-227c-3da0-998c-2bb175c735e2');
UPDATE "mendixsystem$version"
 SET "versionnumber" = '4.2', 
"lastsyncdate" = '20181214 20:40:04';
