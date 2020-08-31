/*    This SQL DDL script was generated by Microsoft Visual Studio (Release Date: LOCAL BUILD). */

/*    Driver Used : Microsoft Visual Studio - Microsoft SQL Server Driver.                    */
/*    Document    : \\titano\Progetti\SistanHub\Progettazione\Auth DB_EXT_v2.vsd.             */
/*    Time Created: 18 February 2019 15:42.                                                   */
/*    Operation   : From Visio Generate Wizard.                                               */
/*    Connected data source : No connection.                                                  */
/*    Connected server      : No connection.                                                  */
/*    Connected database    : Not applicable.                                                 */



SET QUOTED_IDENTIFIER ON

go


/* Create new table "AUTH_CONNECTION_STRING".                                                 */
/* "AUTH_CONNECTION_STRING" : Tabella per le stringhe di connessione a un db                  */
/* 	"CONNECTION_ID" : Id della connessione                                                    */
/* 	"DB_NAME" : Nome del DB                                                                   */
/* 	"DB_TYPE" : Tipo del DB                                                                   */
/* 	"NAME" : Nome della connessione                                                           */
/* 	"DB_PASSWORD" : Password per accedere al DB                                               */
/* 	"DB_PORT" : Porta del DB                                                                  */
/* 	"DB_SERVER" : Server dove risiede il DB                                                   */
/* 	"DB_USER" : Username per accedere al DB                                                   */
/* 	"ADO_CONNECTION_STRING" : ADO connection del DB                                           */  
create table "AUTH_CONNECTION_STRING" ( 
	"CONNECTION_ID" bigint identity not null,
	"DB_NAME" varchar(1000) not null,
	"DB_TYPE" varchar(50) not null,
	"NAME" varchar(50) not null,
	"DB_PASSWORD" varchar(50) null,
	"DB_PORT" int null,
	"DB_SERVER" varchar(100) null,
	"DB_USER" varchar(50) null,
	"ADO_CONNECTION_STRING" varchar(2000) null)  

go

alter table "AUTH_CONNECTION_STRING"
	add constraint "AUTH_CONNECTION_STRING_PK" primary key ("CONNECTION_ID")   


go


/* Create new table "AUTH_DB_CONNECTION".                                                     */
/* "AUTH_DB_CONNECTION" : Modella le stringhe di connessione di un nodo                       */
/* 	"MSDB_CONN" : Id della stringa di connessione al MSDB                                     */
/* 	"DDB_CONN" : Id della stringa di connessione al DDB                                       */
/* 	"RMDB_CONN" : Id della stringa di connessione al RMDB                                     */  
/* 	"MA_SID" : Sid da utilizzare per il MA WS                                    			  */  
create table "AUTH_DB_CONNECTION" ( 
	"MSDB_CONN" bigint not null,
	"DDB_CONN" bigint not null,
	"RMDB_CONN" bigint not null,
	"MA_SID" nvarchar(100) not null)  

go

alter table "AUTH_DB_CONNECTION"
	add constraint "AUTH_DB_CONNECTION_PK" primary key ("MSDB_CONN", "DDB_CONN", "RMDB_CONN")   


go

/* Create new table "AUTH_USER_AGENCY".                                                       */
/* "AUTH_USER_AGENCY" : Tabella che mette in relazione un utente con le agency su cui ha accesso */
/* 	"USER_ID" : Id dell'utente                                                                */
/* 	"AG_ID" : Id dell'agency                                                                  */  
create table "AUTH_USER_AGENCY" ( 
	"USER_ID" bigint not null,
	"AG_ID" int not null)  

go

alter table "AUTH_USER_AGENCY"
	add constraint "AUTH_USER_AGENCY_PK" primary key ("USER_ID", "AG_ID")   


go


/* Create new table "AUTH_AGENCY".                                                            */
/* "AUTH_AGENCY" : Tabella contenente le agency                                               */
/* 	"AG_ID" : Id dell'agency                                                                  */
/* 	"ID_MSDB" : Identificativo dell'agency nel MSDB (es. IT1)                                 */  
create table "AUTH_AGENCY" ( 
	"AG_ID" int identity not null,
	"ID_MSDB" varchar(150) not null)  

go

alter table "AUTH_AGENCY"
	add constraint "AUTH_AGENCY_PK" primary key ("AG_ID")   


go

/* Create new table "AUTH_CATEGORY".                                                          */
/* "AUTH_CATEGORY" : Tabella contenente le category (definite in modo gerarchico)             */
/* 	"CAT_ID" : Id della categoria                                                             */
/* 	"ID_MSDB" : Identificativo della category nel MSDB (es. DDB_DOM_1_18)                     */
/* 	"PARENT_CAT_ID" : Eventuale id della categoria padre                                      */  
create table "AUTH_CATEGORY" ( 
	"CAT_ID" int identity not null,
	"ID_MSDB" varchar(150) not null,
	"PARENT_CAT_ID" int null)  

go

alter table "AUTH_CATEGORY"
	add constraint "AUTH_CATEGORY_PK" primary key ("CAT_ID")   


go

