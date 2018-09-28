ALTER TABLE "widgets$stringparam" RENAME TO "cb6cbce41371456ab2f5dbf5a09e485e";
ALTER TABLE "demo$stringparam" ALTER COLUMN "param" RENAME TO "demoparam";
UPDATE "mendixsystem$attribute"
 SET "entity_id" = '27a2c924-8546-4b4b-8759-92e44c33aa43', 
"attribute_name" = 'demoParam', 
"column_name" = 'demoparam', 
"type" = 30, 
"length" = 200, 
"default_value" = '', 
"is_auto_number" = false
 WHERE "id" = 'a162f0df-939e-4a1a-b371-2f5c6cf09e70';
DELETE FROM "mendixsystem$entity" 
 WHERE "id" = '3bc6e9d9-7698-4ea8-b409-70f2de0e09de';
DELETE FROM "mendixsystem$entityidentifier" 
 WHERE "id" = '3bc6e9d9-7698-4ea8-b409-70f2de0e09de';
DELETE FROM "mendixsystem$sequence" 
 WHERE "attribute_id" IN (SELECT "id"
 FROM "mendixsystem$attribute"
 WHERE "entity_id" = '3bc6e9d9-7698-4ea8-b409-70f2de0e09de');
DELETE FROM "mendixsystem$attribute" 
 WHERE "entity_id" = '3bc6e9d9-7698-4ea8-b409-70f2de0e09de';
DROP TABLE "cb6cbce41371456ab2f5dbf5a09e485e";
UPDATE "mendixsystem$version"
 SET "versionnumber" = '4.2', 
"lastsyncdate" = '20180928 22:26:36';
