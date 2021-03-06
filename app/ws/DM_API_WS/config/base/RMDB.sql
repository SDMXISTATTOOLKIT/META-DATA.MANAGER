IF OBJECT_ID('Settings', 'U') IS NOT NULL drop table Settings;
IF OBJECT_ID('MetadataAttribute', 'U') IS NOT NULL  drop table MetadataAttribute;
IF OBJECT_ID('Annotation', 'U') IS NOT NULL drop table Annotation;
IF OBJECT_ID('AnnotationType', 'U') IS NOT NULL drop table AnnotationType;
IF OBJECT_ID('TargetIdentifier', 'U') IS NOT NULL drop table TargetIdentifier;
IF OBJECT_ID('TargetIdentifierType', 'U') IS NOT NULL drop table TargetIdentifierType;
IF OBJECT_ID('Report', 'U') IS NOT NULL drop table Report;
IF OBJECT_ID('ReportState', 'U') IS NOT NULL drop table ReportState;
IF OBJECT_ID('Target', 'U') IS NOT NULL drop table Target;
IF OBJECT_ID('MetadataSet', 'U') IS NOT NULL drop table MetadataSet;
IF OBJECT_ID('AnnotationsGroup', 'U') IS NOT NULL drop table AnnotationsGroup;
IF OBJECT_ID('TranslatableItemValues', 'U') IS NOT NULL drop table TranslatableItemValues;
IF OBJECT_ID('TranslatableItems', 'U') IS NOT NULL drop table TranslatableItems;
IF OBJECT_ID('TranslatableItemFormat', 'U') IS NOT NULL drop table TranslatableItemFormat;

