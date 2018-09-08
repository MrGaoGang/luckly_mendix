ALTER TABLE "demo$gankimages" ALTER COLUMN "images" RENAME TO "imagesurl";
UPDATE "mendixsystem$attribute"
 SET "entity_id" = '79531b6d-c4a4-40a9-b970-6a476a256ec3', 
"attribute_name" = 'imagesurl', 
"column_name" = 'imagesurl', 
"type" = 30, 
"length" = 200, 
"default_value" = '', 
"is_auto_number" = false
 WHERE "id" = 'bb4e4f82-dbb4-485a-ae53-83bb9900c9b9';
UPDATE "mendixsystem$version"
 SET "versionnumber" = '4.2', 
"lastsyncdate" = '20180906 23:48:28';
