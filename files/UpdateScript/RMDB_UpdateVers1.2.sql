ALTER TRIGGER Trigger_MetadataAttribute_after
    ON MetadataAttribute
    AFTER DELETE
    AS
    BEGIN
        SET NoCount ON
		Delete FROM Annotation  WHERE Annotation.Id IN (SELECT AnnotationsId FROM deleted);
		Delete FROM AnnotationsGroup  WHERE AnnotationsGroup.Id IN (SELECT AnnotationsId FROM deleted);
		Delete FROM TranslatableItems  WHERE TranslatableItems.Id IN (SELECT ValueId FROM deleted);
    END
	
go
	
INSERT ReportState (Id, StateName) VALUES (4, N'DRAFT')
DELETE FROM Settings WHERE RKey = 'RM_DB_VERSION'
INSERT Settings (RKey, RValue) VALUES (N'RM_DB_VERSION', N'1.2')

go