import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ForceGraph2D from 'react-force-graph-2d';
import { getNewsGraph } from '../services/graph.service';
import { getNewsById } from '../services/news.service';
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
      // News node
      {
        id: graphData.news.id,
        name: graphData.news.title,
        type: 'News',
        color: '#4285F4', // Blue for news
        val: 10
      },
      // Entity nodes
      ...graphData.entities.map((entity: any) => ({
        id: entity.id,
        name: entity.name,
        type: entity.type,
        mentionCount: entity.mentionCount,
        color: getColorForType(entity.type),
        val: 5 + (entity.mentionCount / 2) // Size based on mentions
      }))
    ];

    // Create links array
    const links: Link[] = [
      // Entity to news relationships (MENTIONED_IN)
      ...graphData.entities.map((entity: any) => ({
        source: entity.id,
        target: graphData.news.id,
        type: 'MENTIONED_IN',
        value: 1 + (entity.mentionCount / 10),
        color: 'rgba(150, 150, 150, 0.3)'
      })),
      // Entity to entity relationships
      ...graphData.relationships.map((rel: any) => ({
        source: rel.sourceId,
        target: rel.targetId,
        type: rel.type,
        originalType: rel.originalType,
        value: 1 + (rel.confidence * 5),
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
    return `rgba(0, 0, 0, ${opacity})`;
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
      graphRef.current.zoomToFit(400);
    }
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
            {graphData && (
              // In your ForceGraph2D component, add these parameters:
                <ForceGraph2D
                ref={graphRef}
                graphData={graphData}
                nodeId="id"
                nodeVal="val"
                nodeLabel={(node: any) => `${node.name} (${node.type}${node.mentionCount ? `, Mentions: ${node.mentionCount}` : ''})`}
                nodeColor="color"
                nodeRelSize={6}
                linkSource="source"
                linkTarget="target"
                linkLabel={(link: any) => link.type}
                linkWidth="value"
                linkColor="color"
                linkDirectionalParticles={2}
                linkDirectionalParticleWidth={(link: any) => link.value * 0.5}
                onNodeClick={handleNodeClick}
                cooldownTicks={100}
                d3AlphaDecay={0.02} // More gradual cooling
                d3VelocityDecay={0.1} // Less friction for more spread
                onEngineStop={() => handleZoomToFit()}
                nodeCanvasObject={(node, ctx, globalScale) => {
                    // Node circle
                    ctx.beginPath();
                    ctx.arc((node.x ?? 0),(node.y ?? 0), node.val || 1, 0, 2 * Math.PI);
                    ctx.fillStyle = node.color;
                    ctx.fill();

                    // Only display labels for important nodes or on hover
                    const fontSize = 12 / globalScale;
                    const isHighlighted = node.__highlighted || (node.mentionCount ?? 0) > 3 || node.type === 'News';
                    
                    if (isHighlighted || globalScale > 0.8) {
                    // Add a white background for text
                    const label = node.name.length > 15 ? node.name.substring(0, 15) + '...' : node.name;
                    ctx.font = `${fontSize}px Sans-Serif`;
                    const textWidth = ctx.measureText(label).width;
                    
                    // Draw background
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.fillRect(
                        (node.x ?? 0) - fontSize / 2 - 2,
                        (node.y ?? 0) - fontSize / 2 - 2,
                        textWidth + 4,
                        fontSize + 4
                    );
                    
                    // Draw text
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#000000';
                    ctx.fillText(label, (node.x ?? 0), (node.y ?? 0));
                    }
                }}
                
                dagMode={undefined}
                dagLevelDistance={50}
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