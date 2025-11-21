/**
 * Knowledge Graph Visualization - Display entities and relationships using Cytoscape
 */

import type { ElementDefinition } from 'cytoscape';
import CytoscapeComponent from 'react-cytoscapejs';

interface GraphNode {
  id: string;
  label: string;
  type: 'Faction' | 'Character' | 'Location' | 'Resource' | 'Event';
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

interface KnowledgeGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function KnowledgeGraph({ nodes, edges }: KnowledgeGraphProps) {
  const nodeColors = {
    Faction: '#E91E63',
    Character: '#2196F3',
    Location: '#4CAF50',
    Resource: '#FF9800',
    Event: '#9C27B0',
  };

  const elements: ElementDefinition[] = [
    ...nodes.map((node) => ({
      data: {
        id: node.id,
        label: node.label,
        type: node.type,
      },
    })),
    ...edges.map((edge) => ({
      data: {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
      },
    })),
  ];

  const stylesheet = [
    {
      selector: 'node',
      style: {
        'background-color': (ele: { data: (key: string) => string }) => {
          const type = ele.data('type') as keyof typeof nodeColors;
          return nodeColors[type] || '#999';
        },
        label: 'data(label)',
        color: '#fff',
        'text-valign': 'center',
        'text-halign': 'center',
        'font-size': '12px',
        width: 60,
        height: 60,
      },
    },
    {
      selector: 'edge',
      style: {
        width: 2,
        'line-color': '#ccc',
        'target-arrow-color': '#ccc',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        label: 'data(label)',
        'font-size': '10px',
        'text-rotation': 'autorotate',
        'text-margin-y': -10,
      },
    },
  ];

  const layout = {
    name: 'cose',
    idealEdgeLength: 100,
    nodeOverlap: 20,
    refresh: 20,
    fit: true,
    padding: 30,
    randomize: false,
    componentSpacing: 100,
    nodeRepulsion: 400000,
    edgeElasticity: 100,
    nestingFactor: 5,
    gravity: 80,
    numIter: 1000,
    initialTemp: 200,
    coolingFactor: 0.95,
    minTemp: 1.0,
  };

  if (nodes.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '500px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          fontSize: '16px',
          color: '#666',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p>No entities in the knowledge graph yet.</p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>
            Submit some fantasy lore above to populate the graph!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
      <div
        style={{
          padding: '12px',
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #ccc',
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Legend:</div>
        {Object.entries(nodeColors).map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '16px',
                height: '16px',
                backgroundColor: color,
                borderRadius: '50%',
              }}
            />
            <span style={{ fontSize: '13px' }}>{type}</span>
          </div>
        ))}
      </div>
      <CytoscapeComponent
        elements={elements}
        style={{ width: '100%', height: '500px', backgroundColor: '#fafafa' }}
        stylesheet={stylesheet as never}
        layout={layout as never}
        zoom={1}
        pan={{ x: 0, y: 0 }}
        minZoom={0.5}
        maxZoom={2}
      />
    </div>
  );
}