/* Create new table "AUTH_CUBE".                                                              */
/* "AUTH_CUBE" : Tabella contenentei cubi                                                     */
/* 	"CUBE_ID" : Id dell'agency                                                                */
/* 	"CODE" : Identificativo del cubo (assegnato dall'utente)                                  */
/* 	"CAT_ID" : Id della category a cui il cubo � assegnato                                    */  
create table "AUTH_CUBE" ( 
	"CUBE_ID" int identity not null,
	"CODE" nvarchar(50) not null,
	"CAT_ID" int not null)  

go

alter table "AUTH_CUBE"
	add constraint "AUTH_CUBE_PK" primary key ("CUBE_ID")   


go

/* Create new table "AUTH_FUNCTIONALITY".                                                     */
/* "AUTH_FUNCTIONALITY" : Tabella contenente le funzionalit� dell'applicativo (definite in modo gerarchico) */
/* 	"FUNCT_ID" : Id dell'agency                                                               */
/* 	"FUNCT_NAME" : Nome della funzionalit�                                                    */
/* 	"PARENT_FUNCT_ID" : Eventuale id della funzionalit� padre (in una visualizzazione gerarchica) */  
create table "AUTH_FUNCTIONALITY" ( 
	"FUNCT_ID" int identity not null,
	"FUNCT_NAME" varchar(150) not null,
	"PARENT_FUNCT_ID" int null)  

go

alter table "AUTH_FUNCTIONALITY"
	add constraint "AUTH_FUNCTIONALITY_PK" primary key ("FUNCT_ID")   


go

/* Create new table "AUTH_USER_FUNCTIONALITY".                                                */
/* "AUTH_USER_FUNCTIONALITY" : Tabella che mette in relazione un utente con le funzionalit� su cui ha accesso */
/* 	"USER_ID" : Id dell'utente                                                                */
/* 	"FUNCT_ID" : Id della funzioanlit�                                                        */  
create table "AUTH_USER_FUNCTIONALITY" ( 
	"USER_ID" bigint not null,
	"FUNCT_ID" int not null)  

go

alter table "AUTH_USER_FUNCTIONALITY"
	add constraint "AUTH_USER_FUNCTIONALITY_PK" primary key ("USER_ID", "FUNCT_ID")   


go

/* Create new table "AUTH_USER_CATEGORY".                                                     */
/* "AUTH_USER_CATEGORY" : Tabella che mette in relazione un utente con le categorie su cui ha accesso */
/* 	"USER_ID" : Id dell'utente                                                                */
/* 	"CAT_ID" : Id della categoria                                                             */  
create table "AUTH_USER_CATEGORY" ( 
	"USER_ID" bigint not null,
	"CAT_ID" int not null)  

go

alter table "AUTH_USER_CATEGORY"
	add constraint "AUTH_USER_CATEGORY_PK" primary key ("USER_ID", "CAT_ID")   


go

/* Create new table "AUTH_USER_CUBE".                                                         */
/* "AUTH_USER_CUBE" : Tabella che mette in relazione un utente con i cubi su cui ha accesso   */
/* 	"USER_ID" : Id dell'utente                                                                */
/* 	"CUBE_ID" : Id dell'agency                                                                */
/* 	"FLG_IS_OWNER" : Vale true se l'utente � il proprietario (ovvero il creatore) del cubo    */  
create table "AUTH_USER_CUBE" ( 
	"USER_ID" bigint not null,
	"CUBE_ID" int not null,
	"FLG_IS_OWNER" bit not null)  

go

alter table "AUTH_USER_CUBE"
	add constraint "AUTH_USER_CUBE_PK" primary key ("USER_ID", "CUBE_ID")   


go

/* Create new table "AUTH_USER_DATA".                                                         */
/* "AUTH_USER_DATA" : Tabella per le informazioni aggiuntive su un utente che estende la tabella base SRI_USER (non modificabile)   */
/* 	"USER_ID" : Id dell'utente                                                                */
/* 	"Email" : Email dell'utente                                                               */
create table "AUTH_USER_DATA" ( 
	"USER_ID" bigint not null,
	"Email" varchar(255) null)  

go

alter table "AUTH_USER_DATA"
	add constraint "AUTH_USER_DATA_PK" primary key ("USER_ID")   


go

/* Add foreign key constraints to table "AUTH_DB_CONNECTION".                                 */
alter table "AUTH_DB_CONNECTION"
	add constraint "AUTH_CONNECTION_STRING_AUTH_DB_CONNECTION_FK1" foreign key (
		"DDB_CONN")
	 references "AUTH_CONNECTION_STRING" (
		"CONNECTION_ID") on update no action on delete no action  

go

alter table "AUTH_DB_CONNECTION"
	add constraint "AUTH_CONNECTION_STRING_AUTH_DB_CONNECTION_FK2" foreign key (
		"RMDB_CONN")
	 references "AUTH_CONNECTION_STRING" (
		"CONNECTION_ID") on update no action on delete no action  

go

alter table "AUTH_DB_CONNECTION"
	add constraint "AUTH_CONNECTION_STRING_AUTH_DB_CONNECTION_FK3" foreign key (
		"MSDB_CONN")
	 references "AUTH_CONNECTION_STRING" (
		"CONNECTION_ID") on update no action on delete no action  

