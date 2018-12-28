ALTER TABLE "articles$articelcategory" DROP COLUMN "usecount";
ALTER TABLE "articles$articelcategory" ADD "usecount" BIGINT NULL;
UPDATE "articles$articelcategory"
 SET "usecount" = 0;
UPDATE "mendixsystem$attribute"
 SET "entity_id" = 'a9611e02-26ad-4ffa-a5f5-ac7cdacbfff2', 
"attribute_name" = 'useCount', 
"column_name" = 'usecount', 
"type" = 4, 
"length" = 0, 
"default_value" = '0', 
"is_auto_number" = false
 WHERE "id" = 'b839ebce-711f-48d9-a0b7-2292bfe8980d';
UPDATE "mendixsystem$version"
 SET "versionnumber" = '4.2', 
"lastsyncdate" = '20181229 02:29:58';
