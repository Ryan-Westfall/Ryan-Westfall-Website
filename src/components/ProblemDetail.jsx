import React, { useState, useEffect } from 'react';

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/Ryan-Westfall/competitive-programming/main';

function getLocalNotesKey(problem) {
  return `leetcode-notes-${problem.id}`;
}

function getLocalNotes(problem) {
  try {
    const key = getLocalNotesKey(problem);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Check if data is recent (within 7 days) to avoid stale
    if (data.updatedAt) {
      const age = Date.now() - new Date(data.updatedAt).getTime();
      // Keep local notes for up to 30 days
      if (age > 30 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem(key);
        return null;
      }
    }
    return data.content || '';
  } catch {
    return null;
  }
}

function saveLocalNotes(problem, content) {
  try {
    const key = getLocalNotesKey(problem);
    const data = {
      content,
      updatedAt: new Date().toISOString(),
      slug: problem.id,
      title: problem.title,
      frontendId: problem.frontendId,
      dir: problem.dir
    };
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save local notes', e);
  }
}

function parseNotesMd(content) {
  // Notes.md format has header then "---" then notes then "---" footer
  // Extract middle part between --- delimiters
  if (!content) return '';
  const parts = content.split('---');
  if (parts.length >= 3) {
    // parts[0] = header, parts[1] = notes, parts[2] = footer
    return parts[1].trim();
  }
  // Fallback: return whole content after first header
  const lines = content.split('\n');
  const startIdx = lines.findIndex(l => l.trim() === '---');
  if (startIdx !== -1) {
    const endIdx = lines.findIndex((l, i) => i > startIdx && l.trim() === '---');
    if (endIdx !== -1) {
      return lines.slice(startIdx + 1, endIdx).join('\n').trim();
    }
    return lines.slice(startIdx + 1).join('\n').trim();
  }
  return content.trim();
}

function buildNotesMd(problem, notesContent) {
  const title = problem.title || problem.id;
  const slug = problem.id;
  const frontendId = problem.frontendId || '';
  const now = new Date().toISOString();
  return `# Notes: ${title}

**Problem:** ${slug}
**Frontend ID:** ${frontendId}
**Updated:** ${now}

---

${notesContent}

---
*Synced via LeetSync extension from ryan-westfall.info*
`;
}

