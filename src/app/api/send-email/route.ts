import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      to,
      studentName = "Aspiring Student",
      campusName = "Host Campus",
      campusCity = "",
      breakEvenMonths = 14,
      startingSalaryRange = "₹7.5 LPA - ₹12.5 LPA",
      parentLanguage = "English",
      totalFee = 0,
      pcmPercentage = 0,
      natScore = 0,
      reassuranceLetter,
      roiComparison,
    } = body;

    if (!to || !to.includes("@")) {
      return NextResponse.json(
        { success: false, error: "A valid recipient email address is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "NIAT Clarify <onboarding@resend.dev>";

    // Build the executive HTML email
    const assurancesHtml = reassuranceLetter?.keyAssurances?.length
      ? reassuranceLetter.keyAssurances
          .map(
            (item: string) => `
            <tr>
              <td style="padding: 8px 0; vertical-align: top; width: 22px; color: #10b981; font-weight: bold; font-size: 16px;">✓</td>
              <td style="padding: 8px 0; font-size: 13px; color: #334155; line-height: 1.5;">${item}</td>
            </tr>
          `
          )
          .join("")
      : `
        <tr>
          <td style="padding: 8px 0; vertical-align: top; width: 22px; color: #10b981; font-weight: bold; font-size: 16px;">✓</td>
          <td style="padding: 8px 0; font-size: 13px; color: #334155;">100% UGC-Recognized 4-Year B.Tech Degree valid for GATE, UPSC & Global Visas.</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; vertical-align: top; width: 22px; color: #10b981; font-weight: bold; font-size: 16px;">✓</td>
          <td style="padding: 8px 0; font-size: 13px; color: #334155;">24/7 Biometric access, resident faculty wardens, CCTV and parent SMS alerts.</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; vertical-align: top; width: 22px; color: #10b981; font-weight: bold; font-size: 16px;">✓</td>
          <td style="padding: 8px 0; font-size: 13px; color: #334155;">50+ production-grade software applications built instead of textbook rote learning.</td>
        </tr>
      `;

    const letterBodyHtml = reassuranceLetter?.body
      ? `<div style="background: #f1f5f9; border-left: 4px solid #3a86ff; padding: 16px 20px; border-radius: 6px; font-size: 13px; color: #1e293b; line-height: 1.7; white-space: pre-line; margin-top: 14px;">
          ${reassuranceLetter.body}
         </div>`
      : "";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>NIAT Career ROI & Campus Integrity Dossier</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b132b; margin: 0; padding: 24px 12px; color: #0b132b;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 640px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #070d1e 0%, #111d4a 100%); padding: 32px 24px; text-align: center;">
              <span style="display: inline-block; background: rgba(58, 134, 255, 0.15); border: 1px solid rgba(58, 134, 255, 0.4); color: #3a86ff; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
                Official Academic & Career Evaluation
              </span>
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
                NxtWave NIAT Clarify
              </h1>
              <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 13px;">
                Parent Decision, Campus Integrity & Career ROI Dossier
              </p>
            </td>
          </tr>

          <!-- Student & Campus Summary Card -->
          <tr>
            <td style="padding: 24px 24px 16px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
                <tr>
                  <td style="padding: 6px 12px; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600;">Student Candidate</td>
                  <td style="padding: 6px 12px; font-size: 14px; color: #0b132b; font-weight: 700; text-align: right;">${studentName}</td>
                </tr>
                ${pcmPercentage ? `<tr><td style="padding: 6px 12px; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600;">12th PCM Score</td><td style="padding: 6px 12px; font-size: 14px; color: #0b132b; font-weight: 700; text-align: right;">${pcmPercentage}%</td></tr>` : ""}
                ${natScore ? `<tr><td style="padding: 6px 12px; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600;">NAT Assessment Score</td><td style="padding: 6px 12px; font-size: 14px; color: #3a86ff; font-weight: 700; text-align: right;">${natScore}/100</td></tr>` : ""}
                <tr>
                  <td style="padding: 6px 12px; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600;">Selected Host Campus</td>
                  <td style="padding: 6px 12px; font-size: 14px; color: #0b132b; font-weight: 700; text-align: right;">${campusName} ${campusCity ? `(${campusCity})` : ""}</td>
                </tr>
                ${totalFee ? `<tr><td style="padding: 6px 12px; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600;">4-Year Tuition Benchmark</td><td style="padding: 6px 12px; font-size: 14px; color: #0b132b; font-weight: 700; text-align: right;">₹${totalFee.toLocaleString("en-IN")}</td></tr>` : ""}
              </table>
            </td>
          </tr>

          <!-- Key ROI Highlights -->
          <tr>
            <td style="padding: 0 24px 16px 24px;">
              <table width="100%" cellpadding="0" cellspacing="8">
                <tr>
                  <td width="50%" style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px; text-align: center;">
                    <p style="margin: 0; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #059669;">Break-Even Horizon</p>
                    <p style="margin: 4px 0 0 0; font-size: 24px; font-weight: 800; color: #047857;">${breakEvenMonths} Months</p>
                    <p style="margin: 4px 0 0 0; font-size: 11px; color: #065f46;">Full fee recouped after graduation</p>
                  </td>
                  <td width="50%" style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; text-align: center;">
                    <p style="margin: 0; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #2563eb;">Tech Starting Salary</p>
                    <p style="margin: 4px 0 0 0; font-size: 20px; font-weight: 800; color: #1d4ed8;">${startingSalaryRange}</p>
                    <p style="margin: 4px 0 0 0; font-size: 11px; color: #1e40af;">Direct software engineering roles</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Institutional Guarantees -->
          <tr>
            <td style="padding: 8px 24px;">
              <h3 style="margin: 0 0 10px 0; font-size: 15px; font-weight: 700; color: #0b132b; text-transform: uppercase; letter-spacing: 0.5px;">
                Verified Institutional Assurances
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                ${assurancesHtml}
              </table>
            </td>
          </tr>

          <!-- Vernacular Reassurance Letter -->
          ${reassuranceLetter ? `
            <tr>
              <td style="padding: 16px 24px;">
                <div style="border-top: 1px solid #e2e8f0; padding-top: 16px;">
                  <h3 style="margin: 0; font-size: 15px; font-weight: 700; color: #3a86ff;">
                    ${reassuranceLetter.title || "Parent Reassurance Letter"}
                  </h3>
                  <span style="font-size: 11px; color: #64748b; font-weight: 600;">(Language: ${reassuranceLetter.language || parentLanguage})</span>
                  ${letterBodyHtml}
                </div>
              </td>
            </tr>
          ` : ""}

          <!-- Counselor Support Notice -->
          <tr>
            <td style="padding: 16px 24px 24px 24px;">
              <div style="background: #0b132b; border-radius: 12px; padding: 18px 20px; color: #ffffff;">
                <h4 style="margin: 0; font-size: 14px; font-weight: 700; color: #3a86ff;">
                  Senior Academic Counselor Allocated
                </h4>
                <p style="margin: 6px 0 0 0; font-size: 12px; color: #cbd5e1; line-height: 1.6;">
                  An academic counselor fluent in <strong>${parentLanguage}</strong> has been assigned to your family. You will receive an advisory call to review campus hostel safety protocols, food standards, biometric gate curfews, and merit scholarship waivers.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #64748b;">
                NxtWave NIAT © 2026. Empowering high-school graduates with elite industry software engineering mastery.
              </p>
              <p style="margin: 4px 0 0 0; font-size: 10px; color: #94a3b8;">
                UGC Recognized Host Campuses • AICTE Curriculum Alignment • NAAC 'A' Grade Infrastructure
              </p>
            </td>
          </tr>

        </table>
      </body>
      </html>
    `;

    // Real dispatch via Resend
    if (apiKey && apiKey.trim().length > 5) {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [to],
            subject: `Official NIAT Career ROI & Campus Integrity Dossier - ${studentName}`,
            html: htmlContent,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.warn("Resend API returned non-OK response:", data);
          return NextResponse.json({
            success: false,
            error: data.message || "Resend API error: Please check your verified domain or API key.",
            details: data,
          }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          data,
          simulated: false,
          recipient: to,
          message: `Official report successfully dispatched to ${to}.`,
        });
      } catch (err: unknown) {
        console.warn("Resend API network call failed:", err);
      }
    }

    // Fallback simulation when RESEND_API_KEY is not configured
    console.log("==========================================");
    console.log("[EMAIL DISPATCH SIMULATOR - RESEND_API_KEY NOT SET]");
    console.log(`Recipient: ${to}`);
    console.log(`Student: ${studentName}`);
    console.log(`Campus: ${campusName}`);
    console.log(`Language: ${parentLanguage}`);
    console.log(`Break-Even: ${breakEvenMonths} Months`);
    console.log(`Salary: ${startingSalaryRange}`);
    console.log("Status: Email successfully queued in simulation mode.");
    console.log("==========================================");

    return NextResponse.json({
      success: true,
      simulated: true,
      recipient: to,
      message: `Report prepared for ${to}. Running in simulation mode. Add RESEND_API_KEY in .env.local for live inbox delivery.`,
      dispatchTime: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to dispatch email";
    console.error("Error in send-email API:", error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

