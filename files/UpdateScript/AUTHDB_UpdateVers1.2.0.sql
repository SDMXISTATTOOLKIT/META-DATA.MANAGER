IF (NOT EXISTS (SELECT * FROM ACCESS_RULE
                WHERE RULE_NAME = 'CanManageWorkingAnnotation'))
BEGIN
    INSERT INTO [ACCESS_RULE] (RULE_NAME) VALUES ('CanManageWorkingAnnotation')
END