go

/* Add foreign key constraints to table "AUTH_USER_AGENCY".                                   */
alter table "AUTH_USER_AGENCY"
	add constraint "SRI_USER_AUTH_USER_AGENCY_FK1" foreign key (
		"USER_ID")
	 references "SRI_USER" (
		"ID") on update no action on delete cascade  

go

alter table "AUTH_USER_AGENCY"
	add constraint "AUTH_AGENCY_AUTH_USER_AGENCY_FK1" foreign key (
		"AG_ID")
	 references "AUTH_AGENCY" (
		"AG_ID") on update no action on delete no action  

go

/* Add foreign key constraints to table "AUTH_CATEGORY".                                      */
alter table "AUTH_CATEGORY"
	add constraint "AUTH_CATEGORY_AUTH_CATEGORY_FK1" foreign key (
		"PARENT_CAT_ID")
	 references "AUTH_CATEGORY" (
		"CAT_ID") on update no action on delete no action  

go

/* Add foreign key constraints to table "AUTH_CUBE".                                          */
alter table "AUTH_CUBE"
	add constraint "AUTH_CATEGORY_AUTH_CUBE_FK1" foreign key (
		"CAT_ID")
	 references "AUTH_CATEGORY" (
		"CAT_ID") on update no action on delete no action  

go

/* Add foreign key constraints to table "AUTH_FUNCTIONALITY".                                 */
alter table "AUTH_FUNCTIONALITY"
	add constraint "AUTH_FUNCTIONALITY_AUTH_FUNCTIONALITY_FK1" foreign key (
		"PARENT_FUNCT_ID")
	 references "AUTH_FUNCTIONALITY" (
		"FUNCT_ID") on update no action on delete no action  

go

/* Add foreign key constraints to table "AUTH_USER_FUNCTIONALITY".                            */
alter table "AUTH_USER_FUNCTIONALITY"
	add constraint "SRI_USER_AUTH_USER_FUNCTIONALITY_FK1" foreign key (
		"USER_ID")
	 references "SRI_USER" (
		"ID") on update no action on delete cascade  

go

alter table "AUTH_USER_FUNCTIONALITY"
	add constraint "AUTH_FUNCTIONALITY_AUTH_USER_FUNCTIONALITY_FK1" foreign key (
		"FUNCT_ID")
	 references "AUTH_FUNCTIONALITY" (
		"FUNCT_ID") on update no action on delete no action  

go

/* Add foreign key constraints to table "AUTH_USER_CATEGORY".                                 */
alter table "AUTH_USER_CATEGORY"
	add constraint "AUTH_CATEGORY_AUTH_USER_CATEGORY_FK1" foreign key (
		"CAT_ID")
	 references "AUTH_CATEGORY" (
		"CAT_ID") on update no action on delete no action  

go

alter table "AUTH_USER_CATEGORY"
	add constraint "SRI_USER_AUTH_USER_CATEGORY_FK1" foreign key (
		"USER_ID")
	 references "SRI_USER" (
		"ID") on update no action on delete cascade 

go

/* Add foreign key constraints to table "AUTH_USER_CUBE".                                     */
alter table "AUTH_USER_CUBE"
	add constraint "SRI_USER_AUTH_USER_CUBE_FK1" foreign key (
		"USER_ID")
	 references "SRI_USER" (
		"ID") on update no action on delete cascade 

go

alter table "AUTH_USER_CUBE"
	add constraint "AUTH_CUBE_AUTH_USER_CUBE_FK1" foreign key (
		"CUBE_ID")
	 references "AUTH_CUBE" (
		"CUBE_ID") on update no action on delete no action  

go

/* Add foreign key constraints to table "AUTH_USER_DATA".                                     */
alter table "AUTH_USER_DATA"
	add constraint "SRI_USER_AUTH_USER_DATA_FK1" foreign key (
		"USER_ID")
	 references "SRI_USER" (
		"ID") on update no action on delete cascade 

go

CREATE TABLE [AUTH_USER_ENTITY](
	[USER_ID] [bigint] NOT NULL,
	[ENTITY_ID] [int] NOT NULL,
	[IsOwner] [bit] NOT NULL,
 CONSTRAINT [PK_AUTH_USER_ENTITY] PRIMARY KEY CLUSTERED 
(
	[USER_ID] ASC,
	[ENTITY_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [AUTH_USER_ENTITY] ADD  CONSTRAINT [DF_AUTH_USER_ENTITY_IsOwner]  DEFAULT ((0)) FOR [IsOwner]
GO

CREATE TABLE [ENTITY](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[Identifier] [varchar](250) NULL,
	[Type] [varchar](50) NULL,
 CONSTRAINT [PK_ENTITY] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

/* Add foreign key constraints to table "AUTH_USER_ENTITY".                                     */
alter table AUTH_USER_ENTITY
	add constraint "SRI_USER_AUTH_USER_ENTITY_FK1" foreign key (
		"USER_ID")
	 references "SRI_USER" (
		"ID") on update no action on delete cascade 

GO