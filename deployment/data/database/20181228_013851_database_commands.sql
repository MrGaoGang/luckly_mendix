ALTER TABLE "articles$article" ADD "author" VARCHAR_IGNORECASE(200) NULL;
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('cc7130ab-beee-4aab-bee9-8aa26c0ed997', 
'3ebcc329-50f1-47b5-8a00-a450ecec62d2', 
'author', 
'author', 
30, 
200, 
'', 
false);
UPDATE "mendixsystem$version"
 SET "versionnumber" = '4.2', 
"lastsyncdate" = '20181228 01:38:50';
