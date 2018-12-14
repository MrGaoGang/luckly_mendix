CREATE TABLE "demo$myfiledoc" (
	"id" BIGINT NOT NULL,
	PRIMARY KEY("id"));
INSERT INTO "mendixsystem$entity" ("id", 
"entity_name", 
"table_name", 
"superentity_id")
 VALUES ('2c015904-2070-412e-97dd-8d51e2a45792', 
'Demo.MyFileDoc', 
'demo$myfiledoc', 
'170ce49d-f29c-4fac-99a6-b55e8a3aeb39');
UPDATE "mendixsystem$version"
 SET "versionnumber" = '4.2', 
"lastsyncdate" = '20181214 20:05:12';
