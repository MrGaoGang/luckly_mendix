ALTER TABLE "demo$gank" ADD "no" INT NULL;
UPDATE "demo$gank"
 SET "no" = 0;
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('5dc8306a-623d-47b3-8dfa-3d18e6989d1f', 
'3adb8e0d-c19f-4c27-a9cd-654e75b9247f', 
'no', 
'no', 
3, 
0, 
'0', 
false);
UPDATE "mendixsystem$version"
 SET "versionnumber" = '4.2', 
"lastsyncdate" = '20181219 22:42:51';
