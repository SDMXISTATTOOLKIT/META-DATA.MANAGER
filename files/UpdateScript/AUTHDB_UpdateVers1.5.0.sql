INSERT INTO [AUTH_FUNCTIONALITY] VALUES
('attribute-file', NULL), ('update-databrowser-cache', NULL)


UPDATE [AUTH_FUNCTIONALITY]
SET PARENT_FUNCT_ID = q.FUNCT_ID
FROM(	SELECT FUNCT_ID
		FROM [AUTH_FUNCTIONALITY]
		WHERE FUNCT_NAME = 'data-manager')q
WHERE FUNCT_NAME IN ('attribute-file','update-databrowser-cache')