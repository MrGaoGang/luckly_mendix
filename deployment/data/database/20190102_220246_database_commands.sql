ALTER TABLE "articles$article" ADD "changedatemrgao" TIMESTAMP NULL;
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('7c97f199-43bd-4298-84ad-7653290cb03c', 
'3ebcc329-50f1-47b5-8a00-a450ecec62d2', 
'changeDateMrgao', 
'changedatemrgao', 
20, 
0, 
'', 
false);
UPDATE "mendixsystem$version"
 SET "versionnumber" = '4.2', 
"lastsyncdate" = '20190102 22:02:44';
