import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ForceGraph3D, { NodeObject } from 'react-force-graph-3d';
import ForceGraph2D from 'react-force-graph-2d';
import { getNewsGraph } from '../services/graph.service';
import { getNewsById } from '../services/news.service';
import * as THREE from 'three';
import SpriteText from 'three-spritetext';
import { motion } from 'framer-motion';
import { Network, Calendar, ArrowLeft, Maximize, RotateCw, Cpu, Layers, ChevronDown, HelpCircle, Activity } from 'lucide-react';

interface GraphData {
  nodes: Node[];
  links: Link[];
}

interface Node {
  id: string;
  name: string;
  type: string;
  color: string;
  val: number;
  mentionCount?: number;
}

interface Link {
  source: string;
  target: string;
  type: string;
  originalType?: string;
  value: number;
  color: string;
}

const GraphVisualization: React.FC = () => {
  const { newsId } = useParams<{ newsId: string }>();
  const navigate = useNavigate();
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [newsData, setNewsData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const graphRef = useRef<any>(null);
  const [is3D, setIs3D] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark" || 
    (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
  const [showLegend, setShowLegend] = useState<boolean>(true);

  useEffect(() => {
    // Handle dark mode from localStorage
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    async function fetchData() {
      if (!newsId) {
        setError('News ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch news details
        const newsResponse = await getNewsById(newsId);
        if ('news' in newsResponse) {
          setNewsData(newsResponse.news);
        } else {
          setError('Failed to fetch news details');
          setLoading(false);
          return;
        }
        
        // Fetch graph data
        const graphResponse = await getNewsGraph(newsId);
        if (graphResponse && graphResponse.graph) {
          transformGraphData(graphResponse.graph);
        } else {
          setError('Failed to fetch graph data');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [newsId]);

  const transformGraphData = (graphData: any) => {
    // Transform the data for force-graph - Keep existing logic
    const nodes: Node[] = [
      // News node (central)
      {
        id: graphData.news.id,
        name: graphData.news.title,
        type: 'News',
        color: darkMode ? '#4f46e5' : '#3b82f6', // Match the color from main page
        val: 15
      },
      ...graphData.entities.map((entity: any, index: number) => {
        const mentionCount = entity.mentionCount || 1;
        const sizeScale = Math.log10(mentionCount + 1) * 3; 
        
        const maxSizeFactor = 2.5;
        const importanceFactor = Math.min(1 + (mentionCount / 10), maxSizeFactor);
        
        const goldenRatio = 1.618033988749895;
        const angle = index * goldenRatio * Math.PI * 2;
        const radius = 800 + (index * 20); 
        
        return {
          id: entity.id,
          name: entity.name,
          type: entity.type,
          mentionCount: mentionCount,
          color: getColorForType(entity.type, darkMode),
          val: Math.min(5 + sizeScale, 15),
          
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          z: (Math.random() - 0.5) * 1000,
        };
      })
    ];

    const links: Link[] = [
      ...graphData.entities.map((entity: any) => ({
        source: entity.id,
        target: graphData.news.id,
        type: 'MENTIONED_IN',
        value: 0.5 + (entity.mentionCount / 20),
        color: darkMode ? 'rgba(150, 150, 180, 0.4)' : 'rgba(150, 150, 150, 0.5)'
      })),
      ...graphData.relationships.map((rel: any) => ({
        source: rel.sourceId,
        target: rel.targetId,
        type: rel.type,
        originalType: rel.originalType,
        value: 0.7 + (rel.confidence * 3),
        color: getColorForRelationship(rel.confidence, darkMode)
      }))
    ];

    setGraphData({ nodes, links });
  };

  const getColorForType = (type: string, isDark: boolean): string => {
    // Refined color palette with better coordination
    switch (type) {
      // Primary entities
      case 'Person': 
        return isDark ? '#2E073F' : '#8F87F1'; // Deep rose red / Bright rose
      
      case 'Organization': 
        return isDark ? '#7A1CAC' : '#C68EFD'; // Deep sky blue / Bright sky blue
      
      case 'Location': 
        return isDark ? '#AD49E1' : '#E9A5F1'; // Deep green / Bright green
      
      // Secondary entities
      case 'Time': 
        return isDark ? '#EBD3F8' : '#FED2E2'; // Deep purple / Soft purple
      
      case 'Numerical': 
        return isDark ? '#F7374F' : '#8F87F1'; // Deep amber / Bright amber
      
      // Tertiary entities
      case 'Miscellaneous': 
        return isDark ? '#88304E' : '#C68EFD'; // Deep slate / Soft slate
      
      case 'Concept': 
        return isDark ? '#522546' : '#E9A5F1'; // Deep fuchsia / Bright fuchsia
      
      default: 
        return isDark ? '#2C2C2C' : '#FED2E2'; // Dark zinc / Light zinc
    }
  };

  const getColorForRelationship = (confidence: number, isDark: boolean): string => {
    // Brighter colors for dark mode, more subtle for light mode
    const opacity = 0.3 + (confidence * 0.7);
    return isDark 
      ? `rgba(139, 92, 246, ${opacity})` // Indigo/purple in dark mode
      : `rgba(79, 70, 229, ${opacity})`; // Indigo in light mode
  };

  const handleNodeClick = (node: Node) => {
    if (node.type !== 'News') {
      // In the future, you might want to navigate to an entity details page
      console.log(`Clicked on entity: ${node.name} (${node.type})`);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleZoomToFit = () => {
    if (graphRef.current) {
      if (is3D) {
        // For 3D graph, position the camera further back
        graphRef.current.cameraPosition(
          { x: 0, y: 0, z: 1500 },
          { x: 0, y: 0, z: 0 },
          3000
        );
      } else {
        // For 2D graph, use the zoomToFit method
        graphRef.current.zoomToFit(400);
      }
    }
  };

  const toggleDimension = () => {
    setIs3D(!is3D);
    // Allow time for the component to re-render before zooming
    setTimeout(handleZoomToFit, 100);
  };

  // Custom Button component to match main page style
  const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { 
    className?: string; 
    children?: React.ReactNode;
    icon?: React.ReactNode;
  }> = ({ children, className, icon, ...props }) => (
    <button 
      className={`flex items-center font-medium rounded-lg transition-all duration-300 ${className}`} 
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-screen transition-colors duration-500 ${
        darkMode ? 'bg-slate-950' : 'bg-gradient-to-r from-blue-50 to-indigo-50'
      }`}>
        <div className={`w-16 h-16 border-4 border-dashed rounded-full animate-spin ${
          darkMode ? 'border-indigo-500' : 'border-indigo-600'
        }`}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen p-8 transition-colors duration-500 ${
        darkMode ? 'bg-slate-950 text-white' : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-slate-900'
      }`}>
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`rounded-xl overflow-hidden shadow-xl p-6 ${
              darkMode ? 'bg-slate-900 border border-red-900' : 'bg-white border border-red-200'
            }`}
          >
            <div className="flex items-start">
              <div className={`rounded-full p-3 mr-4 ${
                darkMode ? 'bg-red-900/30' : 'bg-red-100'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${
                  darkMode ? 'text-red-500' : 'text-red-600'
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h2 className={`text-2xl font-bold mb-2 ${
                  darkMode ? 'text-white' : 'text-slate-800'
                }`}>An Error Occurred</h2>
                <p className={`mb-4 ${
                  darkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>{error}</p>
                <Button 
                  onClick={handleBackClick}
                  className={`px-4 py-2 ${
                    darkMode 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                  icon={<ArrowLeft className="w-4 h-4" />}
                >
                  Go Back
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      darkMode ? 'bg-slate-950 text-white' : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-slate-800'
    }`}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Network className={`w-7 h-7 mr-2 ${
              darkMode ? 'text-indigo-400' : 'text-indigo-600'
            }`} />
            <h1 className={`text-2xl font-bold ${
              darkMode ? 'text-white' : 'text-slate-800'
            }`}>Knowledge Graph Explorer</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${
                darkMode 
                  ? 'bg-slate-800 hover:bg-slate-700' 
                  : 'bg-white hover:bg-gray-100 shadow-sm'
              }`}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </Button>
            
            <Button 
              onClick={handleBackClick}
              className={`px-4 py-2 ${
                darkMode 
                  ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                  : 'bg-white hover:bg-gray-100 text-slate-800 shadow-sm'
              }`}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
          </div>
        </div>
        
        {/* News Article Card */}
        {newsData && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`mb-6 rounded-xl shadow-xl overflow-hidden transition-colors duration-500 ${
              darkMode ? 'bg-slate-800' : 'bg-white'
            }`}
          >
            <div className="px-6 py-5">
              <h2 className={`text-xl md:text-2xl font-bold mb-2 ${
                darkMode ? 'text-white' : 'text-slate-800'
              }`}>{newsData.title}</h2>
              
              <div className="flex items-center mb-4">
                <Calendar className={`w-4 h-4 mr-2 ${
                  darkMode ? 'text-indigo-400' : 'text-indigo-600'
                }`} />
                <span className={`text-sm ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {newsData.createdAt ? new Date(newsData.createdAt).toLocaleString() : 'No date available'}
                </span>
              </div>
              
              <p className={`line-clamp-2 ${
                darkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                {newsData.content 
                  ? (newsData.content.length > 200 
                    ? `${newsData.content.substring(0, 200)}...` 
                    : newsData.content)
                  : 'No text content available'}
              </p>
            </div>
          </motion.div>
        )}
        
        {/* Controls Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`mb-4 flex flex-wrap gap-2 p-3 rounded-xl shadow-md transition-colors duration-500 ${
            darkMode ? 'bg-slate-800' : 'bg-white'
          }`}
        >
          <Button 
            onClick={handleZoomToFit}
            className={`px-4 py-2 ${
              darkMode 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
            icon={<Maximize className="w-4 h-4" />}
          >
            Zoom to Fit
          </Button>
          
          <Button 
            onClick={toggleDimension}
            className={`px-4 py-2 ${
              darkMode 
                ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
            icon={<Layers className="w-4 h-4" />}
          >
            Switch to {is3D ? '2D' : '3D'} View
          </Button>
          
          <Button 
            onClick={() => setShowLegend(!showLegend)}
            className={`px-4 py-2 ${
              darkMode 
                ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
            }`}
            icon={<HelpCircle className="w-4 h-4" />}
          >
            {showLegend ? 'Hide' : 'Show'} Legend
          </Button>
          
          {graphData && (
            <div className={`ml-auto flex items-center ${
              darkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              <Activity className="w-4 h-4 mr-1.5" />
              <span className="text-sm font-medium">
                {graphData.nodes.length} Nodes | {graphData.links.length} Connections
              </span>
            </div>
          )}
        </motion.div>
        
        {/* Graph Container */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          className={`mb-6 rounded-xl shadow-xl overflow-hidden border transition-colors duration-500 ${
            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          }`}
        >
          {/* Graph Visualization Header */}
          <div className={`px-4 py-3 border-b flex items-center justify-between ${
            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center">
              <Cpu className={`w-5 h-5 mr-2 ${
                darkMode ? 'text-indigo-400' : 'text-indigo-600'
              }`} />
              <h3 className={`font-medium ${
                darkMode ? 'text-white' : 'text-slate-800'
              }`}>{is3D ? '3D' : '2D'} Graph Visualization</h3>
            </div>
            
            <div className="flex space-x-1">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
          </div>
          
          {/* Graph Visualization */}
          <div className="h-[70vh] w-full">
            {graphData && is3D ? (
              <ForceGraph3D
                ref={graphRef}
                graphData={graphData}
                nodeId="id"
                nodeVal="val"
                nodeLabel={(node: any) => `${node.name} (${node.type}${node.mentionCount ? `, Mentions: ${node.mentionCount}` : ''})`}
                nodeColor="color"
                linkSource="source"
                linkTarget="target"
                linkLabel={(link: any) => link.type}
                linkWidth="value"
                linkColor="color"
                backgroundColor={darkMode ? "#1e293b" : "#f8fafc"} // Match the background color
                linkDirectionalParticles={2}
                linkDirectionalParticleWidth={(link: any) => link.value * 0.5}
                onNodeClick={handleNodeClick}
                
                // Adjust physics for better node separation
                d3AlphaMin={0.001}
                d3AlphaDecay={0.01}
                d3VelocityDecay={0.08}
                
                // Force strength parameters for better separation
                dagLevelDistance={300}
                
                // Add a custom force for further separation - keep existing logic
                onEngineTick={() => {
                  try {
                    if (graphRef.current) {
                      if (graphData && graphData.nodes) {
                        const nodes = graphData.nodes;
                        nodes.forEach((node1: any) => {
                          nodes.forEach((node2: any) => {
                            if (node1 !== node2 && node1.type === node2.type) {
                              const dx = node2.x - node1.x;
                              const dy = node2.y - node1.y;
                              const dz = node2.z - node1.z;
                              const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                              if (distance < 200) {
                                const force = 5 / (distance + 1);
                                node2.vx += (dx / distance) * force;
                                node2.vy += (dy / distance) * force;
                                node2.vz += (dz / distance) * force;
                                node1.vx -= (dx / distance) * force;
                                node1.vy -= (dy / distance) * force;
                                node1.vz -= (dz / distance) * force;
                              }
                            }
                          });
                        });
                      }
                    }
                  } catch (error) {
                    console.error("Error in engine tick:", error);
                  }
                }}
                
                // Upgraded 3D node styling
                nodeThreeObject={(node: any) => {
                  const nodeSize = Math.min(node.val, 15);
                  
                  // Create a sphere with a glossy material for a modern look
                  const sphere = new THREE.Mesh(
                    new THREE.SphereGeometry(nodeSize),
                    new THREE.MeshPhongMaterial({ 
                      color: node.color, 
                      transparent: true, 
                      opacity: 0.9,
                      shininess: 80, // Add shininess for a glossy effect
                      specular: new THREE.Color(darkMode ? 0x222222 : 0xffffff) // Specular highlights
                    })
                  );
                  
                  // Add text label with modern styling
                  const label = node.name.length > 20 ? node.name.substring(0, 20) + '...' : node.name;
                  const sprite = new SpriteText(label);
                  sprite.color = darkMode ? '#ffffff' : '#000000';
                  
                  // Style labels based on node type
                  if (node.type === 'News') {
                    sprite.backgroundColor = darkMode ? 'rgba(79, 70, 229, 0.7)' : 'rgba(59, 130, 246, 0.7)';
                    sprite.borderColor = darkMode ? '#4338ca' : '#2563eb';
                    sprite.borderWidth = 0.3;
                    sprite.borderRadius = 3;
                  } else {
                    sprite.backgroundColor = 'rgba(0, 0, 0, 0)'; // Transparent background
                    sprite.fontWeight = 'bold';
                  }
                  
                  sprite.padding = 2;
                  sprite.textHeight = node.type === 'News' ? 8 : Math.min(4 + (node.mentionCount || 0) / 10, 7);
                  sprite.position.y = nodeSize + 8;
                  
                  // Create a group to hold both objects
                  const group = new THREE.Group();
                  group.add(sphere);
                  group.add(sprite);
                  
                  // Add soft glow effect for important nodes
                  if (node.type === 'News' || (node.mentionCount && node.mentionCount > 5)) {
                    const glowMaterial = new THREE.MeshBasicMaterial({
                      color: node.color,
                      transparent: true,
                      opacity: 0.15
                    });
                    const glowSphere = new THREE.Mesh(
                      new THREE.SphereGeometry(nodeSize * 1.5),
                      glowMaterial
                    );
                    group.add(glowSphere);
                  }
                  
                  return group;
                }}

                cooldownTime={5000}
                warmupTicks={100}
                
                // 3D controls
                controlType="orbit"
                enableNodeDrag={true}
                enableNavigationControls={true}
              />
            ) : graphData && (
              <ForceGraph2D
                ref={graphRef}
                graphData={graphData}
                nodeId="id"
                nodeLabel={(node: any) => `${node.name} (${node.type}${node.mentionCount ? `, Mentions: ${node.mentionCount}` : ''})`}
                nodeColor="color"
                linkSource="source"
                linkTarget="target"
                linkLabel={(link: any) => link.type}
                backgroundColor={darkMode ? "#1e293b" : "#f8fafc"} // Match the background color
                
                // Modify link styling to make all relationships visible - keep existing logic
                linkWidth={(link: any) => {
                  return link.type === 'MENTIONED_IN' ? 
                    link.value : 
                    Math.max(link.value * 2, 1.5);
                }}
                
                linkColor={(link: any) => {
                  return link.type === 'MENTIONED_IN' ? 
                    (darkMode ? 'rgba(150, 150, 180, 0.4)' : 'rgba(150, 150, 150, 0.5)') : 
                    (darkMode ? 'rgba(79, 70, 229, 0.8)' : 'rgba(79, 70, 229, 0.7)');
                }}

                // Particle styling
                linkDirectionalParticles={(link: any) => 
                  link.type === 'MENTIONED_IN' ? 2 : 4
                }
                
                linkDirectionalParticleWidth={(link: any) => 
                  link.type === 'MENTIONED_IN' ? 
                  link.value * 0.5 : 
                  link.value * 1.5
                }
                
                onNodeClick={handleNodeClick}
                
                // 2D-specific configurations
                d3AlphaDecay={0.01}
                d3VelocityDecay={0.08}
                cooldownTicks={200}
                d3AlphaMin={0.001}
                nodeVal={(node) => Math.min(node.val * 1.2, 18)}
                
                // Enhanced 2D node styling
                nodeCanvasObject={(node, ctx, globalScale) => {
                  const nodeSize = Math.min(node.val * 1.2, 18);
                  const x = node.x ?? 0;
                  const y = node.y ?? 0;
                  
                  // Draw node with shadow for depth
                  ctx.shadowColor = darkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.2)';
                  ctx.shadowBlur = 5;
                  ctx.shadowOffsetX = 2;
                  ctx.shadowOffsetY = 2;
                  
                  // Draw main circle
                  ctx.beginPath();
                  ctx.arc(x, y, nodeSize, 0, 2 * Math.PI);
                  ctx.fillStyle = node.color;
                  ctx.fill();
                  
                  // Draw highlight circle (for glossy effect)
                  ctx.shadowColor = 'transparent';
                  ctx.beginPath();
                  ctx.arc(x - nodeSize/3, y - nodeSize/3, nodeSize/2, 0, 2 * Math.PI);
                  ctx.fillStyle = darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.3)';
                  ctx.fill();
                  
                  // Text label with clean styling
                  const fontSize = Math.min((node.type === 'News' ? 16 : 12), 16) / globalScale;
                  const label = node.name.length > 15 ? node.name.substring(0, 15) + '...' : node.name;
                  
                  // Draw only if zoomed in enough or for important nodes
                  if (globalScale > 0.7 || node.type === 'News' || (node.mentionCount && node.mentionCount > 2)) {
                    ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
                    const textWidth = ctx.measureText(label).width;
                    
                    // Label background
                    if (node.type === 'News') {
                      // Special styling for news nodes
                      ctx.fillStyle = darkMode ? 'rgba(79, 70, 229, 0.7)' : 'rgba(59, 130, 246, 0.7)';
                      
                      // Rounded rectangle with border
                      const padding = 4;
                      const rectWidth = textWidth + padding * 2;
                      const rectHeight = fontSize + padding * 2;
                      const cornerRadius = 4;
                      
                      // Draw rounded rectangle
                      ctx.beginPath();
                      ctx.moveTo(x - rectWidth/2 + cornerRadius, y + nodeSize + 5);
                      ctx.arcTo(x + rectWidth/2, y + nodeSize + 5, x + rectWidth/2, y + nodeSize + 5 + rectHeight, cornerRadius);
                      ctx.arcTo(x + rectWidth/2, y + nodeSize + 5 + rectHeight, x - rectWidth/2, y + nodeSize + 5 + rectHeight, cornerRadius);
                      ctx.arcTo(x - rectWidth/2, y + nodeSize + 5 + rectHeight, x - rectWidth/2, y + nodeSize + 5, cornerRadius);
                      ctx.arcTo(x - rectWidth/2, y + nodeSize + 5, x + rectWidth/2, y + nodeSize + 5, cornerRadius);
                      ctx.closePath();
                      ctx.fill();
                      
                      // Text
                      ctx.fillStyle = '#ffffff';
                      ctx.textAlign = 'center';
                      ctx.textBaseline = 'middle';
                      ctx.fillText(label, x, y + nodeSize + 5 + rectHeight/2);
                    } else {
                      // Dynamically position labels for other nodes
                      const labelX = x;
                      const labelY = y + nodeSize + fontSize/2 + 4;
                      
                      ctx.textAlign = 'center';
                      ctx.textBaseline = 'middle';
                      
                      // Outline text for contrast
                      ctx.strokeStyle = darkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)';
                      ctx.lineWidth = 3;
                      ctx.strokeText(label, labelX, labelY);
                      
                      // Actual text
                      ctx.fillStyle = darkMode ? '#ffffff' : '#000000';
                      ctx.fillText(label, labelX, labelY);
                    }
                  }
                }}
                
                // Enhanced link visualization
                linkCanvasObject={(link, ctx, globalScale) => {
                  // Only render custom appearances for non-MENTIONED_IN links
                  if (link.type !== 'MENTIONED_IN') {
                    const start = link.source as NodeObject;
                    const end = link.target as NodeObject;
                    
                    if (typeof start !== 'object' || typeof end !== 'object') return;
                    
                    const sourceX = start.x || 0;
                    const sourceY = start.y || 0;
                    const targetX = end.x || 0;
                    const targetY = end.y || 0;
                    
                    // Draw line with shadow for depth
                    ctx.shadowColor = darkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.2)';
                    ctx.shadowBlur = 3;
                    
                    // Draw stylized relationship line
                    ctx.beginPath();
                    ctx.moveTo(sourceX, sourceY);
                    ctx.lineTo(targetX, targetY);
                    
                    // Color based on relationship type
                    switch(link.type) {
                      case 'RELATED_TO':
                        ctx.strokeStyle = darkMode ? 'rgba(99, 102, 241, 0.85)' : 'rgba(79, 70, 229, 0.85)';
                        break;
                      case 'LOCATED_IN':
                      case 'LOCATION_OF':
                        ctx.strokeStyle = darkMode ? 'rgba(34, 197, 94, 0.85)' : 'rgba(16, 185, 129, 0.85)';
                        break;
                      case 'PART_OF':
                      case 'HAS_PART':
                        ctx.strokeStyle = darkMode ? 'rgba(239, 68, 68, 0.85)' : 'rgba(220, 38, 38, 0.85)';
                        break;
                      case 'WORKS_FOR':
                      case 'EMPLOYS':
                        ctx.strokeStyle = darkMode ? 'rgba(245, 158, 11, 0.85)' : 'rgba(217, 119, 6, 0.85)';
                        break;
                      default:
                        ctx.strokeStyle = darkMode ? 'rgba(139, 92, 246, 0.85)' : 'rgba(124, 58, 237, 0.85)';
                    }
                    
                    ctx.lineWidth = Math.max(link.value * 2.5, 2.0);
                    ctx.stroke();
                    ctx.shadowColor = 'transparent';
                    
                    // Draw arrow for direction
                    const headSize = 6 / globalScale;
                    const dx = targetX - sourceX;
                    const dy = targetY - sourceY;
                    const angle = Math.atan2(dy, dx);
                    
                    const arrowLength = Math.sqrt(dx * dx + dy * dy);
                    const nodeRadius = typeof end.val === 'number' ? Math.min(end.val * 1.2, 18) : 5;
                    const arrowRatio = (arrowLength - nodeRadius) / arrowLength;
                    
                    const arrowX = sourceX + dx * arrowRatio;
                    const arrowY = sourceY + dy * arrowRatio;
                    
                    // Arrow head with more stylized look
                    ctx.beginPath();
                    ctx.moveTo(arrowX, arrowY);
                    ctx.lineTo(
                      arrowX - headSize * Math.cos(angle - Math.PI / 6),
                      arrowY - headSize * Math.sin(angle - Math.PI / 6)
                    );
                    ctx.lineTo(
                      arrowX - headSize * Math.cos(angle + Math.PI / 6),
                      arrowY - headSize * Math.sin(angle + Math.PI / 6)
                    );
                    ctx.closePath();
                    ctx.fill();
                    
                    return true;
                  }
                  
                  return false;
                }}
                
                linkCanvasObjectMode={(link) => 
                  link.type !== 'MENTIONED_IN' ? 'replace' : undefined
                }
                
                onEngineStop={() => handleZoomToFit()}
                onEngineTick={() => {
                  try {
                    if (graphData && graphData.nodes) {
                      const nodes = graphData.nodes;
                      
                      // Apply additional repulsion - keep existing logic
                      nodes.forEach((node1: any) => {
                        nodes.forEach((node2: any) => {
                          if (node1 !== node2) {
                            const dx = node2.x - node1.x;
                            const dy = node2.y - node1.y;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            
                            if (distance < 150) {
                              const force = 3 / (distance + 1);
                              if (node2.vx !== undefined && node2.vy !== undefined) {
                                node2.vx += (dx / distance) * force;
                                node2.vy += (dy / distance) * force;
                              }
                              if (node1.vx !== undefined && node1.vy !== undefined) {
                                node1.vx -= (dx / distance) * force;
                                node1.vy -= (dy / distance) * force;
                              }
                            }
                          }
                        });
                      });
                    }
                  } catch (error) {
                    console.error("Error in 2D engine tick:", error);
                  }
                }}
              />
            )}
          </div>
        </motion.div>
        
        {/* Legend Panel (collapsible) */}
        {graphData && showLegend && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`rounded-xl shadow-xl overflow-hidden transition-colors duration-500 ${
              darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
            }`}
          >
            <div className={`px-6 py-4 border-b flex justify-between items-center ${
              darkMode ? 'border-slate-700' : 'border-slate-200'
            }`}>
              <h3 className={`text-lg font-bold flex items-center ${
                darkMode ? 'text-white' : 'text-slate-800'
              }`}>
                <HelpCircle className="w-5 h-5 mr-2" />
                Graph Legend
              </h3>
              <Button
                onClick={() => setShowLegend(false)}
                className={`p-1 rounded ${
                  darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
                }`}
              >
                <ChevronDown className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className={`text-base font-semibold mb-3 ${
                    darkMode ? 'text-white' : 'text-slate-800'
                  }`}>Node Types</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['Person', 'Organization', 'Location', 'Time', 'Numerical', 'Miscellaneous', 'Concept', 'News'].map(type => (
                      <div key={type} className="flex items-center">
                        <div 
                          className={`rounded-full mr-2 border ${
                            darkMode ? 'border-slate-600' : 'border-slate-200'
                          }`}
                          style={{ 
                            width: '16px', 
                            height: '16px',
                            backgroundColor: type === 'News' ? 
                              (darkMode ? '#4f46e5' : '#3b82f6') : 
                              getColorForType(type, darkMode),
                          }} 
                        />
                        <span className={`text-sm ${
                          darkMode ? 'text-slate-300' : 'text-slate-700'
                        }`}>{type}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className={`text-base font-semibold mb-3 ${
                    darkMode ? 'text-white' : 'text-slate-800'
                  }`}>{is3D ? '3D' : '2D'} Navigation Controls</h4>
                  <ul className={`text-sm space-y-2 ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    {is3D ? (
                      <>
                        <li>• Left-click + drag: Rotate view</li>
                        <li>• Right-click + drag: Pan view</li>
                        <li>• Mouse wheel: Zoom in/out</li>
                        <li>• Click on node: View entity details</li>
                      </>
                    ) : (
                      <>
                        <li>• Left-click + drag: Move graph</li>
                        <li>• Mouse wheel: Zoom in/out</li>
                        <li>• Click on node: View entity details</li>
                        <li>• Double-click background: Reset view</li>
                      </>
                    )}
                  </ul>
                  
                  <div className={`mt-4 pt-4 border-t ${
                    darkMode ? 'border-slate-700' : 'border-slate-200'
                  }`}>
                    <h4 className={`text-base font-semibold mb-2 ${
                      darkMode ? 'text-white' : 'text-slate-800'
                    }`}>Entity Statistics</h4>
                    <div className={`grid grid-cols-2 gap-2 text-sm ${
                      darkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      <div>
                        <span className="font-medium">Total Entities:</span> {graphData.nodes.length - 1}
                      </div>
                      <div>
                        <span className="font-medium">Total Relationships:</span> {graphData.links.length - (graphData.nodes.length - 1)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GraphVisualization;