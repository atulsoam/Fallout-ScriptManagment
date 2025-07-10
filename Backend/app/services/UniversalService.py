import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from email.utils import formataddr
from app import mongo
from datetime import datetime
import os

def send_email_notification(receiverlist, CCList, subject, body, attachments=None):
    """
    Send an email notification (with optional attachments) and store the result in MongoDB.
    Enhanced: Validates input, handles empty lists, logs status, and supports attachments.
    attachments: list of file paths or file-like objects (dict with 'filename' and 'content')
    """
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

        # Handle attachments
        if attachments:
            for att in attachments:
                if isinstance(att, dict) and 'filename' in att and 'content' in att:
                    part = MIMEBase('application', 'octet-stream')
                    part.set_payload(att['content'])
                    encoders.encode_base64(part)
                    part.add_header('Content-Disposition', f'attachment; filename="{att["filename"]}"')
                    message.attach(part)
                elif isinstance(att, str) and os.path.isfile(att):
                    with open(att, "rb") as f:
                        part = MIMEBase('application', 'octet-stream')
                        part.set_payload(f.read())
                        encoders.encode_base64(part)
                        part.add_header('Content-Disposition', f'attachment; filename="{os.path.basename(att)}"')
                        message.attach(part)

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
            "Attachments": [att['filename'] if isinstance(att, dict) else os.path.basename(att) for att in attachments] if attachments else []
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
        <p>We got error while sending email subjected {subject}. The error we got is {str(e)}</p>
    </body>
    </html>""",
            "Status": "Failed",
            "Error": str(e),
            "Attachments": [att['filename'] if isinstance(att, dict) else os.path.basename(att) for att in attachments] if attachments else []
        })

def StoreEmailRecords(record):
    """
    Store email record in the EmailRecords collection.
    """
    try:
        record["createdAt"] = datetime.now()
        mongo.db.EmailRecordsScriptMGMT.insert_one(record)
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
        user = mongo.db.ScriptManagmentUsers.find_one({"_id": cuid})
        return user if user else None
    except Exception as e:
        print(f"Error retrieving user details for {cuid}: {e}")
        return None

def GetInternalCCList():
    """
    Retrieve common CC list from the CommonCCList collection.
    
    Returns:
        list: List of email addresses to be used in CC.
    """
    try:
        cc_list = mongo.db.EmailConfig.find_one({"_id": "InternalCCList"})
        return cc_list["emails"] if cc_list and "emails" in cc_list else []
    except Exception as e:
        print(f"Error retrieving common CC list: {e}")
        return []