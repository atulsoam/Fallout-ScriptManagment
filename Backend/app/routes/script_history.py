from flask import request, jsonify,send_file,session
from app.routes import script_routes
from app import mongo
from app.services.script_service import getcollectionDetails
from datetime import datetime,timedelta
import json
import pandas as pd
import io
import traceback

@script_routes.route("/getscriptHistory", methods=["GET"])
def script_history():
    """
    Get script execution history with filters and pagination.
    ---
    tags:
      - ScriptHistory
    parameters:
      - in: header
        name: X-CUID
        type: string
        required: false
        description: User CUID
      - in: query
        name: page
        type: integer
        required: false
        description: Page number (default 0)
      - in: query
        name: pageSize
        type: integer
        required: false
        description: Page size (default 50)
      - in: query
        name: filters
        type: string
        required: false
        description: JSON string with filters (status, scriptType, searchTerm, fromDate, toDate)
      - in: query
        name: sortField
        type: string
        required: false
        description: Field to sort by (default startTime)
      - in: query
        name: sortOrder
        type: integer
        required: false
        description: Sort order (-1 for DESC, 1 for ASC)
    responses:
      200:
        description: Script history data
        schema:
          type: object
          properties:
            data:
              type: array
              items:
                type: object
            totalCount:
              type: integer
            scriptTypes:
              type: array
              items:
                type: string
            statuses:
              type: array
              items:
                type: string
            pagination:
              type: object
              properties:
                page:
                  type: integer
                pageSize:
                  type: integer
      400:
        description: Invalid parameters
      500:
        description: Internal server error
    """
    try:
        # --- Pagination & Filters ---
        # print(session["user"])
        cuid = (
                    request.headers.get("X-CUID")
                    or request.headers.get("X-Approver")
                    or request.headers.get("X-Requested-By")
                )
        try:
            page = int(request.args.get("page", 0))
            pageSize = int(request.args.get("pageSize", 50))
        except ValueError:
            return jsonify(error="Invalid pagination parameters"), 400

        try:
            filters = json.loads(request.args.get("filters", "{}"))
        except json.JSONDecodeError:
            return jsonify(error="Invalid filters format"), 400

        sort_field = request.args.get("sortField", "startTime")
        sort_order = int(request.args.get("sortOrder", -1))  # -1 for DESC, 1 for ASC
            
        query = {}
    
        print("cuid came",cuid)
        if cuid:
            query["user"] = cuid

        # --- Filter by Status ---
        status = filters.get("status")
        if status and status.lower() != "all":
            query["status"] = status.capitalize()

        # --- Filter by Script Type ---
        script_type = filters.get("scriptType")
        if script_type and script_type.lower() != "all":
            query["scriptType"] = script_type

        # --- Search Term ---
        search_term = filters.get("searchTerm")
        if search_term:
            query["script"] = {"$regex": search_term, "$options": "i"}

        # --- Date Filtering ---
        from_date = filters.get("fromDate")
        to_date = filters.get("toDate")
        if from_date and to_date:
            try:
                from_dt = datetime.strptime(from_date, "%Y-%m-%d")
                to_dt = datetime.strptime(to_date, "%Y-%m-%d") + timedelta(days=1) - timedelta(seconds=1)  # Inclusive
                query["startTime"] = {"$gte": from_dt, "$lte": to_dt}
            except ValueError:
                return jsonify(error="Invalid date format. Use YYYY-MM-DD"), 400

        # --- Count Total Results ---
        total_count = mongo.db.RunningScript.count_documents(query)

        # --- Data Retrieval with Sorting ---
        cursor = (
            mongo.db.RunningScript.find(query)
            .sort(sort_field, sort_order)
            .skip(page * pageSize)
            .limit(pageSize)
        )

        result = []
        for doc in cursor:
            fixed = not_fixed = total = processed = 0
            try:
                if doc.get("status") == "Running":
                    fixed, not_fixed, total, processed = getcollectionDetails(
                        doc.get("collectionName", ""), doc["_id"]
                    )
                else:
                    status_list = doc.get("statusList", {})
                    fixed = status_list.get("Fixed", 0)
                    not_fixed = status_list.get("Not Fixed", 0)
                    total = status_list.get("Total", 0)
                    processed = status_list.get("processedAccounts", 0)
            except Exception:
                # In case getcollectionDetails or field access fails
                pass

            result.append({
                "id": str(doc.get("_id")),
                "name": doc.get("script", ""),
                "status": doc.get("status", ""),
                "type": doc.get("scriptType", ""),
                "subType": doc.get("scriptSubType", ""),
                "user": doc.get("user", ""),
                "executedFrom": doc.get("ExecutedFrom", ""),
                "startTime": doc.get("startTime").strftime("%Y-%m-%d %H:%M:%S") if doc.get("startTime") else "",
                "endTime": doc.get("endTime").strftime("%Y-%m-%d %H:%M:%S") if doc.get("endTime") else "",
                "fixed": fixed,
                "notFixed": not_fixed,
                "total": total,
                "processed": processed,
                "duration": float(doc.get("Duration", 0)),
            })

        # --- Fetch Distinct Values for Filters ---
        script_types = [v for v in mongo.db.RunningScript.distinct("scriptType") if v]
        statuses = [v for v in mongo.db.RunningScript.distinct("status") if v]

        return jsonify({
            "data": result,
            "totalCount": total_count,
            "scriptTypes": script_types,
            "statuses": statuses,
            "pagination": {
                "page": page,
                "pageSize": pageSize
            }
        })

    except Exception as e:
        print("Exception in /getscriptHistory -->", str(e))
        traceback.print_exc()
        return jsonify(error="Internal server error", details=str(e)), 500


