ALTER TABLE "demo$homeproject_image" DROP CONSTRAINT "uniq_demo$homeproject_image_demo$homeprojectid";
ALTER TABLE "demo$homeproject_image" DROP CONSTRAINT "uniq_demo$homeproject_image_system$imageid";
DROP INDEX "idx_demo$homeproject_image_system$image_demo$homeproject";
ALTER TABLE "demo$homeproject_image" RENAME TO "4af3c741fe4f4e09a5f8c28a757132fe";
DELETE FROM "mendixsystem$association" 
 WHERE "id" = '39cafe0a-c34d-41a7-aa2e-97111d823730';
DELETE FROM "mendixsystem$unique_constraint" 
 WHERE "name" = 'uniq_demo$homeproject_image_demo$homeprojectid';
DELETE FROM "mendixsystem$unique_constraint" 
 WHERE "name" = 'uniq_demo$homeproject_image_system$imageid';
DROP TABLE "4af3c741fe4f4e09a5f8c28a757132fe";
UPDATE "mendixsystem$version"
 SET "versionnumber" = '4.2', 
"lastsyncdate" = '20181214 20:41:22';
