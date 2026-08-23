// AI-Powered Criminal Network Investigation System - Mock Database

export const initialCases = [
  {
    id: "CASE-2026-001",
    name: "Operation Blackout - Gold Smuggling",
    type: "Smuggling & Syndicate",
    status: "Active",
    priority: "Critical",
    lastUpdated: "2026-08-23 18:30",
    description: "Investigation into the cross-border gold smuggling ring operating through Western ports, linked to hawala channels."
  },
  {
    id: "CASE-2026-002",
    name: "Sector 15 Cyber Extortion Gang",
    type: "Cyber Crime & Ransomware",
    status: "Under Review",
    priority: "High",
    lastUpdated: "2026-08-22 14:15",
    description: "Phishing and ransomware campaign targeting state infrastructure nodes. Trace routes show local proxies."
  },
  {
    id: "CASE-2026-003",
    name: "Vikram Syndicate Hawala Network",
    type: "Financial Fraud",
    status: "Active",
    priority: "High",
    lastUpdated: "2026-08-23 11:20",
    description: "Illicit wire transfer routing between shell companies. Primary suspect Vikram is currently absconding."
  },
  {
    id: "CASE-2026-004",
    name: "Warehouse Zone C Narcotics Distribution",
    type: "Drug Trafficking",
    status: "Solved",
    priority: "Medium",
    lastUpdated: "2026-08-19 09:40",
    description: "Raid on distribution hub in Warehouse Zone C. Recovered contraband and logs of local couriers."
  }
];

export const networkNodes = [
  // Persons
  {
    id: "node-rahul",
    type: "person",
    data: {
      label: "Rahul Sharma",
      role: "Primary Suspect",
      status: "Under Surveillance",
      riskScore: 85,
      details: {
        age: 34,
        occupation: "Logistics Manager (Suspended)",
        firCount: 3,
        remarks: "Frequent visits to Warehouse Zone C. Linked to Amit through call records."
      }
    },
    position: { x: 250, y: 100 }
  },
  {
    id: "node-amit",
    type: "person",
    data: {
      label: "Amit Verma",
      role: "Key Associate",
      status: "Arrest Warrant Issued",
      riskScore: 92,
      details: {
        age: 29,
        occupation: "Unemployed / Handler",
        firCount: 5,
        remarks: "Identified as the intermediary coordinator. Last seen near Sector 15 Safehouse."
      }
    },
    position: { x: 650, y: 100 }
  },
  {
    id: "node-priya",
    type: "person",
    data: {
      label: "Priya Nair",
      role: "Financial Auditor",
      status: "Under Investigation",
      riskScore: 54,
      details: {
        age: 31,
        occupation: "Accountant at Shell Corp",
        firCount: 0,
        remarks: "Managed accounts for Vikram's shell companies. Claiming ignorance."
      }
    },
    position: { x: 450, y: 400 }
  },
  {
    id: "node-vikram",
    type: "person",
    data: {
      label: "Vikram Malhotra",
      role: "Syndicate Kingpin",
      status: "Absconding",
      riskScore: 98,
      details: {
        age: 45,
        occupation: "Export-Import Business Owner",
        firCount: 12,
        remarks: "Red Corner notice active. Believed to have crossed borders using falsified credentials."
      }
    },
    position: { x: 850, y: 350 }
  },
  // Phones
  {
    id: "node-phone-rahul",
    type: "phone",
    data: {
      label: "+91 98765 43210",
      owner: "Rahul Sharma",
      carrier: "Airtel",
      imei: "358912100435122",
      riskScore: 70
    },
    position: { x: 100, y: 250 }
  },
  {
    id: "node-phone-amit",
    type: "phone",
    data: {
      label: "+91 87654 32109",
      owner: "Amit Verma",
      carrier: "Jio (Burner SIM)",
      imei: "442912558291034",
      riskScore: 89
    },
    position: { x: 750, y: 250 }
  },
  // Vehicles
  {
    id: "node-vehicle-rahul",
    type: "vehicle",
    data: {
      label: "Black SUV (DL-3C-AS-1234)",
      model: "Mahindra Scorpio",
      owner: "Rahul Sharma",
      color: "Black",
      riskScore: 65
    },
    position: { x: 250, y: 280 }
  },
  // Locations
  {
    id: "node-loc-warehouse",
    type: "location",
    data: {
      label: "Warehouse Zone C",
      coordinates: "28.6139° N, 77.2090° E",
      address: "Plot 42, Industrial Area, Sector 5, Okhla, New Delhi",
      riskScore: 90
    },
    position: { x: 450, y: 200 }
  },
  {
    id: "node-loc-safehouse",
    type: "location",
    data: {
      label: "Safehouse Sector 15",
      coordinates: "28.5708° N, 77.3258° E",
      address: "Flat 402, Royal Residency, Sector 15, Noida",
      riskScore: 85
    },
    position: { x: 950, y: 150 }
  }
];

