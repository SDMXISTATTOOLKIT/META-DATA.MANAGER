/* Create new table "UploadOps".                                                              */
/* "UploadOps" : Tabella per gestire le operazioni di upload concorrenti sullo stesso cubo    */
/* 	"IDCube" : Id del cubo                                                                    */
/* 	"UploadDate" : Data di inizio dell'operazione di caricamento                              */  
create table "UploadOps" ( 
	"IDCube" int not null,
	"UploadDate" datetime not null)  

go

alter table "UploadOps"
	add constraint "UploadOps_PK" primary key ("IDCube", "UploadDate")   


go

/* Add foreign key constraints to table "UploadOps".                                          */
alter table "UploadOps"
	add constraint "CatCube_UploadOps_FK1" foreign key (
		"IDCube")
	 references "CatCube" (
		"IDCube") on update no action on delete no action  

go

/* Alter table CatDataflow */
alter table "CatDataFlow" drop constraint "UQ_DF_Key"

alter table CatDataflow
alter column ID nvarchar(50)

alter table CatDataflow
alter column Agency nvarchar(50)

alter table CatDataflow
alter column Filter nvarchar(max)

alter table "CatDataFlow" add constraint "UQ_DF_Key" unique (
	"Agency",
	"ID",
	"Version") 

go

/* Database version */
update DDB_VERSION SET MINOR = 2

go
