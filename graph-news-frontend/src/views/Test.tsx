import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ForceGraph3D from 'react-force-graph-3d';
import ForceGraph2D from 'react-force-graph-2d'; // Add this import
import { getNewsGraph } from '../services/graph.service';
import { getNewsById } from '../services/news.service';
import * as THREE from 'three';
import SpriteText from 'three-spritetext';

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
  const [is3D, setIs3D] = useState<boolean>(true); // Add this state


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
          console.log(newsResponse);
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
    // Transform the data for force-graph
    const nodes: Node[] = [
      // News node (central)
      {
        id: graphData.news.id,
        name: graphData.news.title,
        type: 'News',
        color: '#4285F4', // Blue for news
        val: 15  // Make news node larger but with a reasonable size
      },
      ...graphData.entities.map((entity: any, index: number) => {
        // Calculate importance based on mention count with a maximum cap
        const mentionCount = entity.mentionCount || 1;
        // Use a logarithmic scale to prevent excessive growth for high mention counts
        const sizeScale = Math.log10(mentionCount + 1) * 3; 
        
        // Cap the maximum size factor
        const maxSizeFactor = 2.5;
        const importanceFactor = Math.min(1 + (mentionCount / 10), maxSizeFactor);
        
        // Use a mathematical pattern for initial positions to ensure better separation
        const goldenRatio = 1.618033988749895;
        const angle = index * goldenRatio * Math.PI * 2;
        const radius = 800 + (index * 20); // Increasing radius
        
        return {
          id: entity.id,
          name: entity.name,
          type: entity.type,
          mentionCount: mentionCount,
          color: getColorForType(entity.type),
          // Cap the maximum size using Math.min()
          val: Math.min(5 + sizeScale, 15), // Maximum size of 15 (same as news node)
          
          // More organized initial positions (spiral pattern)
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          z: (Math.random() - 0.5) * 1000, // Random Z for 3D
        };
      })
    ];

    // Create links array with reduced strength to let nodes separate more
    const links: Link[] = [
      // Entity to news relationships (MENTIONED_IN)
      ...graphData.entities.map((entity: any) => ({
        source: entity.id,
        target: graphData.news.id,
        type: 'MENTIONED_IN',
        value: 0.5 + (entity.mentionCount / 20), // Reduced from 10 to allow more separation
        color: 'rgba(150, 150, 150, 0.5)'
      })),
      // Entity to entity relationships
      ...graphData.relationships.map((rel: any) => ({
        source: rel.sourceId,
        target: rel.targetId,
        type: rel.type,
        originalType: rel.originalType,
        value: 0.7 + (rel.confidence * 3), // Reduced from 5 to allow more separation
        color: getColorForRelationship(rel.confidence)
      }))
    ];

    setGraphData({ nodes, links });
  };

  const getColorForType = (type: string): string => {
    switch (type) {
      case 'Person': return '#EA4335'; // Red
      case 'Organization': return '#FBBC05'; // Yellow
      case 'Location': return '#34A853'; // Green
      case 'Time': return '#9C27B0'; // Purple
      case 'Numerical': return '#FF6D00'; // Orange
      case 'Miscellaneous': return '#795548'; // Brown
      case 'Concept': return '#00BCD4'; // Cyan
      default: return '#9E9E9E'; // Grey
    }
  };

  const getColorForRelationship = (confidence: number): string => {
    // Opacity based on confidence
    const opacity = 0.3 + (confidence * 0.7);
    return `rgba(255, 255, 255, ${opacity})`;
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 mt-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <button 
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          onClick={handleBackClick}
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-3">
      <div className="mb-4 flex">
        <button 
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
          onClick={handleBackClick}
        >
          Back
        </button>
        <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleZoomToFit}
        >
          Zoom to Fit
        </button>
        <button 
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          onClick={toggleDimension}
        >
          Switch to {is3D ? '2D' : '3D'} View
        </button>
      </div>
      
      {newsData && (
        <div className="mb-4">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-6 py-4">
              <h3 className="text-xl font-bold">{newsData.title}</h3>
              <p className="text-gray-500 text-sm mb-2">
                {newsData.createdAt ? new Date(newsData.createdAt).toLocaleString() : 'No date available'}
              </p>
              <p className="text-gray-700">
                {newsData.content 
                  ? (newsData.content.length > 200 
                    ? `${newsData.content.substring(0, 200)}...` 
                    : newsData.content)
                  : 'No text content available'}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-4">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
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
                linkDirectionalParticles={2}
                linkDirectionalParticleWidth={(link: any) => link.value * 0.5}
                onNodeClick={handleNodeClick}
                
                // Adjust physics for better node separation
                d3AlphaMin={0.001}
                d3AlphaDecay={0.01}
                d3VelocityDecay={0.08}
                
                // Force strength parameters for better separation
                dagLevelDistance={300}
                
                // Add a custom force for further separation
                onEngineTick={() => {
                  try {
                    if (graphRef.current) {
                      // Access nodes directly from the graphData state
                      if (graphData && graphData.nodes) {
                        const nodes = graphData.nodes;
                        // Apply additional repulsion between nodes of the same type
                        nodes.forEach((node1: any) => {
                          nodes.forEach((node2: any) => {
                            if (node1 !== node2 && node1.type === node2.type) {
                              // Calculate distance
                              const dx = node2.x - node1.x;
                              const dy = node2.y - node1.y;
                              const dz = node2.z - node1.z;
                              const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                              // Apply repulsive force for close nodes of the same type
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
                
                nodeThreeObject={(node: any) => {
                  // Create a sphere for the node with a capped size
                  const nodeSize = Math.min(node.val, 15); // Cap maximum sphere size at 15
                  
                  const sphere = new THREE.Mesh(
                    new THREE.SphereGeometry(nodeSize),
                    new THREE.MeshLambertMaterial({ color: node.color, transparent: true, opacity: 0.8 })
                  );
                  
                  // Add text label for all nodes
                  const label = node.name.length > 20 ? node.name.substring(0, 20) + '...' : node.name;
                  const sprite = new SpriteText(label);
                  sprite.color = node.type === 'News' ? '#ffffff' : '#000000';
                  
                  // Use transparent background
                  sprite.backgroundColor = node.type === 'News' ? 
                    'rgba(66, 133, 244, 0.7)' : // Semi-transparent blue for news
                    'rgba(255, 255, 255, 0.5)'; // Semi-transparent white for other entities
                  
                  sprite.padding = 2;
                  // Adjust text size based on node importance but with a cap
                  sprite.textHeight = node.type === 'News' ? 8 : Math.min(4 + (node.mentionCount || 0) / 10, 7);
                  sprite.position.y = nodeSize + 8; // Position label based on the capped node size
                  
                  const group = new THREE.Group();
                  group.add(sphere);
                  group.add(sprite);
                  return group;
                }}

                cooldownTime={5000}
                warmupTicks={100}
                
                // Make the 3D controls smoother
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
                linkWidth="value"
                linkColor="color"
                linkDirectionalParticles={2}
                linkDirectionalParticleWidth={(link: any) => link.value * 0.5}
                onNodeClick={handleNodeClick}
                // 2D-specific configurations - improve node separation
                d3AlphaDecay={0.01} // Slower cooling
                d3VelocityDecay={0.08} // Less friction
                cooldownTicks={200} // Run simulation longer

                // Cap node size for 2D visualization
                nodeVal={(node) => Math.min(node.val * 1.2, 18)} // Cap maximum size

                // Custom node rendering with better spacing
                nodeCanvasObject={(node, ctx, globalScale) => {
                  // Node circle with capped size
                  const nodeSize = Math.min(node.val * 1.2, 18); // Cap maximum circle size
                  
                  ctx.beginPath();
                  ctx.arc((node.x ?? 0), (node.y ?? 0), nodeSize, 0, 2 * Math.PI);
                  ctx.fillStyle = node.color;
                  ctx.fill();

                  // Add labels for all nodes with capped font size
                  const maxFontSize = 16;
                  const fontSize = node.type === 'News' ? 
                    Math.min(16, maxFontSize) / globalScale : 
                    Math.min(10 + (node.mentionCount || 0) / 3, maxFontSize) / globalScale;
                    
                  const label = node.name.length > 15 ? node.name.substring(0, 15) + '...' : node.name;
                  ctx.font = `${fontSize}px Sans-Serif`;
                  const textWidth = ctx.measureText(label).width;
                  
                  // Draw semi-transparent background
                  ctx.fillStyle = node.type === 'News' ? 
                    'rgba(66, 133, 244, 0.8)' : // News nodes
                    'rgba(255, 255, 255, 0.6)'; // Other entities
                  
                  ctx.fillRect(
                    (node.x ?? 0) - textWidth / 2 - 2,
                    (node.y ?? 0) + nodeSize + 2, // Use capped size for positioning
                    textWidth + 4,
                    fontSize + 4
                  );
                  
                  // Draw text
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.fillStyle = node.type === 'News' ? '#ffffff' : '#000000';
                  ctx.fillText(label, (node.x ?? 0), (node.y ?? 0) + nodeSize + fontSize / 2 + 4);
                }}

                onEngineStop={() => handleZoomToFit()}
                onEngineTick={() => {
                  try {
                    if (graphData && graphData.nodes) {
                      const nodes = graphData.nodes;
                      
                      // Apply additional repulsion
                      nodes.forEach((node1: any) => {
                        nodes.forEach((node2: any) => {
                          if (node1 !== node2) {
                            // Calculate distance
                            const dx = node2.x - node1.x;
                            const dy = node2.y - node1.y;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            
                            // Apply repulsive force for close nodes
                            if (distance < 150) { // Repel if closer than this threshold
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
        </div>
      </div>
      
      {graphData && (
        <div className="mt-4">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-6 py-4">
              <h3 className="text-xl font-bold mb-4">Graph Legend</h3>
              <div className="mb-4">
                <h4 className="text-lg font-semibold mb-2">Node Types:</h4>
                <div className="flex flex-wrap">
                  {['Person', 'Organization', 'Location', 'Time', 'Numerical', 'Miscellaneous', 'Concept', 'News'].map(type => (
                    <div key={type} className="mr-4 mb-2 flex items-center">
                      <div 
                        className="rounded-full mr-2"
                        style={{ 
                          width: '20px', 
                          height: '20px',
                          backgroundColor: type === 'News' ? '#4285F4' : getColorForType(type),
                        }} 
                      />
                      <span>{type}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2">3D Navigation Controls:</h4>
                <ul className="list-disc pl-5">
                  <li>Left-click + drag: Rotate view</li>
                  <li>Right-click + drag: Pan view</li>
                  <li>Mouse wheel: Zoom in/out</li>
                  <li>Click on node: Center view on node</li>
                </ul>
              </div>
              <div className="mt-4">
                <h4 className="text-lg font-semibold mb-2">Entity Statistics:</h4>
                <p>Total Entities: {graphData.nodes.length - 1}</p>
                <p>Total Relationships: {graphData.links.length - (graphData.nodes.length - 1)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphVisualization;