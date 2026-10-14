import React, { useState, useEffect } from 'react';

export default function Projects() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Same-origin proxy (Netlify function in prod, Vite plugin in dev), not
    // api.github.com directly: browser calls are unauthenticated (60/hr per
    // IP) and 403 on shared IPs, which used to fail silently below.
    fetch('/api/github-repos')
      .then(async response => {
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(data?.error || `GitHub API error: ${response.status}`);
        }
        if (!Array.isArray(data)) {
          throw new Error('GitHub API returned an unexpected response');
        }
        return data;
      })
      .then(data => {
        setRepos(data);
        setError(null);
      })
      .catch(err => {
        console.error('Failed to load GitHub repos:', err);
        setRepos([]);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="projects">
        <div className="repo load">
          <div className="repoBox">
            <h4>Loading projects...</h4>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="projects">
      <a 
        href="https://github.com/Ryan-Westfall/pixorize-editor" 
        target="_blank" 
        rel="noopener noreferrer"
        className="repo load"
      >
        <div className="repoBox">
          <div>
            <h4>Text Editor Application</h4>
          </div>
          <div style={{padding:"1rem 0px", opacity:"0.4"}}>
            WYSIWYG text editor that selectively parses styled text categorizing them into "views"
          </div>
        </div>
      </a>

      <a 
        href="/study.pdf" 
        target="_blank" 
        rel="noopener noreferrer"
        className="repo load"
      >
        <div className="repoBox">
          <div>
            <h4>ANN-based Sentiment Analysis Study</h4>
          </div>
          <div style={{padding:"1rem 0px", opacity:"0.4"}}>
            Self-researched study comparing performance of RNN, LSTM, and CNN sentiment analysis approaches
          </div>
        </div>
      </a>

      {(error || repos.length === 0) && (
        <a
          href="https://github.com/Ryan-Westfall?tab=repositories"
          target="_blank"
          rel="noopener noreferrer"
          className="repo load"
        >
          <div className="repoBox">
            <div>
              <h4>More projects on GitHub</h4>
            </div>
            <div style={{padding:"1rem 0px", opacity:"0.4"}}>
              {error
                ? "Couldn't load projects from GitHub right now — view them on GitHub instead."
                : "View all projects on GitHub."}
            </div>
          </div>
        </a>
      )}

      {repos
        .filter(repo => repo.name !== "Ryan-Westfall.github.io")
        .map(repo => (
          <a 
            key={repo.id} 
            href={repo.html_url} 
            target="_blank"
            rel="noopener noreferrer"
            className="repo load"
          >
            <div className="repoBox">
              <div>
                <h4>{repo.name}</h4>
              </div>
              <div style={{padding:"1rem 0px", opacity:"0.4"}}>
                {repo.description}
              </div>
            </div>
          </a>
        ))}
    </div>
  );
}
