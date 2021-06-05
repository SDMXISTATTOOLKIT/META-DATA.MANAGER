- version 1.5.1 or later - for updating the enviroment from a software version previous to 1.5.1 the following steps must be done:
	1) execute the following query in the AUTHDB: 
		DELETE FROM AUTH_DB_CONNECTION;
		DELETE FROM AUTH_CONNECTION_STRING;

	2) save the node from the Node - Configuration page
	
- for updating the enviroment from a software version previous to 1.5.3 the main\app\ws\DM_API_WS\config\base\DDB2_upload_TIME_PERIOD.sql script must be executed in the DDB. 
  The same script should be executed when using a version previous to 1.5.3 with datasets with not annual frequency referencing year 2021 or later.