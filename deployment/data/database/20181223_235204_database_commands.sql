ALTER TABLE "articles$article_searchitem" DROP CONSTRAINT "uniq_articles$article_searchitem_articles$articleid";
DELETE FROM "mendixsystem$unique_constraint" 
 WHERE "name" = 'uniq_articles$article_searchitem_articles$articleid';
UPDATE "mendixsystem$version"
 SET "versionnumber" = '4.2', 
"lastsyncdate" = '20181223 23:52:03';
