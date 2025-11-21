/**
 * ACE - Architected Consistency Engine
 * Fantasy World-Building with AI-Powered Knowledge Graphs
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import './App.css';
import { JobStatus } from './components/JobStatus';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { LoreSubmissionForm } from './components/LoreSubmissionForm';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // Sample data for demonstration (will be replaced with real data from API)
  const sampleNodes = [
    { id: 'faction-crimson-empire', label: 'Crimson Empire', type: 'Faction' as const },
    { id: 'character-emperor-valen', label: 'Emperor Valen', type: 'Character' as const },
    { id: 'location-ruby-mines', label: 'Ruby Mines', type: 'Location' as const },
    { id: 'resource-rubies', label: 'Rubies', type: 'Resource' as const },
  ];

  const sampleEdges = [
    {
      id: 'e1',
      source: 'character-emperor-valen',
      target: 'faction-crimson-empire',
      label: 'COMMANDS',
    },
    {
      id: 'e2',
      source: 'faction-crimson-empire',
      target: 'resource-rubies',
      label: 'CONTROLS_RESOURCE',
    },
    {
      id: 'e3',
      source: 'resource-rubies',
      target: 'location-ruby-mines',
      label: 'LOCATED_IN',
    },
  ];

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-container">
        <header className="app-header">
          <h1>🏰 ACE - Fantasy World Builder</h1>
          <p className="app-subtitle">AI-Powered Knowledge Graphs for Consistent World-Building</p>
        </header>

        <main className="app-main">
          <div className="app-grid">
            {/* Left Column: Lore Submission */}
            <div className="app-section">
              <LoreSubmissionForm onJobCreated={setActiveJobId} />

              {activeJobId && (
                <div style={{ marginTop: '24px' }}>
                  <JobStatus jobId={activeJobId} />
                </div>
              )}
            </div>

            {/* Right Column: Knowledge Graph Visualization */}
            <div className="app-section">
              <h2>Knowledge Graph</h2>
              <KnowledgeGraph nodes={sampleNodes} edges={sampleEdges} />

              <div
                style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: '#e3f2fd',
                  borderRadius: '4px',
                  fontSize: '13px',
                }}
              >
                <strong>💡 How to use:</strong>
                <ol style={{ marginTop: '8px', paddingLeft: '20px' }}>
                  <li>Enter fantasy lore text in the form above</li>
                  <li>Click "Extract Entities" to process the text</li>
                  <li>Watch the AI extract factions, characters, locations, and relationships</li>
                  <li>View the knowledge graph update with new entities and connections</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Features Overview */}
          <div className="features-grid">
            <div className="feature-card">
              <h3>🔍 Hybrid RAG</h3>
              <p>Combines vector similarity search with graph-based relational queries</p>
            </div>
            <div className="feature-card">
              <h3>🧩 Consistency Enforcement</h3>
              <p>Validates all lore against existing knowledge to prevent contradictions</p>
            </div>
            <div className="feature-card">
              <h3>🗺️ Entity Extraction</h3>
              <p>Automatically identifies factions, characters, locations, resources, and events</p>
            </div>
            <div className="feature-card">
              <h3>🔗 Relationship Mapping</h3>
              <p>Discovers and tracks connections between entities in your world</p>
            </div>
          </div>
        </main>

        <footer className="app-footer">
          <p>
            Built with <strong>Bun</strong>, <strong>LangGraph</strong>, <strong>Neo4j</strong>,{' '}
            <strong>Qdrant</strong>, and <strong>Ollama</strong>
          </p>
        </footer>
      </div>
    </QueryClientProvider>
  );
}

export default App;
