"""
Description : BAN Identification for ...
Creation Date: 07/02/2025
Created by: Atul Soam
Script Requirements: NA
Input Bans File: NA
Credentials File: ''
Functional Reference Document Name: 
Version: 1.3
Modified Date: 
Modified By: 
Modifications: Flask executor compatible via execution_id
"""

import base64
import datetime
import logging
import os
import sys
import time
import pandas as pd
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

# ===========================
# Logging Configuration
# ===========================
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# ===========================
# Constants & Defaults
# ===========================
MAX_RETRIES = 5
RETRY_DELAY = 5
ScriptCollectionName = ""  # or set dynamically

# ===========================
# Decode Base64 Credentials
# ===========================
def decode_base64(encoded_str):
    return base64.b64decode(encoded_str).decode('utf-8')

final_password = decode_base64("Ym1wX3VzZXIxMjMh")
final_user = decode_base64("QUQyOTMyMA==")

# ===========================
# Mongo Connections
# ===========================
def connect_with_retry(uri, label="MongoClient"):
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            logging.info(f"Connecting to {label} (Attempt {attempt}/{MAX_RETRIES})...")
            client = MongoClient(uri, serverSelectionTimeoutMS=5000)
            client.admin.command('ping')
            logging.info(f"Connected to {label} successfully.")
            return client
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            logging.warning(f"Failed to connect to {label}: {e}")
            if attempt < MAX_RETRIES:
                time.sleep(RETRY_DELAY)
            else:
                logging.critical(f"All retries failed for {label}. Exiting.")
                raise SystemExit(1)

# MongoDB URI setup
connStrDict = {
    'TEST1': 'mongodb://BMOM_app:BM_app_Aug!167@vlmddmong01.dev.intranet:26000,vlmddmong02.dev.intranet:26000,vlmddmong03.dev.intranet:26000/BMP_ORDERMGMT_1?readPreference=secondaryPreferred&replicaSet=MONGODB_E2E&authSource=admin&minPoolSize=2',
    'TEST2': 'mongodb://BMOM_app:BM_app_Aug!167@vlmddmong01.dev.intranet:26000,vlmddmong02.dev.intranet:26000,vlmddmong03.dev.intranet:26000/BMP_ORDERMGMT_2?readPreference=primaryPreferred&replicaSet=MONGODB_E2E&authSource=admin&minPoolSize=2',
    'TEST4': 'mongodb://BMOM_app:BM_app_Aug!167@vlmddmong01.dev.intranet:26000,vlmddmong02.dev.intranet:26000,vlmddmong03.dev.intranet:26000/BMP_ORDERMGMT_4?readPreference=secondaryPreferred&replicaSet=MONGODB_E2E&authSource=admin&minPoolSize=2',
    'DEVSI4': 'mongodb://BMOM_app:BM_app_Wd!912@vlmddmong02.dev.intranet:11000/mongodb://BMP_rep:BMP_rep_ctl123@bluem-mongo-prod-01.corp.intranet:14000/BMP_TOMORCHESTRATOR_1?authSource=admin?authSource=admin',
    'PROD': f'mongodb://{final_user}:{final_password}@bluem-mongo-prod-01.corp.intranet:14000/BMP_ORDERMGMT_1?authSource=admin',
    'DEVSI2': 'mongodb://BMOM_app:BM_app_Wd!912@vlmddmong02.dev.intranet:11000/BMP_ORDERMGMT_2?authSource=admin',
    'PET1': 'mongodb://BMP_dba:BMP_dba_ctl123@vlmddmong04.dev.intranet:24000'
}

client = connect_with_retry(connStrDict['PROD'], label="PROD Mongo")
client1 = connect_with_retry(connStrDict['PET1'], label="PET1 Mongo")
analytics_db = client1["PROD_BM_ANALYTICS"]
ScriptCollection = analytics_db.get_collection(ScriptCollectionName)

# ===========================
# Core Functions
# ===========================
def order_to_check(ban):
    collection = client['BMP_ORDERMGMT_1'].customerOrder
    orders = list(collection.find({'accountInfo.ban': ban}).sort('orderDate', -1))
    for order in orders:
        site_order = order['siteOrders'][-1]['orderReference']
        if site_order['siteOrderType'] == "DISCONNECT" and site_order['siteOrderStatus'] in ["DISCONNECTED", "COMPLETED"]:
            return {}
        if site_order['siteOrderStatus'].upper() == "COMPLETED":
            return order
    return {}

def reporting(data):
    existing = ScriptCollection.find_one({"ban": data["ban"]})
    if not existing:
        ScriptCollection.insert_one(data)
        logging.info(f"Inserted new data for BAN: {data['ban']}")
    else:
        ScriptCollection.update_one({"ban": data["ban"]}, {"$set": data})
        logging.info(f"Updated data for BAN: {data['ban']}")

