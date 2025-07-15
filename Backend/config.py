class Config:
    SECRET_KEY = 'SecerateKeyForYourApp'
    MONGO_URI = 'mongodb://BMP_dba:BMP_dba_ctl123@vlmddmong04.dev.intranet:24000/ScriptManagmentTest1?authSource=admin'

    # Database names
    ANALYTICS_DB = 'PROD_BM_ANALYTICS'
    SCRIPT_DB = 'ScriptManagmentTest1'

    USERS_COLLECTION = 'ScriptManagmentUsers'
    LOGS_COLLECTION = 'ScriptLogs'
    SCRIPTS_COLLECTION = 'AllScript'
    SCHEDULES_COLLECTION = 'ScheduledJobs'
    SCRIPTS_EXECUTION_COLLECTION = 'RunningScript'
    ADMIN_CONTROLLS = "AdminControlls"
    CATEGORY_SUB_CATEGORY = "categorySubCategory"
    EMAIL_RECORD = "EmailRecordsScriptMGMT"
    EMAIL_CONFIG = "EmailConfig"
    FRONTEND_URL = "http://localhost:5173"