export default function ProblemDetail({ problem, onClose }) {
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [rawNotesFile, setRawNotesFile] = useState('');
  const [solutionCode, setSolutionCode] = useState('');
  const [solutionLang, setSolutionLang] = useState('python');
  const [loadingDesc, setLoadingDesc] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [loadingSolution, setLoadingSolution] = useState(true);
  const [descError, setDescError] = useState(null);
  const [notesError, setNotesError] = useState(null);
  const [solutionError, setSolutionError] = useState(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [extensionAvailable, setExtensionAvailable] = useState(false);

  // Detect extension - use ref to avoid re-running on editedNotes change
  const editedNotesRef = React.useRef(editedNotes);
  useEffect(() => {
    editedNotesRef.current = editedNotes;
  }, [editedNotes]);

  useEffect(() => {
    // Check if extension flag exists immediately
    if (window.__leetSyncExtension) {
      setExtensionAvailable(true);
    }

    // Listen for extension announcement and save responses
    const handler = (event) => {
      if (event.data && event.data.type === 'LEETSYNC_EXTENSION_AVAILABLE') {
        setExtensionAvailable(true);
      }
      if (event.data && event.data.type === 'LEETSYNC_SAVE_NOTES_RESPONSE') {
        const { success, error } = event.data;
        setSaving(false);
        if (success) {
          // Success - notes already saved locally and UI updated optimistically
          // No success box per user request
          setIsEditing(false);
          setNotes(editedNotesRef.current);
        } else {
          setSaveError(error || 'Failed to save');
        }
      }
    };
    window.addEventListener('message', handler);

    // Ping extension to announce
    window.postMessage({ type: 'LEETSYNC_PING' }, '*');

    // Also check flag again after a short delay in case extension loads after component
    const interval = setInterval(() => {
      if (window.__leetSyncExtension) {
        setExtensionAvailable(true);
      }
    }, 500);

    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 3000);

    return () => {
      window.removeEventListener('message', handler);
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Fetch description (README.md)
  useEffect(() => {
    let cancelled = false;
    async function fetchDesc() {
      setLoadingDesc(true);
      setDescError(null);
      try {
        const url = `${GITHUB_RAW_BASE}/${problem.dir}/README.md`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`README not found (${res.status})`);
        }
        const text = await res.text();
        if (!cancelled) {
          setDescription(text);
          setLoadingDesc(false);
        }
      } catch (e) {
        if (!cancelled) {
          setDescError(e.message);
          setLoadingDesc(false);
        }
      }
    }
    if (problem.dir) {
      fetchDesc();
    } else {
      setLoadingDesc(false);
      setDescError('No directory info');
    }
    return () => { cancelled = true; };
  }, [problem.dir]);

  // Fetch notes (notes.md) with local persistence
  useEffect(() => {
    let cancelled = false;
    async function fetchNotes() {
      setLoadingNotes(true);
      setNotesError(null);
      
      // Check local storage first for immediate display of user's own writes
      const localNotes = getLocalNotes(problem);
      if (localNotes !== null && !cancelled) {
        // Show local notes immediately while fetching from GitHub in background
        setNotes(localNotes);
        // Don't set loading false yet, will update after fetch
      }
      
      try {
        const url = `${GITHUB_RAW_BASE}/${problem.dir}/notes.md`;
        const res = await fetch(url);
        if (res.status === 404) {
          // No notes on GitHub yet
          if (!cancelled) {
            // If we have local notes, keep them, otherwise empty
            if (localNotes === null) {
              setNotes('');
              setRawNotesFile('');
            }
            setLoadingNotes(false);
          }
          return;
        }
        if (!res.ok) {
          throw new Error(`Notes not found (${res.status})`);
        }
        const text = await res.text();
        if (!cancelled) {
          setRawNotesFile(text);
          const parsed = parseNotesMd(text);
          // If local notes exist and are different, prefer local (user's recent write)
          // GitHub may have delay, so local is more up-to-date for user's own writes
          if (localNotes !== null && localNotes !== parsed) {
            // Keep local version, but update raw file for reference
            // The local version is user's latest write, GitHub may be stale
            setNotes(localNotes);
          } else {
            setNotes(parsed);
            // Also update local storage with GitHub version if no local or same
            if (localNotes === null && parsed) {
              saveLocalNotes(problem, parsed);
            }
          }
          setLoadingNotes(false);
        }
      } catch (e) {
        if (!cancelled) {
          // If fetch fails but we have local notes, show local
          if (localNotes !== null) {
            setNotes(localNotes);
          } else if (e.message.includes('404')) {
            setNotes('');
          } else {
            setNotesError(e.message);
          }
          setLoadingNotes(false);
        }
      }
    }
    if (problem.dir) {
      fetchNotes();
    } else {
      setLoadingNotes(false);
    }
    return () => { cancelled = true; };
  }, [problem.dir]);

  // Fetch solution code - most recent
  useEffect(() => {
    let cancelled = false;
    async function fetchSolution() {
      setLoadingSolution(true);
      setSolutionError(null);
      try {
        // Try common solution filenames in order of likelihood
        const candidates = [
          `${problem.dir}/solution.py`,
          `${problem.dir}/solution.js`,
          `${problem.dir}/solution.ts`,
          `${problem.dir}/solution.java`,
          `${problem.dir}/solution.cpp`,
          `${problem.dir}/solution.go`,
          `${problem.dir}/solution.rs`,
          `${problem.dir}/solution.kt`,
          `${problem.dir}/solution.swift`,
        ];
        
        let foundCode = null;
        let foundLang = 'python';
        
        for (const path of candidates) {
          try {
            const url = `${GITHUB_RAW_BASE}/${path}`;
            const res = await fetch(url);
            if (res.ok) {
              foundCode = await res.text();
              // Determine language from extension
              const ext = path.split('.').pop();
              const langMap = {
                'py': 'python',
                'js': 'javascript',
                'ts': 'typescript',
                'java': 'java',
                'cpp': 'cpp',
                'go': 'go',
                'rs': 'rust',
                'kt': 'kotlin',
                'swift': 'swift'
              };
              foundLang = langMap[ext] || ext;
              break;
            }
          } catch {}
        }
        
        if (!cancelled) {
          if (foundCode) {
            setSolutionCode(foundCode);
            setSolutionLang(foundLang);
          } else {
            setSolutionCode('// No solution found');
            setSolutionLang('text');
          }
          setLoadingSolution(false);
        }
      } catch (e) {
        if (!cancelled) {
          setSolutionError(e.message);
          setLoadingSolution(false);
        }
      }
    }
    if (problem.dir) {
      fetchSolution();
    } else {
      setLoadingSolution(false);
      setSolutionError('No directory info');
    }
    return () => { cancelled = true; };
  }, [problem.dir]);

  const handleEdit = () => {
    setEditedNotes(notes);
    setIsEditing(true);
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedNotes('');
    setSaveError(null);
  };

  const handleSave = () => {
    if (!extensionAvailable) {
      setSaveError('LeetSync extension required to save. Please install the extension.');
      return;
    }
    
    // Immediately persist locally so user can read their own write even before GitHub updates
    saveLocalNotes(problem, editedNotes);
    // Don't close edit mode immediately - keep it open to show saving state
    // Optimistically update notes but keep editing view until save confirmed
    
    setSaving(true);
    setSaveError(null);

    const notesMdContent = buildNotesMd(problem, editedNotes);

    // Send message to extension via window.postMessage
    const message = {
      type: 'LEETSYNC_SAVE_NOTES',
      slug: problem.id,
      dir: problem.dir,
      title: problem.title,
      frontendId: problem.frontendId,
      notes: editedNotes,
      notesMd: notesMdContent,
    };

    window.postMessage(message, '*');

    // Poll GitHub to verify save succeeded
    let pollAttempts = 0;
    const maxPollAttempts = 10;
    const pollInterval = 2000; // 2 seconds
    
    const pollGitHub = async () => {
      pollAttempts++;
      try {
        const url = `${GITHUB_RAW_BASE}/${problem.dir}/notes.md`;
        // Add cache-busting param
        const res = await fetch(`${url}?t=${Date.now()}`);
        if (res.ok) {
          const text = await res.text();
          const parsed = parseNotesMd(text);
          // Check if GitHub version matches our saved version
          if (parsed === editedNotes || text.includes(editedNotes.slice(0, 50))) {
            // GitHub has updated, success
            setSaving(false);
            setIsEditing(false);
            setNotes(editedNotes);
            return true; // stop polling
          }
        }
      } catch (e) {
        console.warn('Polling GitHub notes failed', e);
      }
      
      if (pollAttempts < maxPollAttempts) {
        setTimeout(pollGitHub, pollInterval);
      } else {
        // Max attempts reached, but local save already done
        // Consider it success for local persistence, GitHub may have delay
        setSaving(false);
        setIsEditing(false);
        setNotes(editedNotes);
      }
      return false;
    };

    // Start polling after a short delay to allow GitHub to update
    setTimeout(pollGitHub, 3000);

    // Timeout fallback - even if extension doesn't respond, we already saved locally
    setTimeout(() => {
      setSaving(prev => {
        if (prev) {
          // Extension didn't respond, but local save already done
          setSaving(false);
        }
        return false;
      });
    }, 30000); // longer timeout for polling
  };

  // Simple markdown rendering for notes view mode
  // For now, render as plain text with line breaks, or use a simple markdown parser
  const renderNotes = (text) => {
    if (!text) return <em className="no-notes">No notes yet. Click Edit to add your notes.</em>;
    // Simple rendering: preserve line breaks, render markdown-like
    return (
      <div className="notes-content">
        {text.split('\n').map((line, i) => (
          <p key={i} style={{ margin: '0.5rem 0', whiteSpace: 'pre-wrap' }}>{line || <br />}</p>
        ))}
      </div>
    );
  };

  const renderDescription = (text) => {
    if (!text) return <p>No description available.</p>;
    
    // README structure:
    // # Title
    // **Slug:** ...
    // ## Description
    // <html content>
    // ## Hints
    // ## Solution
    // We want to extract only the Description section
    
    let desc = text;
    
    // Try to extract between ## Description and next ## 
    const descMatch = text.match(/## Description\s*([\s\S]*?)\s*## (Hints|Solution)/i);
    if (descMatch && descMatch[1]) {
      desc = descMatch[1].trim();
    } else {
      // Fallback: extract after ## Description until end or next ##
      const fallbackMatch = text.match(/## Description\s*([\s\S]*)/i);
      if (fallbackMatch && fallbackMatch[1]) {
        // Cut at next ## if exists
        const nextHeader = fallbackMatch[1].search(/\n## /);
        if (nextHeader !== -1) {
          desc = fallbackMatch[1].slice(0, nextHeader).trim();
        } else {
          desc = fallbackMatch[1].trim();
        }
      } else {
        // No description header, try to find first <p> content
        // Remove title and metadata lines
        desc = text.replace(/^#.*\n/, '')
                   .replace(/\*\*Slug:\*\*.*\n/, '')
                   .replace(/\*\*ID:\*\*.*\n/, '')
                   .replace(/\*\*Difficulty:\*\*.*\n/, '')
                   .replace(/\*\*Tags:\*\*.*\n/, '')
                   .replace(/\*\*Companies:\*\*.*\n/, '')
                   .replace(/\*\*Language:\*\*.*\n/, '')
                   .replace(/\*\*Runtime:\*\*.*\n/, '')
                   .replace(/\*\*Memory:\*\*.*\n/, '')
                   .replace(/\*\*Submitted:\*\*.*\n/, '')
                   .replace(/\*\*Link:\*\*.*\n/, '')
                   .replace(/## Description\s*/, '')
                   .split('## Hints')[0]
                   .split('## Solution')[0]
                   .trim();
      }
    }

    // If desc contains HTML tags, render as HTML
    if (desc.includes('<p>') || desc.includes('<code>') || desc.includes('<pre>') || desc.includes('<ul>')) {
      return <div className="problem-description-html" dangerouslySetInnerHTML={{ __html: desc }} />;
    }
    // Fallback: render as preformatted but preserve line breaks
    return (
      <div className="problem-description-text" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
        {desc.slice(0, 8000)}
      </div>
    );
  };

  return (
    <div className="problem-detail-expanded">
      <div className="problem-detail-header">
        <h2>
          {problem.title} 
          {problem.frontendId && <span className="detail-id">#{problem.frontendId}</span>}
          <a 
            href={problem.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="platform-badge platform-badge-link"
            style={{ marginLeft: '0.8rem', fontSize: '0.75rem' }}
          >
            {problem.platform}
          </a>
        </h2>
      </div>

      <div className="problem-detail-layout">
        <div className="problem-description-panel">
          <h3>Problem Description</h3>
          {loadingDesc ? (
            <div className="loading">Loading description...</div>
          ) : descError ? (
            <div className="error">Failed to load description: {descError}</div>
          ) : (
            <div className="description-content">
              {renderDescription(description)}
            </div>
          )}
        </div>

        <div className="notes-panel">
          <div className="notes-header">
            <h3>Notes</h3>
            <div className="notes-header-actions">
              {!isEditing ? (
                extensionAvailable ? (
                  <button 
                    className="edit-btn" 
                    onClick={handleEdit}
                    disabled={loadingNotes}
                  >
                    Edit
                  </button>
                ) : null
              ) : (
                <>
                  <button className="cancel-btn" onClick={handleCancel} disabled={saving}>Cancel</button>
                  <button 
                    className={`save-btn ${saving ? 'saving' : ''}`} 
                    onClick={handleSave} 
                    disabled={saving}
                    title="Save via LeetSync extension"
                  >
                    {saving ? (
                      <>
                        <span className="saving-spinner"></span> Saving...
                      </>
                    ) : 'Save'}
                  </button>
                </>
              )}
            </div>
          </div>

          {saveError && <div className="save-error">Error: {saveError}</div>}

          <div className="notes-body">
            {loadingNotes ? (
              <div className="loading">Loading notes...</div>
            ) : notesError ? (
              <div className="error">Failed to load notes: {notesError}</div>
            ) : isEditing ? (
              <div className="notes-edit-mode">
                <textarea
                  value={editedNotes}
                  onChange={e => setEditedNotes(e.target.value)}
                  placeholder="Write your notes here... Markdown supported."
                  rows={20}
                  className="notes-textarea"
                  disabled={saving}
                />
                <div className="edit-hint">
                  Saving will update the competitive-programming repo via LeetSync extension.
                </div>
              </div>
            ) : (
              <div className="notes-view-mode">
                {renderNotes(notes)}
              </div>
            )}
          </div>

          <div className="solution-code-section">
            <h3>Submitted Solution</h3>
            {loadingSolution ? (
              <div className="loading">Loading solution...</div>
            ) : solutionError ? (
              <div className="error">Failed to load solution: {solutionError}</div>
            ) : (
              <pre className="solution-code-block">
                <code>{solutionCode}</code>
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
