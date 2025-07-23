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
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

# ===========================
# Logging Configuration
# ===========================
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# ===========================
# Constants & Defaults
# ===========================
MAX_RETRIES = 5
RETRY_DELAY = 5
ScriptCollectionName = "PRB0004863_Output"  # or set dynamically
MAX_WORKERS = 10  # Number of threads


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

        site_order = order['siteOrders'][-1]
        order_ref = site_order['orderReference']
        location_attrs = site_order['orderDocument']['serviceAddress']['locationAttributes']

        location = {'CENTURYLINK': 'LC', 'QWEST COMMUNICATIONS': 'LQ'}.get(location_attrs.get('legacyProvider', ''), '')
        company_map = {'1': 'Lumen', '4': 'Bright Speed'}
        company = company_map.get(order['accountInfo']['companyOwnerId'], '')

        if company == 'Bright Speed':
            return {}

        result.update({
            "siteOrderNumber": order_ref.get('siteOrderNumber'),
            "orderReferenceNumber": order_ref.get('orderReferenceNumber'),
            "siteOrderType": order_ref.get('siteOrderType'),
            "siteOrderStatus": order_ref.get('siteOrderStatus'),
            "SourceSystem": order_ref.get('sourceSystem'),
            "orderDate": order.get('orderDate'),
            "legacyProvider": location,
            "Company": company,
            "FinalDueDate": site_order['orderDocument']['schedule']['dates']['finalDueDate'],
            "salesChannel": order.get('salesChannel')
        })
        return result

    except Exception as e:
        logging.error(f"Error processing BAN {ban}: {e}")
        return {}

def process_ban(ban,exec_id = None):
    report = check_order_doc(ban)
    if report:
        reporting(report)
# ===========================
# Threaded BAN processing with progress count and logging
# ===========================
def threaded_process_bans(ban_list, max_workers=MAX_WORKERS,exec_id=None):
    processed_count = 0
    lock = threading.Lock()

    def task(ban):
        nonlocal processed_count
        process_ban(ban,exec_id)
        with lock:
            processed_count += 1
            print(f"Processed {processed_count}/{len(ban_list)} BANs", end='\r')
            logging.info(f"Processed {processed_count}/{len(ban_list)} BANs")

    logging.info(f"Starting processing of {len(ban_list)} BANs with {max_workers} threads...")

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [executor.submit(task, ban) for ban in ban_list]
        for future in as_completed(futures):
            future.result()  # raise exceptions if any

    print(f"\nCompleted processing all {len(ban_list)} BANs.")
    logging.info(f"Completed processing all {len(ban_list)} BANs.")

# ===========================
# Extract BANs & process them threaded
# ===========================
def extract_ban_data():
    client = connect_with_retry(connStrDict['PROD'], label="PROD Mongo for extract_ban_data")
    query = {"accountInfo.companyOwnerId": "1"}
    cursor = client['BMP_ORDERMGMT_1'].customerOrder.find(query)
    bans = [order['accountInfo']['ban'] for order in cursor]
    client.close()
    threaded_process_bans(bans)

def process_pet1():
    client1 = connect_with_retry(connStrDict['PET1'], label="PET1 Mongo for process_pet1")
    cursor = client1['PROD_BM_ANALYTICS'].PRB0004863_Identification.find()
    bans = [doc.get("ban") for doc in cursor]
    client1.close()
    threaded_process_bans(bans)

def process_excel(input_file="input_.xlsx"):
    df = pd.read_excel(input_file)
    bans = [str(row['ban']) for idx, row in df.iterrows()]
    threaded_process_bans(bans)

# ===========================
# Flask executor compatibility function
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
        batch = []
        for order in client['BMP_ORDERMGMT_1'].customerOrder.find():

            ban = order['accountInfo']['ban']
            print(f"count -->  {count}")
            print(f"ban --> {ban}")
            count = count + 1
            if ban not in batch:
                batch.append(ban)
                
            if len(batch) >= 100:
                threaded_process_bans(batch,exec_id=exec_id)
                batch.clear()
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
def main(execution_id=None, source=None, input_file=None, ban=None):
    logging.info(f"Script Execution Started: {datetime.datetime.now()}")

    if execution_id:
        # Triggered from Flask executor
        process_by_execution_id(execution_id)
    elif source == "ban" and ban:
        process_ban(ban)
    elif source == "excel":
        process_excel(input_file or "input_.xlsx")
    elif source == "db":
        extract_ban_data()
    elif source == "pet":
        process_pet1()
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
