export interface Campus {
  id: string;
  name: string;
  universityName: string;
  city: string;
  state: "Telangana" | "Karnataka" | "Maharashtra" | "Andhra Pradesh" | "Rajasthan";
  totalFee: number;
  totalFeeDisplay: string;
  annualFeeDisplay: string;
  accreditation: string;
  hostelDetails: string;
  securityFeatures: string[];
  techEcosystem: string;
}

export const CAMPUSES: Campus[] = [
  {
    id: "chaitanya-hyd",
    name: "Chaitanya Deemed University (Hyderabad)",
    universityName: "Chaitanya Deemed to be University",
    city: "Hyderabad",
    state: "Telangana",
    totalFee: 1000000,
    totalFeeDisplay: "₹10,00,000",
    annualFeeDisplay: "₹2,50,000/yr",
    accreditation: "UGC Category-1 Deemed to be University, AICTE Approved, NAAC 'A' Accredited",
    hostelDetails: "Separate air-cooled boys & girls hostels with 24x7 resident wardens, hygienic multi-cuisine dining, and doctor-on-call.",
    securityFeatures: [
      "Biometric gated turnstiles with RFID smart cards",
      "250+ CCTV surveillance perimeter cameras",
      "Strict zero-ragging anti-ragging squad & 8:30 PM curfews for 1st years",
      "Direct app-based parent gate-pass approval system"
    ],
    techEcosystem: "Located in Hyderabad tech corridor (HITEC City & Gachibowli accessible) with visits from Microsoft, Amazon, and ServiceNow hubs."
  },
  {
    id: "malla-reddy-hyd",
    name: "Malla Reddy Vishwavidyapeeth (Hyderabad)",
    universityName: "Malla Reddy Vishwavidyapeeth",
    city: "Hyderabad",
    state: "Telangana",
    totalFee: 950000,
    totalFeeDisplay: "₹9,50,000",
    annualFeeDisplay: "₹2,37,500/yr",
    accreditation: "State Private University by Telangana State Legislature, UGC Recognized & AICTE compliant",
    hostelDetails: "On-campus modern hostel buildings, dedicated reading rooms, high-speed Wi-Fi, and round-the-clock water and power backup.",
    securityFeatures: [
      "24/7 armed security personnel at all access checkpoints",
      "Comprehensive digital visitor logging",
      "Parent SMS notifications on campus exit and entry",
      "On-campus ambulance and 200-bed hospital affiliation"
    ],
    techEcosystem: "Direct tie-ups with Hyderabad software clusters, fintech hubs, and NxtWave corporate partner networks."
  },
  {
    id: "svyasa-blr",
    name: "S-VYASA University (Bengaluru)",
    universityName: "S-VYASA Deemed to be University",
    city: "Bengaluru",
    state: "Karnataka",
    totalFee: 1200000,
    totalFeeDisplay: "₹12,00,000",
    annualFeeDisplay: "₹3,00,000/yr",
    accreditation: "Deemed-to-be-University under Section 3 of UGC Act 1956, NAAC 'A+' Rated",
    hostelDetails: "Lush green peaceful Prashanti Nilayam campus with serene environment, wholesome vegetarian nutritious food, and indoor sports complex.",
    securityFeatures: [
      "Gated green campus with 100% biometric check-in",
      "Senior faculty resident proctors residing on each hostel floor",
      "Parental video call support and digital health logs",
      "Zero tolerance substance & ragging policy with institutional oversight"
    ],
    techEcosystem: "Bengaluru India Silicon Valley advantage: rapid access to Bellandur, Whitefield, and Electronic City tech parks."
  },
  {
    id: "yenepoya-blr",
    name: "Yenepoya Deemed University (Bengaluru/Mangalore)",
    universityName: "Yenepoya Deemed to be University",
    city: "Bengaluru / Mangalore",
    state: "Karnataka",
    totalFee: 1050000,
    totalFeeDisplay: "₹10,50,000",
    annualFeeDisplay: "₹2,62,500/yr",
    accreditation: "UGC Deemed University, NAAC 'A+' Grade, NIRF Top 100 Ranked Institution",
    hostelDetails: "Premium hostel accommodations with AC/non-AC options, attached restrooms, solar hot water, laundry facility, and cafeteria.",
    securityFeatures: [
      "24-hour centralized security command center",
      "Strict biometric student attendance taken twice daily at hostel",
      "Dedicated lady wardens and female security staff for girls block",
      "Counseling center with certified mental wellness counselors"
    ],
    techEcosystem: "Karnataka IT innovation ecosystem access with corporate mentors from tier-1 global tech MNCs."
  },
  {
    id: "adypu-pune",
    name: "Ajeenkya DY Patil University (Pune)",
    universityName: "Ajeenkya DY Patil University",
    city: "Pune",
    state: "Maharashtra",
    totalFee: 1400000,
    totalFeeDisplay: "₹14,00,000",
    annualFeeDisplay: "₹3,50,000/yr",
    accreditation: "State Private University approved by Government of Maharashtra and recognized by UGC",
    hostelDetails: "State-of-the-art international-standard student housing in Lohegaon Pune, multi-cuisine food court, modern gym, and maker spaces.",
    securityFeatures: [
      "Integrated campus security grid with automated license plate recognition",
      "Smart-card hostel access control",
      "24-hour campus patrolling squad & emergency response team",
      "Parent portal with live attendance and fee transparency"
    ],
    techEcosystem: "Pune Hinjawadi & Kharadi IT hubs proximity: high concentration of product startups, automotive tech, and GCCs."
  },
  {
    id: "sgu-kolhapur",
    name: "Sanjay Ghodawat University (Kolhapur)",
    universityName: "Sanjay Ghodawat University",
    city: "Kolhapur",
    state: "Maharashtra",
    totalFee: 1000000,
    totalFeeDisplay: "₹10,00,000",
    annualFeeDisplay: "₹2,50,000/yr",
    accreditation: "State Private University under Maharashtra Act XL of 2017, UGC recognized & AICTE approved",
    hostelDetails: "Spacious multi-story hostels surrounded by scenic Sahyadri hills, RO purified drinking water, uninterrupted Wi-Fi, and library.",
    securityFeatures: [
      "Rigorous 3-tier security protocol at entrance gates",
      "CCTV monitoring across dining halls, corridors, and campus perimeters",
      "Parent permission required via automated IVR/SMS for all overnight leaves",
      "Dedicated resident medical officer and first-aid center"
    ],
    techEcosystem: "Direct campus placement drives connecting western Maharashtra students with Mumbai, Pune, and Bengaluru tech recruiters."
  },
  {
    id: "chalapathi-guntur",
    name: "Chalapathi Institute of Engg & Tech (Guntur)",
    universityName: "Chalapathi Institute of Engineering and Technology (Autonomous)",
    city: "Guntur",
    state: "Andhra Pradesh",
    totalFee: 850000,
    totalFeeDisplay: "₹8,50,000",
    annualFeeDisplay: "₹2,12,500/yr",
    accreditation: "UGC Autonomous Institution, Permanently Affiliated to JNTUK, AICTE Approved, NAAC 'A' Grade",
    hostelDetails: "Secure and homely residential facilities with clean hygienic South-Indian meals, sports grounds, and Wi-Fi computer labs open late.",
    securityFeatures: [
      "Zero-tolerance disciplinary committee and anti-ragging squad",
      "Biometric presence recording with daily SMS dispatch to parents",
      "Female security wardens and 24x7 gatekeepers",
      "Campus perimeter surveillance network"
    ],
    techEcosystem: "Proximity to Amaravati capital region & Vijayawada-Guntur industrial tech clusters with dedicated NxtWave remote hiring hubs."
  },
  {
    id: "vgu-jaipur",
    name: "Vivekananda Global University (Jaipur)",
    universityName: "Vivekananda Global University",
    city: "Jaipur",
    state: "Rajasthan",
    totalFee: 1000000,
    totalFeeDisplay: "₹10,00,000",
    annualFeeDisplay: "₹2,50,000/yr",
    accreditation: "State Private University under Rajasthan State Act, NAAC 'A+' Accredited, AICTE Approved",
    hostelDetails: "Air-cooled and AC hostel rooms, pure vegetarian hygienically cooked meals, gym, indoor badminton court, and dispensary.",
    securityFeatures: [
      "24/7 security surveillance with 300+ high-definition cameras",
      "Strict entry restrictions: biometric validation for all residents",
      "Warden-accompanied movement for off-campus excursions",
      "Resident doctors and on-call university ambulance"
    ],
    techEcosystem: "Rapid connection to Delhi-NCR and Jaipur IT SEZs (Mahindra World City) hiring for cloud, AI, and enterprise tech roles."
  }
];

export const CAMPUSES_BY_STATE: Record<string, Campus[]> = CAMPUSES.reduce((acc, campus) => {
  if (!acc[campus.state]) {
    acc[campus.state] = [];
  }
  acc[campus.state].push(campus);
  return acc;
}, {} as Record<string, Campus[]>);
