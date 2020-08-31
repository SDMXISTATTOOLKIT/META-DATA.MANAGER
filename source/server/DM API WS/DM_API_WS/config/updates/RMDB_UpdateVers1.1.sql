CREATE TABLE Settings(
	[RKey] [nvarchar](255) NOT NULL,
	[RValue] [nvarchar](max) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[RKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

go

ALTER TABLE TargetIdentifier
ALTER COLUMN [TargetIdentifierTypeId] [int] NULL;

go

INSERT Settings (RKey, RValue) VALUES (N'RM_DB_VERSION', N'1.1');

go