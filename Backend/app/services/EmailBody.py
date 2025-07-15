from datetime import datetime
import html

def FrameEmailBody(
    recipient_name: str,
    script_title: str = "",
    script_author: str = "",
    submission_date: str = "",
    script_description: str = "",
    action_required: bool = False,
    info_link: str = "",
    Information: str = "View Details",
    msg: str = ""
) -> str:
    year = datetime.now().year

    def escape(val): return html.escape(val) if val else ""

    # Script details rows
    def item_row(icon, label, value):
        return f"""
        <tr>
          <td width="120" style="padding:8px 0;font-size:14px;vertical-align:top;color:#6B7280;">
            <span style="font-size:16px;">{icon}</span> <strong>{label}</strong>
          </td>
          <td style="padding:8px 0;font-size:14px;color:#111827;font-weight:500;">
            {escape(value)}
          </td>
        </tr>"""

    rows = ""
    if script_title:
        rows += item_row("📘", "Title:", script_title)
    if script_author:
        rows += item_row("👤", "Author:", script_author)
    if submission_date:
        rows += item_row("📅", "Submitted:", submission_date)

    # Description
    desc_html = ""
    if script_description:
        desc_html = f"""
        <tr>
          <td colspan="2" style="padding:10px 0 20px;font-size:14px;color:#374151;line-height:1.6;">
            <em>{escape(script_description)}</em>
          </td>
        </tr>"""

    # Buttons
    if action_required:
        # msg = f"{escape(requester)} has submitted a new script for your review:"
        btns = f"""
        <!--[if mso]>
        <table role="presentation" cellpadding="0" cellspacing="0" align="center">
          <tr>
            <td align="center" style="padding:0 8px;">
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="{info_link}"
                style="height:40px;v-text-anchor:middle;width:160px;" arcsize="10%"
                strokecolor="#4F46E5" fillcolor="#4F46E5">
                <w:anchorlock/>
                <center style="color:#ffffff;font-family:sans-serif;font-size:10px;font-weight:bold;">
                 Approve
                </center>
              </v:roundrect>
            </td>
            <td align="center" style="padding:0 8px;">
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="{info_link}"
                style="height:40px;v-text-anchor:middle;width:160px;" arcsize="10%"
                strokecolor="#A78BFA" fillcolor="#A78BFA">
                <w:anchorlock/>
                <center style="color:#ffffff;font-family:sans-serif;font-size:10px;font-weight:bold;">
                  Reject
                </center>
              </v:roundrect>
            </td>
          </tr>
        </table>
        <![endif]-->

        <!--[if !mso]><!-- -->
        <a href="{info_link}" style="display:inline-block;margin:8px;padding:12px 24px;
            background-color:#4F46E5;color:#ffffff;text-decoration:none;font-size:10px;
            font-weight:600;border-radius:6px;">Approve</a>
        <a href="{info_link}" style="display:inline-block;margin:8px;padding:12px 24px;
            background-color:#A78BFA;color:#ffffff;text-decoration:none;font-size:10px;
            font-weight:600;border-radius:6px;"> Reject</a>
        <!--<![endif]-->
        """
    else:
        # msg = "Here's an informational update on a script:"
        btns = f"""
        <p style="color:#4B5563;font-size:14px;margin-bottom:12px;">{escape(Information)}</p>
        <a href="{info_link}" style="display:inline-block;margin:8px;padding:12px 24px;
            background-color:#6B7280;color:#ffffff;text-decoration:none;font-size:14px;
            font-weight:600;border-radius:6px;">🔍 View Details</a>
        """

    # Final HTML
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Script Notification</title>
</head>
<body style="margin:0;padding:0;background-color:#F3F4F6;font-family:'Segoe UI', sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;background-color:#F3F4F6;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:12px;box-shadow:0 0 8px rgba(0,0,0,0.04);overflow:hidden;">

        <!-- Header -->
        <tr><td style="background:#4F46E5;padding:20px;text-align:center;">
          <span style="font-size:20px;font-weight:600;color:#FFFFFF;">Script Management System</span>
        </td></tr>

        <!-- Greeting -->
        <tr><td style="padding:24px 32px 8px;font-size:16px;color:#111827;">
          Hello {escape(recipient_name)},
        </td></tr>

        <!-- Message -->
        <tr><td style="padding:0 32px 16px;font-size:14px;color:#374151;line-height:1.6;">
          {msg}
        </td></tr>

        <!-- Script Details -->
        {(rows or desc_html) and f"<tr><td style='padding:0 32px;'><table width='100%'>{rows}{desc_html}</table></td></tr>" or ""}

        <!-- Buttons -->
        <tr><td style="padding:24px 32px;text-align:center;">
          {btns}
        </td></tr>

        <!-- Signoff -->
        <tr><td style="padding:0 32px 20px;font-size:14px;color:#6B7280;text-align:center;">
          Respectfully,<br>The Script Management Team
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#F9FAFB;padding:14px 32px;border-top:1px solid #E5E7EB;
                     text-align:center;font-size:12px;color:#9CA3AF;">
          &copy; {year} Script Management System · All rights reserved.
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""

# # Example usage
# print(FrameEmailBody(
#     recipient_name="John Doe",
#     script_title="Automated Report Generator",
#     script_author="Jane Smith",
#     submission_date="2023-10-01",
#     script_description="This script generates automated reports based on user input.",
#     action_required=True,
#     approve_link="https://example.com/approve",
#     reject_link="https://example.com/reject",
#     info_link="https://example.com/info",
#     requester="Alice Johnson"
# ))
