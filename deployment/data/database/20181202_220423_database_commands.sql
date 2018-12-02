CREATE TABLE "demo$user" (
	"id" BIGINT NOT NULL,
	"username" VARCHAR_IGNORECASE(200) NULL,
	"age" VARCHAR_IGNORECASE(200) NULL,
	"password" VARCHAR_IGNORECASE(200) NULL,
	PRIMARY KEY("id"));
INSERT INTO "mendixsystem$entity" ("id", 
"entity_name", 
"table_name")
 VALUES ('ab26b43d-705f-4d02-83e0-f63af013c58c', 
'Demo.User', 
'demo$user');
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('318cb10b-68e6-48a5-a076-4dab643b46ce', 
'ab26b43d-705f-4d02-83e0-f63af013c58c', 
'UserName', 
'username', 
30, 
200, 
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
 VALUES ('b07be558-2dbd-41fd-9b8c-cdc0772a945e', 
'ab26b43d-705f-4d02-83e0-f63af013c58c', 
'Age', 
'age', 
30, 
200, 
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
 VALUES ('9e4c4433-2211-4888-988f-38aa7dcce91c', 
'ab26b43d-705f-4d02-83e0-f63af013c58c', 
'Password', 
'password', 
30, 
200, 
'', 
false);
UPDATE "mendixsystem$version"
 SET "versionnumber" = '4.2', 
"lastsyncdate" = '20181202 22:04:22';
