"""
Description : BAN Identification for ....
Creation Date- 07/02/2025
Created by - Atul Soam
scripts requirements - NA
input bans file - NA
Credentials file - ''
Functional reference document name :
version : 1
Modified Date :
Modified By :
Modifications :
"""
import base64
# Importing libraries

import json
import datetime
import sys
import requests

from pymongo import MongoClient
import time
import os
import pandas as pd

env = 'PROD'
env1 = 'PET1'

# Prod write credential
# decrypt user and password
password = "Ym1wX3VzZXIxMjMh"
decpwd = base64.b64decode(password)
final_password = decpwd.decode("utf-8")

user = "QUQyOTMyMA=="
decuser = base64.b64decode(user)
final_user = decuser.decode("utf-8")

connStrDict = {
    'TEST1': 'mongodb://BMOM_app:BM_app_Aug!167@vlmddmong01.dev.intranet:26000,vlmddmong02.dev.intranet:26000,vlmddmong03.dev.intranet:26000/BMP_ORDERMGMT_1?readPreference=secondaryPreferred&replicaSet=MONGODB_E2E&authSource=admin&minPoolSize=2',
    'TEST2': 'mongodb://BMOM_app:BM_app_Aug!167@vlmddmong01.dev.intranet:26000,vlmddmong02.dev.intranet:26000,vlmddmong03.dev.intranet:26000/BMP_ORDERMGMT_2?readPreference=primaryPreferred&replicaSet=MONGODB_E2E&authSource=admin&minPoolSize=2',
    'TEST4': 'mongodb://BMOM_app:BM_app_Aug!167@vlmddmong01.dev.intranet:26000,vlmddmong02.dev.intranet:26000,vlmddmong03.dev.intranet:26000/BMP_ORDERMGMT_4?readPreference=secondaryPreferred&replicaSet=MONGODB_E2E&authSource=admin&minPoolSize=2',
    'DEVSI4': 'mongodb://BMOM_app:BM_app_Wd!912@vlmddmong02.dev.intranet:11000/mongodb://BMP_rep:BMP_rep_ctl123@bluem-mongo-prod-01.corp.intranet:14000/BMP_TOMORCHESTRATOR_1?authSource=admin?authSource=admin',
    'PROD': f'mongodb://{final_user}:{final_password}@bluem-mongo-prod-01.corp.intranet:14000/BMP_ORDERMGMT_1?authSource=admin',
    'DEVSI2': 'mongodb://BMOM_app:BM_app_Wd!912@vlmddmong02.dev.intranet:11000/BMP_ORDERMGMT_2?authSource=admin',
    'PET1': 'mongodb://BMP_dba:BMP_dba_ctl123@vlmddmong04.dev.intranet:24000'
}

client = MongoClient(connStrDict[env])
client1 = MongoClient(connStrDict[env1])
PROD_BM_ANALYTICSDb = client1["PROD_BM_ANALYTICS"]
ScriptCollectionName = ""
ScriptCollection = PROD_BM_ANALYTICSDb.get_collection(ScriptCollectionName)

def Order_to_check(ban):
    order_list = list(client['BMP_ORDERMGMT_1'].customerOrder.find({'accountInfo.ban': ban}).sort('orderDate', -1))
    if len(order_list) != 0:
        for order in order_list:
            siteOrderType = order['siteOrders'][-1]['orderReference']['siteOrderType']
            siteOrderStatus = order['siteOrders'][-1]['orderReference']['siteOrderStatus']
            if siteOrderType == "DISCONNECT" and siteOrderStatus in ["DISCONNECTED", "COMPLETED"]:
                return {}
            if siteOrderStatus in ["COMPLETED", "Completed"]:
                return order

    return {}


def reporting(data):
    check = list(ScriptCollection.find({"ban": data["ban"]}))
    if len(check) == 0:
        ScriptCollection.insert_one(data)
        print(f"Data --> {data} has been pushed to {ScriptCollectionName}")
    else:
        ScriptCollection.update_one({"ban": data["ban"]},{"$set":data},upsert=True)
        print(f"Data --> {data} has been updated to {ScriptCollectionName}")


