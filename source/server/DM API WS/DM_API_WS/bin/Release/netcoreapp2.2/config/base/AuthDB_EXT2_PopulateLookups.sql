--creazione funzionalità

INSERT INTO [AUTH_FUNCTIONALITY] VALUES
('meta-manager', NULL),
('codelists', NULL),
('concept-schemes', NULL),
('category-schemes', NULL),
('data-structure-definitions', NULL),
('dataflows', NULL),
('categorisations', NULL),
('hierarchical-codelists', NULL),
('agency-schemes', NULL),
('data-provider-schemes', NULL),
('data-consumer-schemes', NULL),
('organization-unit-schemes', NULL),
('content-constraints', NULL),
('structure-sets', NULL),
('provision-agreements', NULL),
('registrations', NULL),
('category-schemes-and-dataflows', NULL),
('data-manager', NULL),
('builder', NULL),
('file-mapping', NULL),
('loader', NULL),
('dataflow-builder', NULL),
('cube-list', NULL),
('manage-series', NULL),
('compare-dsds', NULL),
('upgrade-dsd', NULL),
('synchronize-codelists', NULL),
('ddb-reset', NULL),
('remove-temp-tables', NULL),
('utilities', NULL),
('import-structures', NULL),
('compare-item-schemes', NULL),
('artefact-browser', NULL),
('reference-metadata', NULL),
('metadata-set', NULL),
('dcat-ap-it', NULL),
('users', NULL),
('user-management', NULL),
('permissions', NULL),
('msds', NULL),
('metadataflows', NULL),
('merge-item-schemes', NULL)

UPDATE [AUTH_FUNCTIONALITY]
SET PARENT_FUNCT_ID = q.FUNCT_ID
FROM(	SELECT FUNCT_ID
		FROM [AUTH_FUNCTIONALITY]
		WHERE FUNCT_NAME = 'meta-manager')q
WHERE FUNCT_NAME IN 
('codelists','concept-schemes','category-schemes','data-structure-definitions','dataflows','categorisations','hierarchical-codelists','agency-schemes','data-provider-schemes','data-consumer-schemes','organization-unit-schemes','content-constraints','structure-sets','provision-agreements','registrations','category-schemes-and-dataflows','msds','metadataflows')

UPDATE [AUTH_FUNCTIONALITY]
SET PARENT_FUNCT_ID = q.FUNCT_ID
FROM(	SELECT FUNCT_ID
		FROM [AUTH_FUNCTIONALITY]
		WHERE FUNCT_NAME = 'data-manager')q
WHERE FUNCT_NAME IN 
('builder', 'file-mapping','loader','dataflow-builder','cube-list','manage-series','upgrade-dsd','synchronize-codelists','ddb-reset','remove-temp-tables')

UPDATE [AUTH_FUNCTIONALITY]
SET PARENT_FUNCT_ID = q.FUNCT_ID
FROM(	SELECT FUNCT_ID
		FROM [AUTH_FUNCTIONALITY]
		WHERE FUNCT_NAME = 'utilities')q
WHERE FUNCT_NAME IN ('import-structures','compare-item-schemes','compare-dsds','artefact-browser', 'merge-item-schemes')

UPDATE [AUTH_FUNCTIONALITY]
SET PARENT_FUNCT_ID = q.FUNCT_ID
FROM(	SELECT FUNCT_ID
		FROM [AUTH_FUNCTIONALITY]
		WHERE FUNCT_NAME = 'reference-metadata')q
WHERE FUNCT_NAME IN ('metadata-set','dcat-ap-it')

UPDATE [AUTH_FUNCTIONALITY]
SET PARENT_FUNCT_ID = q.FUNCT_ID
FROM(	SELECT FUNCT_ID
		FROM [AUTH_FUNCTIONALITY]
		WHERE FUNCT_NAME = 'users')q
WHERE FUNCT_NAME IN ('permissions', 'user-management')

--modifica credenziali utente admin e suoi permessi
--UPDATE SRI_USER
--SET PASSWORD = '45C8382CB32887A8510586E875C1267C8A5CFF60FC204D656F4EC355615C0832E3F3A79060B5A4A17A214286658E744B58EBE560D22E81F5EB3E41B165C1682C',
--	SALT = '8DBD253C19FEB9CD33F7A17AB3383403',
--	ALGORITHM = 'SHA-512'
--WHERE USERNAME = 'admin'

INSERT INTO AUTH_USER_FUNCTIONALITY
SELECT u.ID, f.FUNCT_ID
FROM SRI_USER u, AUTH_FUNCTIONALITY f
WHERE USERNAME = 'admin'

INSERT INTO AUTH_USER_DATA
SELECT u.ID, 'admin@gmail.com'
FROM SRI_USER u
WHERE USERNAME = 'admin'

INSERT INTO AUTH_AGENCY VALUES ('INIT_AGENCY')

INSERT INTO AUTH_USER_AGENCY
SELECT u.ID, a.AG_ID
FROM SRI_USER u, AUTH_AGENCY a
WHERE USERNAME = 'admin' AND ID_MSDB = 'INIT_AGENCY'

