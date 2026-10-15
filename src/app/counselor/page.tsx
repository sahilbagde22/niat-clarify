"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LeadRecord } from "@/lib/leads";
import {
  Users,
  Search,
  Filter,
  Phone,
  AlertTriangle,
  Award,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  X,
  Copy,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Building2,
  Languages,
  Mail,
  CheckCircle2
} from "lucide-react";

export default function CounselorPortalPage() {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCampusFilter, setSelectedCampusFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [whatsappSent, setWhatsappSent] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSentMsg, setEmailSentMsg] = useState<string | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
      if (data.success && data.leads) {
        setLeads(data.leads);
      }
    } catch (err) {
      console.error("Failed to load leads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetch("/api/leads")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && data.leads) {
          setLeads(data.leads);
        }
      })
      .catch((err) => console.error("Failed to load leads:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.parentPhone.includes(searchTerm) ||
      lead.parentEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCampus =
      selectedCampusFilter === "all" || lead.campusId === selectedCampusFilter;
    return matchesSearch && matchesCampus;
  });

  const highReadinessCount = leads.filter(
    (l) => (l.report?.counselorBrief?.readinessScore || 0) >= 80
  ).length;

  const avgReadiness = leads.length
    ? Math.round(
        leads.reduce((acc, l) => acc + (l.report?.counselorBrief?.readinessScore || 75), 0) /
          leads.length
      )
    : 0;

  const handleCopyScript = (lead: LeadRecord) => {
    const brief = lead.report?.counselorBrief;
    const script = `Counselor Pre-Call Brief for ${lead.studentName}:
- Parent Phone: ${lead.parentPhone}
- Campus: ${lead.campusName}
- PCM Score: ${lead.pcmPercentage}% | Budget: ${lead.budgetTier}
- Preferred Language: ${lead.preferredLanguage}
- Readiness Score: ${brief?.readinessScore}/100
- Primary Objection: ${brief?.primaryObjectionToHandle}
- Scholarship Angle: ${brief?.recommendedScholarshipAngle}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(script);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    }
  };

  const handleSimulateWhatsApp = () => {
    setWhatsappSent(true);
    setTimeout(() => setWhatsappSent(false), 3000);
  };

  const handleEmailParent = async (lead: LeadRecord) => {
    if (!lead.parentEmail) {
      alert("No email address recorded for this student candidate.");
      return;
    }
    setEmailSending(true);
    setEmailSentMsg(null);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: lead.parentEmail,
          studentName: lead.studentName,
          campusName: lead.campusName,
          breakEvenMonths: lead.report?.breakEvenMonths,
          startingSalaryRange: lead.report?.startingSalaryRange,
          parentLanguage: lead.preferredLanguage,
          totalFee: lead.campusTotalFee,
          pcmPercentage: lead.pcmPercentage,
          reassuranceLetter: lead.report?.parentReassuranceLetter,
          roiComparison: lead.report?.traditionalCollegeROIComparison,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEmailSentMsg(data.simulated ? `Queued for ${lead.parentEmail} (Simulation)` : `Dispatched to ${lead.parentEmail}!`);
        setTimeout(() => setEmailSentMsg(null), 4000);
      } else {
        alert("Failed to send email: " + (data.error || "Please check email configuration."));
      }
    } catch {
      alert("Network error dispatching email to parent.");
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070d1e] text-slate-100">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#070d1e]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Return to Parent Diagnostic Flow"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base sm:text-lg text-white">
                  NIAT Counselor <span className="text-[#3a86ff]">Pre-Call Intelligence CRM</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Live Dispatch
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Understand parent mindsets, safety questions, and scholarship eligibility before dialing
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchLeads}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center space-x-1.5 text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#3a86ff]" : ""}`} />
              <span className="hidden sm:inline">Refresh Leads</span>
            </button>
            <Link
              href="/"
              className="px-3.5 py-2 rounded-xl bg-[#3a86ff] hover:bg-blue-600 text-xs font-bold text-white transition flex items-center space-x-1"
            >
              <span>+ Diagnostic Form</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0b132b] border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Leads Logged</span>
              <Users className="w-4 h-4 text-[#3a86ff]" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2">{leads.length}</p>
            <p className="text-[11px] text-slate-400 mt-1">Post-NAT qualified profiles</p>
          </div>

          <div className="bg-[#0b132b] border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">High Readiness (&gt;80)</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-2">
              {highReadinessCount}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Ready for campus seat closure</p>
          </div>

          <div className="bg-[#0b132b] border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Avg Readiness</span>
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-cyan-400 mt-2">{avgReadiness}%</p>
            <p className="text-[11px] text-slate-400 mt-1">Calculated by AI Reasoning Model</p>
          </div>

          <div className="bg-[#0b132b] border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Host Campuses</span>
              <Building2 className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-2">8 Campuses</p>
            <p className="text-[11px] text-slate-400 mt-1">Active nationwide clusters</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0b132b] border border-slate-800 rounded-2xl p-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#111d4a]/60 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#3a86ff]"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCampusFilter}
              onChange={(e) => setSelectedCampusFilter(e.target.value)}
              className="bg-[#111d4a]/60 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#3a86ff]"
            >
              <option value="all">All Collaborating Campuses</option>
              <option value="chaitanya-hyd">Chaitanya Deemed University (Hyderabad)</option>
              <option value="malla-reddy-hyd">Malla Reddy Vishwavidyapeeth (Hyderabad)</option>
              <option value="svyasa-blr">S-VYASA University (Bengaluru)</option>
              <option value="yenepoya-blr">Yenepoya Deemed University (Bengaluru)</option>
              <option value="adypu-pune">Ajeenkya DY Patil University (Pune)</option>
              <option value="sgu-kolhapur">Sanjay Ghodawat University (Kolhapur)</option>
              <option value="chalapathi-guntur">Chalapathi Institute (Guntur)</option>
              <option value="vgu-jaipur">Vivekananda Global University (Jaipur)</option>
            </select>
          </div>
        </div>

        {/* Leads Table Card */}
        <div className="bg-[#0b132b] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Recent Lead Submissions ({filteredLeads.length})
            </h3>
            <span className="text-xs text-slate-400">Click any row to open AI Pre-Call Brief</span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400 text-sm space-y-2">
              <div className="w-8 h-8 border-2 border-blue-500/30 border-t-[#3a86ff] rounded-full animate-spin mx-auto" />
              <p>Loading parent diagnostic entries...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm space-y-3">
              <Users className="w-10 h-10 text-slate-600 mx-auto" />
              <p>No leads match your filter criteria.</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCampusFilter("all");
                }}
                className="text-xs text-[#3a86ff] hover:underline font-semibold"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#111d4a]/50 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Student & Parent</th>
                    <th className="py-3.5 px-4">Target Campus & Fees</th>
                    <th className="py-3.5 px-4">12th PCM & Budget</th>
                    <th className="py-3.5 px-4">Language</th>
                    <th className="py-3.5 px-4">Readiness</th>
                    <th className="py-3.5 px-4 text-right">Pre-Call Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredLeads.map((lead) => {
                    const readiness = lead.report?.counselorBrief?.readinessScore || 75;
                    return (
                      <tr
                        key={lead.id}
                        className="hover:bg-slate-800/40 transition cursor-pointer"
                        onClick={() => setSelectedLead(lead)}
                      >
                        {/* Student & Parent */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-white text-sm">{lead.studentName}</p>
                          <div className="flex items-center space-x-2 text-slate-400 mt-1">
                            <span className="flex items-center space-x-1">
                              <Phone className="w-3 h-3 text-[#3a86ff]" />
                              <span>{lead.parentPhone}</span>
                            </span>
                          </div>
                        </td>

                        {/* Campus */}
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-200">{lead.campusName}</p>
                          <p className="text-[11px] text-emerald-400 font-bold mt-0.5">
                            ₹{(lead.campusTotalFee / 100000).toFixed(1)}L Total Fee
                          </p>
                        </td>

                        {/* PCM & Budget */}
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2 py-0.5 rounded font-bold bg-blue-500/10 text-[#3a86ff] border border-blue-500/20">
                            {lead.pcmPercentage}% PCM
                          </span>
                          <p className="text-slate-400 mt-1 text-[11px]">{lead.budgetTier}</p>
                        </td>

                        {/* Language */}
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-medium">
                            {lead.preferredLanguage}
                          </span>
                        </td>

                        {/* Readiness Score */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2.5 py-1 rounded-lg font-black text-xs ${
                                readiness >= 85
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : readiness >= 70
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                  : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              }`}
                            >
                              {readiness}%
                            </span>
                            <span className="text-[10px] text-slate-400 hidden sm:inline">
                              {readiness >= 85 ? "High Intent" : readiness >= 70 ? "Warm Lead" : "Needs Reassurance"}
                            </span>
                          </div>
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLead(lead);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-[#3a86ff] text-[#3a86ff] hover:text-white border border-blue-500/30 text-xs font-bold transition inline-flex items-center space-x-1"
                          >
                            <span>View Brief</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* AI Pre-Call Brief Modal */}
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#0b132b] border border-blue-500/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto relative">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#3a86ff] mb-1">
                    <Sparkles className="w-4 h-4 text-[#3a86ff]" />
                    <span>AI Pre-Call Counselor Brief</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    {selectedLead.studentName}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Parent Contact: <strong className="text-white">{selectedLead.parentPhone}</strong> • {selectedLead.parentEmail}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Score & Campus Snapshot */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-bold uppercase">Readiness Score</span>
                  <p className="text-xl font-extrabold text-emerald-400 mt-1">
                    {selectedLead.report?.counselorBrief?.readinessScore || 78}/100
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-bold uppercase">Target Campus</span>
                  <p className="text-xs font-bold text-white mt-1 truncate">
                    {selectedLead.campusName}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-slate-400 font-bold uppercase">Preferred Language</span>
                  <p className="text-xs font-bold text-[#3a86ff] mt-1">
                    {selectedLead.preferredLanguage}
                  </p>
                </div>
              </div>

              {/* 1. Primary Objection to Handle */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Primary Skepticism / Objection to Handle</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedLead.report?.counselorBrief?.primaryObjectionToHandle ||
                    "Hostel security and ROI clarity compared to local engineering options."}
                </p>
              </div>

              {/* 2. Recommended Scholarship Pitch */}
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-1.5">
                <div className="flex items-center space-x-2 text-[#3a86ff] font-bold text-xs uppercase tracking-wider">
                  <Award className="w-4 h-4" />
                  <span>Recommended Scholarship / Fee Structure Pitch</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedLead.report?.counselorBrief?.recommendedScholarshipAngle ||
                    "Merit-based first semester fee subsidy based on 12th PCM performance."}
                </p>
              </div>

              {/* 3. Vernacular Reassurance Preview */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <Languages className="w-3.5 h-3.5 text-[#3a86ff]" />
                  <span>Vernacular Reassurance Letter Sent to Parent:</span>
                </span>
                <div className="p-4 rounded-2xl bg-[#070d1e] border border-slate-800 text-xs text-slate-300 max-h-40 overflow-y-auto leading-relaxed whitespace-pre-line">
                  {selectedLead.report?.parentReassuranceLetter?.body}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCopyScript(selectedLead)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copySuccess ? "Script Copied!" : "Copy Call Script"}</span>
                  </button>

                  <button
                    onClick={handleSimulateWhatsApp}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center space-x-1.5 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{whatsappSent ? "WhatsApp Queued!" : "Queue WhatsApp"}</span>
                  </button>

                  <button
                    onClick={() => handleEmailParent(selectedLead)}
                    disabled={emailSending}
                    className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center space-x-1.5 transition disabled:opacity-50"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#3a86ff]" />
                    <span>{emailSending ? "Sending..." : emailSentMsg ? emailSentMsg : "Email Dossier"}</span>
                  </button>
                </div>

                <a
                  href={`tel:${selectedLead.parentPhone}`}
                  className="px-4 py-2.5 rounded-xl bg-[#3a86ff] hover:bg-blue-600 text-xs font-bold text-white shadow-lg shadow-blue-500/20 flex items-center space-x-2 transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Parent Now ({selectedLead.parentPhone})</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