CREATE TABLE Settings(
	[RKey] [nvarchar](255) NOT NULL,
	[RValue] [nvarchar](max) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[RKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY];

/****** Object:  Table Annotation    Script Date: 08/02/2019 12:05:43 ******/
CREATE TABLE Annotation(
	[Id] [int] NOT NULL,
	[AnnotationGroupId] [int] NOT NULL,
	[AnnotationTypeId] [int] NOT NULL,
	[AnnotationId] [nvarchar](50) NULL,
	[AnnotationTitle] [int] NULL,
	[AnnotationURL] [nvarchar](255) NULL,
	[AnnotationTextId] [int] NULL,
 CONSTRAINT [PK_Annotation] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY];

CREATE TABLE AnnotationsGroup(
	[Id] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

/****** Object:  Table AnnotationType    Script Date: 08/02/2019 12:05:43 ******/
CREATE TABLE AnnotationType(
	[Id] [int] NOT NULL,
	[Type] [nvarchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY];

/****** Object:  Table MetadataAttribute    Script Date: 08/02/2019 12:05:43 ******/
CREATE TABLE MetadataAttribute(
	[Id] [int] NOT NULL,
	[AttributeName] [nvarchar](50) NOT NULL,
	[ReportId] [int] NOT NULL,
	[ParentAttributeId] [int] NULL,
	[ValueId] [int] NULL,
	[AnnotationsId] [int] NULL,
	[IsPresentational] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY];

/****** Object:  Table MetadataSet    Script Date: 08/02/2019 12:05:43 ******/ 
CREATE TABLE MetadataSet(
	[Id] [int] NOT NULL,
	[NameId] [int] NOT NULL,
	[MetadataflowId] [nvarchar](50) NOT NULL,
	[MetadataflowAgency] [nvarchar](50) NOT NULL,
	[MetadataflowVersion] [nvarchar](50) NOT NULL,
	[ReportingBegin] [date] NULL,
	[ReportingEnd] [date] NULL,
	[ValidFrom] [date] NULL,
	[ValidTo] [date] NULL,
	[MSDId] [nvarchar](50) NOT NULL,
	[MSDAgency] [nvarchar](50) NOT NULL,
	[MSDVersion] [nvarchar](50) NOT NULL,
	[IsFinal] [bit] NULL,
	[PublicationYear] [smallint] NULL,
	[PublicationPeriod] [nvarchar](50) NULL,
	[AnnotationsId] [int] NULL,
	[ReferenceId] [nvarchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[ReferenceId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY];

/****** Object:  Table Report    Script Date: 08/02/2019 12:05:43 ******/
CREATE TABLE Report(
	[Id] [int] NOT NULL,
	[MetadasetId] [int] NOT NULL,
	[TargetId] [int] NOT NULL,
	[StateId] [int] NOT NULL DEFAULT 2,
	[ReferenceId] [nvarchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[MetadasetId] ASC,[ReferenceId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY];

/****** Object:  Table ReportState    Script Date: 08/02/2019 12:05:43 ******/
CREATE TABLE ReportState(
	[Id] [int] NOT NULL,
	[StateName] [nchar](255) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

/****** Object:  Table Target    Script Date: 08/02/2019 12:05:43 ******/
CREATE TABLE Target(
	[Id] [int] NOT NULL,
	[TargetName] [nchar](255) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY];

/****** Object:  Table TargetIdentifier    Script Date: 08/02/2019 12:05:43 ******/
CREATE TABLE TargetIdentifier(
	[Id] [int] NOT NULL,
	[TargetId] [int] NOT NULL,
	[TargetIdentifierTypeId] [int] NULL,
	[Name] [nvarchar](50) NOT NULL,
	[Value] [nvarchar](255) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY];

/****** Object:  Table TargetIdentifierType    Script Date: 08/02/2019 12:05:43 ******/
CREATE TABLE TargetIdentifierType(
	[Id] [int] NOT NULL,
	[Name] [nvarchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY];

/****** Object:  Table TranslatableItemFormat    Script Date: 08/02/2019 12:05:43 ******/
CREATE TABLE TranslatableItemFormat(
	[Id] [int] NOT NULL,
	[Type] [nvarchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[Type] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY];

/****** Object:  Table TranslatableItems    Script Date: 08/02/2019 12:05:43 ******/
CREATE TABLE TranslatableItems(
	[Id] [int] NOT NULL,
	[ValueTypeId] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY];

/****** Object:  Table TranslatableItemValues]    Script Date: 08/02/2019 12:05:43 ******/
CREATE TABLE TranslatableItemValues(
	[ValueId] [int] NOT NULL,
	[Language] [varchar](3) NOT NULL,
	[Value] [nvarchar](max) NOT NULL,
 CONSTRAINT [PK_TranslatableItemValues] PRIMARY KEY CLUSTERED 
(
	[ValueId] ASC,
	[Language] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY];

ALTER TABLE Annotation  WITH CHECK ADD  CONSTRAINT [FK_Annotation_ToAnnotationGroup] FOREIGN KEY([AnnotationGroupId])
REFERENCES AnnotationsGroup ([Id])
ON DELETE CASCADE;

ALTER TABLE Annotation CHECK CONSTRAINT [FK_Annotation_ToAnnotationGroup];

ALTER TABLE Annotation  WITH CHECK ADD  CONSTRAINT [FK_Annotation_ToAnnotationType] FOREIGN KEY([AnnotationTypeId])
REFERENCES AnnotationType ([Id]);

ALTER TABLE Annotation CHECK CONSTRAINT [FK_Annotation_ToAnnotationType];

ALTER TABLE Annotation  WITH CHECK ADD  CONSTRAINT [FK_Annotation_ToTitleTextTranslation] FOREIGN KEY([AnnotationTextId])
REFERENCES TranslatableItems ([Id]);

ALTER TABLE Annotation CHECK CONSTRAINT [FK_Annotation_ToTitleTextTranslation];

ALTER TABLE Annotation  WITH CHECK ADD  CONSTRAINT [FK_Annotation_ToTitleTranslation] FOREIGN KEY([AnnotationTitle])
REFERENCES TranslatableItems ([Id]);

ALTER TABLE Annotation CHECK CONSTRAINT [FK_Annotation_ToTitleTranslation];

ALTER TABLE MetadataAttribute  WITH CHECK ADD  CONSTRAINT [FK_EntityAttribute_ToMetadataAttribute] FOREIGN KEY([ParentAttributeId])
REFERENCES MetadataAttribute ([Id]);

ALTER TABLE MetadataAttribute CHECK CONSTRAINT [FK_EntityAttribute_ToMetadataAttribute];

ALTER TABLE MetadataAttribute  WITH CHECK ADD  CONSTRAINT [FK_EntityAttribute_ToReport] FOREIGN KEY([ReportId])
REFERENCES Report ([Id])
ON DELETE CASCADE;

ALTER TABLE MetadataAttribute CHECK CONSTRAINT [FK_EntityAttribute_ToReport];

ALTER TABLE MetadataAttribute  WITH CHECK ADD  CONSTRAINT [FK_MetadataAttribute_ToAnnotations] FOREIGN KEY([AnnotationsId])
REFERENCES AnnotationsGroup ([Id]);

ALTER TABLE MetadataAttribute CHECK CONSTRAINT [FK_MetadataAttribute_ToAnnotations];

ALTER TABLE MetadataAttribute  WITH CHECK ADD  CONSTRAINT [FK_MetadataAttribute_ToTranslatableItems] FOREIGN KEY([ValueId])
REFERENCES TranslatableItems ([Id]);

ALTER TABLE MetadataAttribute CHECK CONSTRAINT [FK_MetadataAttribute_ToTranslatableItems];

ALTER TABLE MetadataSet  WITH CHECK ADD  CONSTRAINT [FK_MetadataSet_ToAnnotations] FOREIGN KEY([AnnotationsId])
REFERENCES AnnotationsGroup ([Id]);

ALTER TABLE MetadataSet CHECK CONSTRAINT [FK_MetadataSet_ToAnnotations];

ALTER TABLE MetadataSet WITH CHECK ADD  CONSTRAINT [FK_MetadataSet_ToNameValue] FOREIGN KEY([NameId])
REFERENCES TranslatableItems ([Id]);

ALTER TABLE MetadataSet CHECK CONSTRAINT [FK_MetadataSet_ToNameValue];

ALTER TABLE Report WITH CHECK ADD  CONSTRAINT [FK_Report_ToMetadataSet] FOREIGN KEY([MetadasetId])
REFERENCES MetadataSet ([Id])
ON DELETE CASCADE;

ALTER TABLE Report CHECK CONSTRAINT [FK_Report_ToMetadataSet];

ALTER TABLE Report  WITH CHECK ADD  CONSTRAINT [FK_Report_ToTarget] FOREIGN KEY([TargetId])
REFERENCES Target ([Id]);

ALTER TABLE Report CHECK CONSTRAINT [FK_Report_ToTarget];

ALTER TABLE Report  WITH CHECK ADD  CONSTRAINT [FK_Report_ReportState] FOREIGN KEY(StateId)
REFERENCES ReportState ([Id]);

ALTER TABLE Report CHECK CONSTRAINT [FK_Report_ReportState];

ALTER TABLE TargetIdentifier  WITH CHECK ADD  CONSTRAINT [FK_TargetIdentifier_ToTarget] FOREIGN KEY([TargetId])
REFERENCES Target ([Id])
ON DELETE CASCADE;

ALTER TABLE TargetIdentifier CHECK CONSTRAINT [FK_TargetIdentifier_ToTarget];

ALTER TABLE TargetIdentifier  WITH CHECK ADD  CONSTRAINT [FK_TargetIdentifier_ToTargetIdentifierType] FOREIGN KEY([TargetIdentifierTypeId])
REFERENCES TargetIdentifierType ([Id]);

ALTER TABLE TargetIdentifier CHECK CONSTRAINT [FK_TargetIdentifier_ToTargetIdentifierType];

ALTER TABLE TranslatableItems  WITH CHECK ADD  CONSTRAINT [FK_TranslatableItems_ToTranslatableItemFormat] FOREIGN KEY([ValueTypeId])
REFERENCES TranslatableItemFormat ([Id]);

ALTER TABLE TranslatableItems CHECK CONSTRAINT [FK_TranslatableItems_ToTranslatableItemFormat]

ALTER TABLE TranslatableItemValues  WITH CHECK ADD  CONSTRAINT [FK_Values_ToTranslatableItems] FOREIGN KEY([ValueId])
REFERENCES TranslatableItems ([Id])
ON DELETE CASCADE;

ALTER TABLE TranslatableItemValues CHECK CONSTRAINT [FK_Values_ToTranslatableItems]

/****** Object:  Trigger Trigger_Annotation    Script Date: 08/02/2019 12:05:43 ******/
GO
CREATE TRIGGER Trigger_Annotation
    ON Annotation
    AFTER  DELETE    AS
    BEGIN
        SET NoCount ON
		Delete FROM TranslatableItems  WHERE TranslatableItems.Id IN (SELECT AnnotationTextId FROM deleted);
		Delete FROM TranslatableItems  WHERE TranslatableItems.Id IN (SELECT AnnotationTitle FROM deleted);
    END
GO
ALTER TABLE Annotation ENABLE TRIGGER [Trigger_Annotation]
GO
/****** Object:  Trigger Trigger_MetadataAttribute_after    Script Date: 08/02/2019 12:05:43 ******/

CREATE TRIGGER [Trigger_MetadataAttribute_after]
    ON MetadataAttribute
    AFTER DELETE
    AS
    BEGIN
        SET NoCount ON
		Delete FROM Annotation  WHERE Annotation.Id IN (SELECT AnnotationsId FROM deleted);
		Delete FROM AnnotationsGroup  WHERE AnnotationsGroup.Id IN (SELECT AnnotationsId FROM deleted);
		Delete FROM TranslatableItems  WHERE TranslatableItems.Id IN (SELECT ValueId FROM deleted);
    END
GO
ALTER TABLE MetadataAttribute ENABLE TRIGGER [Trigger_MetadataAttribute_after]
GO
/****** Object:  Trigger Trigger_MetadataAttribute_before    Script Date: 08/02/2019 12:05:43 ******/

CREATE TRIGGER [Trigger_MetadataSet]
    ON MetadataSet
    AFTER DELETE
    AS
    BEGIN
        SET NoCount ON
		Delete FROM AnnotationsGroup  WHERE AnnotationsGroup.Id IN (SELECT AnnotationsId FROM deleted);
		Delete FROM TranslatableItems  WHERE TranslatableItems.Id IN (SELECT NameId FROM deleted);
		Delete FROM MetadataAttribute  WHERE MetadataAttribute.ParentAttributeId IS NOT NULL AND  MetadataAttribute.ParentAttributeId  IN (SELECT Id FROM deleted);
    END
GO
ALTER TABLE MetadataSet ENABLE TRIGGER [Trigger_MetadataSet]
GO
/****** Object:  Trigger Trigger_Report    Script Date: 08/02/2019 12:05:43 ******/

CREATE TRIGGER [Trigger_Report]
    ON Report
    AFTER DELETE
    AS
    BEGIN
        SET NoCount ON
		Delete FROM [Target]  WHERE [Target].Id IN (SELECT TargetId FROM deleted);
    END
GO
ALTER TABLE Report ENABLE TRIGGER [Trigger_Report]
GO

