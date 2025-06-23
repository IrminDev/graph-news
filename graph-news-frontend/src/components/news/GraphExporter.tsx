import React, { useState } from 'react';
import { Download, Check, ChevronDown } from 'lucide-react';

interface GraphExporterProps {
  graphData: any;
  darkMode: boolean;
  fileName?: string;
}

const GraphExporter: React.FC<GraphExporterProps> = ({ graphData, darkMode, fileName = 'graph-export' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  // Available export formats
  const exportFormats = [
    { id: 'json', name: 'JSON', description: 'Standard JSON format' },
    { id: 'gexf', name: 'GEXF', description: 'Graph Exchange XML Format (for Gephi)' },
    { id: 'graphml', name: 'GraphML', description: 'XML-based graph format' },
    { id: 'dot', name: 'DOT', description: 'GraphViz DOT format' }
  ];

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleExport = (format: string) => {
    let dataStr = '';
    let mimeType = '';
    let fileExtension = '';

    try {
      switch (format) {
        case 'json':
            // Clean JSON export
            const cleanedGraph = {
                nodes: graphData.nodes.map((node: any) => ({
                id: node.id,
                name: node.name,
                type: node.type,
                color: node.color,
                mentionCount: node.mentionCount || 0,
                size: node.val || 5
                })),
                links: graphData.links.map((link: any) => {
                // Properly extract source and target IDs
                const sourceId = getNodeId(link.source);
                const targetId = getNodeId(link.target);
                
                return {
                    source: sourceId,
                    target: targetId,
                    type: link.type || '',
                    value: link.value || 1
                };
                })
            };
            dataStr = JSON.stringify(cleanedGraph, null, 2);
            mimeType = 'application/json';
            fileExtension = 'json';
            break;
        
        case 'gexf':
            dataStr = convertToGEXF(graphData);
            mimeType = 'application/xml';
            fileExtension = 'gexf';
            break;
          
        case 'graphml':
            dataStr = convertToGraphML(graphData);
            mimeType = 'application/xml';
            fileExtension = 'graphml';
            break;

        case 'dot':
            dataStr = convertToDOT(graphData);
            mimeType = 'text/plain';
            fileExtension = 'dot';
            break;

        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      // Create a download link
      const blob = new Blob([dataStr], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Show success indicator
      setExportSuccess(format);
      setTimeout(() => setExportSuccess(null), 2000);
      setIsOpen(false);
    } catch (error) {
      console.error(`Error exporting graph as ${format}:`, error);
      alert(`Failed to export as ${format}. See console for details.`);
    }
  };

    // Convert graph data to GraphViz DOT format
    const convertToDOT = (data: any) => {
        // Start with digraph definition
        let dotContent = 'digraph G {\n';
        
        // Add graph styling options
        dotContent += '  // Graph styling\n';
        dotContent += '  graph [overlap=false, splines=true, bgcolor="white"];\n';
        dotContent += '  node [style=filled, shape=circle];\n\n';
        
        // Add nodes
        dotContent += '  // Nodes\n';
        data.nodes.forEach((node: any) => {
        const nodeId = getNodeId(node);
        const colorAttr = node.color ? `, fillcolor="${node.color}"` : '';
        const sizeValue = node.val || 5;
        // Scale node size for GraphViz
        const scaledSize = Math.max(0.3, sizeValue / 10);
        
        dotContent += `  "${nodeId}" [label="${escapeGraphvizString(node.name || '')}", tooltip="${escapeGraphvizString(node.type || '')}"${colorAttr}, width=${scaledSize}, height=${scaledSize}];\n`;
        });
        
        dotContent += '\n  // Edges\n';
        // Add edges
        data.links.forEach((link: any) => {
        const sourceId = getNodeId(link.source);
        const targetId = getNodeId(link.target);
        const weight = link.value || 1;
        const label = link.type || '';
        
        dotContent += `  "${sourceId}" -> "${targetId}" [label="${escapeGraphvizString(label)}", weight=${weight}];\n`;
        });
        
        // Close graph
        dotContent += '}\n';
        
        return dotContent;
    };
  
    // Helper function to escape strings for GraphViz DOT format
    const escapeGraphvizString = (str: string) => {
        if (typeof str !== 'string') return '';
        return str
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n');
    };

  // Convert graph data to GEXF (Gephi format)
  const convertToGEXF = (data: any) => {
    const header = `<?xml version="1.0" encoding="UTF-8"?>
    <gexf xmlns="http://www.gexf.net/1.2draft" 
      xmlns:viz="http://www.gexf.net/1.2draft/viz"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.gexf.net/1.2draft http://www.gexf.net/1.2draft/gexf.xsd"
      version="1.2">
  <meta lastmodifieddate="${new Date().toISOString().split('T')[0]}">
    <creator>Graph News Explorer</creator>
    <description>Knowledge graph export</description>
  </meta>
  <graph mode="static" defaultedgetype="directed">
    <attributes class="node">
      <attribute id="0" title="type" type="string"/>
      <attribute id="1" title="mentionCount" type="integer"/>
    </attributes>`;
    
    // Add nodes
    let nodesXml = '    <nodes>\n';
    data.nodes.forEach((node: any) => {
      nodesXml += `      <node id="${node.id}" label="${escapeXml(node.name)}">
        <attvalues>
          <attvalue for="0" value="${escapeXml(node.type)}"/>
          ${node.mentionCount ? `<attvalue for="1" value="${node.mentionCount}"/>` : ''}
        </attvalues>
        <viz:color r="${hexToRgb(node.color).r}" g="${hexToRgb(node.color).g}" b="${hexToRgb(node.color).b}"/>
        <viz:size value="${node.val || 5}"/>
      </node>\n`;
    });
    nodesXml += '    </nodes>\n';
    
    // Add edges
    let edgesXml = '    <edges>\n';
    data.links.forEach((link: any, index: number) => {
    const sourceId = getNodeId(link.source);
    const targetId = getNodeId(link.target);
    
    edgesXml += `      <edge id="${index}" source="${sourceId}" target="${targetId}" label="${escapeXml(link.type || '')}" weight="${link.value || 1}"/>\n`;
    });
    edgesXml += '    </edges>\n';
    
    const footer = '  </graph>\n</gexf>';
    
    return header + '\n' + nodesXml + edgesXml + footer;
  };

const convertToGraphML = (data: any) => {
    const header = `<?xml version="1.0" encoding="UTF-8"?>
  <graphml xmlns="http://graphml.graphdrawing.org/xmlns">
    <key id="label" for="node" attr.name="label" attr.type="string"/>
    <key id="type" for="node" attr.name="type" attr.type="string"/>
    <key id="mentionCount" for="node" attr.name="mentionCount" attr.type="int"/>
    <key id="color" for="node" attr.name="color" attr.type="string"/>
    <key id="size" for="node" attr.name="size" attr.type="double"/>
    <key id="relation" for="edge" attr.name="relation" attr.type="string"/>
    <key id="weight" for="edge" attr.name="weight" attr.type="double"/>
    <graph id="G" edgedefault="directed">`;
    
    // Add nodes
    let nodesXml = '';
    data.nodes.forEach((node: any) => {
      const nodeId = getNodeId(node);
      
      nodesXml += `
      <node id="${nodeId}">
        <data key="label">${escapeXml(node.name || '')}</data>
        <data key="type">${escapeXml(node.type || '')}</data>
        ${node.mentionCount ? `<data key="mentionCount">${node.mentionCount}</data>` : ''}
        <data key="color">${node.color || '#cccccc'}</data>
        <data key="size">${node.val || 5}</data>
      </node>`;
    });
    
    // Add edges
    let edgesXml = '';
    data.links.forEach((link: any, index: number) => {
      // Extract source and target IDs properly
      const sourceId = getNodeId(link.source);
      const targetId = getNodeId(link.target);
      
      edgesXml += `
      <edge id="e${index}" source="${sourceId}" target="${targetId}">
        <data key="relation">${escapeXml(link.type || '')}</data>
        <data key="weight">${link.value || 1}</data>
      </edge>`;
    });
    
    const footer = '\n  </graph>\n</graphml>';
    
    return header + nodesXml + edgesXml + footer;
  };
  
  // Helper function to get node ID regardless of whether it's an object or string
  const getNodeId = (node: any): string => {
    if (node === null || node === undefined) {
      return '';
    }
    
    // If node is an object with an id property
    if (typeof node === 'object' && node !== null) {
      return node.id || '';
    }
    
    // If node is already a string ID
    return String(node);
  };

  // Helper function to escape XML special characters
  const escapeXml = (unsafe: string) => {
    if (typeof unsafe !== 'string') return '';
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };


  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string) => {
    // Default to black if color is invalid
    if (!hex || typeof hex !== 'string') {
      return { r: 0, g: 0, b: 0 };
    }
    
    // Remove the # if present
    hex = hex.replace(/^#/, '');
    
    // Handle both 3-digit and 6-digit formats
    let r, g, b;
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
    
    // Handle invalid values
    r = isNaN(r) ? 0 : r;
    g = isNaN(g) ? 0 : g;
    b = isNaN(b) ? 0 : b;
    
    return { r, g, b };
  };

  // Render export dropdown
  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
          darkMode 
            ? 'bg-slate-700 hover:bg-slate-600 text-white' 
            : 'bg-white hover:bg-gray-100 text-slate-800 shadow-sm border border-gray-200'
        }`}
      >
        <Download className="w-4 h-4 mr-2" />
        Export Graph
        <ChevronDown className="w-4 h-4 ml-2" />
      </button>
      
      {isOpen && (
        <div 
          className={`absolute right-0 mt-2 w-64 rounded-lg shadow-lg z-10 ${
            darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'
          }`}
        >
          <div className={`p-2 border-b ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
            <h4 className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
              Export Format
            </h4>
          </div>
          <div className="p-1">
            {exportFormats.map(format => (
              <button
                key={format.id}
                onClick={() => handleExport(format.id)}
                className={`w-full text-left px-3 py-2 rounded flex items-center ${
                  darkMode 
                    ? 'hover:bg-slate-700 text-slate-300' 
                    : 'hover:bg-gray-100 text-slate-700'
                } ${exportSuccess === format.id ? (darkMode ? 'bg-slate-700' : 'bg-gray-100') : ''}`}
              >
                <div className="flex-1">
                  <div className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                    {format.name}
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {format.description}
                  </div>
                </div>
                {exportSuccess === format.id && (
                  <Check className={`w-4 h-4 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphExporter;