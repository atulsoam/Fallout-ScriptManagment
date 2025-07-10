from datetime import datetime

def FrameEmailBody(
    recipient_name: str,
    script_title: str = "",
    script_author: str = "",
    submission_date: str = "",
    script_description: str = "",
    action_required: bool = False,
    approve_link: str = "",
    reject_link: str = "",
    info_link: str = "",
    requester: str = "",
    Information: str = "View Details"
) -> str:
    year = datetime.now().year

    # Script details rows
    def item_row(icon, label, value):
        return f"""
        <tr>
          <td width="100" style="padding:6px 0;font-size:13px;vertical-align:top;">
            <span style="font-size:17px;color:#9CA3AF;line-height:1;">{icon}</span>
            &nbsp;<strong style="color:#6B7280;">{label}</strong>
          </td>
          <td style="padding:6px 0;font-size:13px;color:#1F2937;font-weight:600;vertical-align:top;">
            {value}
          </td>
        </tr>"""

    rows = ""
    if script_title:
        rows += item_row("📘", "Title:", script_title)
    if script_author:
        rows += item_row("👤", "Author:", script_author)
    if submission_date:
        rows += item_row("📅", "Submitted:", submission_date)

    # Description row
    desc_html = ""
    if script_description:
        desc_html = f"""
        <tr>
          <td colspan="2" style="padding:8px 0 16px;font-size:13px;color:#4B5563;line-height:1.5;">
            <em>{script_description}</em>
          </td>
        </tr>"""

    # Message & button rows
    if action_required:
        msg = f"{requester} has submitted a new script for your consideration. Please review below:"
        btns = f"""
        <!--[if mso]>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="{approve_link}"
          style="height:36px;v-text-anchor:middle;width:120px;" arcsize="8%" strokecolor="#6366F1" fillcolor="#6366F1">
          <w:anchorlock/>
          <center style="color:#ffffff;font-family:'Segoe UI',sans-serif;font-size:10px;font-weight:bold;">
             Approve
          </center>
        </v:roundrect>
        <![endif]-->
        <![if !mso]>
          <a href="{approve_link}"
             style="display:inline-block;padding:10px 20px;background:#6366F1;color:#FFF;
                    font-weight:600;font-size:10px;border-radius:6px;text-decoration:none;">
             Approve
          </a>
        <![endif]>
        &nbsp;
        <!--[if mso]>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="{reject_link}"
          style="height:36px;v-text-anchor:middle;width:120px;" arcsize="8%" strokecolor="#A78BFA" fillcolor="#A78BFA">
          <w:anchorlock/>
          <center style="color:#ffffff;font-family:'Segoe UI',sans-serif;font-size:10px;font-weight:bold;">
            Reject
          </center>
        </v:roundrect>
        <![endif]-->
        <![if !mso]>
          <a href="{reject_link}"
             style="display:inline-block;padding:10px 20px;background:#A78BFA;color:#FFF;
                    font-weight:600;font-size:10px;border-radius:6px;text-decoration:none;">
            Reject
          </a>
        <![endif]>"""
    else:
        msg = "This is an update regarding the script. "
        btns = f"""
        <p style="font-weight: bold; color: #1F2937; margin-bottom: 5px;">This is an informational update:</p>
        <p style="color: #4B5563; font-size: 14px; margin-top: 0;">{Information}</p>
        <a href="{info_link}" style="background-color: #6B7280; padding: 12px 24px; border-radius: 8px; color: #ffffff; text-decoration: none; display: inline-block; font-size: 8px; font-weight: bold;">
          View Details
        </a>
        """

    return f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#FFF;border:1px solid #E5E7EB;border-radius:12px;overflow:hidden;">
        
        <!-- Header -->
        <tr><td style="background:#6366F1;padding:20px;text-align:center;">
          
          <span style="display:inline-block;font-size:20px;font-weight:600;color:#FFF;margin-left:12px;vertical-align:middle;">
            Script Management System
          </span>
        </td></tr>
        
        <!-- Greeting -->
        <tr><td style="padding:20px 30px 10px;font-size:14px;color:#1F2937;mso-line-height-rule:exactly;line-height:20px;">
          Dear {recipient_name},
        </td></tr>
        
        <!-- Message -->
        <tr><td style="padding:0 30px 20px;font-size:13px;color:#374151;line-height:18px;mso-line-height-rule:exactly;">
          {msg}
        </td></tr>
        
        <!-- Details -->
        { (rows or desc_html) and f"<tr><td style='padding:0 30px 10px;'><table width='100%' cellpadding='0' cellspacing='0'>{rows}{desc_html}</table></td></tr>" or "" }
        
        <!-- Buttons -->
        <tr><td style="padding:20px 30px;text-align:center;">
          {btns}
        </td></tr>
        
        <!-- Sign-off -->
        <tr><td style="padding:0 30px 20px;font-size:13px;color:#6B7280;text-align:center;line-height:18px;mso-line-height-rule:exactly;">
          Respectfully,<br>The Script Management Team
        </td></tr>
        
        <!-- Footer -->
        <tr><td style="background:#F3F4F6;padding:14px 30px;border-top:1px solid #E5E7EB;
                     text-align:center;font-size:12px;color:#9CA3AF;">
          &copy; {year} Script Management System · All rights reserved.
        </td></tr>
        
      </table>
    </td></tr>
  </table>
</body></html>"""
