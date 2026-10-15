import fs from "fs";
import path from "path";

export interface ROIReport {
  breakEvenMonths: number;
  startingSalaryRange: string;
  traditionalCollegeROIComparison: {
    niatProjects: string;
    traditionalProjects: string;
    niatPlacement: string;
    traditionalPlacement: string;
    degreeRecognition: string;
  };
  parentReassuranceLetter: {
    language: string;
    title: string;
    body: string;
    keyAssurances: string[];
  };
  counselorBrief: {
    readinessScore: number;
    primaryObjectionToHandle: string;
    recommendedScholarshipAngle: string;
  };
}

export interface LeadRecord {
  id: string;
  createdAt: string;
  studentName: string;
  parentPhone: string;
  parentEmail: string;
  campusId: string;
  campusName: string;
  campusTotalFee: number;
  pcmPercentage: number;
  natScore?: number;
  budgetTier: string;
  preferredLanguage: string;
  report: ROIReport;
}

const LEADS_FILE_PATH = path.join(process.cwd(), "data", "leads.json");

const getSupabaseConfig = () => {
  let url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_ANON_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (url && key && url.startsWith("http")) {
    url = url.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
    return { url, key };
  }
  return null;
};

export async function getLeads(): Promise<LeadRecord[]> {
  const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
  const sb = !isBuildPhase ? getSupabaseConfig() : null;
  if (sb) {
    try {
      const res = await fetch(`${sb.url}/rest/v1/leads?select=*&order=created_at.desc`, {
        headers: {
          apikey: sb.key,
          Authorization: `Bearer ${sb.key}`,
        },
        cache: "no-store",
      });
      if (res.ok) {
        const rows = await res.json();
        return rows.map((row: any) => ({
          id: row.id,
          createdAt: row.created_at || row.createdAt,
          studentName: row.student_name || row.studentName,
          parentPhone: row.parent_phone || row.parentPhone || "",
          parentEmail: row.parent_email || row.parentEmail || "",
          campusId: row.campus_id || row.campusId,
          campusName: row.campus_name || row.campusName,
          campusTotalFee: row.campus_total_fee || row.campusTotalFee || 0,
          pcmPercentage: row.pcm_percentage || row.pcmPercentage || 0,
          natScore: row.nat_score || row.natScore || (typeof row.report === "object" ? row.report?.natScore : undefined) || 78,
          budgetTier: row.budget_tier || row.budgetTier || "",
          preferredLanguage: row.preferred_language || row.preferredLanguage || "English",
          report: typeof row.report === "string" ? JSON.parse(row.report) : row.report,
        }));
      }
    } catch (sbError) {
      console.warn("Supabase fetch failed, falling back to local file:", sbError);
    }
  }

  // Local filesystem fallback
  try {
    if (!fs.existsSync(LEADS_FILE_PATH)) {
      const dir = path.dirname(LEADS_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(LEADS_FILE_PATH, JSON.stringify([], null, 2), "utf8");
      return [];
    }
    const data = fs.readFileSync(LEADS_FILE_PATH, "utf8");
    return JSON.parse(data) as LeadRecord[];
  } catch (error) {
    console.error("Error reading leads file:", error);
    return [];
  }
}

export async function saveLead(lead: LeadRecord): Promise<void> {
  const sb = getSupabaseConfig();
  if (sb) {
    try {
      const res = await fetch(`${sb.url}/rest/v1/leads`, {
        method: "POST",
        headers: {
          apikey: sb.key,
          Authorization: `Bearer ${sb.key}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify({
          id: lead.id,
          created_at: lead.createdAt,
          student_name: lead.studentName,
          parent_phone: lead.parentPhone,
          parent_email: lead.parentEmail,
          campus_id: lead.campusId,
          campus_name: lead.campusName,
          campus_total_fee: lead.campusTotalFee,
          pcm_percentage: lead.pcmPercentage,
          budget_tier: lead.budgetTier,
          preferred_language: lead.preferredLanguage,
          report: { ...lead.report, natScore: lead.natScore },
        }),
      });
      if (res.ok) {
        return;
      }
    } catch (sbError) {
      console.warn("Supabase insert failed, attempting local fallback:", sbError);
    }
  }

  // Local filesystem save
  try {
    const leads = await getLeadsLocalOnly();
    leads.unshift(lead);
    const dir = path.dirname(LEADS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LEADS_FILE_PATH, JSON.stringify(leads, null, 2), "utf8");
  } catch (error) {
    console.error("Error saving lead locally:", error);
  }
}

function getLeadsLocalOnly(): LeadRecord[] {
  try {
    if (!fs.existsSync(LEADS_FILE_PATH)) return [];
    const data = fs.readFileSync(LEADS_FILE_PATH, "utf8");
    return JSON.parse(data) as LeadRecord[];
  } catch {
    return [];
  }
}