def Check_order_doc(ban):
    Excel_dict = {'ban': ban,
                  "Script_ran_date": str(datetime.date.today()),
                  }
    try:

        order = Order_to_check(ban)
        if order == {}:

            return {}
        siteOrderType = order['siteOrders'][-1]['orderReference']['siteOrderType']
        siteOrderStatus = order['siteOrders'][-1]['orderReference']['siteOrderStatus']
        sourceSystem = order['siteOrders'][-1]['orderReference']['sourceSystem']
        siteOrderNumber = order['siteOrders'][-1]['orderReference']['siteOrderNumber']
        print(
            f'BAN : {ban} - siteOrderNumber : {siteOrderNumber} - siteOrderType : {siteOrderType} - siteOrderStatus : {siteOrderStatus}')
        orderReferenceNumber = order['siteOrders'][-1]['orderReference']['orderReferenceNumber']
        orderdate = order['orderDate']
        legacy_provider = order['siteOrders'][-1]['orderDocument']['serviceAddress']['locationAttributes'][
            'legacyProvider']
        location = ''
        if legacy_provider == 'CENTURYLINK':
            location = 'LC'
        elif legacy_provider == 'QWEST COMMUNICATIONS':
            location = 'LQ'
        companyNameSpy = ''
        if order['accountInfo']['companyOwnerId'] == '1':
            companyNameSpy = 'Lumen'
        elif order['accountInfo']['companyOwnerId'] == '4':
            companyNameSpy = 'Bright Speed'
            return {}

        finalDueDate = order['siteOrders'][-1]['orderDocument']['schedule']["dates"]["finalDueDate"]
        Excel_dict["siteOrderNumber"] = siteOrderNumber
        Excel_dict["orderReferenceNumber"] = orderReferenceNumber
        Excel_dict["siteOrderType"] = siteOrderType
        Excel_dict["siteOrderStatus"] = siteOrderStatus
        Excel_dict["SourceSystem"] = sourceSystem
        Excel_dict["orderDate"] = orderdate
        Excel_dict["legacyProvider"] = location
        Excel_dict["Company"] = companyNameSpy
        Excel_dict["FinalDueDate"] = finalDueDate
        Excel_dict["salesChannel"] = order['salesChannel']


        return {}
    except Exception as e:
        print(e)
        return {}




def extract_ban_data():
    count = 0
    Query = {"accountInfo.companyOwnerId": "1"}
    for order in client['BMP_ORDERMGMT_1'].customerOrder.find(Query).skip(0):
        ban = order['accountInfo']['ban']
        print(f"ban --> {ban}")
        count = count + 1
        print(f"count --> {count}")
        with_ban(ban)


def with_ban(ban):
    report_dict = Check_order_doc(ban)
    if report_dict != {}:
        reporting(report_dict)

def Pet1():
    count = 0
    for doc in client1['PROD_BM_ANALYTICS'].PRB0004863_Identification.find():
        count = count + 1
        print(f"Count --> {count}")
        with_ban(doc["ban"])



if __name__ == "__main__":
    today_date = str(datetime.date.today())
    Action_to_performe = input("Please enter the source of input[ban,excel,db,pet]:")
    if Action_to_performe == 'ban':
        ban = input("Please enter a ban: ")

        with_ban(ban)
    elif Action_to_performe == "excel":
        input_file = "input_.xlsx"
        bans = pd.read_excel(input_file)
        for Ban in range(len(bans)):
            ban = str(bans.loc[Ban, 'ban'])

            print("Working for ban --> ", ban)
            with_ban(ban)

    elif Action_to_performe == 'db':
        extract_ban_data()
    elif Action_to_performe == "pet":
        Pet1()

    # creating output logs

    # checking_order("310142114")
    print(f"-----------------Complete_Script_at_{datetime.datetime.now()}----------------")
