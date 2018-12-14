ALTER TABLE "demo$homeproject" ADD "changeddate" TIMESTAMP NULL;
ALTER TABLE "demo$homeproject" ADD "system$changedby" BIGINT NULL;
ALTER TABLE "demo$homeproject" ADD "createddate" TIMESTAMP NULL;
ALTER TABLE "demo$homeproject" ADD "system$owner" BIGINT NULL;
CREATE INDEX "idx_demo$homeproject_system$owner" ON "demo$homeproject" ("system$owner" ASC,"id" ASC);
CREATE INDEX "idx_demo$homeproject_system$changedby" ON "demo$homeproject" ("system$changedby" ASC,"id" ASC);
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('ad0a6f2d-018b-33b9-a8b7-3bfcb159f392', 
'c51e20a6-590b-4ee7-ade9-1615226abe3b', 
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
 VALUES ('98aa6554-0ee5-3751-8795-257ce5e0882b', 
'c51e20a6-590b-4ee7-ade9-1615226abe3b', 
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
 VALUES ('7e439375-ad42-3dd2-a258-07c124c28bae', 
'System.owner', 
'system$owner', 
'c51e20a6-590b-4ee7-ade9-1615226abe3b', 
'282e2e60-88a5-469d-84a5-ba8d9151644f', 
'id', 
'system$owner');
INSERT INTO "mendixsystem$association" ("id", 
"association_name", 
"table_name", 
"parent_entity_id", 
"child_entity_id", 
"parent_column_name", 
"child_column_name")
 VALUES ('66a20d32-7be0-38ad-a22c-2a5552aa3fe6', 
'System.changedBy', 
'system$changedby', 
'c51e20a6-590b-4ee7-ade9-1615226abe3b', 
'282e2e60-88a5-469d-84a5-ba8d9151644f', 
'id', 
'system$changedby');
INSERT INTO "mendixsystem$index" ("id", 
"table_id", 
"index_name")
 VALUES ('9cc2e564-ed00-388c-b8df-c2d478e21022', 
'c51e20a6-590b-4ee7-ade9-1615226abe3b', 
'idx_demo$homeproject_system$owner');
INSERT INTO "mendixsystem$index_column" ("index_id", 
"column_id", 
"sort_order", 
"ordinal")
 VALUES ('9cc2e564-ed00-388c-b8df-c2d478e21022', 
'7e439375-ad42-3dd2-a258-07c124c28bae', 
false, 
0);
INSERT INTO "mendixsystem$index" ("id", 
"table_id", 
"index_name")
 VALUES ('99a7f8eb-e05a-3151-ab66-afabe97a9e9a', 
'c51e20a6-590b-4ee7-ade9-1615226abe3b', 
'idx_demo$homeproject_system$changedby');
INSERT INTO "mendixsystem$index_column" ("index_id", 
"column_id", 
"sort_order", 
"ordinal")
 VALUES ('99a7f8eb-e05a-3151-ab66-afabe97a9e9a', 
'66a20d32-7be0-38ad-a22c-2a5552aa3fe6', 
false, 
0);
UPDATE "mendixsystem$version"
 SET "versionnumber" = '4.2', 
"lastsyncdate" = '20181214 20:29:35';
