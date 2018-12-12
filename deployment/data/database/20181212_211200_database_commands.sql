CREATE TABLE "demo$user_user" (
	"demo$userid" BIGINT NOT NULL,
	"system$userid" BIGINT NOT NULL,
	PRIMARY KEY("demo$userid","system$userid"),
	CONSTRAINT "uniq_demo$user_user_demo$userid" UNIQUE ("demo$userid"));
CREATE INDEX "idx_demo$user_user_system$user_demo$user" ON "demo$user_user" ("system$userid" ASC,"demo$userid" ASC);
INSERT INTO "mendixsystem$association" ("id", 
"association_name", 
"table_name", 
"parent_entity_id", 
"child_entity_id", 
"parent_column_name", 
"child_column_name", 
"index_name")
 VALUES ('f0a44795-56f8-47ae-be6e-552434204979', 
'Demo.User_User', 
'demo$user_user', 
'ab26b43d-705f-4d02-83e0-f63af013c58c', 
'282e2e60-88a5-469d-84a5-ba8d9151644f', 
'demo$userid', 
'system$userid', 
'idx_demo$user_user_system$user_demo$user');
INSERT INTO "mendixsystem$unique_constraint" ("name", 
"table_id", 
"column_id")
 VALUES ('uniq_demo$user_user_demo$userid', 
'f0a44795-56f8-47ae-be6e-552434204979', 
'7288f9f4-05e0-328e-acf7-9a3ca87c27cc');
UPDATE "mendixsystem$version"
 SET "versionnumber" = '4.2', 
"lastsyncdate" = '20181212 21:11:58';
