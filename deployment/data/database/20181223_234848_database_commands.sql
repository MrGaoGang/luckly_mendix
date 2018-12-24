CREATE TABLE "articles$article" (
	"id" BIGINT NOT NULL,
	"content" VARCHAR_IGNORECASE(2147483647) NULL,
	"title" VARCHAR_IGNORECASE(200) NULL,
	PRIMARY KEY("id"));
INSERT INTO "mendixsystem$entity" ("id", 
"entity_name", 
"table_name")
 VALUES ('3ebcc329-50f1-47b5-8a00-a450ecec62d2', 
'Articles.Article', 
'articles$article');
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('4c139374-ec24-4d52-b2ce-077d8ff5ec4c', 
'3ebcc329-50f1-47b5-8a00-a450ecec62d2', 
'Content', 
'content', 
30, 
0, 
'', 
false);
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('1d2c2966-00de-42cc-af59-7c212deb55a7', 
'3ebcc329-50f1-47b5-8a00-a450ecec62d2', 
'Title', 
'title', 
30, 
200, 
'', 
false);
CREATE TABLE "articles$article_searchitem" (
	"articles$articleid" BIGINT NOT NULL,
	"demo$searchitemid" BIGINT NOT NULL,
	PRIMARY KEY("articles$articleid","demo$searchitemid"),
	CONSTRAINT "uniq_articles$article_searchitem_articles$articleid" UNIQUE ("articles$articleid"));
CREATE INDEX "idx_articles$article_searchitem_demo$searchitem_articles$article" ON "articles$article_searchitem" ("demo$searchitemid" ASC,"articles$articleid" ASC);
INSERT INTO "mendixsystem$association" ("id", 
"association_name", 
"table_name", 
"parent_entity_id", 
"child_entity_id", 
"parent_column_name", 
"child_column_name", 
"index_name")
 VALUES ('1a1a6c33-6336-42db-a079-19efba6a5740', 
'Articles.Article_SearchItem', 
'articles$article_searchitem', 
'3ebcc329-50f1-47b5-8a00-a450ecec62d2', 
'74459a84-6e57-4c4b-9446-404da620133d', 
'articles$articleid', 
'demo$searchitemid', 
'idx_articles$article_searchitem_demo$searchitem_articles$article');
INSERT INTO "mendixsystem$unique_constraint" ("name", 
"table_id", 
"column_id")
 VALUES ('uniq_articles$article_searchitem_articles$articleid', 
'1a1a6c33-6336-42db-a079-19efba6a5740', 
'8d24e354-bb43-3b71-9dd0-6aa2588e86fb');
UPDATE "mendixsystem$version"
 SET "versionnumber" = '4.2', 
"lastsyncdate" = '20181223 23:48:46';
