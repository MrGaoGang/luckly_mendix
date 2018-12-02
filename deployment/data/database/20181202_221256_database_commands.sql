ALTER TABLE "demo$user" DROP COLUMN "age";
ALTER TABLE "demo$user" ADD "age" BIGINT NULL;
UPDATE "demo$user"
 SET "age" = 0;
UPDATE "mendixsystem$attribute"
 SET "entity_id" = 'ab26b43d-705f-4d02-83e0-f63af013c58c', 
"attribute_name" = 'Age', 
"column_name" = 'age', 
"type" = 4, 
"length" = 0, 
"default_value" = '0', 
"is_auto_number" = false
 WHERE "id" = 'b07be558-2dbd-41fd-9b8c-cdc0772a945e';
UPDATE "mendixsystem$version"
 SET "versionnumber" = '4.2', 
"lastsyncdate" = '20181202 22:12:54';