export const networkEdges = [
  // Rahul Relations
  { id: "edge-1", source: "node-rahul", target: "node-phone-rahul", label: "Owns", animated: false, style: { stroke: '#3b82f6' } },
  { id: "edge-2", source: "node-rahul", target: "node-vehicle-rahul", label: "Owns", animated: false, style: { stroke: '#3b82f6' } },
  { id: "edge-3", source: "node-rahul", target: "node-loc-warehouse", label: "Visited", animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
  
  // Amit Relations
  { id: "edge-4", source: "node-amit", target: "node-phone-amit", label: "Owns", animated: false, style: { stroke: '#3b82f6' } },
  { id: "edge-5", source: "node-amit", target: "node-loc-warehouse", label: "Visited", animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
  { id: "edge-6", source: "node-amit", target: "node-loc-safehouse", label: "Located At", animated: true, style: { stroke: '#ef4444' } },

  // Phone Connection
  { id: "edge-7", source: "node-phone-rahul", target: "node-phone-amit", label: "Called (14x)", animated: true, style: { stroke: '#ef4444', strokeDasharray: '5,5', strokeWidth: 2 } },

  // Priya Relations
  { id: "edge-8", source: "node-priya", target: "node-rahul", label: "Connected To", labelBgStyle: { fill: '#111827' }, style: { stroke: '#9ca3af' } },
  { id: "edge-9", source: "node-priya", target: "node-vikram", label: "Transferred Funds", animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 } },

  // Vikram Relations
  { id: "edge-10", source: "node-vikram", target: "node-amit", label: "Connected To (Handler)", style: { stroke: '#ef4444', strokeWidth: 2 } },
  { id: "edge-11", source: "node-vikram", target: "node-loc-safehouse", label: "Financed", style: { stroke: '#f59e0b' } },
  { id: "edge-12", source: "node-vehicle-rahul", target: "node-loc-warehouse", label: "Scanned at ANPR", style: { stroke: '#3b82f6' } }
];

export const timelineEvents = [
  {
    id: "evt-1",
    timestamp: "2026-08-23 10:20 AM",
    type: "Call Record",
    severity: "High",
    entity: "Rahul Sharma & Amit Verma",
    description: "Call intercepted: 8-minute conversation on burner lines. Subject discussed 'cargo clearance details'.",
    iconName: "Phone"
  },
  {
    id: "evt-2",
    timestamp: "2026-08-23 11:30 AM",
    type: "Vehicle Detection",
    severity: "Medium",
    entity: "Black SUV (DL-3C-AS-1234)",
    description: "ANPR Camera #12 scanned Mahindra Scorpio heading towards Warehouse Zone C.",
    iconName: "Car"
  },
  {
    id: "evt-3",
    timestamp: "2026-08-23 12:15 PM",
    type: "Location Overlap",
    severity: "Critical",
    entity: "Rahul & Amit at Warehouse C",
    description: "Simultaneous cell-tower logs register Rahul and Amit's burner SIMs connected to BTS Sector 3 (Warehouse Zone C).",
    iconName: "MapPin"
  },
  {
    id: "evt-4",
    timestamp: "2026-08-23 01:40 PM",
    type: "New Connection Discovered",
    severity: "High",
    entity: "Priya Nair & Vikram Malhotra",
    description: "Bank audit flags a transaction of INR 45,00,000 from Priya's firm to a front enterprise registered under Vikram Malhotra.",
    iconName: "Link"
  },
  {
    id: "evt-5",
    timestamp: "2026-08-22 09:10 AM",
    type: "FIR Logged",
    severity: "Critical",
    entity: "Amit Verma",
    description: "FIR No: 122/2026 registered under Section 120B (Criminal Conspiracy) and Arms Act at Okhla Police Station.",
    iconName: "FileText"
  }
];

export const evidenceItems = [
  {
    id: "FIR-2026-089",
    type: "FIR",
    source: "Okhla Police Station",
    date: "2026-08-22",
    relatedEntity: "Amit Verma",
    status: "Verified",
    summary: "Conspiracy to transport unregistered commercial goods. Direct involvement of syndicate couriers confirmed.",
    fileSize: "2.4 MB"
  },
  {
    id: "CDR-2026-5541",
    type: "Call Record",
    source: "Telecom Intercept logs",
    date: "2026-08-23",
    relatedEntity: "+91 98765 43210 (Rahul) & +91 87654 32109 (Amit)",
    status: "Verified",
    summary: "Call details record showing 14 calls over 48 hours. Calls strictly timed during late-night hours.",
    fileSize: "840 KB"
  },
  {
    id: "GPS-2026-8911",
    type: "Location Record",
    source: "BTS Cell Tower Logs",
    date: "2026-08-23",
    relatedEntity: "Warehouse Zone C BTS Tower",
    status: "Verified",
    summary: "Cell site tower logs showing IMEI overlaps between target phones during suspicious hours.",
    fileSize: "1.2 MB"
  },
  {
    id: "ANPR-2026-778",
    type: "Vehicle Record",
    source: "Highway ANPR System",
    date: "2026-08-23",
    relatedEntity: "Black SUV (DL-3C-AS-1234)",
    status: "Under Review",
    summary: "High-definition camera snapshot of vehicle license plates matching the Scorpio registered under Rahul Sharma.",
    fileSize: "4.5 MB"
  },
  {
    id: "BANK-2026-1029",
    type: "Document",
    source: "Financial Intelligence Unit (FIU)",
    date: "2026-08-23",
    relatedEntity: "Priya Nair",
    status: "Pending",
    summary: "Forensic banking ledger. Shows indirect fund routing from offshore accounts to Vikram's shell companies.",
    fileSize: "11.2 MB"
  }
];

export const suspiciousPatterns = [
  {
    id: "pat-1",
    title: "Communication & Co-location Overlap",
    description: "Rahul and Amit have repeated burner phone communications scheduled immediately prior to co-location at Warehouse Zone C.",
    relatedEntities: ["Rahul Sharma", "Amit Verma", "Warehouse Zone C"],
    riskScore: 94,
    confidence: 91,
    supportingEvidence: "Intercept logs CDR-2026-5541 and BTS Logs GPS-2026-8911"
  },
  {
    id: "pat-2",
    title: "Layered Financial Fund Routing",
    description: "Offshore funds routed through local firm managed by Priya Nair, converted to cash deposits, and wired to Vikram's shell companies.",
    relatedEntities: ["Priya Nair", "Vikram Malhotra"],
    riskScore: 82,
    confidence: 78,
    supportingEvidence: "Bank audit trail files BANK-2026-1029"
  },
  {
    id: "pat-3",
    title: "Safehouse Linkage Pattern",
    description: "Multiple suspects (Amit Verma, Vikram Malhotra) sharing access to Noida Sector 15 Safehouse. Utility bills paid by Vikram's holding corp.",
    relatedEntities: ["Amit Verma", "Vikram Malhotra", "Safehouse Sector 15"],
    riskScore: 89,
    confidence: 85,
    supportingEvidence: "Surveillance log logs-2026-Noida"
  }
];

// Pre-computed connection paths for the query engine
export const connectionPaths = [
  {
    source: "rahul",
    target: "amit",
    sourceName: "Rahul Sharma",
    targetName: "Amit Verma",
    confidence: "91%",
    riskScore: 94,
    pathSteps: [
      { type: "entity", category: "Person", name: "Rahul Sharma", icon: "User", subtitle: "Surveillance Target" },
      { type: "edge", relation: "Phone Communication", source: "Registered Phone", detail: "Burner SIM Airtel" },
      { type: "entity", category: "Phone", name: "+91 98765 43210", icon: "Phone", subtitle: "Rahul's device" },
      { type: "edge", relation: "CDR Intercept logs", source: "CDR-2026-5541", detail: "14 Calls / 48 Hrs" },
      { type: "entity", category: "Phone", name: "+91 87654 32109", icon: "Phone", subtitle: "Amit's device" },
      { type: "edge", relation: "Phone Ownership", source: "Carrier Records", detail: "Burner SIM Jio" },
      { type: "entity", category: "Person", name: "Amit Verma", icon: "User", subtitle: "Key Intermediary" }
    ],
    evidence: [
      { id: "CDR-2026-5541", type: "Call Record", details: "Direct phone log communication, peak durations late night." },
      { id: "GPS-2026-8911", type: "Location Record", details: "Co-location overlap at Warehouse Zone C within 15 minutes of calls." }
    ]
  },
  {
    source: "rahul",
    target: "vikram",
    sourceName: "Rahul Sharma",
    targetName: "Vikram Malhotra",
    confidence: "82%",
    riskScore: 89,
    pathSteps: [
      { type: "entity", category: "Person", name: "Rahul Sharma", icon: "User", subtitle: "Surveillance Target" },
      { type: "edge", relation: "Direct Linkage", source: "Call Intercepts", detail: "Phone Call Chain" },
      { type: "entity", category: "Person", name: "Amit Verma", icon: "User", subtitle: "Key Associate" },
      { type: "edge", relation: "Syndicate Operations", source: "Intelligence File", detail: "Handler/Agent relationship" },
      { type: "entity", category: "Person", name: "Vikram Malhotra", icon: "ShieldAlert", subtitle: "Syndicate Kingpin" }
    ],
    evidence: [
      { id: "FIR-2026-089", type: "FIR Details", details: "Amit named Vikram as the final beneficiary during primary questioning." },
      { id: "BANK-2026-1029", type: "Financial Trail", details: "Shared safehouse payments traced back to export businesses owned by Vikram." }
    ]
  },
  {
    source: "priya",
    target: "vikram",
    sourceName: "Priya Nair",
    targetName: "Vikram Malhotra",
    confidence: "95%",
    riskScore: 82,
    pathSteps: [
      { type: "entity", category: "Person", name: "Priya Nair", icon: "User", subtitle: "Financial Auditor" },
      { type: "edge", relation: "Financial Transaction", source: "Bank Audit Ledger", detail: "Wire Transfer Log" },
      { type: "entity", category: "Document", name: "BANK-2026-1029 File", icon: "FileText", subtitle: "INR 45,00,000 Transferred" },
      { type: "edge", relation: "Registered Account", source: "FIU Intelligence", detail: "Shell company routing" },
      { type: "entity", category: "Person", name: "Vikram Malhotra", icon: "User", subtitle: "Syndicate Kingpin" }
    ],
    evidence: [
      { id: "BANK-2026-1029", type: "Document", details: "Certified transaction ledger showing fund movement out of accounts Priya Nair audited." }
    ]
  }
];

export const searchEntitiesList = [
  { id: "rahul", name: "Rahul Sharma", type: "Person" },
  { id: "amit", name: "Amit Verma", type: "Person" },
  { id: "priya", name: "Priya Nair", type: "Person" },
  { id: "vikram", name: "Vikram Malhotra", type: "Person" }
];
