import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from email.utils import formataddr
from app import mongo,USERS_COLLECTION,EMAIL_RECORD,EMAIL_CONFIG
from datetime import datetime
import os
import base64
import mimetypes
from email.mime.application import MIMEApplication

def send_email_notification(receiverlist, CCList, subject, body, attachments=None):
    """
    Send an email notification (with optional attachments) and store the result in MongoDB.
    Supports file paths or dicts like {'filename': str, 'content': bytes/base64 str}
    """
    print(f"send_email_notification called with subject: {subject}, receiverlist: {receiverlist}, CCList: {CCList}")
    sender_address = "ScriptMGMT@lumen.com"
    sender_Name = "ScriptManagement Team"

    if not receiverlist or not isinstance(receiverlist, list):
        print("No receiver email addresses provided.")
        StoreEmailRecords({
            "Subject": subject,
            "ReceiverList": receiverlist,
            "CCList": CCList,
            "SenderAddress": sender_address,
            "EmailBody": body,
            "Status": "Failed",
            "Error": "No receiver email addresses provided."
        })
        return

    try:
        message = MIMEMultipart()
        message['From'] = formataddr((sender_Name, sender_address))
        message['To'] = ', '.join(receiverlist)
        message['Cc'] = ', '.join(CCList) if CCList else ""
        message['Subject'] = subject
        message.attach(MIMEText(body, 'html'))

    
        attached_files = []
        if attachments:
            for att in attachments:
                try:
                    filename = att.get('filename') if isinstance(att, dict) else os.path.basename(att)
                    content = None

                    if isinstance(att, dict) and 'content' in att:
                        content = base64.b64decode(att['content']) if isinstance(att['content'], str) else att['content']
                    elif isinstance(att, str) and os.path.isfile(att):
                        with open(att, "rb") as f:
                            content = f.read()

                    if content:
                        # Guess MIME type
                        mimetype, _ = mimetypes.guess_type(filename)
                        maintype, subtype = (mimetype.split('/', 1) if mimetype else ('application', 'octet-stream'))

                        part = MIMEBase(maintype, subtype)
                        part.set_payload(content)
                        encoders.encode_base64(part)
                        part.add_header('Content-Disposition', f'attachment; filename="{filename}"')
                        message.attach(part)
                        attached_files.append(filename)

                except Exception as e:
                    print(f"Failed to attach file: {filename}. Error: {e}")

        all_recipients = receiverlist + (CCList if CCList else [])
        session = smtplib.SMTP('mailgate.qintra.com', 25)
        text = message.as_string()
        session.sendmail(sender_address, all_recipients, text)
        print(f"{subject} :: mailConfig :: sendMailRequest ==> Mail sent successfully..")
        session.quit()

        StoreEmailRecords({
            "Subject": subject,
            "ReceiverList": receiverlist,
            "CCList": CCList,
            "SenderAddress": sender_address,
            "EmailBody": body,
            "Status": "Sent",
            "Attachments": attached_files
        })

    except Exception as e:
        print("Could not send email, error occurred")
        print("Error:", e)
        StoreEmailRecords({
            "Subject": subject,
            "ReceiverList": receiverlist,
            "CCList": CCList,
            "SenderAddress": sender_address,
            "EmailBody": f"""<html>
    <body>
        <p>We got error while sending email with subject '{subject}'. The error we got is: {str(e)}</p>
    </body>
    </html>""",
            "Status": "Failed",
            "Error": str(e),
            "Attachments": attached_files
        })


def StoreEmailRecords(record):
    """
    Store email record in the EmailRecords collection.
    """
    try:
        record["createdAt"] = datetime.now()
        EMAIL_RECORD.insert_one(record)
    except Exception as e:
        print("Failed to store email record:", e)

def GetUserDetaials(cuid):
    """
    Retrieve user details from the Users collection based on cuid.
    
    Args:
        cuid (str): The unique identifier for the user.
    
    Returns:
        dict: User details if found, otherwise None.
    """
    try:
        user = USERS_COLLECTION.find_one({"_id": cuid})
        return user if user else None
    except Exception as e:
        print(f"Error retrieving user details for {cuid}: {e}")
        return None

def GetAllApproversOrAdmin(isApprover=False,isAdmin=False):
    
    try:
        query = {}
        if isApprover:
            query["isApprover"] = True
        if isAdmin:
            query["isAdmin"] = True
        user = USERS_COLLECTION.find(query)
        return user if user else None
    except Exception as e:
        print(f"Error retrieving user details : {e}")
        return None

def GetInternalCCList():
    """
    Retrieve internal CC list from the CommonCCList collection.

    Returns:
        list: List of email addresses to be used in CC.
    """
    try:
        cc_list = EMAIL_CONFIG.find_one()
        if cc_list and "configs" in cc_list and "InternalCCList" in cc_list["configs"]:
            return cc_list["configs"]["InternalCCList"]
        return []
    except Exception as e:
        print(f"Error retrieving internal CC list: {e}")
        return []