def check_order_doc(ban):
    result = {'ban': ban, "Script_ran_date": str(datetime.date.today())}
    try:
        order = order_to_check(ban)
        if not order:
            return {}

        siteOrders = order['siteOrders'][-1]
        orderReference = siteOrders['orderReference']
        locationAttributes = siteOrders['orderDocument']['serviceAddress']['locationAttributes']

        location = {'CENTURYLINK': 'LC', 'QWEST COMMUNICATIONS': 'LQ'}.get(locationAttributes.get('legacyProvider', ''), '')
        company_map = {'1': 'Lumen', '4': 'Bright Speed'}
        company = company_map.get(order['accountInfo']['companyOwnerId'], '')

        if company == 'Bright Speed':
            return {}

        result.update({
            "siteOrderNumber": orderReference.get('siteOrderNumber'),
            "orderReferenceNumber": orderReference.get('orderReferenceNumber'),
            "siteOrderType": orderReference.get('siteOrderType'),
            "siteOrderStatus": orderReference.get('siteOrderStatus'),
            "SourceSystem": orderReference.get('sourceSystem'),
            "orderDate": order.get('orderDate'),
            "legacyProvider": location,
            "Company": company,
            "FinalDueDate": siteOrders['orderDocument']['schedule']['dates']['finalDueDate'],
            "salesChannel": order.get('salesChannel')
        })
        return result

    except Exception as e:
        logging.error(f"Error processing BAN {ban}: {e}")
        return {}

def process_ban(ban):
    report = check_order_doc(ban)
    if report:
        reporting(report)

def extract_ban_data():
    query = {"accountInfo.companyOwnerId": "1"}
    cursor = client['BMP_ORDERMGMT_1'].customerOrder.find(query)
    for count, order in enumerate(cursor, start=1):
        ban = order['accountInfo']['ban']
        logging.info(f"[{count}] Processing BAN: {ban}")
        process_ban(ban)

def process_pet1():
    cursor = client1['PROD_BM_ANALYTICS'].PRB0004863_Identification.find()
    for count, doc in enumerate(cursor, start=1):
        ban = doc.get("ban")
        logging.info(f"[{count}] Processing BAN from PET1: {ban}")
        process_ban(ban)

def process_excel(input_file="input_.xlsx"):
    df = pd.read_excel(input_file)
    for idx, row in df.iterrows():
        ban = str(row['ban'])
        logging.info(f"[Excel] Processing BAN: {ban}")
        process_ban(ban)

# ===========================
# For Script Executor Use
# ===========================
def process_by_execution_id(exec_id):
    """
    Called when script is executed by the Flask executor.
    Uses execution ID to read bans from a known collection.
    """
    count = 0

    try:
        flag = False
        startTime = time.time()
        for order in client['BMP_ORDERMGMT_1'].customerOrder.find():

            ban = order['accountInfo']['ban']
            print(f"count -->  {count}")
            print(f"ban --> {ban}")
            count = count + 1
            report_dict = check_order_doc(ban)
            if report_dict != {}:
                report_dict["ScriptidentificationId"] = str(exec_id)

                reporting(report_dict)
            currentTime = time.time()
            if currentTime - startTime >= 30:
                flag = True
                startTime = currentTime
            if flag:
                check = list(
                    ScriptCollection.find(
                        {"otherDetail": "processedAccounts","ScriptidentificationId":str(exec_id)}))
                if len(check) != 0:
                    ScriptCollection.update_one({"_id": check[0]["_id"]},                                                                                       {"$set": {
"totalProcessedAccounts": count}})
                else:
                    ScriptCollection.insert_one(
                        {"otherDetail": "processedAccounts", "totalProcessedAccounts": count,"ScriptidentificationId":str(exec_id)})
                flag = False

    except Exception as e:
        print(f"Exception in main -> {e}")
        check = list(
            ScriptCollection.find({"otherDetail": "processedAccounts","ScriptidentificationId":str(exec_id)}))
        if len(check) != 0:
            ScriptCollection.update_one({"_id": check[0]["_id"]},
                                                                               {"$set": {
                                                                                   "totalProcessedAccounts": count,
                                                                                   "Error": str(e)}})
        else:
            ScriptCollection.insert_one(
                {"otherDetail": "processedAccounts", "totalProcessedAccounts": count, "Error": str(e),"ScriptidentificationId":str(exec_id)})

# ===========================
# Entry Point
# ===========================
def main(execution_id=None):
    logging.info(f"Script Execution Started: {datetime.datetime.now()}")

    if execution_id:
        # Triggered from Flask executor
        process_by_execution_id(execution_id)
        return
    else:
        # Interactive mode
        action = input("Enter source of input [ban, excel, db, pet]: ").strip().lower()
        if action == 'ban':
            ban = input("Enter BAN: ").strip()
            process_ban(ban)
        elif action == 'excel':
            process_excel()
        elif action == 'db':
            extract_ban_data()
        elif action == 'pet':
            process_pet1()
        else:
            logging.warning("Invalid input option.")

    logging.info(f"Script Execution Completed: {datetime.datetime.now()}")

# Execute if run directly
if __name__ == "__main__":
    main()
