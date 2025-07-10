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
    """
    Returns a modern, visually appealing HTML email body for Script Management notifications.
    Only shows script details that are provided (non-empty).
    """
    year = datetime.now().year

    # Build script details dynamically
    details_html = ""
    if script_title or script_author or submission_date or script_description:
        details_html += '<section class="script-details" aria-label="Script Details">'
        if script_title:
            details_html += f'''
            <div class="info-item">
              <div class="info-icon" aria-hidden="true">📘</div>
              <div class="info-label">Title:</div>
              <div class="info-value">{script_title}</div>
            </div>'''
        if script_author:
            details_html += f'''
            <div class="info-item">
              <div class="info-icon" aria-hidden="true">👤</div>
              <div class="info-label">Author:</div>
              <div class="info-value">{script_author}</div>
            </div>'''
        if submission_date:
            details_html += f'''
            <div class="info-item">
              <div class="info-icon" aria-hidden="true">📅</div>
              <div class="info-label">Submitted:</div>
              <div class="info-value">{submission_date}</div>
            </div>'''
        if script_description:
            details_html += f'''
            <div class="description">
              <strong>Description:</strong> {script_description}
            </div>'''
        details_html += '</section>'

    # Action buttons
    if action_required:
        action_html = f'''
        <p style="text-align:center; font-weight:600; color:#1F2937; margin:0 30px 20px 30px;">
          {requester} has submitted a script for your review, Please take action:
        </p>
        <div class="button-group">
          <a href="{approve_link}" class="btn btn-approve" role="button" aria-label="Approve Script">✅ Approve</a>
          <a href="{reject_link}" class="btn btn-reject" role="button" aria-label="Reject Script">❌ Reject</a>
        </div>
        '''
    else:
        action_html = f'''
        <p style="text-align:center; font-weight:600; color:#1F2937; margin:0 30px 20px 30px;">
          This is an informational update:
        </p>
        <div class="button-group">
          <a href="{info_link}" class="btn btn-info" role="button" aria-label="View Details">{Information}</a>
        </div>
        '''

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Script Management Email</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body,html {{
      margin: 0; padding: 0; background: #F9FAFB; color: #1F2937; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
    }}
    a {{
      text-decoration: none;
      cursor: pointer;
    }}
    .email-wrapper {{
      width: 100%;
      background: #F9FAFB;
      padding: 40px 15px;
      box-sizing: border-box;
    }}
    .email-container {{
      max-width: 620px;
      margin: 0 auto;
      background: #FFFFFF;
      border-radius: 14px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.07);
      overflow: hidden;
      border: 1px solid #E5E7EB;
    }}
    .email-header {{
      display: flex;
      align-items: center;
      padding: 25px 30px;
      background: #6366F1;
      color: white;
      border-bottom-left-radius: 14px;
      border-bottom-right-radius: 14px;
    }}
    .logo {{
      width: 40px;
      height: 40px;
      background: #A78BFA;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 20px;
      color: white;
      margin-right: 15px;
      user-select: none;
      font-family: 'Segoe UI', sans-serif;
    }}
    .header-title {{
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.03em;
    }}
    .greeting {{
      padding: 30px 30px 15px 30px;
      font-size: 17px;
      color: #1F2937;
      font-weight: 600;
    }}
    .script-details {{
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
      padding: 0 30px 30px 30px;
      background: #F9FAFB;
      border-radius: 12px;
      margin: 0 30px 30px 30px;
      border: 1px solid #E5E7EB;
    }}
    .info-item {{
      flex: 1 1 250px;
      min-width: 200px;
      display: flex;
      align-items: center;
      gap: 12px;
    }}
    .info-icon {{
      font-size: 20px;
      color: #9CA3AF;
      flex-shrink: 0;
      user-select: none;
    }}
    .info-label {{
      font-weight: 600;
      color: #6B7280;
      min-width: 90px;
    }}
    .info-value {{
      color: #1F2937;
      font-weight: 600;
      word-break: break-word;
    }}
    .description {{
      width: 100%;
      margin-top: 15px;
      font-size: 15px;
      color: #4B5563;
      line-height: 1.5;
    }}
    .button-group {{
      display: flex;
      justify-content: center;
      gap: 20px;
      padding-bottom: 40px;
      flex-wrap: wrap;
    }}
    .btn {{
      flex: 1 1 140px;
      max-width: 180px;
      padding: 14px 0;
      font-weight: 700;
      font-size: 16px;
      border-radius: 10px;
      text-align: center;
      color: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
      transition: background-color 0.3s ease;
      user-select: none;
      cursor: pointer;
    }}
    .btn-approve {{
      background-color: #6366F1;
    }}
    .btn-approve:hover {{
      background-color: #4F46E5;
    }}
    .btn-reject {{
      background-color: #A78BFA;
    }}
    .btn-reject:hover {{
      background-color: #8B5CF6;
    }}
    .btn-info {{
      background-color: #6B7280;
    }}
    .btn-info:hover {{
      background-color: #4B5563;
    }}
    .email-footer {{
      background-color: #F3F4F6;
      font-size: 13px;
      color: #9CA3AF;
      text-align: center;
      padding: 18px 30px;
      border-top: 1px solid #E5E7EB;
      border-bottom-left-radius: 14px;
      border-bottom-right-radius: 14px;
      user-select: none;
    }}
    @media (max-width: 480px) {{
      .script-details {{
        flex-direction: column;
        margin: 0 20px 30px 20px;
      }}
      .info-item {{
        min-width: 100%;
      }}
      .button-group {{
        flex-direction: column;
        gap: 12px;
      }}
      .btn {{
        max-width: 100%;
      }}
    }}
    @media (prefers-color-scheme: dark) {{
      body, html {{
        background: #1F2937;
        color: #F9FAFB;
      }}
      .email-container {{
        background: #111827;
        border-color: #374151;
        box-shadow: 0 6px 20px rgba(0,0,0,0.5);
      }}
      .email-header {{
        background-color: #4F46E5;
        color: #E0E7FF;
      }}
      .greeting {{
        color: #E0E7FF;
      }}
      .script-details {{
        background: #1F2937;
        border-color: #374151;
      }}
      .info-label {{
        color: #9CA3AF;
      }}
      .info-value {{
        color: #E0E7FF;
      }}
      .description {{
        color: #CBD5E1;
      }}
      .btn-approve {{
        background-color: #6366F1;
      }}
      .btn-approve:hover {{
        background-color: #818CF8;
      }}
      .btn-reject {{
        background-color: #A78BFA;
      }}
      .btn-reject:hover {{
        background-color: #C4B5FD;
      }}
      .btn-info {{
        background-color: #6B7280;
      }}
      .btn-info:hover {{
        background-color: #9CA3AF;
      }}
      .email-footer {{
        background-color: #111827;
        color: #9CA3AF;
        border-color: #374151;
      }}
    }}
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">

      <!-- Header with logo and title -->
      <div class="email-header" role="banner">
        <div class="logo" aria-label="Script Management">SM</div>
        <div class="header-title">Script Management System</div>
      </div>

      <!-- Greeting -->
      <div class="greeting" role="main">
        Hello <strong>{recipient_name}</strong>,
      </div>

      <!-- Script details (only if any provided) -->
      {details_html}

      <!-- Action buttons -->
      {action_html}

      <p style="padding: 0 30px 40px 30px; font-size: 14px; color: #6B7280; text-align: center; margin:0;">
        Best regards,<br />
        The Script Management Team
      </p>

      <!-- Footer -->
      <footer class="email-footer" role="contentinfo">
        &copy; {year} Script Management System · All rights reserved.
      </footer>
    </div>
  </div>
</body>
</html>
"""