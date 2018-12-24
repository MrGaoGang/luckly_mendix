ALTER TABLE "articles$article" ADD "subcontent" VARCHAR_IGNORECASE(300) NULL;
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('5d207814-2eba-4051-9a14-8a8ff3af7908', 
'3ebcc329-50f1-47b5-8a00-a450ecec62d2', 
'subContent', 
'subcontent', 
30, 
300, 
'', 
false);
UPDATE "mendixsystem$version"
 SET "versionnumber" = '4.2', 
"lastsyncdate" = '20181224 00:29:03';
