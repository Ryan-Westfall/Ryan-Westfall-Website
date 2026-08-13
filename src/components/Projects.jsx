import React, { useState, useEffect } from 'react';

export default function Projects() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = {};
    if (import.meta.env.VITE_GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`;
    }

    fetch('https://api.github.com/users/Ryan-Westfall/repos?sort=updated&per_page=12', { headers })
      .then(response => {
        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setRepos(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load GitHub repos:', err);
        setRepos([]);
        setLoading(false);
      });
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
