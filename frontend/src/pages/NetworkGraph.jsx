import React, { useState } from 'react';
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
  ShieldAlert, 
  FileText, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Search,
  Activity
} from 'lucide-react';
import { networkNodes as initialNodes, networkEdges as initialEdges } from '../data/mockData';

// --- Custom Nodes ---

// Custom Person Node
const CustomPersonNode = ({ data, selected }) => {
  const isRed = data.status === "Arrest Warrant Issued" || data.status === "Absconding";
  return (
    <div className={`p-3 rounded-xl bg-cyber-darker border-2 text-left w-52 shadow-2xl transition-all ${
      selected ? 'border-cyber-blue ring-2 ring-cyber-blue/30 scale-105' : (isRed ? 'border-cyber-red/80' : 'border-cyber-border')
    }`}>
      <Handle type="target" position={Position.Top} className="!bg-cyber-blue w-2 h-2" />
      
      <div className="flex items-center gap-2 pb-2 border-b border-cyber-border/60">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isRed ? 'bg-cyber-red/10 text-cyber-red' : 'bg-cyber-blue/10 text-cyber-blue'
        }`}>
          <User size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-slate-200 truncate">{data.label}</h4>
          <span className={`text-[8px] font-bold uppercase ${
            isRed ? 'text-cyber-red' : 'text-slate-400'
          }`}>{data.role}</span>
        </div>
        {/* Risk Score badge */}
        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
          data.riskScore > 80 ? 'bg-cyber-red/20 text-cyber-red' : 'bg-cyber-warning/20 text-cyber-warning'
        }`}>
          {data.riskScore}%
        </span>
      </div>
      
      <div className="pt-2 flex items-center justify-between text-[9px] text-slate-400">
        <span>Status:</span>
        <span className={`font-semibold ${isRed ? 'text-cyber-red' : 'text-cyber-blue'}`}>{data.status}</span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-cyber-blue w-2 h-2" />
    </div>
  );
};

// Custom Phone Node
const CustomPhoneNode = ({ data, selected }) => {
  return (
    <div className={`p-3 rounded-xl bg-cyber-darker border-2 text-left w-48 shadow-2xl transition-all ${
      selected ? 'border-cyber-blue ring-2 ring-cyber-blue/30 scale-105' : 'border-cyan-500/50'
    }`}>
      <Handle type="target" position={Position.Top} className="!bg-cyan-500 w-2 h-2" />
      
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
          <Phone size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-mono font-bold text-slate-200 truncate">{data.label}</h4>
          <span className="text-[8px] text-slate-500 font-bold block uppercase">{data.carrier}</span>
        </div>
      </div>
      <div className="mt-2 text-[9px] text-slate-400 border-t border-cyber-border/40 pt-1.5 flex justify-between">
        <span>Owner:</span>
        <span className="font-semibold text-slate-300">{data.owner}</span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-cyan-500 w-2 h-2" />
    </div>
  );
};

// Custom Vehicle Node
const CustomVehicleNode = ({ data, selected }) => {
  return (
    <div className={`p-3 rounded-xl bg-cyber-darker border-2 text-left w-48 shadow-2xl transition-all ${
      selected ? 'border-cyber-blue ring-2 ring-cyber-blue/30 scale-105' : 'border-amber-500/50'
    }`}>
      <Handle type="target" position={Position.Top} className="!bg-amber-500 w-2 h-2" />
      
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded bg-amber-500/10 text-amber-400 flex items-center justify-center">
          <Car size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-slate-200 truncate">{data.label}</h4>
          <span className="text-[8px] text-slate-500 font-bold block uppercase">{data.model}</span>
        </div>
      </div>
      <div className="mt-2 text-[9px] text-slate-400 border-t border-cyber-border/40 pt-1.5 flex justify-between">
        <span>Owner:</span>
        <span className="font-semibold text-slate-300">{data.owner}</span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-amber-500 w-2 h-2" />
    </div>
  );
};

