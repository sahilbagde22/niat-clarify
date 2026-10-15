import { NextResponse } from "next/server";
import { CAMPUSES, Campus } from "@/data/campuses";
import { saveLead, ROIReport, LeadRecord } from "@/lib/leads";
import { GoogleGenerativeAI } from "@google/generative-ai";

function getFallbackReport(
  studentName: string,
  campusName: string,
  totalFee: number,
  pcmPercentage: number,
  budgetTier: string,
  language: string,
  campusDetails?: Campus
): ROIReport {
  // Estimated starting tech compensation based on PCM & NIAT benchmark: 7.5L to 14.5L
  const minSalary = pcmPercentage >= 85 ? 850000 : pcmPercentage >= 70 ? 750000 : 700000;
  const maxSalary = pcmPercentage >= 85 ? 1500000 : pcmPercentage >= 70 ? 1250000 : 1050000;
  const avgStartingSalary = (minSalary + maxSalary) / 2;
  
  // Break-even horizon in months: (total fee / starting annual salary) * 12
  const breakEvenMonths = Math.max(10, Math.min(22, Math.round((totalFee / avgStartingSalary) * 12)));
  const salaryRangeStr = `₹${(minSalary / 100000).toFixed(1)} LPA - ₹${(maxSalary / 100000).toFixed(1)} LPA`;

  // Counselor readiness calculation based on PCM, budget, campus selection
  let readiness = 70;
  if (pcmPercentage >= 85) readiness += 15;
  else if (pcmPercentage >= 70) readiness += 10;
  if (budgetTier.includes("Above")) readiness += 10;
  else if (budgetTier.includes("2.5L - 4L")) readiness += 5;
  readiness = Math.min(96, Math.max(55, readiness));

  let primaryObjection = "";
  if (budgetTier.includes("Under")) {
    primaryObjection = `Parent may have fee apprehension regarding ₹${(totalFee / 100000).toFixed(1)}L total cost; emphasize 0% interest monthly EMI and 50+ project-driven ROI recoup in ${breakEvenMonths} months.`;
  } else if (pcmPercentage >= 85) {
    primaryObjection = `Parent questioning whether to pick Tier-3 government quota/local college vs NIAT host campus (${campusDetails?.city || "Host Campus"}). Highlight 3x higher starting salary and full UGC degree validity.`;
  } else {
    primaryObjection = `Hostel security and student discipline away from home. Emphasize biometric entry gates, resident wardens, and daily digital attendance tracking.`;
  }

  let scholarshipAngle = "";
  if (pcmPercentage >= 90) {
    scholarshipAngle = `Direct eligibility for NxtWave Founder's Merit Scholarship (Up to ₹1,50,000 waiver across program tenure).`;
  } else if (pcmPercentage >= 75) {
    scholarshipAngle = `NAT Top-Percentile Merit Grant (₹50,000 to ₹75,000 tuition assistance) applicable on confirming campus allocation before seat closure.`;
  } else {
    scholarshipAngle = `Early Enrolment Tech Apprenticeship Subsidy + flexible term-wise payment schedule.`;
  }

  const isTelugu = language.includes("తెలుగు") || language.toLowerCase().includes("telugu");
  const isHindi = language.includes("हिन्दी") || language.toLowerCase().includes("hindi");

  let reassuranceLetter = {
    language: "English",
    title: `Parent Reassurance & Academic Integrity Brief: ${campusName}`,
    body: `Dear Parent of ${studentName},\n\nWe understand that choosing an engineering program is one of your family's biggest life investments. You deserve absolute clarity on your child's safety, living conditions, and degree legitimacy.\n\nAt ${campusName}, your child is enrolled in a fully recognized UGC Deemed / State University program accredited by NAAC and approved by AICTE. Student residential quarters feature 24/7 CCTV surveillance, biometric access gates, resident faculty wardens, and dedicated health infrastructure.\n\nWhile typical regional colleges focus on memorization and leave graduates dependent on ₹3.5 LPA mass IT service jobs, NxtWave NIAT equips ${studentName} with over 50 real-world production projects and modern AI engineering skills, unlocking starting salaries of ${salaryRangeStr} and full tuition break-even within ${breakEvenMonths} months.`,
    keyAssurances: [
      `100% UGC-recognized degree awarded by ${campusDetails?.universityName || campusName} (Fully valid for Higher Studies, GATE, UPSC & Global Visas)`,
      `Rigorous campus safety: 24/7 biometric checkpoints, resident wardens, and parent SMS notification for movement`,
      `Estimated tuition fee break-even in just ${breakEvenMonths} months based on tech hiring packages of ${salaryRangeStr}`,
      `Practical hands-on tech curriculum with 50+ industry-reviewed software builds instead of outdated rote theory`
    ]
  };

  if (isTelugu) {
    reassuranceLetter = {
      language: "Telugu",
      title: `తల్లిదండ్రులకు గౌరవపూర్వక హామీ పత్రం: ${campusName}`,
      body: `గౌరవనీయులైన ${studentName} తల్లిదండ్రులకు నమస్కారములు.\n\nమీ బిడ్డ ఇంజనీరింగ్ భవిష్యత్తు కోసం సరైన నిర్ణయం తీసుకోవడం ఒక కుటుంబానికి ఎంతటి ప్రాధాన్యమైన విషయమో మేము గ్రహించాము. ముఖ్యంగా కాలేజ్ భద్రత, హాస్టల్ వాతావరణం, మరియు డిగ్రీ చెల్లుబాటుపై మీకున్న ప్రతి సందేహానికి స్పష్టమైన హామీ ఇవ్వడమే మా బాధ్యత.\n\n${campusName} అనేది UGC మరియు AICTE నిబంధనల ప్రకారం పూర్తి గుర్తింపు పొందిన ఉన్నత విద్యాసంస్థ. ఇక్కడ ప్రవేశించిన విద్యార్థికి లభించే డిగ్రీ ప్రభుత్వ ఉద్యోగాలు (UPSC, GATE) మరియు విదేశీ ఉన్నత విద్య (MS) కొరకు 100% చెల్లుబాటు అవుతుంది. హాస్టల్ వద్ద 24 గంటల సీసీటీవీ పర్యవేక్షణ, బయోమెట్రిక్ ప్రవేశం, మరియు నిరంతరం అందుబాటులో ఉండే అనుభవజ్ఞులైన వార్డెన్లు ఉన్నారు.\n\nసాధారణ ఇంజనీరింగ్ కాలేజీలలో పాత సిలబస్ నేర్చుకుని ₹3.5 లక్షల చిన్న ఉద్యోగాల కోసం ఎదురుచూడాల్సిన పరిస్థితి ఉండదు. NxtWave NIAT శిక్షణ ద్వారా మీ బిడ్డ 50కి పైగా లైవ్ సాఫ్ట్‌వేర్ మరియు AI ప్రాజెక్టులను నిర్మిస్తూ, ${salaryRangeStr} ఆరంభ ప్యాకేజీతో కేవలం ${breakEvenMonths} నెలల్లోనే పూర్తి ఫీజును రికవర్ చేసుకునే సామర్థ్యాన్ని పొందుతారు.`,
      keyAssurances: [
        `UGC మరియు AICTE గుర్తింపు పొందిన 4 సంవత్సరాల ఇంజనీరింగ్ డిగ్రీ (ప్రభుత్వ ఉద్యోగాలు మరియు విదేశీ విద్యకు పూర్తి అర్హత)`,
        `హాస్టల్ బయోమెట్రిక్ గేట్-పాస్ సిస్టమ్ & విద్యార్థి హాజరుపై తల్లిదండ్రులకు రోజువారీ SMS సమాచారం`,
        `${salaryRangeStr} ప్రారంభ టెక్ వేతనంతో కేవలం ${breakEvenMonths} నెలల్లోనే మొత్తం కాలేజ్ ఫీజు రికవరీ (ROI)`,
        `రాత పరీక్షలకే పరిమితం కాకుండా 50కి పైగా ప్రొడక్షన్-గ్రేడ్ సాఫ్ట్‌వేర్ ప్రాజెక్టుల నిర్మాణం`
      ]
    };
  } else if (isHindi) {
    reassuranceLetter = {
      language: "Hindi",
      title: `अभिभावकों के लिए निष्पक्ष आश्वासन पत्र: ${campusName}`,
      body: `आदरणीय ${studentName} के अभिभावक, सादर प्रणाम।\n\nअपने बच्चे के करियर और उच्च शिक्षा का फैसला किसी भी परिवार के लिए सबसे महत्वपूर्ण निर्णय होता है। हम जानते हैं कि आपकी सबसे बड़ी प्राथमिकता कैंपस की सुरक्षा, हॉस्टल का शांत माहौल और डिग्री की सरकारी मान्यता है।\n\n${campusName} एक यूजीसी (UGC) और एआईसीटीई (AICTE) द्वारा पूर्णतः मान्यता प्राप्त संस्थान है। यहां मिलने वाली बी.टेक / डिग्री गेट (GATE), यूपीएससी और विदेश में मास्टर्स हेतु शत-प्रतिशत मान्य है। कैंपस में 24 घंटे बायोमेट्रिक एक्सेस, सीसीटीवी निगरानी, समर्पित वार्डन और चिकित्सकीय सुविधाएं उपलब्ध हैं।\n\nपारंपरिक कॉलेजों में ₹3.5 लाख के मास रिक्रूटमेंट पैकेजों के विपरीत, NxtWave NIAT का व्यावहारिक पाठ्यक्रम ${studentName} को 50+ लाइव प्रोडक्शन प्रोजेक्ट्स और आधुनिक एआई टूल्स में दक्ष बनाता है, जिससे ${salaryRangeStr} का शुरुआती पैकेज और मात्र ${breakEvenMonths} महीनों में पूरी कॉलेज फीस की रिकवरी सुनिश्चित होती है।`,
      keyAssurances: [
        `यूजीसी एवं एआईसीटीई द्वारा 100% मान्यता प्राप्त डिग्री (सरकारी परीक्षाओं एवं विदेश अध्ययन के लिए पूरी तरह वैध)`,
        `सुरक्षित एवं अनुशासित हॉस्टल: बायोमेट्रिक उपस्थिति, महिला/पुरुष वार्डन एवं 24/7 सुरक्षा कर्मी`,
        `${salaryRangeStr} के शुरुआती टेक पैकेज के साथ मात्र ${breakEvenMonths} महीनों में संपूर्ण फीस का ब्रेक-ईवन`,
        `सिद्धांतों की बजाय 50 से अधिक हैंड्स-ऑन सॉफ्टवेयर व एआई प्रोजेक्ट्स का व्यावहारिक अनुभव`
      ]
    };
  }

  return {
    breakEvenMonths,
    startingSalaryRange: salaryRangeStr,
    traditionalCollegeROIComparison: {
      niatProjects: "50+ Enterprise Full-Stack & Generative AI applications deployed live to AWS/Vercel with public GitHub repos, system architecture design, and code reviews.",
      traditionalProjects: "1-2 standard textbook academic assignments (e.g. basic calculator, library management) with outdated tech stacks and zero cloud deployment.",
      niatPlacement: `High-growth tech product firms, fintechs, and modern AI engineering roles with ${salaryRangeStr} starting CTC and direct placement acceleration.`,
      traditionalPlacement: "Mass-recruitment IT service vendor companies offering ₹3.2 - ₹3.6 LPA with high competition and 6-12 month bench waiting periods.",
      degreeRecognition: `Official UGC-Recognized 4-Year B.Tech Degree from ${campusDetails?.universityName || campusName} (NAAC Accredited) + Industry-Standard NIAT Specialization Certificate.`
    },
    parentReassuranceLetter: reassuranceLetter,
    counselorBrief: {
      readinessScore: readiness,
      primaryObjectionToHandle: primaryObjection,
      recommendedScholarshipAngle: scholarshipAngle
    }
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      studentName = "Aspiring Tech Student",
      parentPhone = "",
      parentEmail = "",
      campusId = "chaitanya-hyd",
      pcmPercentage = 75,
      budgetTier = "₹2.5L - ₹4L",
      preferredLanguage = "English"
    } = body;

    const campus = CAMPUSES.find((c) => c.id === campusId) || CAMPUSES[0];
    const totalFee = campus.totalFee;

    let report: ROIReport;
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim().length > 5) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-3.8-flash",
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3
          }
        });

        const prompt = `
You are an objective Academic & Career ROI Analyst for NxtWave NIAT.
Generate a comprehensive, truthful, and high-impact Parent Decision & ROI Evaluation.

Context:
- Student Name: ${studentName}
- 12th PCM Percentage: ${pcmPercentage}%
- Host Campus Selected: ${campus.name} (${campus.universityName}, ${campus.city}, ${campus.state})
- 4-Year Total Tuition Fee: ₹${totalFee.toLocaleString("en-IN")}
- Campus Accreditation: ${campus.accreditation}
- Campus Security Features: ${campus.securityFeatures.join("; ")}
- Hostel Details: ${campus.hostelDetails}
- Annual Family Budget Tier: ${budgetTier}
- Parent's Preferred Vernacular Language: ${preferredLanguage}

CRITICAL RULES:
1. Compare NIAT at the selected host campus vs. a standard Tier-3 regional engineering college (₹3.5L avg mass-recruiter package vs ₹7-12L+ NIAT tech package; 50+ production projects vs rote theory).
2. Calculate Break-Even Horizon: Total tuition fee divided by starting tech compensation (in months, typically 11-18 months).
3. MULTI-LINGUAL REQUIREMENT: Provide the "parentReassuranceLetter" STRICTLY in the chosen language (${preferredLanguage} - e.g. Telugu script if Telugu, Hindi Devanagari script if Hindi, English if English). Address host campus safety, hostel environment, biometric curfew, food/warden care, and AICTE/UGC degree recognition.
4. Output STRICT JSON adhering to this schema:
{
  "breakEvenMonths": number,
  "startingSalaryRange": string,
  "traditionalCollegeROIComparison": {
    "niatProjects": string,
    "traditionalProjects": string,
    "niatPlacement": string,
    "traditionalPlacement": string,
    "degreeRecognition": string
  },
  "parentReassuranceLetter": {
    "language": string,
    "title": string,
    "body": string,
    "keyAssurances": string[]
  },
  "counselorBrief": {
    "readinessScore": number,
    "primaryObjectionToHandle": string,
    "recommendedScholarshipAngle": string
  }
}
`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const parsed = JSON.parse(responseText);

        // Validate structure
        if (
          parsed &&
          typeof parsed.breakEvenMonths === "number" &&
          parsed.parentReassuranceLetter &&
          parsed.counselorBrief
        ) {
          report = parsed;
        } else {
          report = getFallbackReport(
            studentName,
            campus.name,
            totalFee,
            pcmPercentage,
            budgetTier,
            preferredLanguage,
            campus
          );
        }
      } catch (geminiError) {
        console.warn("Gemini API call failed or timed out, using fallback:", geminiError);
        report = getFallbackReport(
          studentName,
          campus.name,
          totalFee,
          pcmPercentage,
          budgetTier,
          preferredLanguage,
          campus
        );
      }
    } else {
      // Robust intelligent fallback generator
      report = getFallbackReport(
        studentName,
        campus.name,
        totalFee,
        pcmPercentage,
        budgetTier,
        preferredLanguage,
        campus
      );
    }

    // Persist lead to data/leads.json
    const leadRecord: LeadRecord = {
      id: `lead-${Date.now()}`,
      createdAt: new Date().toISOString(),
      studentName,
      parentPhone,
      parentEmail,
      campusId: campus.id,
      campusName: campus.name,
      campusTotalFee: campus.totalFee,
      pcmPercentage: Number(pcmPercentage),
      budgetTier,
      preferredLanguage,
      report
    };

    await saveLead(leadRecord);

    return NextResponse.json({
      success: true,
      leadId: leadRecord.id,
      campus,
      report
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate report";
    console.error("API error in generate-report:", error);
    return NextResponse.json(
      {
        success: false,
        error: message
      },
      { status: 500 }
    );
  }
}
