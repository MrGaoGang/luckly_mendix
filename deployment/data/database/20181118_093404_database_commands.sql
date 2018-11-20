CREATE TABLE "demo$project" (
	"id" BIGINT NOT NULL,
	"projectname" VARCHAR_IGNORECASE(200) NULL,
	PRIMARY KEY("id"));
INSERT INTO "mendixsystem$entity" ("id", 
"entity_name", 
"table_name", 
"superentity_id")
 VALUES ('26aa540f-8142-4c2a-aef8-282e84ecd3e9', 
'Demo.Project', 
'demo$project', 
'9c8d258b-9188-486c-b1fd-9db1d2962156');
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('2d0f1740-b9ab-4325-9e2d-fdd746128ff0', 
'26aa540f-8142-4c2a-aef8-282e84ecd3e9', 
'ProjectName', 
'projectname', 
30, 
200, 
'', 
false);
CREATE TABLE "demo$selector1" (
	"id" BIGINT NOT NULL,
	"otherdata" VARCHAR_IGNORECASE(200) NULL,
	"dataname" VARCHAR_IGNORECASE(200) NULL,
	PRIMARY KEY("id"));
INSERT INTO "mendixsystem$entity" ("id", 
"entity_name", 
"table_name")
 VALUES ('a515366e-98e8-4df8-9f25-27210965a358', 
'Demo.Selector1', 
'demo$selector1');
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('645a4788-cccb-4029-9ae9-7cd176609a00', 
'a515366e-98e8-4df8-9f25-27210965a358', 
'otherData', 
'otherdata', 
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
 VALUES ('52b94b47-9887-49d7-875c-ef1ec6c88675', 
'a515366e-98e8-4df8-9f25-27210965a358', 
'dataName', 
'dataname', 
30, 
200, 
'', 
false);
CREATE TABLE "demo$selector3" (
	"id" BIGINT NOT NULL,
	"otherdata" VARCHAR_IGNORECASE(200) NULL,
	"dataname" VARCHAR_IGNORECASE(200) NULL,
	PRIMARY KEY("id"));
INSERT INTO "mendixsystem$entity" ("id", 
"entity_name", 
"table_name")
 VALUES ('89b8578a-6a0c-494d-8697-6e2dedde1020', 
'Demo.Selector3', 
'demo$selector3');
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('8ed6a402-9881-4363-a0e7-f202ac4714d9', 
'89b8578a-6a0c-494d-8697-6e2dedde1020', 
'otherData', 
'otherdata', 
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
 VALUES ('e3de8e58-9fc1-4164-8d42-193999b01be3', 
'89b8578a-6a0c-494d-8697-6e2dedde1020', 
'dataName', 
'dataname', 
30, 
200, 
'', 
false);
CREATE TABLE "demo$selector3_selector2" (
	"demo$selector3id" BIGINT NOT NULL,
	"demo$selector2id" BIGINT NOT NULL,
	PRIMARY KEY("demo$selector3id","demo$selector2id"),
	CONSTRAINT "uniq_demo$selector3_selector2_demo$selector3id" UNIQUE ("demo$selector3id"));
CREATE INDEX "idx_demo$selector3_selector2_demo$selector2_demo$selector3" ON "demo$selector3_selector2" ("demo$selector2id" ASC,"demo$selector3id" ASC);
INSERT INTO "mendixsystem$association" ("id", 
"association_name", 
"table_name", 
"parent_entity_id", 
"child_entity_id", 
"parent_column_name", 
"child_column_name", 
"index_name")
 VALUES ('b557134b-cb63-4f4e-a17c-197cdd71005f', 
'Demo.Selector3_Selector2', 
'demo$selector3_selector2', 
'89b8578a-6a0c-494d-8697-6e2dedde1020', 
'dbbcbbaa-5048-4ade-a631-e7d16b9b9351', 
'demo$selector3id', 
'demo$selector2id', 
'idx_demo$selector3_selector2_demo$selector2_demo$selector3');
INSERT INTO "mendixsystem$unique_constraint" ("name", 
"table_id", 
"column_id")
 VALUES ('uniq_demo$selector3_selector2_demo$selector3id', 
'b557134b-cb63-4f4e-a17c-197cdd71005f', 
'1f7f6180-cd22-384f-8792-250ddeb463c5');
CREATE TABLE "demo$selector2" (
	"id" BIGINT NOT NULL,
	"otherdata" VARCHAR_IGNORECASE(200) NULL,
	"dataname" VARCHAR_IGNORECASE(200) NULL,
	PRIMARY KEY("id"));
INSERT INTO "mendixsystem$entity" ("id", 
"entity_name", 
"table_name")
 VALUES ('dbbcbbaa-5048-4ade-a631-e7d16b9b9351', 
'Demo.Selector2', 
'demo$selector2');
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('dc553913-d134-4573-ac64-64de5bcdfc92', 
'dbbcbbaa-5048-4ade-a631-e7d16b9b9351', 
'otherData', 
'otherdata', 
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
 VALUES ('3a3f64ad-1b69-4896-bf75-f6aa25773774', 
'dbbcbbaa-5048-4ade-a631-e7d16b9b9351', 
'dataName', 
'dataname', 
30, 
200, 
'', 
false);
CREATE TABLE "demo$selector2_selector1" (
	"demo$selector2id" BIGINT NOT NULL,
	"demo$selector1id" BIGINT NOT NULL,
	PRIMARY KEY("demo$selector2id","demo$selector1id"),
	CONSTRAINT "uniq_demo$selector2_selector1_demo$selector2id" UNIQUE ("demo$selector2id"));
CREATE INDEX "idx_demo$selector2_selector1_demo$selector1_demo$selector2" ON "demo$selector2_selector1" ("demo$selector1id" ASC,"demo$selector2id" ASC);
INSERT INTO "mendixsystem$association" ("id", 
"association_name", 
"table_name", 
"parent_entity_id", 
"child_entity_id", 
"parent_column_name", 
"child_column_name", 
"index_name")
 VALUES ('c93e1ad1-f1c1-4263-8a24-0869b95eaada', 
'Demo.Selector2_Selector1', 
'demo$selector2_selector1', 
'dbbcbbaa-5048-4ade-a631-e7d16b9b9351', 
'a515366e-98e8-4df8-9f25-27210965a358', 
'demo$selector2id', 
'demo$selector1id', 
'idx_demo$selector2_selector1_demo$selector1_demo$selector2');
INSERT INTO "mendixsystem$unique_constraint" ("name", 
"table_id", 
"column_id")
 VALUES ('uniq_demo$selector2_selector1_demo$selector2id', 
'c93e1ad1-f1c1-4263-8a24-0869b95eaada', 
'96a27e44-c96f-3d2d-8971-0345c0e8069b');
CREATE TABLE "widgets$project" (
	"id" BIGINT NOT NULL,
	"projectname" VARCHAR_IGNORECASE(200) NULL,
	"projectcode" VARCHAR_IGNORECASE(200) NULL,
	PRIMARY KEY("id"));
INSERT INTO "mendixsystem$entity" ("id", 
"entity_name", 
"table_name")
 VALUES ('b08a597b-a941-4351-9b80-7e120494c958', 
'Widgets.Project', 
'widgets$project');
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('f96366a1-1764-47cc-852e-793193499bcf', 
'b08a597b-a941-4351-9b80-7e120494c958', 
'ProjectName', 
'projectname', 
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
 VALUES ('a70f6b4d-c848-4374-8b9a-f0fc2690371a', 
'b08a597b-a941-4351-9b80-7e120494c958', 
'ProjectCode', 
'projectcode', 
30, 
200, 
'', 
false);
CREATE TABLE "demo$baseselector" (
	"id" BIGINT NOT NULL,
	"selector1" VARCHAR_IGNORECASE(200) NULL,
	"selector2" VARCHAR_IGNORECASE(200) NULL,
	"selector3" VARCHAR_IGNORECASE(200) NULL,
	"submetaobjectname" VARCHAR_IGNORECASE(255) NULL,
	PRIMARY KEY("id"));
CREATE INDEX "idx_demo$baseselector_submetaobjectname" ON "demo$baseselector" ("submetaobjectname" ASC,"id" ASC);
INSERT INTO "mendixsystem$entity" ("id", 
"entity_name", 
"table_name")
 VALUES ('9c8d258b-9188-486c-b1fd-9db1d2962156', 
'Demo.BaseSelector', 
'demo$baseselector');
INSERT INTO "mendixsystem$attribute" ("id", 
"entity_id", 
"attribute_name", 
"column_name", 
"type", 
"length", 
"default_value", 
"is_auto_number")
 VALUES ('bb533642-5260-4013-9a4d-532d87dd5f60', 
'9c8d258b-9188-486c-b1fd-9db1d2962156', 
'Selector1', 
'selector1', 
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
 VALUES ('0ac9680f-f163-4455-97be-0e552aa35e18', 
'9c8d258b-9188-486c-b1fd-9db1d2962156', 
'Selector2', 
'selector2', 
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
 VALUES ('e601657b-bdf5-4864-9e31-0657535128b2', 
'9c8d258b-9188-486c-b1fd-9db1d2962156', 
'Selector3', 
'selector3', 
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
 VALUES ('fe74e91b-ec5b-3d8f-b110-ab80434d4cd0', 
'9c8d258b-9188-486c-b1fd-9db1d2962156', 
'submetaobjectname', 
'submetaobjectname', 
30, 
255, 
'Demo.BaseSelector', 
false);
INSERT INTO "mendixsystem$index" ("id", 
"table_id", 
"index_name")
 VALUES ('db94b1f8-f641-3e46-8d1a-b422a1d0e84c', 
'9c8d258b-9188-486c-b1fd-9db1d2962156', 
'idx_demo$baseselector_submetaobjectname');
INSERT INTO "mendixsystem$index_column" ("index_id", 
"column_id", 
"sort_order", 
"ordinal")
 VALUES ('db94b1f8-f641-3e46-8d1a-b422a1d0e84c', 
'fe74e91b-ec5b-3d8f-b110-ab80434d4cd0', 
false, 
0);
CREATE TABLE "demo$baseselector_selector2" (
	"demo$baseselectorid" BIGINT NOT NULL,
	"demo$selector2id" BIGINT NOT NULL,
	PRIMARY KEY("demo$baseselectorid","demo$selector2id"),
	CONSTRAINT "uniq_demo$baseselector_selector2_demo$baseselectorid" UNIQUE ("demo$baseselectorid"));
CREATE INDEX "idx_demo$baseselector_selector2_demo$selector2_demo$baseselector" ON "demo$baseselector_selector2" ("demo$selector2id" ASC,"demo$baseselectorid" ASC);
INSERT INTO "mendixsystem$association" ("id", 
"association_name", 
"table_name", 
"parent_entity_id", 
"child_entity_id", 
"parent_column_name", 
"child_column_name", 
"index_name")
 VALUES ('ae1cc059-8944-45cf-9ed1-9be49adaae56', 
'Demo.BaseSelector_Selector2', 
'demo$baseselector_selector2', 
'9c8d258b-9188-486c-b1fd-9db1d2962156', 
'dbbcbbaa-5048-4ade-a631-e7d16b9b9351', 
'demo$baseselectorid', 
'demo$selector2id', 
'idx_demo$baseselector_selector2_demo$selector2_demo$baseselector');
INSERT INTO "mendixsystem$unique_constraint" ("name", 
"table_id", 
"column_id")
 VALUES ('uniq_demo$baseselector_selector2_demo$baseselectorid', 
'ae1cc059-8944-45cf-9ed1-9be49adaae56', 
'1784d3e1-51c8-358b-ae4d-03e4d91e3414');
CREATE TABLE "demo$baseselector_selector1" (
	"demo$baseselectorid" BIGINT NOT NULL,
	"demo$selector1id" BIGINT NOT NULL,
	PRIMARY KEY("demo$baseselectorid","demo$selector1id"),
	CONSTRAINT "uniq_demo$baseselector_selector1_demo$baseselectorid" UNIQUE ("demo$baseselectorid"));
CREATE INDEX "idx_demo$baseselector_selector1_demo$selector1_demo$baseselector" ON "demo$baseselector_selector1" ("demo$selector1id" ASC,"demo$baseselectorid" ASC);
INSERT INTO "mendixsystem$association" ("id", 
"association_name", 
"table_name", 
"parent_entity_id", 
"child_entity_id", 
"parent_column_name", 
"child_column_name", 
"index_name")
 VALUES ('17684311-c577-448c-92a1-05e13422e10b', 
'Demo.BaseSelector_Selector1', 
'demo$baseselector_selector1', 
'9c8d258b-9188-486c-b1fd-9db1d2962156', 
'a515366e-98e8-4df8-9f25-27210965a358', 
'demo$baseselectorid', 
'demo$selector1id', 
'idx_demo$baseselector_selector1_demo$selector1_demo$baseselector');
INSERT INTO "mendixsystem$unique_constraint" ("name", 
"table_id", 
"column_id")
 VALUES ('uniq_demo$baseselector_selector1_demo$baseselectorid', 
'17684311-c577-448c-92a1-05e13422e10b', 
'7a51567c-00f1-370a-acce-dfaf6497e12c');
CREATE TABLE "demo$baseselector_selector3" (
	"demo$baseselectorid" BIGINT NOT NULL,
	"demo$selector3id" BIGINT NOT NULL,
	PRIMARY KEY("demo$baseselectorid","demo$selector3id"),
	CONSTRAINT "uniq_demo$baseselector_selector3_demo$baseselectorid" UNIQUE ("demo$baseselectorid"));
CREATE INDEX "idx_demo$baseselector_selector3_demo$selector3_demo$baseselector" ON "demo$baseselector_selector3" ("demo$selector3id" ASC,"demo$baseselectorid" ASC);
INSERT INTO "mendixsystem$association" ("id", 
"association_name", 
"table_name", 
"parent_entity_id", 
"child_entity_id", 
"parent_column_name", 
"child_column_name", 
"index_name")
 VALUES ('2260e53e-66c8-4811-b517-32ab05f59524', 
'Demo.BaseSelector_Selector3', 
'demo$baseselector_selector3', 
'9c8d258b-9188-486c-b1fd-9db1d2962156', 
'89b8578a-6a0c-494d-8697-6e2dedde1020', 
'demo$baseselectorid', 
'demo$selector3id', 
'idx_demo$baseselector_selector3_demo$selector3_demo$baseselector');
INSERT INTO "mendixsystem$unique_constraint" ("name", 
"table_id", 
"column_id")
 VALUES ('uniq_demo$baseselector_selector3_demo$baseselectorid', 
'2260e53e-66c8-4811-b517-32ab05f59524', 
'81d71b63-c7e5-39ea-9595-29155ca79f34');
UPDATE "mendixsystem$version"
 SET "versionnumber" = '4.2', 
"lastsyncdate" = '20181118 09:34:03';
