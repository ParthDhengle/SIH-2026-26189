import React, { useState } from 'react';
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

export default function Investigation({ caseData }) {
  // Encapsulated chat history state mapped per case ID
  const [chatHistories, setChatHistories] = useState({
    "CASE-2026-001": [
      { sender: 'ai', text: 'Cognitive Connection System initialized. Ask anything about Operation Blackout.' }
    ],
    "CASE-2026-002": [
      { sender: 'ai', text: 'Cognitive Connection System initialized. Ask anything about the Sector 15 Cyber Extortion group.' }
    ],
    "CASE-2026-003": [
      { sender: 'ai', text: 'Cognitive Connection System initialized. Ask anything about the Vikram Hawala Syndicate.' }
    ]
  });

  const [inputVal, setInputVal] = useState('');

  // Retrieve current active chat history
  const activeChat = chatHistories[caseData.id] || [
    { sender: 'ai', text: 'Cognitive system initialized. Ask a question regarding this case.' }
  ];

  const updateActiveChat = (newMessages) => {
    setChatHistories({
      ...chatHistories,
      [caseData.id]: newMessages
    });
  };

  const handleSend = (text) => {
    if (!text.trim()) return;

    const userMsg = { sender: 'user', text };
    const nextChat = [...activeChat, userMsg];
    updateActiveChat(nextChat);
    setInputVal('');

    // Simulate AI response delay
    setTimeout(() => {
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
      </div>

      {/* Input panel & Suggested Chips */}
      <div className="border-t border-cyber-border bg-white p-4 space-y-3 z-10">
        
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
