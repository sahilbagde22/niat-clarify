import { NextResponse } from "next/server";
import { CAMPUSES, Campus } from "@/data/campuses";
import { saveLead, ROIReport, LeadRecord } from "@/lib/leads";
import { GoogleGenerativeAI } from "@google/generative-ai";

function getFallbackReport(
  studentName: string,
  campusName: string,
  totalFee: number,
  pcmPercentage: number,
  natScore: number = 78,
  budgetTier: string,
  language: string,
  campusDetails?: Campus
): ROIReport {
  // Estimated starting tech compensation based on NAT score & PCM benchmark: 7.5L to 15L
  const minSalary = natScore >= 85 || pcmPercentage >= 85 ? 850000 : natScore >= 70 ? 750000 : 700000;
  const maxSalary = natScore >= 85 ? 1500000 : natScore >= 70 ? 1250000 : 1050000;
  const avgStartingSalary = (minSalary + maxSalary) / 2;
  
  // Break-even horizon in months: (total fee / starting annual salary) * 12
  const breakEvenMonths = Math.max(10, Math.min(22, Math.round((totalFee / avgStartingSalary) * 12)));
  const salaryRangeStr = `₹${(minSalary / 100000).toFixed(1)} LPA - ₹${(maxSalary / 100000).toFixed(1)} LPA`;

  // Counselor readiness calculation based on NAT Score, PCM, budget, campus selection
  let readiness = 70;
  if (natScore >= 85) readiness += 15;
  else if (natScore >= 70) readiness += 8;
  if (pcmPercentage >= 85) readiness += 10;
  if (budgetTier.includes("Above")) readiness += 5;
  readiness = Math.min(98, Math.max(55, readiness));

  let primaryObjection = "";
  if (budgetTier.includes("Under")) {
    primaryObjection = `Parent may have fee apprehension regarding ₹${(totalFee / 100000).toFixed(1)}L total cost; emphasize 0% interest monthly EMI and 50+ project-driven ROI recoup in ${breakEvenMonths} months.`;
  } else if (pcmPercentage >= 85 || natScore >= 85) {
    primaryObjection = `Parent questioning whether to pick Tier-3 government quota/local college vs NIAT host campus (${campusDetails?.city || "Host Campus"}). Highlight 3x higher starting salary, NAT score of ${natScore}/100 proving elite tech aptitude, and full UGC degree validity.`;
  } else {
    primaryObjection = `Hostel security and student discipline away from home. Emphasize biometric entry gates, resident wardens, and daily digital attendance tracking.`;
  }

  let scholarshipAngle = "";
  if (natScore >= 85) {
    scholarshipAngle = `Direct eligibility for NAT Founder's High-Merit Scholarship (₹50,000 to ₹1,00,000 tuition fee concession based on NAT Score of ${natScore}/100 across Psychometric, Math & Aptitude).`;
  } else if (natScore >= 70) {
    scholarshipAngle = `NAT Direct Admission Merit Grant (₹35,000 to ₹50,000 tuition assistance) applicable on confirming campus allocation before seat closure.`;
  } else {
    scholarshipAngle = `Foundational Track Tech Mentorship Subsidy + flexible term-wise payment schedule.`;
  }

  const isTelugu = language.includes("తెలుగు") || language.toLowerCase().includes("telugu");
  const isHindi = language.includes("हिन्दी") || language.toLowerCase().includes("hindi");

  let reassuranceLetter = {
    language: "English",
    title: `Parent Reassurance & Academic Integrity Brief: ${campusName}`,
    body: `Dear Parent of ${studentName},\n\nWe understand that choosing an engineering program is one of your family's biggest life investments. You deserve absolute clarity on your child's safety, living conditions, and degree legitimacy.\n\n${studentName} has scored ${natScore}/100 in the NxtWave Assessment Test (NAT), demonstrating proven problem-solving and analytical aptitude across psychometric, mathematics, and cognitive reasoning. Combined with a ${pcmPercentage}% in 12th PCM, this confirms clear natural capability to succeed in high-growth software engineering careers.\n\nAt ${campusName}, your child is enrolled in a fully recognized UGC Deemed / State University program accredited by NAAC and approved by AICTE. Student residential quarters feature 24/7 CCTV surveillance, biometric access gates, resident faculty wardens, and dedicated health infrastructure.\n\nWhile typical regional colleges focus on memorization and leave graduates dependent on ₹3.5 LPA mass IT service jobs, NxtWave NIAT equips ${studentName} with over 50 real-world production projects and modern AI engineering skills, unlocking starting salaries of ${salaryRangeStr} and full tuition break-even within ${breakEvenMonths} months.`,
    keyAssurances: [
      `NAT Score of ${natScore}/100 verified: High-aptitude candidate qualified for project-led tech training`,
      `100% UGC-recognized degree awarded by ${campusDetails?.universityName || campusName} (Fully valid for Higher Studies, GATE, UPSC & Global Visas)`,
      `Rigorous campus safety: 24/7 biometric checkpoints, resident wardens, and parent SMS notification for movement`,
      `Estimated tuition fee break-even in just ${breakEvenMonths} months based on tech hiring packages of ${salaryRangeStr}`
    ]
  };

  if (isTelugu) {
    reassuranceLetter = {
      language: "Telugu",
      title: `తల్లిదండ్రులకు గౌరవపూర్వక హామీ పత్రం: ${campusName}`,
      body: `గౌరవనీయులైన ${studentName} తల్లిదండ్రులకు నమస్కారములు.\n\nమీ బిడ్డ ఇంజనీరింగ్ భవిష్యత్తు కోసం సరైన నిర్ణయం తీసుకోవడం ఒక కుటుంబానికి ఎంతటి ప్రాధాన్యమైన విషయమో మేము గ్రహించాము. ముఖ్యంగా కాలేజ్ భద్రత, హాస్టల్ వాతావరణం, మరియు డిగ్రీ చెల్లుబాటుపై మీకున్న ప్రతి సందేహానికి స్పష్టమైన హామీ ఇవ్వడమే మా బాధ్యత.\n\n${studentName} గారు NxtWave అసెస్‌మెంట్ టెస్ట్ (NAT) లో 100కి ${natScore} మార్కులు సాధించి, సైకోమెట్రిక్, మ్యాథ్స్ మరియు ఆప్టిట్యూడ్‌లలో విశేషమైన ప్రతిభను కనబరిచారు. 12వ తరగతి PCM లో ${pcmPercentage}% తో పాటు ఈ NAT స్కోరు మీ బిడ్డకు సాఫ్ట్‌వేర్ ఇంజనీరింగ్‌లో ఉన్న సహజ ప్రతిభను నిరూపిస్తోంది.\n\n${campusName} అనేది UGC మరియు AICTE నిబంధనల ప్రకారం పూర్తి గుర్తింపు పొందిన ఉన్నత విద్యాసంస్థ. ఇక్కడ లభించే డిగ్రీ ప్రభుత్వ ఉద్యోగాలు (UPSC, GATE) మరియు విదేశీ ఉన్నత విద్య (MS) కొరకు 100% చెల్లుబాటు అవుతుంది. హాస్టల్ వద్ద 24 గంటల సీసీటీవీ పర్యవేక్షణ, బయోమెట్రిక్ ప్రవేశం, మరియు నిరంతరం అందుబాటులో ఉండే అనుభవజ్ఞులైన వార్డెన్లు ఉన్నారు.\n\nNxtWave NIAT శిక్షణ ద్వారా మీ బిడ్డ 50కి పైగా లైవ్ సాఫ్ట్‌వేర్ మరియు AI ప్రాజెక్టులను నిర్మిస్తూ, ${salaryRangeStr} ఆరంభ ప్యాకేజీతో కేవలం ${breakEvenMonths} నెలల్లోనే పూర్తి ఫీజును రికవర్ చేసుకునే సామర్థ్యాన్ని పొందుతారు.`,
      keyAssurances: [
        `NAT స్కోరు ${natScore}/100: కంప్యూటర్ సైన్స్ ప్రాజెక్టులకు విశేష అర్హత సాధించిన అభ్యర్థి`,
        `UGC మరియు AICTE గుర్తింపు పొందిన 4 సంవత్సరాల ఇంజనీరింగ్ డిగ్రీ (ప్రభుత్వ ఉద్యోగాలు మరియు విదేశీ విద్యకు పూర్తి అర్హత)`,
        `హాస్టల్ బయోమెట్రిక్ గేట్-పాస్ సిస్టమ్ & విద్యార్థి హాజరుపై తల్లిదండ్రులకు రోజువారీ SMS సమాచారం`,
        `${salaryRangeStr} ప్రారంభ టెక్ వేతనంతో కేవలం ${breakEvenMonths} నెలల్లోనే మొత్తం కాలేజ్ ఫీజు రికవరీ (ROI)`
      ]
    };
  } else if (isHindi) {
    reassuranceLetter = {
      language: "Hindi",
      title: `अभिभावकों के लिए निष्पक्ष आश्वासन पत्र: ${campusName}`,
      body: `आदरणीय ${studentName} के अभिभावक, सादर प्रणाम।\n\nअपने बच्चे के करियर और उच्च शिक्षा का फैसला किसी भी परिवार के लिए सबसे महत्वपूर्ण निर्णय होता है। हम जानते हैं कि आपकी सबसे बड़ी प्राथमिकता कैंपस की सुरक्षा, हॉस्टल का शांत माहौल और डिग्री की सरकारी मान्यता है।\n\n${studentName} ने NxtWave असेसमेंट टेस्ट (NAT) में 100 में से ${natScore} अंक प्राप्त कर साइकोमेट्रिक, गणित और तार्किक क्षमता में अपनी उत्कृष्ट प्रतिभा प्रमाणित की है। 12वीं PCM में ${pcmPercentage}% के साथ यह NAT स्कोर साबित करता है कि आपके बच्चे में सॉफ्टवेयर एवं कंप्यूटर साइंस की स्वाभाविक योग्यता है।\n\n${campusName} एक यूजीसी (UGC) और एआईसीटीई (AICTE) द्वारा पूर्णतः मान्यता प्राप्त संस्थान है। यहां मिलने वाली बी.टेक / डिग्री गेट (GATE), यूपीएससी और विदेश में मास्टर्स हेतु शत-प्रतिशत मान्य है। कैंपस में 24 घंटे बायोमेट्रिक एक्सेस, सीसीटीवी निगरानी, समर्पित वार्डन और चिकित्सकीय सुविधाएं उपलब्ध हैं।\n\nपारंपरिक कॉलेजों के विपरीत, NxtWave NIAT का पाठ्यक्रम ${studentName} को 50+ लाइव प्रोडक्शन प्रोजेक्ट्स में दक्ष बनाता है, जिससे ${salaryRangeStr} का शुरुआती पैकेज और मात्र ${breakEvenMonths} महीनों में पूरी कॉलेज फीस की रिकवरी सुनिश्चित होती है।`,
      keyAssurances: [
        `NAT स्कोर ${natScore}/100: सॉफ्टवेयर इंजीनियरिंग हेतु उच्च संज्ञानात्मक योग्यता प्रमाणित`,
        `यूजीसी एवं एआईसीटीई द्वारा 100% मान्यता प्राप्त डिग्री (सरकारी परीक्षाओं एवं विदेश अध्ययन के लिए पूरी तरह वैध)`,
        `सुरक्षित एवं अनुशासित हॉस्टल: बायोमेट्रिक उपस्थिति, महिला/पुरुष वार्डन एवं 24/7 सुरक्षा कर्मी`,
        `${salaryRangeStr} के शुरुआती टेक पैकेज के साथ मात्र ${breakEvenMonths} महीनों में संपूर्ण फीस का ब्रेक-ईवन`
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
      natScore = 78,
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
- 12th PCM Percentage: ${pcmPercentage}% (Partner University Statutory Eligibility)
- NAT Score: ${natScore}/100 (NxtWave Assessment Test: Psychometric 50 marks, Math 25 marks, Aptitude 25 marks)
- Host Campus Selected: ${campus.name} (${campus.universityName}, ${campus.city}, ${campus.state})
- 4-Year Total Tuition Fee: ₹${totalFee.toLocaleString("en-IN")}
- Campus Accreditation: ${campus.accreditation}
- Campus Security Features: ${campus.securityFeatures.join("; ")}
- Hostel Details: ${campus.hostelDetails}
- Annual Family Budget Tier: ${budgetTier}
- Parent's Preferred Vernacular Language: ${preferredLanguage}

CRITICAL RULES:
1. Student Performance Context: The student scored ${natScore}/100 in the NAT assessment (demonstrating strong cognitive and problem-solving aptitude) and ${pcmPercentage}% in 12th PCM.
2. Merit Concession: If NAT Score >= 85, highlight an estimated ₹50,000–₹1,00,000 NAT Founder's Merit scholarship concession on the tuition breakdown.
3. Compare NIAT at the selected host campus vs. a standard Tier-3 regional engineering college (₹3.5L avg mass-recruiter package vs ₹7-12L+ NIAT tech package; 50+ production projects vs rote theory).
4. Calculate Break-Even Horizon: Total tuition fee divided by starting tech compensation (in months, typically 11-18 months).
5. MULTI-LINGUAL REQUIREMENT: Provide the "parentReassuranceLetter" STRICTLY in the chosen language (${preferredLanguage} - e.g. Telugu script if Telugu, Hindi Devanagari script if Hindi, English if English). Reference their verified NAT performance (${natScore}/100) as proof that the student has high natural aptitude for computer science and software development. Address host campus safety, hostel environment, biometric curfew, food/warden care, and AICTE/UGC degree recognition.
6. Output STRICT JSON adhering to this schema:
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
            Number(natScore),
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
          Number(natScore),
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
        Number(natScore),
        budgetTier,
        preferredLanguage,
        campus
      );
    }

    // Persist lead to data/leads.json and Supabase
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
      natScore: Number(natScore),
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
