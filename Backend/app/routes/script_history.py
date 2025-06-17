from flask import request, jsonify,send_file
from app.routes import script_routes
from app import mongo
from app.services.script_service import getcollectionDetails
from datetime import datetime
import json
import pandas as pd
import io

@script_routes.route("/getscriptHistory", methods=["GET"])
def script_history():
    try:
        # Pagination
        page = int(request.args.get("page", 0))
        pageSize = int(request.args.get("pageSize", 50))
        filters = json.loads(request.args.get("filters", "{}"))

        # Build query
        query = {}

        status = filters.get("status")
        if status and status.lower() != "all":
            query["status"] = status.capitalize()

        script_type = filters.get("scriptType")
        if script_type and script_type.lower() != "all":
            query["scriptType"] = script_type

        search_term = filters.get("searchTerm")
        if search_term:
            query["script"] = {"$regex": search_term, "$options": "i"}

        from_date = filters.get("fromDate")
        to_date = filters.get("toDate")
        if from_date and to_date:
            from_dt = datetime.strptime(from_date, "%Y-%m-%d")
            to_dt = datetime.strptime(to_date, "%Y-%m-%d")
            query["startTime"] = {"$gte": from_dt, "$lte": to_dt}

        # Total count
        total_count = mongo.db.RunningScript.count_documents(query)

        # Pagination query
        cursor = (
            mongo.db.RunningScript.find(query)
            .sort("startTime", -1)
            .skip(page * pageSize)
            .limit(pageSize)
        )

        result = []
        for doc in cursor:
            fixed = not_fixed = total = processed = 0
            if doc["status"] == "Running":
                fixed, not_fixed, total, processed = getcollectionDetails(
                    doc["collectionName"], doc["_id"]
                )
            else:
                fixed = doc["statusList"].get("Fixed", 0)
                not_fixed = doc["statusList"].get("Not Fixed", 0)
                total = doc["statusList"].get("Total", 0)
                processed = doc["statusList"].get("processedAccounts", 0)

            item = {
                "id": str(doc["_id"]),
                "name": doc.get("script", ""),
                "status": doc.get("status", ""),
                "type": doc.get("scriptType", ""),
                "startTime": doc.get("startTime").strftime("%Y-%m-%d %H:%M:%S") if doc.get("startTime") else "",
                "endTime": doc.get("endTime").strftime("%Y-%m-%d %H:%M:%S") if doc.get("endTime") else "",
                "fixed": fixed,
                "notFixed": not_fixed,
                "total": total,
                "processed": processed
            }

            result.append(item)

        # NEW: Fetch distinct scriptType and status values
        distinct_script_types = mongo.db.RunningScript.distinct("scriptType")
        distinct_statuses = mongo.db.RunningScript.distinct("status")

        return jsonify(
            data=result,
            totalCount=total_count,
            scriptTypes=[v for v in distinct_script_types if v],  # clean None
            statuses=[v for v in distinct_statuses if v]
        )

    except Exception as e:
        print(f"Exception in /getscriptHistory --> {str(e)}")
        return jsonify(error=str(e)), 500



@script_routes.route("/exportScriptData", methods=["POST"])
def export_script_data():
    try:
        data = request.get_json()
        collection_name = data.get("collectionName")
        script_id = data.get("scriptId")
        status = data.get("status","all")  # Optional, can be used to filter
        if not script_id:
            return jsonify({"error": "scriptId is required"}), 400
        if not collection_name:
            return jsonify({"error": "collectionName is required"}), 400
        query = {}
        if status and status.lower() != "all":
            query["status"] = status
        query["ScriptidentificationId"] = script_id
        # Fetch full data from the specified collection
        documents = list(mongo.db[collection_name].find(query))

        if not documents:
            return jsonify({"error": "No data found in the specified collection."}), 404

        # Convert documents to DataFrame
        df = pd.DataFrame(documents)

        # Categorize into separate dataframes
        df_fixed = df[df["status"] == "Fixed"]
        df_not_fixed = df[df["status"] == "Not Fixed"]

        # Prepare Excel in memory
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df_fixed.to_excel(writer, sheet_name="Fixed", index=False)
            df_not_fixed.to_excel(writer, sheet_name="Not Fixed", index=False)
            df.to_excel(writer, sheet_name="All Data", index=False)

        output.seek(0)

        return send_file(
            output,
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            as_attachment=True,
            download_name=f"{collection_name}_export.xlsx"
        )

    except Exception as e:
        print(f"Error in export_script_data: {e}")
        return jsonify({"error": str(e)}), 500


@script_routes.route("/getScriptDataByType", methods=["POST"])
def get_script_data_by_type():
    try:
        data = request.json
        collection_name = data.get("collectionName")
        script_id = data.get("scriptId")
        filter_type = data.get("type")  # "Fixed", "Not Fixed", or "All"

        if not collection_name or not script_id or not filter_type:
            return jsonify({"error": "Missing required parameters"}), 400

        collection = mongo.db[collection_name]

        query = {"ScriptidentificationId": script_id}
        if filter_type != "All":
            query["status"] = filter_type

        docs = list(collection.find(query, {"_id": 0}))  # hide MongoDB _id

        return jsonify(data=docs)

    except Exception as e:
        print(f"Error in /getScriptDataByType: {str(e)}")
        return jsonify({"error": str(e)}), 500
