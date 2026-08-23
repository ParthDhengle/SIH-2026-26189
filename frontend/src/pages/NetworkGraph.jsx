import React, { useState, useEffect } from 'react';
import { 
  ReactFlow, 
  Controls, 
  Background,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  User, 
  Phone, 
  Car, 
  MapPin, 
  ExternalLink,
  Search,
  Activity
} from 'lucide-react';

// --- Custom Nodes (Light Theme styled) ---

// Custom Person Node
const CustomPersonNode = ({ data, selected }) => {
  const isHighRisk = data.riskScore > 80;
  return (
    <div className={`p-3 rounded-xl bg-white border-2 text-left w-52 shadow-md transition-all ${
      selected ? 'border-cyber-blue ring-2 ring-cyber-blue/20 scale-105' : (isHighRisk ? 'border-cyber-red/70 shadow-red-50/50' : 'border-cyber-border')
    }`}>
      <Handle type="target" position={Position.Top} className="!bg-cyber-blue w-2 h-2" />
      
      <div className="flex items-center gap-2 pb-2 border-b border-cyber-border">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isHighRisk ? 'bg-cyber-red/10 text-cyber-red' : 'bg-cyber-blue/10 text-cyber-blue'
        }`}>
          <User size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-slate-800 truncate">{data.label}</h4>
          <span className={`text-[8px] font-bold uppercase ${
            isHighRisk ? 'text-cyber-red' : 'text-slate-400'
          }`}>{data.role}</span>
        </div>
        {/* Risk Score badge */}
        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
          isHighRisk ? 'bg-cyber-red/10 text-cyber-red border border-cyber-red/20' : 'bg-cyber-warning/10 text-cyber-warning border border-cyber-warning/20'
        }`}>
          {data.riskScore}%
        </span>
      </div>
      
      <div className="pt-2 flex items-center justify-between text-[9px] text-slate-500">
        <span>Status:</span>
        <span className={`font-semibold ${isHighRisk ? 'text-cyber-red font-bold' : 'text-cyber-blue'}`}>{data.status}</span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-cyber-blue w-2 h-2" />
    </div>
  );
};

// Custom Phone Node
const CustomPhoneNode = ({ data, selected }) => {
  return (
    <div className={`p-3 rounded-xl bg-white border-2 text-left w-48 shadow-md transition-all ${
      selected ? 'border-cyber-blue ring-2 ring-cyber-blue/20 scale-105' : 'border-cyan-500/60'
    }`}>
      <Handle type="target" position={Position.Top} className="!bg-cyan-500 w-2 h-2" />
      
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded bg-cyan-50 text-cyan-600 flex items-center justify-center">
          <Phone size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-mono font-bold text-slate-800 truncate">{data.label}</h4>
          <span className="text-[8px] text-slate-400 font-bold block uppercase">{data.carrier}</span>
        </div>
      </div>
      <div className="mt-2 text-[9px] text-slate-500 border-t border-slate-100 pt-1.5 flex justify-between">
        <span>Owner:</span>
        <span className="font-semibold text-slate-700">{data.owner}</span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-cyan-500 w-2 h-2" />
    </div>
  );
};

// Custom Vehicle Node
const CustomVehicleNode = ({ data, selected }) => {
  return (
    <div className={`p-3 rounded-xl bg-white border-2 text-left w-48 shadow-md transition-all ${
      selected ? 'border-cyber-blue ring-2 ring-cyber-blue/20 scale-105' : 'border-amber-500/60'
    }`}>
      <Handle type="target" position={Position.Top} className="!bg-amber-500 w-2 h-2" />
      
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded bg-amber-50 text-amber-600 flex items-center justify-center">
          <Car size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-slate-800 truncate">{data.label}</h4>
          <span className="text-[8px] text-slate-400 font-bold block uppercase">{data.model}</span>
        </div>
      </div>
      <div className="mt-2 text-[9px] text-slate-500 border-t border-slate-100 pt-1.5 flex justify-between">
        <span>Owner:</span>
        <span className="font-semibold text-slate-700">{data.owner}</span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-amber-500 w-2 h-2" />
    </div>
  );
};

