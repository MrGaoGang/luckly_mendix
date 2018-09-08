ALTER TABLE "demo$gank" ALTER COLUMN "images" RENAME TO "imagesurl";
ALTER TABLE "demo$gank" ALTER COLUMN "imagesurl" RENAME TO "5e75e41b42fa42898ee9152da0a51f53";
ALTER TABLE "demo$gank" ADD "imagesurl" VARCHAR_IGNORECASE(2147483647) NULL;
UPDATE "demo$gank"
 SET "imagesurl" = CAST("5e75e41b42fa42898ee9152da0a51f53" AS VARCHAR_IGNORECASE(200));
ALTER TABLE "demo$gank" DROP COLUMN "5e75e41b42fa42898ee9152da0a51f53";
UPDATE "mendixsystem$attribute"
 SET "entity_id" = '3adb8e0d-c19f-4c27-a9cd-654e75b9247f', 
"attribute_name" = 'imagesURL', 
"column_name" = 'imagesurl', 
"type" = 30, 
"length" = 0, 
"default_value" = 'http://ww1.sinaimg.cn/large/0073sXn7ly1fupho47i6mj30690b4n1c', 
"is_auto_number" = false
 WHERE "id" = 'f8fb7f69-fc66-4154-8faf-8a18dda4cde2';
UPDATE "mendixsystem$version"
 SET "versionnumber" = '4.2', 
"lastsyncdate" = '20180907 00:01:05';
