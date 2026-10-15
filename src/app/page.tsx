"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CAMPUSES, CAMPUSES_BY_STATE, Campus } from "@/data/campuses";
import { ROIReport } from "@/lib/leads";
import confetti from "canvas-confetti";
import {
  GraduationCap,
  ShieldCheck,
  TrendingUp,
  CheckCircle2,
  Clock,
  Sparkles,
  Building2,
  Mail,
  Phone,
  User,
  Sliders,
  DollarSign,
  Languages,
  ArrowRight,
  Printer,
  Share2,
  Send,
  AlertCircle,
  BadgeCheck,
  MapPin,
  Flame,
  FileText,
  Lock,
  ChevronRight,
} from "lucide-react";

export default function HomePage() {
  // Form State
  const [studentName, setStudentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [selectedCampusId, setSelectedCampusId] = useState("chaitanya-hyd");
  const [pcmPercentage, setPcmPercentage] = useState(75);
  const [natScore, setNatScore] = useState(78);
  const [budgetTier, setBudgetTier] = useState("₹2.5L - ₹4L");
  const [preferredLanguage, setPreferredLanguage] = useState("తెలుగు (Telugu)");

  // UI & Report State
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [report, setReport] = useState<ROIReport | null>(null);
  const [reportCampus, setReportCampus] = useState<Campus | null>(null);
  const [reportLeadId, setReportLeadId] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<"sent" | "simulated" | "error" | null>(null);
  const [emailSending, setEmailSending] = useState(false);
  const [emailMessage, setEmailMessage] = useState<string>("");
  const [customRecipientEmail, setCustomRecipientEmail] = useState<string>("");
  const [copiedShare, setCopiedShare] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const selectedCampus = CAMPUSES.find((c) => c.id === selectedCampusId) || CAMPUSES[0];

  // Validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!studentName.trim()) {
      errors.studentName = "Please enter the student's full name.";
    }
    if (!parentPhone.trim() || parentPhone.replace(/\D/g, "").length < 10) {
      errors.parentPhone = "Please enter a valid 10-digit mobile number.";
    }
    if (!parentEmail.trim() || !parentEmail.includes("@") || !parentEmail.includes(".")) {
      errors.parentEmail = "Please enter a valid parent email address.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendEmail = async (overrideEmail?: string, customReport?: ROIReport, customCampus?: Campus) => {
    const targetEmail = overrideEmail || customRecipientEmail || parentEmail;
    if (!targetEmail || !targetEmail.includes("@")) {
      setEmailStatus("error");
      setEmailMessage("Please enter a valid recipient email address.");
      return;
    }

    setEmailSending(true);
    setEmailStatus(null);
    setEmailMessage("");

    const activeReport = customReport || report;
    const activeCampus = customCampus || reportCampus || selectedCampus;

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: targetEmail,
          studentName,
          campusName: activeCampus.name,
          campusCity: activeCampus.city,
          breakEvenMonths: activeReport?.breakEvenMonths,
          startingSalaryRange: activeReport?.startingSalaryRange,
          parentLanguage: preferredLanguage,
          totalFee: activeCampus.totalFee,
          pcmPercentage: Number(pcmPercentage),
          natScore: Number(natScore),
          reassuranceLetter: activeReport?.parentReassuranceLetter,
          roiComparison: activeReport?.traditionalCollegeROIComparison,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEmailStatus(data.simulated ? "simulated" : "sent");
        setEmailMessage(data.message || `Official report dispatched to ${targetEmail}`);
      } else {
        setEmailStatus("error");
        setEmailMessage(data.error || "Failed to dispatch email.");
      }
    } catch {
      setEmailStatus("error");
      setEmailMessage("Network error trying to dispatch email. Please check your connection.");
    } finally {
      setEmailSending(false);
    }
  };

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setLoadingStep(1);
    setEmailStatus(null);
    setEmailMessage("");

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 600);

    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          parentPhone,
          parentEmail,
          campusId: selectedCampusId,
          pcmPercentage,
          natScore,
          budgetTier,
          preferredLanguage,
        }),
      });

      const data = await res.json();
      clearInterval(stepInterval);

      if (data.success && data.report) {
        setReport(data.report);
        setReportCampus(data.campus);
        setReportLeadId(data.leadId);
        setCustomRecipientEmail(parentEmail);

        // Auto-dispatch official evaluation report to parent's inbox!
        if (parentEmail && parentEmail.includes("@")) {
          handleSendEmail(parentEmail, data.report, data.campus);
        }

        // Celebration Confetti
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#3a86ff", "#00f2fe", "#ffffff", "#10b981"],
          });
        } catch {
          // ignore if canvas not supported
        }

        // Smooth scroll to report
        setTimeout(() => {
          document.getElementById("roi-report-section")?.scrollIntoView({ behavior: "smooth" });
        }, 150);
      } else {
        alert("Unable to generate evaluation: " + (data.error || "Please try again"));
      }
    } catch (err) {
      console.error(err);
      alert("Network error while generating report. Please check your connection.");
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  const handleShare = () => {
    const text = `NIAT Parent Career ROI & Campus Integrity Evaluation for ${studentName}: Estimated Break-Even in ${report?.breakEvenMonths} months at ${reportCampus?.name} with ${report?.startingSalaryRange} package!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070d1e] text-slate-100">
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#070d1e]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#3a86ff] via-[#4361ee] to-[#4cc9f0] p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-[#0b132b] rounded-[10px] flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-[#3a86ff]" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                  NxtWave <span className="text-[#3a86ff]">NIAT</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-blue-500/10 text-[#3a86ff] px-2 py-0.5 rounded-full border border-blue-500/20">
                  NAT Qualified
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Parent Decision & Career ROI Evaluation Engine
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/counselor"
              className="text-xs sm:text-sm font-medium px-3.5 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition flex items-center space-x-2"
            >
              <Lock className="w-3.5 h-3.5 text-[#3a86ff]" />
              <span>Counselor CRM Portal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-semibold text-[#3a86ff]">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>AI-Powered Financial & Academic Transparency</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Make the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3a86ff] via-[#4cc9f0] to-[#00f2fe]">Right College Decision</span> with Certainty
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Eliminate tuition skepticism before speaking with admission counselors. Compare real 4-year financial break-even horizons, campus safety protocols, and UGC degree recognition across all 8 NIAT host university campuses.
          </p>

          {/* Quick Metrics Bar */}
          <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Break-Even</p>
              <p className="text-base sm:text-lg font-bold text-emerald-400">11 - 16 Months</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Practical Builds</p>
              <p className="text-base sm:text-lg font-bold text-[#3a86ff]">50+ Live Projects</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Starting Package</p>
              <p className="text-base sm:text-lg font-bold text-cyan-400">₹7.5L - ₹15L+</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Host Campuses</p>
              <p className="text-base sm:text-lg font-bold text-amber-400">8 UGC Campuses</p>
            </div>
          </div>
        </div>

        {/* COMPONENT 1: Interactive Parent Assessment Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Assessment Form Card */}
          <div className="lg:col-span-7 bg-[#0b132b] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#3a86ff]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="border-b border-slate-800/80 pb-5 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <span>Student & Parent Diagnostic Profile</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Fill the details to generate an objective institutional ROI report
                  </p>
                </div>
                <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800 text-[11px] font-medium text-slate-300 border border-slate-700">
                  <BadgeCheck className="w-3.5 h-3.5 text-[#3a86ff]" />
                  <span>NAT 2026 Verified</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleGenerateReport} className="space-y-6">
              {/* 1. Student Full Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-[#3a86ff]" />
                  <span>1. Student Full Name</span>
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kalyan Ramachandran"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className={`w-full bg-[#111d4a]/70 border ${
                    formErrors.studentName ? "border-red-500" : "border-slate-700/80 focus:border-[#3a86ff]"
                  } rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#3a86ff] transition`}
                />
                {formErrors.studentName && (
                  <p className="text-xs text-red-400 mt-1.5 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formErrors.studentName}</span>
                  </p>
                )}
              </div>

              {/* 2. Parent Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#3a86ff]" />
                    <span>2. Parent Phone Number</span>
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 98480 12345"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className={`w-full bg-[#111d4a]/70 border ${
                      formErrors.parentPhone ? "border-red-500" : "border-slate-700/80 focus:border-[#3a86ff]"
                    } rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#3a86ff] transition`}
                  />
                  {formErrors.parentPhone && (
                    <p className="text-xs text-red-400 mt-1.5 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{formErrors.parentPhone}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#3a86ff]" />
                    <span>Parent Email Address</span>
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. parent@gmail.com"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    className={`w-full bg-[#111d4a]/70 border ${
                      formErrors.parentEmail ? "border-red-500" : "border-slate-700/80 focus:border-[#3a86ff]"
                    } rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#3a86ff] transition`}
                  />
                  {formErrors.parentEmail && (
                    <p className="text-xs text-red-400 mt-1.5 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{formErrors.parentEmail}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* 3. Target Collaborating Campus Grouped by State */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#3a86ff]" />
                    <span>3. Target Collaborating Campus</span>
                  </span>
                  <span className="text-xs font-normal text-slate-400">Grouped by State & Fee</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedCampusId}
                    onChange={(e) => setSelectedCampusId(e.target.value)}
                    className="w-full bg-[#111d4a]/90 border border-slate-700/80 focus:border-[#3a86ff] rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#3a86ff] transition appearance-none cursor-pointer"
                  >
                    {Object.entries(CAMPUSES_BY_STATE).map(([state, campuses]) => (
                      <optgroup key={state} label={`📍 ${state.toUpperCase()}`} className="bg-[#0b132b] text-[#3a86ff] font-bold">
                        {campuses.map((c) => (
                          <option key={c.id} value={c.id} className="text-slate-100 font-normal">
                            {c.name} — Total: {c.totalFeeDisplay} ({c.annualFeeDisplay})
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>

                {/* Instant campus preview snapshot */}
                <div className="mt-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold text-slate-200 flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-[#3a86ff]" />
                      <span>{selectedCampus.city}, {selectedCampus.state}</span>
                    </span>
                    <span className="font-bold text-emerald-400">{selectedCampus.totalFeeDisplay} 4-Yr Total</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    {selectedCampus.accreditation}
                  </p>
                </div>
              </div>

              {/* 4. ACADEMIC & APTITUDE EVALUATION: 4A & 4B */}
              <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-slate-900/40 border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#3a86ff]">
                    <Sliders className="w-3.5 h-3.5 text-[#3a86ff]" />
                    <span>4. Academic Eligibility & Assessment Scores</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                    NAT: Psychometric (50m) + Math (25m) + Aptitude (25m)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 4A. 12th PCM Percentage */}
                  <div className="p-4 rounded-xl bg-[#0b132b]/80 border border-slate-800 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <label className="text-xs font-bold text-slate-200 block">
                          4A. 12th PCM Percentage
                        </label>
                        <span className="inline-block mt-0.5 text-[10px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                          Partner University Statutory Eligibility
                        </span>
                      </div>
                      <span className="text-sm font-bold text-white px-2.5 py-0.5 rounded-lg bg-blue-600/30 border border-blue-500/40 shrink-0">
                        {pcmPercentage}%
                      </span>
                    </div>

                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={pcmPercentage}
                      onChange={(e) => setPcmPercentage(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#3a86ff]"
                    />

                    <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>50% (Min Cutoff)</span>
                      <span>75% (State Avg)</span>
                      <span>100% (Topper)</span>
                    </div>
                  </div>

                  {/* 4B. NAT Score (Marks out of 100) */}
                  <div className="p-4 rounded-xl bg-[#0b132b]/80 border border-slate-800 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <label className="text-xs font-bold text-slate-200 block">
                          4B. NAT Score (Out of 100)
                        </label>
                        <span
                          className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded border ${
                            natScore >= 85
                              ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                              : natScore >= 70
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                              : "bg-blue-500/15 text-blue-300 border-blue-500/30"
                          }`}
                        >
                          {natScore >= 85
                            ? "⭐ High Merit & Scholarship Qualified"
                            : natScore >= 70
                            ? "✅ Direct Admission Qualified"
                            : "📘 Foundational Track Qualified"}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-[#3a86ff] px-2.5 py-0.5 rounded-lg bg-blue-600/30 border border-blue-500/40 shrink-0">
                        {natScore}/100
                      </span>
                    </div>

                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={natScore}
                      onChange={(e) => setNatScore(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#3a86ff]"
                    />

                    <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>50 (Pass Cutoff)</span>
                      <span>75 (Average)</span>
                      <span>100 (Max Score)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Annual Family Budget Tier */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center space-x-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-[#3a86ff]" />
                  <span>5. Annual Family Budget Tier</span>
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { tier: "Under ₹2.5L", desc: "0% Interest EMI" },
                    { tier: "₹2.5L - ₹4L", desc: "Standard Plan" },
                    { tier: "Above ₹4L", desc: "Direct Full-Term" },
                  ].map((item) => {
                    const isSelected = budgetTier === item.tier;
                    return (
                      <button
                        type="button"
                        key={item.tier}
                        onClick={() => setBudgetTier(item.tier)}
                        className={`p-3 rounded-xl border text-left transition ${
                          isSelected
                            ? "bg-blue-600/20 border-[#3a86ff] text-white shadow-md shadow-blue-500/10"
                            : "bg-[#111d4a]/50 border-slate-700/60 text-slate-300 hover:border-slate-600"
                        }`}
                      >
                        <p className="text-xs font-bold">{item.tier}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6. Preferred Parent Language (Pills) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center space-x-1.5">
                  <Languages className="w-3.5 h-3.5 text-[#3a86ff]" />
                  <span>6. Preferred Parent Reassurance Language</span>
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { label: "English", sub: "Global Tech Format" },
                    { label: "हिन्दी (Hindi)", sub: "राष्ट्रभाषा आश्वासन" },
                    { label: "తెలుగు (Telugu)", sub: "మాతృభాషలో స్పష్టత" },
                  ].map((lang) => {
                    const isSelected = preferredLanguage === lang.label;
                    return (
                      <button
                        type="button"
                        key={lang.label}
                        onClick={() => setPreferredLanguage(lang.label)}
                        className={`p-3 rounded-xl border text-center transition ${
                          isSelected
                            ? "bg-gradient-to-r from-blue-600/30 to-cyan-500/20 border-[#3a86ff] text-white shadow-md shadow-blue-500/15"
                            : "bg-[#111d4a]/50 border-slate-700/60 text-slate-300 hover:border-slate-600"
                        }`}
                      >
                        <span className="text-xs font-bold block">{lang.label}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{lang.sub}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  * The generated parent reassurance letter and campus safety charter will be generated natively in this language.
                </p>
              </div>

              {/* Dynamic Submit Button with Multi-step Loader */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-[#3a86ff] via-[#4361ee] to-[#2563eb] hover:from-blue-500 hover:to-blue-700 text-white shadow-xl shadow-blue-500/25 transition disabled:opacity-60 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>
                        {loadingStep === 1 && "Verifying Campus UGC & AICTE Accreditations..."}
                        {loadingStep === 2 && "Calculating 4-Year Tuition vs Tech Packages..."}
                        {loadingStep === 3 && `Synthesizing Reassurance Letter in ${preferredLanguage}...`}
                        {loadingStep >= 4 && "Finalizing Counselor Intelligence Brief..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      <span>Generate Parent Career & ROI Report</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Key Guarantees & Campus Trust Blueprint */}
          <div className="lg:col-span-5 space-y-6">
            {/* Campus Security & Trust Card */}
            <div className="bg-[#0b132b] border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center space-x-2.5 text-white font-bold text-base">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Host Campus Assurance & Safety Charter</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Parents often hesitate sending their 12th-grade children to out-of-city host campuses. Here is how <strong className="text-white">{selectedCampus.name}</strong> safeguards students:
              </p>

              <div className="space-y-3 pt-1">
                {selectedCampus.securityFeatures.map((feature, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5 text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <p className="text-[11px] text-slate-400">
                  <strong className="text-slate-300">Hostel & Living:</strong> {selectedCampus.hostelDetails}
                </p>
              </div>
            </div>

            {/* Why NIAT vs Tier-3 Quick Primer */}
            <div className="bg-gradient-to-br from-[#111d4a]/80 to-[#0b132b] border border-blue-500/20 rounded-2xl p-6 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#3a86ff] flex items-center space-x-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>The Bottom-of-Funnel Reality</span>
                </span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono">
                  Parent FAQ
                </span>
              </div>

              <h3 className="text-sm font-bold text-white leading-snug">
                Why pay ₹{ (selectedCampus.totalFee / 100000).toFixed(1) }L when local colleges cost ₹4L?
              </h3>

              <div className="text-xs text-slate-300 space-y-2">
                <p className="leading-relaxed">
                  In typical tier-3 colleges, students spend 4 years learning outdated syllabi with zero live code deployment, leading to ₹3.5 LPA mass recruiter service jobs.
                </p>
                <p className="leading-relaxed text-blue-200">
                  NIAT students build <strong>50+ production systems</strong>, resulting in <strong>₹7.5L - ₹15L+ starting compensation</strong> and complete tuition recovery within 12-16 months.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* COMPONENT 2 & 3 PRESENTATION: Dynamic Report Display */}
        {report && (
          <section id="roi-report-section" className="pt-8 border-t border-slate-800/80 space-y-8">
            {/* Report Header Card */}
            <div className="bg-gradient-to-r from-[#0b132b] via-[#111d4a] to-[#0b132b] border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-semibold text-[#3a86ff] uppercase tracking-wider mb-1">
                    <BadgeCheck className="w-4 h-4" />
                    <span>Official NIAT Career & ROI Report</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">ID: {reportLeadId || "Verified"}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Diagnostic Analysis for {studentName}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">
                    Target Host Campus: <strong className="text-white">{reportCampus?.name || selectedCampus.name}</strong> ({reportCampus?.city || selectedCampus.city})
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print PDF</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copiedShare ? "Summary Copied!" : "Share Summary"}</span>
                  </button>

                  <button
                    onClick={() => handleSendEmail(customRecipientEmail || parentEmail)}
                    disabled={emailSending}
                    className="px-4 py-2 rounded-xl bg-[#3a86ff] hover:bg-blue-600 disabled:opacity-50 text-xs font-bold text-white shadow-lg shadow-blue-500/20 flex items-center space-x-1.5 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{emailSending ? "Sending Report..." : "Send to Email"}</span>
                  </button>
                </div>
              </div>

              {/* Dedicated Official Email Report Dispatcher Box */}
              <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#070d1e] to-[#111d4a] border border-blue-500/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/40 text-[#3a86ff] flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white flex items-center space-x-1.5">
                        <span>Official Evaluation Report Email Dispatch</span>
                        <span className="text-[10px] bg-blue-500/20 text-[#3a86ff] px-2 py-0.5 rounded-full font-bold">PDF-Ready</span>
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-300">
                        Dispatches institutional accreditation seals, break-even metrics & vernacular reassurance letter directly to the parent.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <input
                      type="email"
                      value={customRecipientEmail || parentEmail}
                      onChange={(e) => setCustomRecipientEmail(e.target.value)}
                      placeholder="parent@example.com"
                      className="w-full sm:w-60 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#3a86ff]"
                    />
                    <button
                      onClick={() => handleSendEmail(customRecipientEmail || parentEmail)}
                      disabled={emailSending}
                      className="px-4 py-2 rounded-xl bg-[#3a86ff] hover:bg-blue-600 disabled:opacity-50 text-xs font-bold text-white shadow-lg shadow-blue-500/20 flex items-center space-x-1.5 transition shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{emailSending ? "Sending..." : "Send Now"}</span>
                    </button>
                  </div>
                </div>

                {/* Email Delivery Feedback Card */}
                {emailStatus && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center justify-between transition-all ${
                      emailStatus === "sent"
                        ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                        : emailStatus === "simulated"
                        ? "bg-amber-500/15 border border-amber-500/30 text-amber-300"
                        : "bg-red-500/15 border border-red-500/30 text-red-300"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {emailStatus === "sent" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : emailStatus === "simulated" ? (
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                      <span className="leading-relaxed">
                        {emailStatus === "sent" &&
                          (emailMessage || `Official evaluation report successfully delivered to ${customRecipientEmail || parentEmail} via Resend.`)}
                        {emailStatus === "simulated" &&
                          (emailMessage || `Report prepared and queued for ${customRecipientEmail || parentEmail}. (Simulation Mode: Add RESEND_API_KEY in .env.local for live inbox delivery).`)}
                        {emailStatus === "error" &&
                          (emailMessage || "Failed to dispatch email. Please check the recipient address.")}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded shrink-0 ${
                        emailStatus === "sent"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : emailStatus === "simulated"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {emailStatus === "sent" ? "Delivered" : emailStatus === "simulated" ? "Simulated" : "Error"}
                    </span>
                  </div>
                )}
              </div>

              {/* 3 Top Quantitative Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
                {/* 1. Break-Even Horizon */}
                <div className="bg-[#0b132b]/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Break-Even Horizon</span>
                    <Clock className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="mt-2 flex items-baseline space-x-2">
                    <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400">
                      {report.breakEvenMonths}
                    </span>
                    <span className="text-sm font-semibold text-slate-300">Months</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Total ₹{((reportCampus?.totalFee || selectedCampus.totalFee) / 100000).toFixed(1)}L fees fully recovered within {report.breakEvenMonths} months of employment.
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                    Tier-3 College Benchmark: <strong className="text-amber-400">42 - 50 Months</strong>
                  </div>
                </div>

                {/* 2. Starting Compensation Range */}
                <div className="bg-[#0b132b]/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tech Starting Package</span>
                    <TrendingUp className="w-4 h-4 text-[#3a86ff]" />
                  </div>
                  <div className="mt-2 flex items-baseline space-x-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#3a86ff]">
                      {report.startingSalaryRange}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Product engineering, cloud & modern AI developer positions across NxtWave corporate hiring networks.
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                    Mass Recruiter Baseline: <strong className="text-slate-400">₹3.2 - ₹3.6 LPA</strong>
                  </div>
                </div>

                {/* 3. 4-Year Wealth Surplus Delta */}
                <div className="bg-[#0b132b]/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">4-Year Net Career Delta</span>
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="mt-2 flex items-baseline space-x-2">
                    <span className="text-3xl sm:text-4xl font-extrabold text-cyan-400">
                      +₹28.5L
                    </span>
                    <span className="text-sm font-semibold text-slate-300">Surplus</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Cumulative earnings difference over 4 post-graduation years compared to a conventional IT services job.
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                    Calculated on standard 18% annual tech promotion trajectory.
                  </div>
                </div>
              </div>
            </div>

            {/* Head-to-Head Comparison Matrix */}
            <div className="bg-[#0b132b] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                    <span>Head-to-Head Comparison: NIAT vs. Tier-3 Regional College</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Objective breakdown addressing parent questions on practical skill vs. traditional theory
                  </p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-blue-500/10 text-[#3a86ff] font-semibold border border-blue-500/20 self-start">
                  Academic Audit
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* NIAT Host Campus Card */}
                <div className="bg-gradient-to-b from-[#111d4a]/90 to-[#0b132b] border-2 border-[#3a86ff]/40 rounded-2xl p-5 space-y-4 shadow-xl shadow-blue-500/10">
                  <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-[#3a86ff] flex items-center justify-center text-white font-black text-xs">
                        N
                      </div>
                      <span className="font-extrabold text-white text-base">
                        NxtWave NIAT Host Campus
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Recommended Path
                    </span>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <p className="font-bold text-[#3a86ff] uppercase tracking-wider text-[11px] mb-1">
                        🛠 Practical Builds & Portfolio
                      </p>
                      <p className="text-slate-200 leading-relaxed">
                        {report.traditionalCollegeROIComparison.niatProjects}
                      </p>
                    </div>

                    <div>
                      <p className="font-bold text-[#3a86ff] uppercase tracking-wider text-[11px] mb-1">
                        💼 Placements & Recruiter Quality
                      </p>
                      <p className="text-slate-200 leading-relaxed">
                        {report.traditionalCollegeROIComparison.niatPlacement}
                      </p>
                    </div>

                    <div>
                      <p className="font-bold text-[#3a86ff] uppercase tracking-wider text-[11px] mb-1">
                        📜 Degree Recognition & AICTE/UGC Status
                      </p>
                      <p className="text-slate-200 leading-relaxed">
                        {report.traditionalCollegeROIComparison.degreeRecognition}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tier-3 Regional College Card */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs">
                        T
                      </div>
                      <span className="font-bold text-slate-300 text-base">
                        Standard Tier-3 Regional Engineering College
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      Conventional Route
                    </span>
                  </div>

                  <div className="space-y-4 text-xs text-slate-400">
                    <div>
                      <p className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                        🛠 Academic Builds
                      </p>
                      <p className="leading-relaxed">
                        {report.traditionalCollegeROIComparison.traditionalProjects}
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                        💼 Placements & Career Trajectory
                      </p>
                      <p className="leading-relaxed">
                        {report.traditionalCollegeROIComparison.traditionalPlacement}
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                        📜 Accreditation
                      </p>
                      <p className="leading-relaxed">
                        Affiliated state university degree; minimal industry collaboration or modern software portfolio validation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vernacular Parent Reassurance Letter */}
            <div className="bg-gradient-to-br from-[#111d4a]/90 via-[#0b132b] to-[#1c2541]/80 border-2 border-blue-400/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-5 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-[#3a86ff]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#3a86ff] uppercase tracking-wider">
                      Official Vernacular Reassurance Letter
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                      {report.parentReassuranceLetter.title}
                    </h3>
                  </div>
                </div>
                <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-xs font-semibold text-blue-300 border border-blue-500/30">
                  <Languages className="w-3.5 h-3.5" />
                  <span>Language: {report.parentReassuranceLetter.language}</span>
                </div>
              </div>

              {/* Letter Body */}
              <div className="bg-[#070d1e]/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed whitespace-pre-line font-normal">
                  {report.parentReassuranceLetter.body}
                </p>

                {/* Key Assurance Bulletins */}
                <div className="pt-6 border-t border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#3a86ff]">
                    Core Institutional Guarantees for Parents:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {report.parentReassuranceLetter.keyAssurances.map((item, idx) => (
                      <div key={idx} className="flex items-start space-x-2.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-200 leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Counselor Contact Callout */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <div className="text-xs text-slate-300 flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-[#3a86ff] shrink-0" />
                  <span>
                    Host Campus: <strong className="text-white">{reportCampus?.name}</strong> • Resident Campus Director Helpline Active
                  </span>
                </div>
                <Link
                  href="/counselor"
                  className="text-xs font-bold text-white bg-[#3a86ff] hover:bg-blue-600 px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shrink-0"
                >
                  <span>Admission Rep CRM View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070d1e] py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 NxtWave NIAT. Empowering next-generation software innovators across India.</p>
          <div className="flex items-center space-x-6">
            <span className="text-slate-500">UGC Recognized Campuses</span>
            <span className="text-slate-500">AICTE Aligned Credits</span>
            <Link href="/counselor" className="text-[#3a86ff] hover:underline font-medium">
              Counselor Pre-Call Briefs
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
