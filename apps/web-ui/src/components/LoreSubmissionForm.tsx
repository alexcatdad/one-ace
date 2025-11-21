/**
 * Lore Submission Form - Submit fantasy world-building text for processing
 */

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { submitLore } from '../lib/api';

export function LoreSubmissionForm({ onJobCreated }: { onJobCreated: (jobId: string) => void }) {
  const [text, setText] = useState('');

  const mutation = useMutation({
    mutationFn: submitLore,
    onSuccess: (data) => {
      setText('');
      onJobCreated(data.jobId);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      mutation.mutate({ text });
    }
  };

  return (
    <div className="lore-submission-form">
      <h2>Submit Fantasy Lore</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your fantasy world-building text here...

Example:
The Crimson Empire, a militaristic faction led by Emperor Valen, controls the rich Ruby Mines located in the Bloodstone Mountains. Their long-standing alliance with the Silver Covenant strengthens their grip on regional trade routes..."
          rows={12}
          disabled={mutation.isPending}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '14px',
            fontFamily: 'monospace',
            borderRadius: '4px',
            border: '1px solid #ccc',
            resize: 'vertical',
          }}
        />
        <div style={{ marginTop: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            type="submit"
            disabled={!text.trim() || mutation.isPending}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: mutation.isPending ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: mutation.isPending ? 'not-allowed' : 'pointer',
            }}
          >
            {mutation.isPending ? 'Processing...' : 'Extract Entities'}
          </button>

          {mutation.isError && (
            <span style={{ color: 'red', fontSize: '14px' }}>
              Error: {mutation.error instanceof Error ? mutation.error.message : 'Unknown error'}
            </span>
          )}

          {mutation.isSuccess && (
            <span style={{ color: 'green', fontSize: '14px' }}>
              ✓ Submitted successfully! Job ID: {mutation.data.jobId.slice(0, 8)}...
            </span>
          )}
        </div>
      </form>

      <div
        style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          fontSize: '13px',
        }}
      >
        <strong>How it works:</strong>
        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
          <li>
            <strong>Extract:</strong> AI identifies entities (Factions, Characters, Locations,
            Resources, Events)
          </li>
          <li>
            <strong>Define:</strong> Maps entities to knowledge graph ontology
          </li>
          <li>
            <strong>Canonicalize:</strong> Merges duplicates and resolves entity IDs
          </li>
          <li>
            <strong>Write:</strong> Stores entities and relationships in Neo4j graph database
          </li>
        </ul>
      </div>
    </div>
  );
}
