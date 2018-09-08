ALTER TABLE "demo$gankimages" RENAME TO "a6b61af610d94b5a83a7ca2a853eb95e";
ALTER TABLE "demo$entity_gank" DROP CONSTRAINT "uniq_demo$entity_gank_demo$gankimagesid";
DROP INDEX "idx_demo$entity_gank_demo$gank_demo$gankimages";
ALTER TABLE "demo$entity_gank" RENAME TO "4b495434071243b89e849c8b25fb80ec";
DELETE FROM "mendixsystem$entity" 
 WHERE "id" = '79531b6d-c4a4-40a9-b970-6a476a256ec3';
DELETE FROM "mendixsystem$entityidentifier" 
 WHERE "id" = '79531b6d-c4a4-40a9-b970-6a476a256ec3';
DELETE FROM "mendixsystem$sequence" 
 WHERE "attribute_id" IN (SELECT "id"
 FROM "mendixsystem$attribute"
 WHERE "entity_id" = '79531b6d-c4a4-40a9-b970-6a476a256ec3');
DELETE FROM "mendixsystem$attribute" 
 WHERE "entity_id" = '79531b6d-c4a4-40a9-b970-6a476a256ec3';
DELETE FROM "mendixsystem$association" 
 WHERE "id" = 'c739a299-4745-4ee1-9828-bbd7e3782ab2';
DELETE FROM "mendixsystem$unique_constraint" 
 WHERE "name" = 'uniq_demo$entity_gank_demo$gankimagesid';
DROP TABLE "a6b61af610d94b5a83a7ca2a853eb95e";
DROP TABLE "4b495434071243b89e849c8b25fb80ec";
UPDATE "mendixsystem$version"
 SET "versionnumber" = '4.2', 
"lastsyncdate" = '20180906 23:51:30';
