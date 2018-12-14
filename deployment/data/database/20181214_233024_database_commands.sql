ALTER TABLE "demo$homeproject" ADD "youdaourl" VARCHAR_IGNORECASE(200) NULL;
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('ef126bbb-c811-46c7-8300-a1d62e4e03b5', 
'c51e20a6-590b-4ee7-ade9-1615226abe3b', 
'youdaoURL', 
'youdaourl', 
30, 
200, 
'', 
false);
UPDATE "mendixsystem$version"
 SET "versionnumber" = '4.2', 
"lastsyncdate" = '20181214 23:30:11';
