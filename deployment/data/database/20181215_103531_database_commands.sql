CREATE TABLE "demo$homeproject_searchitem" (
	"demo$homeprojectid" BIGINT NOT NULL,
	"demo$searchitemid" BIGINT NOT NULL,
	PRIMARY KEY("demo$homeprojectid","demo$searchitemid"));
CREATE INDEX "idx_demo$homeproject_searchitem_demo$searchitem_demo$homeproject" ON "demo$homeproject_searchitem" ("demo$searchitemid" ASC,"demo$homeprojectid" ASC);
INSERT INTO "mendixsystem$association" ("id", 
"association_name", 
"table_name", 
"parent_entity_id", 
"child_entity_id", 
"parent_column_name", 
"child_column_name", 
"index_name")
 VALUES ('d945bec4-908e-4051-9894-8ccdf1f1ff31', 
'Demo.HomeProject_SearchItem', 
'demo$homeproject_searchitem', 
'c51e20a6-590b-4ee7-ade9-1615226abe3b', 
'74459a84-6e57-4c4b-9446-404da620133d', 
'demo$homeprojectid', 
'demo$searchitemid', 
'idx_demo$homeproject_searchitem_demo$searchitem_demo$homeproject');
UPDATE "mendixsystem$version"
 SET "versionnumber" = '4.2', 
"lastsyncdate" = '20181215 10:35:29';
