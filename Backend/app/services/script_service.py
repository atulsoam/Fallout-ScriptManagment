from app import mongo

def getcollectionDetails(collection, requestedScript):
    collectionOutput_fixed = 0
    collectionOutput_pending = 0
    collectionOutput_total = 0
    totalProcessedAccounts = 0
    requestedScript = str(requestedScript)

    try:
        collectionOutput_fixed = list(
            mongo.db[collection].find({"status": "Fixed", "ScriptidentificationId": requestedScript})
        )
        collectionOutput_pending = list(
            mongo.db[collection].find({"status": "Not Fixed", "ScriptidentificationId": requestedScript})
        )
        collectionOutput_total = list(
            mongo.db[collection].find({"ScriptidentificationId": requestedScript})
        )
        processedAccounts = list(
            mongo.db[collection].find({"otherDetail": "processedAccounts", "ScriptidentificationId": requestedScript})
        )

        if processedAccounts:
            totalProcessedAccounts = processedAccounts[0].get("totalProcessedAccounts", 0)

        return (
            len(collectionOutput_fixed),
            len(collectionOutput_pending),
            len(collectionOutput_total),
            totalProcessedAccounts,
        )

    except Exception as e:
        print(f"Exception in getcollectionDetails --> {str(e)}")
        return collectionOutput_fixed, collectionOutput_pending, collectionOutput_total, totalProcessedAccounts
