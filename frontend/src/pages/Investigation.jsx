import React, { useEffect, useState } from 'react';
import { 
  Send, 
  Sparkles, 
  HelpCircle, 
  User, 
  Phone, 
  Car, 
  MapPin, 
  FileText, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function nodeType(entityType) {
  const type = String(entityType || '').toLowerCase();
  return ['person', 'phone', 'vehicle', 'location'].includes(type) ? type : 'entity';
}

function toFlowGraph(graph) {
  const nodes = (graph.nodes || []).map((node, index) => ({
    id: String(node.entity_id),
    type: nodeType(node.entity_type),
    position: { x: 120 + (index % 4) * 260, y: 100 + Math.floor(index / 4) * 180 },
    data: {
      label: node.canonical_name || node.entity_id,
      role: node.entity_type,
      status: node.status || 'Discovered',
    },
  }));
  const edges = (graph.edges || []).map((edge) => ({
    id: String(edge.relationship_id || `${edge.from_entity_id}-${edge.to_entity_id}`),
    source: String(edge.from_entity_id),
    target: String(edge.to_entity_id),
    label: edge.relationship_type || 'RELATED_TO',
  }));
  return { nodes, edges };
}

function mergeFlowGraphs(current, incoming) {
  return {
    nodes: [...current.nodes, ...incoming.nodes.filter((node) => !current.nodes.some((existing) => existing.id === node.id))],
    edges: [...current.edges, ...incoming.edges.filter((edge) => !current.edges.some((existing) => existing.id === edge.id))],
  };
}

export default function Investigation({ caseData, onGraphEvent, findings, setFindings, onFindingSelect, onInvestigationStart, onInvestigationComplete }) {
  // Encapsulated chat history state mapped per case ID
  const [chatHistories, setChatHistories] = useState({});

  const [inputVal, setInputVal] = useState('');
  const [investigationStatus, setInvestigationStatus] = useState('Ready');
  const [pendingSessionId, setPendingSessionId] = useState(null);
  const [activeSessionId, setActiveSessionId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setInvestigationStatus('Loading conversation');
    fetch(`${API_BASE}/api/cases/${encodeURIComponent(caseData.id)}/conversation`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('History unavailable')))
      .then((history) => {
        if (cancelled) return;
        if (history.session?.session_id) setActiveSessionId(history.session.session_id);
        const messages = (history.messages || []).map((message) => ({
          sender: message.role === 'investigator' ? 'user' : 'ai',
          text: message.content,
        }));
        setChatHistories((current) => ({
          ...current,
          [caseData.id]: messages.length ? messages : [{ sender: 'ai', text: 'Cognitive system initialized. Ask a question regarding this case.' }],
        }));
        setFindings(history.findings || []);
        if (history.graph) onGraphEvent((current) => mergeFlowGraphs(current, toFlowGraph(history.graph)));
        setInvestigationStatus(history.session?.status === 'COMPLETED' ? 'Investigation completed' : 'Ready');
      })
      .catch(() => {
        if (!cancelled) setInvestigationStatus('Ready');
      });
    return () => { cancelled = true; };
  }, [caseData.id, setFindings]);

  // Retrieve current active chat history
  const activeChat = chatHistories[caseData.id] || [
    { sender: 'ai', text: 'Cognitive system initialized. Ask a question regarding this case.' }
  ];

  const updateActiveChat = (newMessages) => {
    setChatHistories((current) => ({ ...current, [caseData.id]: newMessages }));
  };

  const appendActiveChat = (message) => {
    setChatHistories((current) => ({
      ...current,
      [caseData.id]: [...(current[caseData.id] || []), message]
    }));
  };

  const runLiveInvestigation = async (text, nextChat) => {
    if (!caseData.backendReady) {
      setInvestigationStatus('Case is not persisted');
      updateActiveChat([
        ...nextChat,
        {
          sender: 'ai',
          text: 'This case exists only in the local workspace and has not been saved to the investigation database. Persist this case before starting live analysis.',
          isIncomplete: true
        }
      ]);
      return;
    }
    onInvestigationStart();
    setInvestigationStatus('Creating query context');
    const queryResponse = await fetch(`${API_BASE}/api/cases/${encodeURIComponent(caseData.id)}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: text, session_id: activeSessionId })
    });
    const query = await queryResponse.json();
    if (!queryResponse.ok) throw new Error(query.detail || 'Query failed');
    if (query.status === 'CLARIFICATION_REQUIRED') {
      setPendingSessionId(query.session_id);
      updateActiveChat([...nextChat, { sender: 'ai', text: query.question, isIncomplete: true }]);
      setInvestigationStatus('Clarification required');
      return;
    }

    setActiveSessionId(query.session_id);
    await startStream(query.session_id, nextChat);
  };

  const startStream = async (sessionId, nextChat) => {
    setPendingSessionId(null);
    setActiveSessionId(sessionId);

    const socket = new WebSocket(`${API_BASE.replace(/^http/, 'ws')}/api/investigations/${sessionId}/stream`);
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'node_added' && message.node?.entity_id) {
        const node = message.node;
        onGraphEvent(current => {
          if (current.nodes.some(existing => existing.id === node.entity_id)) return current;
          return {
            ...current,
            nodes: [...current.nodes, {
              id: node.entity_id,
              type: nodeType(node.entity_type),
              position: { x: 120 + (current.nodes.length % 4) * 260, y: 100 + Math.floor(current.nodes.length / 4) * 180 },
              data: { label: node.canonical_name || node.entity_id, role: node.entity_type, status: node.status || 'Discovered' }
            }]
          };
        });
      }
      if (message.type === 'edge_added' && message.edge?.from_entity_id && message.edge?.to_entity_id) {
        const edge = message.edge;
        onGraphEvent(current => {
          const edgeId = edge.relationship_id || `${edge.from_entity_id}-${edge.to_entity_id}-${edge.relationship_type}`;
          if (current.edges.some(existing => existing.id === edgeId)) return current;
          return { ...current, edges: [...current.edges, { id: edgeId, source: edge.from_entity_id, target: edge.to_entity_id, label: edge.relationship_type || 'RELATED_TO', animated: true }] };
        });
      }
      if (message.type === 'entity_processing') setInvestigationStatus(`Processing entity at depth ${message.depth}`);
      if (message.type === 'depth_changed') setInvestigationStatus(`Depth ${message.depth}`);
      if (message.type === 'investigation_completed') {
        setInvestigationStatus('Investigation completed');
        if (message.result?.graph) onGraphEvent((current) => mergeFlowGraphs(current, toFlowGraph(message.result.graph)));
        if (message.result?.findings) setFindings((current) => [
          ...current,
          ...message.result.findings.filter((finding) => !current.some((item) => item.finding_id === finding.finding_id)),
        ]);
        appendActiveChat({ sender: 'ai', text: 'Investigation completed. The final knowledge graph and findings are ready.' });
        onInvestigationComplete();
        socket.close();
      }
      if (message.type === 'findings_ready') {
        setFindings((current) => [
          ...current,
          ...(message.findings || []).filter((finding) => !current.some((item) => item.finding_id === finding.finding_id)),
        ]);
        appendActiveChat({ sender: 'ai', text: `${message.findings?.length || 0} graph-backed investigative findings are ready below.` });
      }
      if (message.type === 'investigation_error') {
        setInvestigationStatus('Investigation failed');
        updateActiveChat([...nextChat, { sender: 'ai', text: 'The investigation could not be completed. Check the backend connection and case data.', isIncomplete: true }]);
        socket.close();
      }
    };
    socket.onerror = () => setInvestigationStatus('Stream unavailable');
    await new Promise((resolve, reject) => {
      socket.onopen = resolve;
      socket.onerror = reject;
    });
    const startResponse = await fetch(`${API_BASE}/api/investigations/${sessionId}/start`, { method: 'POST' });
    if (!startResponse.ok) throw new Error('Investigation could not start');
    setInvestigationStatus('Starting investigation');
  };

  const clarifyAndStart = async (text, nextChat) => {
    onInvestigationStart();
    setInvestigationStatus('Updating query context');
    const response = await fetch(`${API_BASE}/api/investigations/${pendingSessionId}/clarify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: text, session_id: pendingSessionId })
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.detail || 'Clarification failed');
    if (payload.status === 'CLARIFICATION_REQUIRED') {
      updateActiveChat([...nextChat, { sender: 'ai', text: payload.question, isIncomplete: true }]);
      setInvestigationStatus('Clarification required');
      return;
    }
    await startStream(payload.session_id, nextChat);
  };

  const handleSend = (text) => {
    if (!text.trim()) return;

    const userMsg = { sender: 'user', text };
    const nextChat = [...activeChat, userMsg];
    updateActiveChat(nextChat);
    setInputVal('');

    const action = pendingSessionId ? clarifyAndStart(text, nextChat) : runLiveInvestigation(text, nextChat);
    action.catch(() => {
      setInvestigationStatus('Backend unavailable');
      updateActiveChat([...nextChat, { sender: 'ai', text: 'The live investigation service is unavailable. Start FastAPI and try again.', isIncomplete: true }]);
    });
    /* Keep the existing mock experience available when no backend is configured. */
    if (!API_BASE) setTimeout(() => {
      const queryKey = text.toLowerCase().trim().replace(/[?.]$/g, '');
      
      // Look up matching pre-computed response in active case data
      let aiResponse = null;
      if (caseData.chatResponses && caseData.chatResponses[queryKey]) {
        aiResponse = caseData.chatResponses[queryKey];
      } else {
        // Fallback keyword search
        const keys = Object.keys(caseData.chatResponses || {});
        const matchedKey = keys.find(k => queryKey.includes(k) || k.includes(queryKey));
        if (matchedKey) {
          aiResponse = caseData.chatResponses[matchedKey];
        }
      }

      if (aiResponse) {
        updateActiveChat([
          ...nextChat,
          {
            sender: 'ai',
            text: aiResponse.text,
            path: aiResponse.path,
            confidence: aiResponse.confidence,
            evidenceCard: aiResponse.evidenceCard
          }
        ]);
      } else {
        // Incomplete / Unknown Query fallback
        updateActiveChat([
          ...nextChat,
          {
            sender: 'ai',
            text: 'Need more information. The query is incomplete or could not be mapped to any entity connection route in this case file. Try asking one of the suggested questions listed below.',
            isIncomplete: true
          }
        ]);
      }
    }, 600);
  };

  const getStepIcon = (type) => {
    switch (type) {
      case 'person': return <User size={14} className="text-cyber-blue" />;
      case 'phone': return <Phone size={14} className="text-cyan-500" />;
      case 'vehicle': return <Car size={14} className="text-amber-500" />;
      case 'location': return <MapPin size={14} className="text-emerald-500" />;
      default: return <FileText size={14} className="text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-cyber-darkest text-slate-800">
      
      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[calc(100vh-14rem)]">
        {activeChat.map((msg, idx) => {
          const isAI = msg.sender === 'ai';
          return (
            <div 
              key={idx} 
              className={`flex flex-col ${isAI ? 'items-start' : 'items-end'} animate-in fade-in slide-in-from-bottom-2 duration-200`}
            >
              <div className={`max-w-2xl p-4 rounded-xl shadow-sm border ${
                isAI 
                  ? 'bg-white border-cyber-border text-slate-800' 
                  : 'bg-cyber-blue text-white border-cyber-blue-dark'
              }`}>
                <p className="text-xs leading-relaxed font-sans">{msg.text}</p>

                {/* Render explainable path diagram if available */}
                {isAI && msg.path && (
                  <div className="mt-4 pt-3 border-t border-cyber-border space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Explainable Connection Route:</span>
                    <div className="flex flex-wrap items-center gap-2">
                      {msg.path.map((step, sIdx) => {
                        const isEntity = step.type !== 'edge';
                        return (
                          <React.Fragment key={sIdx}>
                            {isEntity ? (
                              <div className="flex items-center gap-1.5 bg-slate-50 border border-cyber-border p-2 rounded text-xs shadow-sm">
                                {getStepIcon(step.type)}
                                <span className="font-bold text-slate-700">{step.name}</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <span className="text-[8px] font-mono font-bold text-cyber-red px-1 bg-cyber-red/5 border border-cyber-red/10 rounded">
                                  {step.relation}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold">➔</span>
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Render inline evidence card if available */}
                {isAI && msg.evidenceCard && (
                  <div className="mt-4 p-3 bg-slate-50 border border-cyber-border rounded-lg space-y-2">
                    <div className="flex justify-between items-center border-b border-cyber-border pb-1.5">
                      <div className="flex items-center gap-1">
                        <FileText size={12} className="text-cyber-blue" />
                        <span className="text-xs font-bold text-cyber-blue font-mono">{msg.evidenceCard.id}</span>
                      </div>
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-cyber-success/15 text-cyber-success border border-cyber-success/20">
                        Confidence: {msg.confidence || '90%'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 space-y-1">
                      <div><span className="font-bold text-slate-500">Source:</span> {msg.evidenceCard.source}</div>
                      <div><span className="font-bold text-slate-500">Date:</span> {msg.evidenceCard.date}</div>
                      <p className="text-slate-600 mt-1 italic">"{msg.evidenceCard.details}"</p>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button 
                        onClick={() => alert(`Redirecting to Network view...`)}
                        className="px-2 py-1 bg-white hover:bg-slate-100 border border-cyber-border rounded text-[9px] font-bold text-slate-600 transition-all"
                      >
                        View on Network
                      </button>
                      <button 
                        onClick={() => alert(`Reviewing evidence file: ${msg.evidenceCard.id}`)}
                        className="px-2 py-1 bg-white hover:bg-slate-100 border border-cyber-border rounded text-[9px] font-bold text-slate-600 transition-all"
                      >
                        Inspect File
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {findings.length > 0 && (
          <div className="max-w-2xl space-y-2">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Investigation Findings</h3>
            {findings.map((finding) => (
              <FindingCard key={finding.finding_id} finding={finding} onSelect={onFindingSelect} />
            ))}
          </div>
        )}
      </div>

      {/* Input panel & Suggested Chips */}
      <div className="border-t border-cyber-border bg-white p-4 space-y-3 z-10">
        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyber-blue">Investigation status: {investigationStatus}</div>
        
        {/* Suggested chips list */}
        {caseData.suggestedQuestions && (
          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
            <span className="text-slate-400 font-bold uppercase tracking-wider mr-1">Suggested Analyst Queries:</span>
            {caseData.suggestedQuestions.map((q, qIdx) => (
              <button
                key={qIdx}
                onClick={() => handleSend(q)}
                className="px-2.5 py-1 bg-slate-50 hover:bg-cyber-blue/10 hover:border-cyber-blue/30 text-slate-600 hover:text-cyber-blue rounded border border-cyber-border transition-colors font-medium"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input box form */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputVal);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="Ask anything about this case (e.g. How is Rahul connected to Amit?)..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-cyber-border rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-cyber-blue transition-all"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-cyber-blue hover:bg-cyber-blue-dark text-white rounded-lg text-xs font-bold transition-all shadow flex items-center gap-1.5"
          >
            <Send size={12} /> Query
          </button>
        </form>
      </div>

    </div>
  );
}

function FindingCard({ finding, onSelect }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <button
      type="button"
      onClick={() => { setExpanded(!expanded); onSelect(expanded ? null : finding); }}
      className="w-full text-left bg-white border border-cyber-border rounded-lg p-3 shadow-sm hover:border-cyber-blue transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-bold text-slate-800">{finding.title}</span>
        <span className="text-[10px] font-mono text-cyber-blue">{Math.round((finding.confidence || 0) * 100)}%</span>
      </div>
      <p className="mt-1 text-[11px] text-slate-500">{finding.summary}</p>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-[10px] text-slate-600">
          <div>Entities: {finding.entity_ids.join(', ') || 'None'}</div>
          <div>Relationships: {finding.relationship_ids.join(', ') || 'None'}</div>
          {finding.evidence.map((evidence) => (
            <div key={evidence.source_record_id} className="font-mono">Evidence: {evidence.source_record_id} {evidence.description}</div>
          ))}
        </div>
      )}
    </button>
  );
}