@script_routes.route("/exportScriptData", methods=["POST"])
def export_script_data():
    """
    Export script data as Excel file.
    ---
    tags:
      - ScriptHistory
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            collectionName:
              type: string
              example: "MyCollection"
            scriptId:
              type: string
              example: "60d..."
            status:
              type: string
              example: "all"
    responses:
      200:
        description: Excel file with script data
        schema:
          type: string
          format: binary
      400:
        description: Missing parameters
      404:
        description: No data found
      500:
        description: Server error
    """
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
        """
    Get script data by type (Fixed, Not Fixed, All).
    ---
    tags:
      - ScriptHistory
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            collectionName:
              type: string
              example: "MyCollection"
            scriptId:
              type: string
              example: "60d..."
            type:
              type: string
              example: "Fixed"
    responses:
      200:
        description: Filtered script data
        schema:
          type: object
          properties:
            data:
              type: array
              items:
                type: object
      400:
        description: Missing parameters
      500:
        description: Server error
    """
        data = request.json
        collection_name = data.get("collectionName")
        script_id = data.get("scriptId")
        filter_type = data.get("type")  # "Fixed", "Not Fixed", or "All"

        if not collection_name or not script_id or not filter_type:
            return jsonify({"error": "Missing required parameters"}), 400

        # collection = mongo.db[collection_name]
        StatusDb = mongo.cx['PROD_BM_ANALYTICS']
        collection = StatusDb[collection_name]  # Use the custom database
        query = {"ScriptidentificationId": script_id}
        if filter_type != "All":
            query["status"] = filter_type

        docs = list(collection.find(query, {"_id": 0}))  # hide MongoDB _id

        return jsonify(data=docs)

    except Exception as e:
        print(f"Error in /getScriptDataByType: {str(e)}")
        return jsonify({"error": str(e)}), 500




@script_routes.route('/downloadScriptLogs', methods=['POST'])
def download_script_logs():
    """
    Download logs for a script execution as a text file.
    ---
    tags:
      - ScriptHistory
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            execId:
              type: string
              example: "60d..."
    responses:
      200:
        description: Log file
        schema:
          type: string
          format: binary
      400:
        description: execId is required
      404:
        description: No logs found
      500:
        description: Server error
    """
    data = request.get_json()
    exec_id = data.get("execId")

    if not exec_id:
        return jsonify({"error": "execId is required"}), 400

    try:
        # Step 1: Fetch all log documents with the given exec_id
        docs = list(mongo.db.ScriptLogs.find({"exec_id": exec_id}))
        if not docs:
            return jsonify({"error": "No logs found for this execId"}), 404

        # Step 2: Merge and sort all lines by timestamp
        all_lines = []
        for doc in docs:
            all_lines.extend(doc.get("lines", []))

        all_lines.sort(key=lambda x: x.get("timestamp"))

        # Step 3: Create log text
        log_text = "\n".join([f"[{line['timestamp']}] {line['text']}" for line in all_lines])

        # Step 4: Return as downloadable file
        file_stream = io.BytesIO()
        file_stream.write(log_text.encode("utf-8"))
        file_stream.seek(0)

        filename = f"script_logs_{exec_id}.txt"
        return send_file(
            file_stream,
            as_attachment=True,
            download_name=filename,
            mimetype="text/plain"
        )
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500


