ALTER TABLE "articles$article" ADD "isowener" BOOLEAN NULL;
UPDATE "articles$article"
 SET "isowener" = true;
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('1354f041-cfe9-4935-a796-009eabbb9a18', 
'3ebcc329-50f1-47b5-8a00-a450ecec62d2', 
'isOwener', 
'isowener', 
10, 
0, 
'true', 
false);
UPDATE "mendixsystem$version"
 SET "versionnumber" = '4.2', 
"lastsyncdate" = '20181228 01:48:27';
