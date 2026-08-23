// AI-Powered Criminal Network Investigation System - Case-Centric Mock Database

export const casesData = {
  "CASE-2026-001": {
    id: "CASE-2026-001",
    name: "Operation Blackout - Gold Smuggling",
    type: "Smuggling & Syndicate",
    status: "Active",
    risk: "High",
    riskScore: 85,
    lastUpdated: "2026-08-23 18:30",
    summary: "Investigation into a cross-border gold smuggling ring operating through Western ports, linked to hawala channels and burner phone coordination hubs.",
    primaryPOI: "Rahul Sharma",
    stats: {
      persons: 4,
      phones: 2,
      vehicles: 1,
      locations: 2
    },
    nodes: [
      { id: "node-rahul", type: "person", data: { label: "Rahul Sharma", role: "Primary Suspect", status: "Under Surveillance", riskScore: 85, details: { age: 34, occupation: "Logistics Manager (Suspended)", firCount: 3, remarks: "Frequent visits to Warehouse Zone C. Linked to Amit Verma." } }, position: { x: 150, y: 100 } },
      { id: "node-amit", type: "person", data: { label: "Amit Verma", role: "Key Associate", status: "Arrest Warrant Issued", riskScore: 91, details: { age: 29, occupation: "Unemployed / Handler", firCount: 5, remarks: "Identified as the intermediary coordinator. Last seen near Sector 15 Safehouse." } }, position: { x: 550, y: 100 } },
      { id: "node-priya", type: "person", data: { label: "Priya Nair", role: "Financial Auditor", status: "Under Investigation", riskScore: 54, details: { age: 31, occupation: "Accountant at Shell Corp", firCount: 0, remarks: "Managed accounts for Vikram's shell companies." } }, position: { x: 350, y: 350 } },
      { id: "node-vikram", type: "person", data: { label: "Vikram Malhotra", role: "Syndicate Kingpin", status: "Absconding", riskScore: 98, details: { age: 45, occupation: "Export-Import Owner", firCount: 12, remarks: "Red Corner notice active." } }, position: { x: 750, y: 300 } },
      { id: "node-phone-rahul", type: "phone", data: { label: "98XXXXXX12", owner: "Rahul Sharma", carrier: "Airtel", imei: "358912100435122", riskScore: 70 }, position: { x: 50, y: 250 } },
      { id: "node-phone-amit", type: "phone", data: { label: "87XXXXXX09", owner: "Amit Verma", carrier: "Jio (Burner SIM)", imei: "442912558291034", riskScore: 89 }, position: { x: 650, y: 220 } },
      { id: "node-vehicle-rahul", type: "vehicle", data: { label: "Black SUV (DL-3C-AS-1234)", model: "Mahindra Scorpio", owner: "Rahul Sharma", color: "Black", riskScore: 65 }, position: { x: 180, y: 260 } },
      { id: "node-loc-warehouse", type: "location", data: { label: "Warehouse Zone C", coordinates: "28.6139° N, 77.2090° E", address: "Plot 42, Industrial Area, Sector 5, Okhla, New Delhi", riskScore: 90 }, position: { x: 350, y: 180 } },
      { id: "node-loc-safehouse", type: "location", data: { label: "Safehouse Sector 15", coordinates: "28.5708° N, 77.3258° E", address: "Flat 402, Royal Residency, Noida Sector 15", riskScore: 85 }, position: { x: 800, y: 120 } }
    ],
    edges: [
      { id: "edge-1", source: "node-rahul", target: "node-phone-rahul", label: "Owns", style: { stroke: '#2563eb' } },
      { id: "edge-2", source: "node-rahul", target: "node-vehicle-rahul", label: "Owns", style: { stroke: '#2563eb' } },
      { id: "edge-3", source: "node-rahul", target: "node-loc-warehouse", label: "Located At", animated: true, style: { stroke: '#dc2626', strokeWidth: 2 } },
      { id: "edge-4", source: "node-amit", target: "node-phone-amit", label: "Owns", style: { stroke: '#2563eb' } },
      { id: "edge-5", source: "node-amit", target: "node-loc-warehouse", label: "Located At", animated: true, style: { stroke: '#dc2626', strokeWidth: 2 } },
      { id: "edge-6", source: "node-amit", target: "node-loc-safehouse", label: "Located At", style: { stroke: '#dc2626' } },
      { id: "edge-7", source: "node-phone-rahul", target: "node-phone-amit", label: "Called (14x)", animated: true, style: { stroke: '#dc2626', strokeDasharray: '5,5', strokeWidth: 2 } },
      { id: "edge-8", source: "node-priya", target: "node-rahul", label: "Connected To", style: { stroke: '#cbd5e1' } },
      { id: "edge-9", source: "node-priya", target: "node-vikram", label: "Fund Route", animated: true, style: { stroke: '#ea580c', strokeWidth: 2 } },
      { id: "edge-10", source: "node-vikram", target: "node-amit", label: "Connected To", style: { stroke: '#dc2626', strokeWidth: 2 } }
    ],
    patterns: [
      {
        id: "PAT-001-1",
        title: "Suspicious Communication & Location Overlap",
        riskScore: 94,
        description: "Rahul Sharma and Amit Verma scheduled repeated phone calls immediately preceding overlapping presence at Warehouse Zone C.",
        relatedEntities: ["Rahul Sharma", "Amit Verma", "Warehouse Zone C"],
        evidence: "Call log record CDR-1023 and cell tower location site overlaps GPS-1023."
      },
      {
        id: "PAT-001-2",
        title: "Layered Hawker Funding Channels",
        riskScore: 82,
        description: "Indirect wire routing from Offshore imports, managed by Auditor Priya Nair, flowing directly to shell companies linked to Vikram Malhotra.",
        relatedEntities: ["Priya Nair", "Vikram Malhotra"],
        evidence: "Bank audit transactions files BANK-1023."
      }
    ],
    timeline: [
      { id: "t1-1", timestamp: "10:20 AM", type: "Call Record", severity: "High", entity: "Rahul Sharma & Amit Verma", description: "Call intercepted: 8-minute conversation discussing logistics clearance on burner phone channels.", iconName: "Phone" },
      { id: "t1-2", timestamp: "11:30 AM", type: "Vehicle Record", severity: "Medium", entity: "Black SUV (DL-3C-AS-1234)", description: "ANPR Highway Camera scanned vehicle heading to industrial sector Warehouse Zone C.", iconName: "Car" },
      { id: "t1-3", timestamp: "12:15 PM", type: "Location Record", severity: "Critical", entity: "Warehouse Zone C Overlap", description: "Simultaneous BTS cell tower triangulation registers both target SIM lines active at coordinates.", iconName: "MapPin" },
      { id: "t1-4", timestamp: "01:40 PM", type: "Document", severity: "High", entity: "Priya Nair Ledger Audit", description: "Ledger check flags INR 45,00,000 transfer from shell accounts directly linked to Vikram Malhotra.", iconName: "FileText" }
    ],
    evidence: [
      { id: "FIR-1023", type: "FIR", source: "Okhla Police Station", date: "2026-08-22", relatedEntity: "Amit Verma", status: "Verified", summary: "FIR filed under Section 120B (Criminal Conspiracy) and Customs Act for smuggling logistics routing." },
      { id: "CDR-1023", type: "Call Record", source: "Telecom Cell Site Logs", date: "2026-08-23", relatedEntity: "Rahul Sharma & Amit Verma", status: "Verified", summary: "Call detail records confirming 14 call exchanges over 48 hours, exclusively between burner lines." },
      { id: "GPS-1023", type: "Location Record", source: "BTS Network Logs", date: "2026-08-23", relatedEntity: "Warehouse Zone C Coordinates", status: "Verified", summary: "Cellular tower coordinates logs indicating concurrent overlaps near cargo warehouses." },
      { id: "BANK-1023", type: "Document", source: "Financial Intel Audit", date: "2026-08-23", relatedEntity: "Priya Nair Ledger", status: "Under Review", summary: "Audited wire ledgers verifying funds movement from shell organizations managed by Priya Nair." }
    ],
    suggestedQuestions: [
      "How is Rahul connected to Amit?",
      "Show Rahul's strongest connections.",
      "Which suspicious patterns were detected?",
      "What evidence supports this connection?"
    ],
    chatResponses: {
      "how is rahul connected to amit?": {
        text: "Rahul Sharma and Amit Verma appear connected through repeated direct burner phone communications, as well as coordinated location overlaps at Warehouse Zone C.",
        path: [
          { type: "person", name: "Rahul Sharma", subtitle: "Surveillance Target" },
          { type: "edge", relation: "Phone Communication" },
          { type: "phone", name: "98XXXXXX12", subtitle: "Rahul's device" },
          { type: "edge", relation: "Direct Call Link" },
          { type: "phone", name: "87XXXXXX09", subtitle: "Amit's Burner device" },
          { type: "edge", relation: "Phone Ownership" },
          { type: "person", name: "Amit Verma", subtitle: "Key Associate" }
        ],
        confidence: "91%",
        evidenceCard: {
          id: "CDR-1023",
          type: "Call Record",
          source: "Telecom Intercept logs",
          date: "14 Aug 2026, 10:42 PM",
          details: "14 Calls intercepted over 48 hours. Coordinated logistics discuss patterns."
        }
      },
      "show rahul's strongest connections.": {
        text: "Rahul Sharma's primary neural connections are linked to Amit Verma (via cell site overlaps) and the Black SUV (registered under his name).",
        path: [
          { type: "person", name: "Rahul Sharma", subtitle: "Target POI" },
          { type: "edge", relation: "Direct Link (91%)" },
          { type: "person", name: "Amit Verma", subtitle: "Key Associate" }
        ],
        confidence: "91%",
        evidenceCard: {
          id: "GPS-1023",
          type: "Location Record",
          source: "Cell Site Logs",
          date: "2026-08-23",
          details: "Co-location registered 3 times at Warehouse Zone C coordinates."
        }
      },
      "which suspicious patterns were detected?": {
        text: "Two threat patterns have been flagged algorithmically for this case: Suspicious Communication & Location Overlap (94% Threat Index) and Layered Hawker Funding Channels (82% Threat Index).",
        confidence: "94%",
        evidenceCard: {
          id: "FIR-1023",
          type: "FIR Log",
          source: "Okhla Police",
          date: "2026-08-22",
          details: "FIR names Amit Verma in smuggling coordination syndicate operations."
        }
      },
      "what evidence supports this connection?": {
        text: "The link between Rahul Sharma and Amit Verma is supported by call log record CDR-1023 (14 call interactions) and cell tower coordinate logs GPS-1023 showing concurrent logins at the Warehouse.",
        confidence: "91%",
        evidenceCard: {
          id: "CDR-1023",
          type: "Call Record",
          source: "Telecom Intercepts",
          date: "14 Aug 2026",
          details: "Direct phone log communications, peak late-night call timings."
        }
      }
    }
  },
  "CASE-2026-002": {
    id: "CASE-2026-002",
    name: "Sector 15 Cyber Extortion Gang",
    type: "Cyber Crime & Ransomware",
    status: "Active",
    risk: "High",
    riskScore: 82,
    lastUpdated: "2026-08-22 14:15",
    summary: "Investigation into a phishing and ransomware syndicate targeting state municipal server nodes. Trace routes show proxy connections routing through local cyber cafes.",
    primaryPOI: "Sanjay Gupta",
    stats: {
      persons: 3,
      phones: 2,
      vehicles: 1,
      locations: 1
    },
    nodes: [
      { id: "node-sanjay", type: "person", data: { label: "Sanjay Gupta", role: "Lead Hacker", status: "Surveillance Active", riskScore: 88, details: { age: 26, occupation: "System Administrator", firCount: 2, remarks: "SSH logs register entry from Sector 15 coordinates. Suspected hacker handler." } }, position: { x: 150, y: 100 } },
      { id: "node-neha", type: "person", data: { label: "Neha Patel", role: "Proxy Coordinator", status: "Under Surveillance", riskScore: 79, details: { age: 28, occupation: "Web Developer", firCount: 1, remarks: "Coordinated server passwords. Registered silver sedan scanned at coordinates." } }, position: { x: 550, y: 100 } },
      { id: "node-deepak", type: "person", data: { label: "Deepak Rao", role: "Mule Account Holder", status: "Arrest Warrant Issued", riskScore: 62, details: { age: 35, occupation: "Retail clerk", firCount: 4, remarks: "Account flagged for receiving ransomware wire transfers." } }, position: { x: 350, y: 350 } },
      { id: "node-phone-sanjay", type: "phone", data: { label: "91XXXXXX89", owner: "Sanjay Gupta", carrier: "Jio", imei: "354912990435122", riskScore: 68 }, position: { x: 50, y: 250 } },
      { id: "node-phone-neha", type: "phone", data: { label: "82XXXXXX90", owner: "Neha Patel", carrier: "Vi", imei: "441912558291034", riskScore: 72 }, position: { x: 650, y: 250 } },
      { id: "node-vehicle-neha", type: "vehicle", data: { label: "Silver Sedan (MH-12-PQ-9999)", model: "Honda City", owner: "Neha Patel", color: "Silver", riskScore: 59 }, position: { x: 750, y: 150 } },
      { id: "node-loc-cafe", type: "location", data: { label: "Cyber Cafe Sector 15", coordinates: "28.5823° N, 77.3112° E", address: "Sector 15 Market, Noida", riskScore: 82 }, position: { x: 350, y: 180 } }
    ],
    edges: [
      { id: "edge-1", source: "node-sanjay", target: "node-phone-sanjay", label: "Owns", style: { stroke: '#2563eb' } },
      { id: "edge-2", source: "node-sanjay", target: "node-loc-cafe", label: "Logged In", animated: true, style: { stroke: '#dc2626', strokeWidth: 2 } },
      { id: "edge-3", source: "node-phone-sanjay", target: "node-phone-neha", label: "SMS Texts", animated: true, style: { stroke: '#dc2626', strokeDasharray: '5,5' } },
      { id: "edge-4", source: "node-neha", target: "node-phone-neha", label: "Owns", style: { stroke: '#2563eb' } },
      { id: "edge-5", source: "node-neha", target: "node-vehicle-neha", label: "Owns", style: { stroke: '#2563eb' } },
      { id: "edge-6", source: "node-neha", target: "node-deepak", label: "Wired Cash", animated: true, style: { stroke: '#ea580c', strokeWidth: 2 } }
    ],
    patterns: [
      {
        id: "PAT-002-1",
        title: "Cyber Ransom Proxy Routing",
        riskScore: 87,
        description: "Sanjay Gupta coordinated ransomware deployment using Cyber Cafe proxies, while Neha Patel wired funds directly to Deepak Rao's mule accounts.",
        relatedEntities: ["Sanjay Gupta", "Neha Patel", "Deepak Rao"],
        evidence: "SSH coordinate logs IP-2024 and banking ledger BANK-2024."
      }
    ],
    timeline: [
      { id: "t2-1", timestamp: "09:15 AM", type: "IP Login", severity: "High", entity: "Sanjay at Cyber Cafe", description: "SSH connection logged from Noida Cyber Cafe IP range into Municipal server node.", iconName: "MapPin" },
      { id: "t2-2", timestamp: "10:40 AM", type: "SMS Record", severity: "Medium", entity: "Sanjay & Neha Text", description: "SMS intercept: Coordinated password decrypt transfers between burner lines.", iconName: "Phone" },
      { id: "t2-3", timestamp: "11:50 AM", type: "Vehicle Record", severity: "Medium", entity: "Silver Sedan (MH-12-PQ-9999)", description: "ANPR scan logs Honda City near server municipal building block.", iconName: "Car" },
      { id: "t2-4", timestamp: "02:15 PM", type: "Mule Bank Transfer", severity: "Critical", entity: "Deepak Rao Mule Account", description: "Ransomware bank wire of INR 12,00,000 flagged in Deepak Rao's Sector 15 account.", iconName: "FileText" }
    ],
    evidence: [
      { id: "FIR-2024", type: "FIR", source: "Noida Cyber Cell", date: "2026-08-21", relatedEntity: "Sanjay Gupta", status: "Verified", summary: "FIR registered for server decryption blockade and extortion demands." },
      { id: "SMS-2024", type: "Call Record", source: "Vi Network Intercepts", date: "2026-08-22", relatedEntity: "Neha Patel & Sanjay Gupta", status: "Verified", summary: "SMS log intercepts verifying server configuration and password transfers." },
      { id: "IP-2024", type: "Location Record", source: "Server Auth Logs", date: "2026-08-22", relatedEntity: "Sector 15 Cyber Cafe IP", status: "Verified", summary: "Server authentication reports verifying Noida Cyber Cafe IP logins." },
      { id: "BANK-2024", type: "Document", source: "FIU Audit Alert", date: "2026-08-22", relatedEntity: "Deepak Rao Ledger", status: "Verified", summary: "Mule banking ledger audits confirming rapid cash withdrawals following wire transfers." }
    ],
    suggestedQuestions: [
      "How is Sanjay connected to Neha?",
      "Which suspicious patterns were detected?",
      "What evidence supports this connection?"
    ],
    chatResponses: {
      "how is sanjay connected to neha?": {
        text: "Sanjay Gupta and Neha Patel are linked through SMS logs coordinating passwords, followed by Neha's silver Honda Sedan operating near Sector 15 Cyber Cafe coordinates.",
        path: [
          { type: "person", name: "Sanjay Gupta", subtitle: "Lead Hacker" },
          { type: "edge", relation: "SMS Text Exchange" },
          { type: "phone", name: "91XXXXXX89", subtitle: "Sanjay's phone" },
          { type: "edge", relation: "Telecom Intercept Logs" },
          { type: "phone", name: "82XXXXXX90", subtitle: "Neha's phone" },
          { type: "edge", relation: "Phone Owner" },
          { type: "person", name: "Neha Patel", subtitle: "Proxy Coordinator" }
        ],
        confidence: "84%",
        evidenceCard: {
          id: "SMS-2024",
          type: "SMS Record",
          source: "Telecom Intercept logs",
          date: "15 Aug 2026, 11:20 AM",
          details: "Text intercepts confirming decryption password logistics coordination."
        }
      },
      "which suspicious patterns were detected?": {
        text: "The main threat detected is the Cyber Ransom Proxy Routing pattern (87% Threat Index). Sanjay accessed systems via cafe IPs, and Neha routed cash to mule accounts.",
        confidence: "87%",
        evidenceCard: {
          id: "BANK-2024",
          type: "Bank Document",
          source: "FIU Audit",
          date: "2026-08-22",
          details: "Ledger shows ransomware money flows routed to Deepak Rao's account."
        }
      },
      "what evidence supports this connection?": {
        text: "The association is backed by SMS log record SMS-2024 (text intercepts) and server login coordinates IP-2024 pinpointing Noida Cyber Cafe logins.",
        confidence: "84%",
        evidenceCard: {
          id: "IP-2024",
          type: "Location IP",
          source: "Server Auth Logs",
          date: "2026-08-22",
          details: "Authentication reports register SSH access from Noida cafe IP coordinates."
        }
      }
    }
  },
  "CASE-2026-003": {
    id: "CASE-2026-003",
    name: "Vikram Syndicate Hawala Network",
    type: "Financial Fraud",
    status: "Under Review",
    risk: "Medium",
    riskScore: 58,
    lastUpdated: "2026-08-23 11:20",
    summary: "Illicit financial transactions and cash transfers routed through front export agencies and layered cash ledgers. Primary syndicate director Vikram Malhotra is currently absconding.",
    primaryPOI: "Rohan Mehta",
    stats: {
      persons: 3,
      phones: 1,
      vehicles: 1,
      locations: 2
    },
    nodes: [
      { id: "node-rohan", type: "person", data: { label: "Rohan Mehta", role: "Hawala Courier", status: "Surveillance Active", riskScore: 75, details: { age: 38, occupation: "Business Broker", firCount: 1, remarks: "Flagged withdrawing INR 50,00,000 cash at Connaught Place bank node." } }, position: { x: 150, y: 100 } },
      { id: "node-vikram-c3", type: "person", data: { label: "Vikram Malhotra", role: "Syndicate Kingpin", status: "Absconding", riskScore: 98, details: { age: 45, occupation: "Export Owner", firCount: 12, remarks: "Primary shell company owner. Red Corner notice active." } }, position: { x: 550, y: 100 } },
      { id: "node-priya-c3", type: "person", data: { label: "Priya Nair", role: "Auditor Associate", status: "Under Investigation", riskScore: 54, details: { age: 31, occupation: "Auditor at Shell Corp", firCount: 0, remarks: "Suspected of structuring transaction sheets." } }, position: { x: 350, y: 350 } },
      { id: "node-phone-rohan", type: "phone", data: { label: "95XXXXXX45", owner: "Rohan Mehta", carrier: "Jio", imei: "351112990435122", riskScore: 60 }, position: { x: 50, y: 250 } },
      { id: "node-vehicle-rohan", type: "vehicle", data: { label: "White Sedan (HR-26-XY-5678)", model: "Maruti Ciaz", owner: "Rohan Mehta", color: "White", riskScore: 52 }, position: { x: 650, y: 250 } },
      { id: "node-loc-office", type: "location", data: { label: "Connaught Place Office", coordinates: "28.6304° N, 77.2177° E", address: "Regal Building, Connaught Place, New Delhi", riskScore: 65 }, position: { x: 350, y: 180 } }
    ],
    edges: [
      { id: "edge-1", source: "node-rohan", target: "node-phone-rohan", label: "Owns", style: { stroke: '#2563eb' } },
      { id: "edge-2", source: "node-rohan", target: "node-vehicle-rohan", label: "Owns", style: { stroke: '#2563eb' } },
      { id: "edge-3", source: "node-rohan", target: "node-loc-office", label: "Operates At", style: { stroke: '#2563eb' } },
      { id: "edge-4", source: "node-rohan", target: "node-priya-c3", label: "Cash Routed", animated: true, style: { stroke: '#ea580c', strokeWidth: 2 } },
      { id: "edge-5", source: "node-priya-c3", target: "node-vikram-c3", label: "Wired Funds", animated: true, style: { stroke: '#dc2626', strokeWidth: 2 } },
      { id: "edge-6", source: "node-vikram-c3", target: "node-loc-office", label: "Financed Office", style: { stroke: '#cbd5e1' } }
    ],
    patterns: [
      {
        id: "PAT-003-1",
        title: "Layered Cash Placement & Wire",
        riskScore: 88,
        description: "Rohan Mehta's large cash withdrawals are layered through local consulting firms audited by Priya Nair, before being wired to offshore shell entities registered to Vikram Malhotra.",
        relatedEntities: ["Rohan Mehta", "Priya Nair", "Vikram Malhotra"],
        evidence: "Bank ledger audits BANK-3011 and encrypted texts CHAT-3011."
      }
    ],
    timeline: [
      { id: "t3-1", timestamp: "10:00 AM", type: "Bank Alert", severity: "High", entity: "Rohan Mehta CP Branch", description: "Connaught Place bank flags a cash withdrawal of INR 50,00,000 from Rohan Mehta's business file.", iconName: "FileText" },
      { id: "t3-2", timestamp: "11:15 AM", type: "ANPR Tracking", severity: "Medium", entity: "White Sedan (HR-26-XY-5678)", description: "ANPR scanner logs Maruti Ciaz outside Priya Nair's consulting firm office block.", iconName: "Car" },
      { id: "t3-3", timestamp: "01:30 PM", type: "Bank Ledger", severity: "High", entity: "Priya Nair Audit Wire", description: "Audit trail shows Priya Nair routing wire deposits to export entities owned by Vikram Malhotra.", iconName: "FileText" }
    ],
    evidence: [
      { id: "FIR-3011", type: "FIR", source: "Economic Offence Wing", date: "2026-08-20", relatedEntity: "Vikram Malhotra", status: "Verified", summary: "EOW FIR registered for laundering and Hawala channel networks." },
      { id: "BANK-3011", type: "Document", source: "Bank Audit Ledger", date: "2026-08-23", relatedEntity: "Priya Nair & Vikram Malhotra", status: "Verified", summary: "Banking ledger audits verifying cash placements and layered routing." },
      { id: "ANPR-3011", type: "Vehicle Record", source: "Highway Surveillance", date: "2026-08-23", relatedEntity: "White Sedan (HR-26-XY-5678)", status: "Verified", summary: "ANPR tracking reports positioning vehicle near Priya Nair's office during cash drop window." },
      { id: "CHAT-3011", type: "Document", source: "Encrypted Chat Logs", date: "2026-08-22", relatedEntity: "Rohan Mehta & Priya Nair", status: "Under Review", summary: "Recovered mobile messaging transcripts confirming cash drop details." }
    ],
    suggestedQuestions: [
      "How is Rohan connected to Vikram?",
      "Which suspicious patterns were detected?",
      "What evidence supports this connection?"
    ],
    chatResponses: {
      "how is rohan connected to vikram?": {
        text: "Rohan Mehta is connected to Vikram Malhotra through financial auditor Priya Nair. Rohan delivered cash drops to Priya, who then wired the layered funds directly to Vikram's shell companies.",
        path: [
          { type: "person", name: "Rohan Mehta", subtitle: "Hawala Courier" },
          { type: "edge", relation: "Cash Handover" },
          { type: "person", name: "Priya Nair", subtitle: "Financial Auditor" },
          { type: "edge", relation: "Wire Transfer Log" },
          { type: "document", name: "BANK-3011", subtitle: "INR 45,00,000 audit trail" },
          { type: "edge", relation: "Registered Account" },
          { type: "person", name: "Vikram Malhotra", subtitle: "Syndicate Kingpin" }
        ],
        confidence: "95%",
        evidenceCard: {
          id: "BANK-3011",
          type: "Bank Ledger",
          source: "Bank Audit Ledger",
          date: "23 Aug 2026, 01:30 PM",
          details: "Ledger trails verify fund movement out of consulting accounts to export firms owned by Vikram Malhotra."
        }
      },
      "which suspicious patterns were detected?": {
        text: "The primary pattern detected is the Layered Cash Placement & Wire (88% Threat Index), showing Courier Rohan's withdrawals layered through Priya's ledger to Vikram's offshore shells.",
        confidence: "88%",
        evidenceCard: {
          id: "FIR-3011",
          type: "EOW Document",
          source: "Economic Offence Wing",
          date: "2026-08-20",
          details: "FIR names Vikram Malhotra in laundering hawala conspiracy."
        }
      },
      "what evidence supports this connection?": {
        text: "The financial connection path is supported by cash ledger audits BANK-3011 and vehicle camera log transcripts ANPR-3011.",
        confidence: "95%",
        evidenceCard: {
          id: "ANPR-3011",
          type: "Vehicle Record",
          source: "Highway Surveillance",
          date: "23 Aug 2026",
          details: "ANPR tracks Rohan's White Sedan outside Priya Nair's firm coordinates during the cash transaction window."
        }
      }
    }
  }
};

export const initialCasesList = Object.values(casesData).map(c => ({
  id: c.id,
  name: c.name,
  type: c.type,
  status: c.status,
  priority: c.risk === "High" ? "High" : (c.risk === "Medium" ? "Medium" : "Critical"),
  lastUpdated: c.lastUpdated,
  description: c.summary
}));