// Custom Location Node
const CustomLocationNode = ({ data, selected }) => {
  return (
    <div className={`p-3 rounded-xl bg-cyber-darker border-2 text-left w-48 shadow-2xl transition-all ${
      selected ? 'border-cyber-blue ring-2 ring-cyber-blue/30 scale-105' : 'border-emerald-500/50'
    }`}>
      <Handle type="target" position={Position.Top} className="!bg-emerald-500 w-2 h-2" />
      
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
          <MapPin size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-slate-200 truncate">{data.label}</h4>
          <span className="text-[8px] text-slate-500 truncate block font-mono">{data.coordinates}</span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-emerald-500 w-2 h-2" />
    </div>
  );
};

// Node type registry
const nodeTypes = {
  person: CustomPersonNode,
  phone: CustomPhoneNode,
  vehicle: CustomVehicleNode,
  location: CustomLocationNode
};

export default function NetworkGraph() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle node selection
  const onNodeClick = (event, node) => {
    setSelectedNode(node);
  };

  // Find connections for details panel
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
      .filter(c => c.node); // filter out potential undefined
  };

  // Search filter
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      // Reset highlights
      setNodes(nodes.map(n => ({
        ...n,
        selected: false
      })));
      return;
    }

    const matchedNode = nodes.find(n => 
      n.data.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.data.owner && n.data.owner.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (matchedNode) {
      // Highlight matching node
      setNodes(nodes.map(n => ({
        ...n,
        selected: n.id === matchedNode.id
      })));
      setSelectedNode(matchedNode);
    }
  };

  return (
    <div className="flex-1 flex h-[calc(100vh-4rem)] relative overflow-hidden">
      {/* Network Canvas */}
      <div className="flex-1 h-full bg-cyber-darkest relative">
        {/* Search floating panel */}
        <form onSubmit={handleSearch} className="absolute top-4 left-4 z-10 w-80 flex gap-2">
          <div className="flex-1 relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={14} className="text-slate-500" />
            </span>
            <input
              type="text"
              placeholder="Search node (e.g. Rahul, Burner)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-4 py-1.5 text-xs bg-cyber-darker border border-cyber-border rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyber-blue shadow-2xl"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-cyber-blue hover:bg-cyber-blue-dark text-slate-100 font-bold rounded-lg text-[10px] transition-colors"
          >
            Locate
          </button>
        </form>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-10 bg-cyber-darker/90 backdrop-blur p-3 rounded-lg border border-cyber-border text-[9px] font-mono space-y-1.5 shadow-2xl">
          <h5 className="font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-cyber-border pb-1">Node Legend</h5>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-blue"></span>
            <span className="text-slate-300">Person of Interest</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-cyan-500"></span>
            <span className="text-slate-300">Burner Phone/SIM</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
            <span className="text-slate-300">Vehicle Registered</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
            <span className="text-slate-300">Surveillance Location</span>
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
          <Background color="#1f2937" gap={16} size={1} />
          <Controls className="!bg-cyber-darker !border-cyber-border !text-slate-200 shadow-2xl [&_button]:!border-cyber-border hover:[&_button]:!bg-cyber-light" />
        </ReactFlow>
      </div>

      {/* Details Side Panel */}
      <div className={`w-80 border-l border-cyber-border bg-cyber-darker flex flex-col h-full z-10 shadow-2xl transition-transform duration-300 ${
        selectedNode ? 'translate-x-0' : 'translate-x-full absolute right-0'
      }`}>
        {selectedNode ? (
          <div className="flex flex-col h-full divide-y divide-cyber-border">
            {/* Header info */}
            <div className="p-4 space-y-3 bg-cyber-dark/40">
              <div className="flex justify-between items-start">
                <span className={`text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded ${
                  selectedNode.type === 'person' ? 'bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue' : 
                  (selectedNode.type === 'phone' ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400' : 'bg-amber-500/10 border border-amber-500/30 text-amber-400')
                }`}>
                  {selectedNode.type} file
                </span>
                <button 
                  onClick={() => setSelectedNode(null)}
                  className="text-xs text-slate-500 hover:text-white"
                >
                  Close dossier
                </button>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                  {selectedNode.data.label}
                </h3>
                {selectedNode.data.role && (
                  <p className="text-[10px] text-cyber-red font-semibold tracking-wider uppercase">
                    {selectedNode.data.role}
                  </p>
                )}
              </div>
            </div>

            {/* Risk Index widget */}
            {selectedNode.data.riskScore && (
              <div className="p-4 bg-cyber-red/5 flex items-center justify-between border-t-0">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-500 uppercase font-bold">Threat Risk Level</span>
                  <p className="text-xs font-bold text-slate-300">High Risk Profile</p>
                </div>
                <span className="text-xl font-mono font-black text-cyber-red">
                  {selectedNode.data.riskScore}%
                </span>
              </div>
            )}

            {/* Dossier Attributes */}
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dossier Details</h4>
              <div className="space-y-2 text-xs">
                {selectedNode.type === 'person' && selectedNode.data.details && (
                  <>
                    <div className="flex justify-between py-1 border-b border-cyber-border/40">
                      <span className="text-slate-400">Age:</span>
                      <span className="text-slate-200">{selectedNode.data.details.age}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-cyber-border/40">
                      <span className="text-slate-400">Occupation:</span>
                      <span className="text-slate-200 font-medium truncate max-w-[130px]">{selectedNode.data.details.occupation}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-cyber-border/40">
                      <span className="text-slate-400">Active FIRs:</span>
                      <span className="text-cyber-red font-bold font-mono">{selectedNode.data.details.firCount}</span>
                    </div>
                    <div className="pt-2">
                      <span className="text-slate-400 block mb-1 text-[10px] uppercase font-bold">Notes:</span>
                      <p className="p-2 rounded bg-cyber-dark/65 border border-cyber-border/30 text-[11px] leading-relaxed text-slate-300">
                        {selectedNode.data.details.remarks}
                      </p>
                    </div>
                  </>
                )}

                {selectedNode.type === 'phone' && (
                  <>
                    <div className="flex justify-between py-1 border-b border-cyber-border/40">
                      <span className="text-slate-400">Carrier:</span>
                      <span className="text-slate-200 font-mono">{selectedNode.data.carrier}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-cyber-border/40">
                      <span className="text-slate-400">IMEI:</span>
                      <span className="text-slate-200 font-mono">{selectedNode.data.imei}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-cyber-border/40">
                      <span className="text-slate-400">Registered Owner:</span>
                      <span className="text-slate-200 font-bold">{selectedNode.data.owner}</span>
                    </div>
                  </>
                )}

                {selectedNode.type === 'vehicle' && (
                  <>
                    <div className="flex justify-between py-1 border-b border-cyber-border/40">
                      <span className="text-slate-400">Model:</span>
                      <span className="text-slate-200">{selectedNode.data.model}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-cyber-border/40">
                      <span className="text-slate-400">Color:</span>
                      <span className="text-slate-200">{selectedNode.data.color}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-cyber-border/40">
                      <span className="text-slate-400">Registered Owner:</span>
                      <span className="text-slate-200 font-bold">{selectedNode.data.owner}</span>
                    </div>
                  </>
                )}

                {selectedNode.type === 'location' && (
                  <>
                    <div className="flex justify-between py-1 border-b border-cyber-border/40">
                      <span className="text-slate-400">Address:</span>
                      <span className="text-slate-200 font-medium truncate max-w-[130px]">{selectedNode.data.address}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-cyber-border/40">
                      <span className="text-slate-400">Coordinates:</span>
                      <span className="text-slate-200 font-mono">{selectedNode.data.coordinates}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Direct connection listings */}
            <div className="p-4 space-y-3 bg-cyber-dark/20 max-h-56 overflow-y-auto">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Activity size={10} className="text-cyber-blue animate-pulse" />
                Network Associations
              </h4>
              <div className="space-y-2">
                {getConnections(selectedNode.id).map((c, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-cyber-dark/60 p-2 border border-cyber-border rounded hover:border-cyber-blue/30 transition-all">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-200">{c.node.data.label}</span>
                      <span className="text-[8px] text-slate-400 uppercase font-mono block">{c.node.type}</span>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyber-light border border-cyber-border text-slate-400 font-bold">
                      {c.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center text-slate-500 space-y-2">
            <ExternalLink size={20} className="text-slate-600 animate-pulse" />
            <p className="text-xs">
              Select a node in the graph workspace to pull suspect records and connection data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