// Custom Location Node
const CustomLocationNode = ({ data, selected }) => {
  return (
    <div className={`p-3 rounded-xl bg-white border-2 text-left w-48 shadow-md transition-all ${
      selected ? 'border-cyber-blue ring-2 ring-cyber-blue/20 scale-105' : 'border-emerald-500/60'
    }`}>
      <Handle type="target" position={Position.Top} className="!bg-emerald-500 w-2 h-2" />
      
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <MapPin size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-slate-800 truncate">{data.label}</h4>
          <span className="text-[8px] text-slate-400 truncate block font-mono">{data.coordinates}</span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-emerald-500 w-2 h-2" />
    </div>
  );
};

const nodeTypes = {
  person: CustomPersonNode,
  phone: CustomPhoneNode,
  vehicle: CustomVehicleNode,
  location: CustomLocationNode
};

export default function NetworkGraph({ caseData }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync state whenever caseData changes
  useEffect(() => {
    setNodes(caseData.nodes || []);
    setEdges(caseData.edges || []);
    setSelectedNode(null);
    setSearchQuery('');
  }, [caseData]);

  // Handle node selection
  const onNodeClick = (event, node) => {
    setSelectedNode(node);
  };

  // Find neighbors dynamically
  const getConnections = (nodeId) => {
    return edges
      .filter(edge => edge.source === nodeId || edge.target === nodeId)
      .map(edge => {
        const otherId = edge.source === nodeId ? edge.target : edge.source;
        const otherNode = nodes.find(n => n.id === otherId);
        return {
          node: otherNode,
          label: edge.label
        };
      })
      .filter(c => c.node);
  };

  // Search filter
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setNodes(nodes.map(n => ({ ...n, selected: false })));
      return;
    }

    const matchedNode = nodes.find(n => 
      n.data.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.data.owner && n.data.owner.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (matchedNode) {
      setNodes(nodes.map(n => ({ ...n, selected: n.id === matchedNode.id })));
      setSelectedNode(matchedNode);
    }
  };

  return (
    <div className="flex-1 flex h-[calc(100vh-10rem)] relative overflow-hidden bg-slate-50 animate-in fade-in duration-200">
      
      {/* React Flow Canvas */}
      <div className="flex-1 h-full relative">
        
        {/* Search floating box */}
        <form onSubmit={handleSearch} className="absolute top-4 left-4 z-10 w-80 flex gap-2">
          <div className="flex-1 relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={14} className="text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Locate node (e.g. Rahul, Neha)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-4 py-1.5 text-xs bg-white border border-cyber-border rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-cyber-blue shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-cyber-blue hover:bg-cyber-blue-dark text-white font-bold rounded-lg text-[10px] transition-colors shadow-sm"
          >
            Locate
          </button>
        </form>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-10 bg-white p-3 rounded-lg border border-cyber-border text-[9px] font-mono space-y-1.5 shadow-sm">
          <h5 className="font-bold text-slate-500 uppercase tracking-wider mb-2 border-b border-slate-100 pb-1">Node Legend</h5>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-blue"></span>
            <span className="text-slate-600">Person of Interest</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-cyan-400"></span>
            <span className="text-slate-600">Phone Burner line</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-amber-400"></span>
            <span className="text-slate-600">Vehicle Registered</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-emerald-400"></span>
            <span className="text-slate-600">Location coordinate</span>
          </div>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
          minZoom={0.2}
          maxZoom={1.5}
        >
          <Background color="#cbd5e1" gap={16} size={1} />
          <Controls className="!bg-white !border-cyber-border !text-slate-700 shadow-sm [&_button]:!border-cyber-border hover:[&_button]:!bg-slate-50" />
        </ReactFlow>
      </div>

      {/* Dossier details panel */}
      <div className={`w-80 border-l border-cyber-border bg-white flex flex-col h-full z-10 shadow-lg transition-transform duration-300 ${
        selectedNode ? 'translate-x-0' : 'translate-x-full absolute right-0'
      }`}>
        {selectedNode ? (
          <div className="flex flex-col h-full divide-y divide-cyber-border text-slate-800">
            {/* Header info */}
            <div className="p-4 space-y-3 bg-slate-50/50">
              <div className="flex justify-between items-start">
                <span className={`text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded border ${
                  selectedNode.type === 'person' ? 'bg-cyber-blue/10 border-cyber-blue/20 text-cyber-blue' : 
                  (selectedNode.type === 'phone' ? 'bg-cyan-50 border-cyan-200 text-cyan-600' : 'bg-amber-50 border-amber-200 text-amber-600')
                }`}>
                  {selectedNode.type} profile
                </span>
                <button 
                  onClick={() => setSelectedNode(null)}
                  className="text-xs text-slate-400 hover:text-slate-800"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                  {selectedNode.data.label}
                </h3>
                {selectedNode.data.role && (
                  <p className="text-[10px] text-cyber-red font-bold uppercase tracking-wider">
                    {selectedNode.data.role}
                  </p>
                )}
              </div>
            </div>

            {/* Risk Index widget */}
            {selectedNode.data.riskScore && (
              <div className="p-4 bg-red-50/30 flex items-center justify-between border-t-0">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-400 uppercase font-bold">Threat Risk Level</span>
                  <p className="text-xs font-bold text-slate-600">High Risk Profile</p>
                </div>
                <span className="text-xl font-mono font-black text-cyber-red">
                  {selectedNode.data.riskScore}%
                </span>
              </div>
            )}

            {/* Dossier Attributes */}
            <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dossier Details</h4>
              <div className="space-y-2">
                {selectedNode.type === 'person' && selectedNode.data.details && (
                  <>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400 font-medium">Age:</span>
                      <span className="text-slate-700 font-semibold">{selectedNode.data.details.age}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400 font-medium">Occupation:</span>
                      <span className="text-slate-700 font-semibold truncate max-w-[130px]">{selectedNode.data.details.occupation}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400 font-medium">Active FIRs:</span>
                      <span className="text-cyber-red font-bold font-mono">{selectedNode.data.details.firCount}</span>
                    </div>
                    <div className="pt-2">
                      <span className="text-slate-400 block mb-1 text-[10px] uppercase font-bold">Notes:</span>
                      <p className="p-2.5 rounded bg-slate-50 border border-cyber-border text-[11px] leading-relaxed text-slate-600">
                        {selectedNode.data.details.remarks}
                      </p>
                    </div>
                  </>
                )}

                {selectedNode.type === 'phone' && (
                  <>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400 font-medium">Carrier:</span>
                      <span className="text-slate-700 font-semibold">{selectedNode.data.carrier}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400 font-medium">IMEI:</span>
                      <span className="text-slate-700 font-semibold font-mono">{selectedNode.data.imei}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400 font-medium">Owner:</span>
                      <span className="text-slate-700 font-semibold">{selectedNode.data.owner}</span>
                    </div>
                  </>
                )}

                {selectedNode.type === 'vehicle' && (
                  <>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400 font-medium">Model:</span>
                      <span className="text-slate-700 font-semibold">{selectedNode.data.model}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400 font-medium">Color:</span>
                      <span className="text-slate-700 font-semibold">{selectedNode.data.color}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400 font-medium">Owner:</span>
                      <span className="text-slate-700 font-semibold">{selectedNode.data.owner}</span>
                    </div>
                  </>
                )}

                {selectedNode.type === 'location' && (
                  <>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400 font-medium">Address:</span>
                      <span className="text-slate-700 font-semibold">{selectedNode.data.address}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400 font-medium">Coordinates:</span>
                      <span className="text-slate-700 font-semibold font-mono">{selectedNode.data.coordinates}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Direct neighbor lists */}
            <div className="p-4 space-y-3 bg-slate-50/30 max-h-56 overflow-y-auto">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Activity size={10} className="text-cyber-blue animate-pulse" />
                Network Associations
              </h4>
              <div className="space-y-2">
                {getConnections(selectedNode.id).map((c, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white p-2 border border-cyber-border rounded hover:border-cyber-blue/30 transition-all text-xs">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-700">{c.node.data.label}</span>
                      <span className="text-[8px] text-slate-400 uppercase font-mono block">{c.node.type}</span>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-50 border border-cyber-border text-slate-500 font-bold">
                      {c.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center text-slate-400 space-y-2">
            <ExternalLink size={20} className="text-slate-300 animate-pulse" />
            <p className="text-xs">
              Select a node in the graph workspace to pull suspect records and connection data.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
