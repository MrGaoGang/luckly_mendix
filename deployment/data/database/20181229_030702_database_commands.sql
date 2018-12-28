ALTER TABLE "articles$articelcategory" ADD "level" BIGINT NULL;
UPDATE "articles$articelcategory"
 SET "level" = 0;
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('3864c97c-5663-4f28-abf8-027610c103d1', 
'a9611e02-26ad-4ffa-a5f5-ac7cdacbfff2', 
'level', 
'level', 
4, 
0, 
'0', 
false);
ALTER TABLE "articles$article" ADD "isrecommend" BOOLEAN NULL;
UPDATE "articles$article"
 SET "isrecommend" = false;
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('663bd91e-3c9e-4cb6-b018-149876614f91', 
'3ebcc329-50f1-47b5-8a00-a450ecec62d2', 
'isRecommend', 
'isrecommend', 
10, 
0, 
'false', 
false);
UPDATE "mendixsystem$version"
 SET "versionnumber" = '4.2', 
"lastsyncdate" = '20181229 03:07:01';
