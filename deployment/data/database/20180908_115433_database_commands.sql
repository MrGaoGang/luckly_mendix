CREATE TABLE "demo$vehicle" (
	"id" BIGINT NOT NULL,
	"color" VARCHAR_IGNORECASE(200) NULL,
	"name" VARCHAR_IGNORECASE(200) NULL,
	"vehicleid" BIGINT NULL,
	"style" VARCHAR_IGNORECASE(7) NULL,
	PRIMARY KEY("id"));
CREATE SEQUENCE "demo$vehicle_vehicleid_mxseq" AS BIGINT START WITH 1;
INSERT INTO "mendixsystem$entity" ("id", 
"entity_name", 
"table_name")
 VALUES ('c49905d0-72f6-42f8-a9c1-f9f7cb890de8', 
'Demo.Vehicle', 
'demo$vehicle');
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('ce9166a1-46d2-4753-8e0c-75f8fc333a14', 
'c49905d0-72f6-42f8-a9c1-f9f7cb890de8', 
'color', 
'color', 
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
 VALUES ('a95f1fbc-57dc-49dc-a3e7-3f946df89161', 
'c49905d0-72f6-42f8-a9c1-f9f7cb890de8', 
'name', 
'name', 
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
 VALUES ('111cb3ae-cf72-4599-be4e-f43baacb0ae3', 
'c49905d0-72f6-42f8-a9c1-f9f7cb890de8', 
'VehicleID', 
'vehicleid', 
0, 
0, 
'1', 
true);
INSERT INTO "mendixsystem$sequence" ("attribute_id", 
"name", 
"start_value", 
"current_value")
 VALUES ('111cb3ae-cf72-4599-be4e-f43baacb0ae3', 
'demo$vehicle_vehicleid_mxseq', 
1, 
0);
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('d1fafb41-2cc1-4119-9723-082f96edbcc8', 
'c49905d0-72f6-42f8-a9c1-f9f7cb890de8', 
'Style', 
'style', 
40, 
7, 
'', 
false);
UPDATE "mendixsystem$version"
 SET "versionnumber" = '4.2', 
"lastsyncdate" = '20180908 11:54:31';
