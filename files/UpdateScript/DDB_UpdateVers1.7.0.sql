ALTER TABLE ComponentMapping
  ADD MappingType varchar(50)
GO
  
UPDATE ComponentMapping
SET MappingType = 'Default'
GO

ALTER TABLE ComponentMapping
  ALTER COLUMN MappingType varchar(50) not null
GO
  
ALTER TABLE ComponentMapping
  ALTER COLUMN ColumnName nvarchar(255) null
GO
  
ALTER TABLE ComponentMapping
  ADD Expression nvarchar(max)
GO

ALTER TABLE Mapping
  ADD XmlFilePath nvarchar(max)
GO

/* Database version */
update DDB_VERSION SET MINOR = 4
GO
