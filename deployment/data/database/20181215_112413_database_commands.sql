ALTER TABLE "demo$searchitem" ADD "categorylevel" BIGINT NULL;
UPDATE "demo$searchitem"
 SET "categorylevel" = 1;
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('2357fdd9-ea84-4f8c-8420-8acffc0ec27c', 
'74459a84-6e57-4c4b-9446-404da620133d', 
'categoryLevel', 
'categorylevel', 
4, 
0, 
'1', 
false);
UPDATE "mendixsystem$version"
 SET "versionnumber" = '4.2', 
"lastsyncdate" = '20181215 11:24:11';
