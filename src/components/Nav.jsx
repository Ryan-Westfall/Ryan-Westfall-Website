import React from 'react';

export default function Nav() {
  return (
    <nav className="navigation">
      <div className="nav-desktop">
        <div className="nav-title">
          <a href="/">Ryan Westfall</a>
        </div>
        <div className="nav-social">
          <ul>
            <li>
              <a 
                href="https://linkedin.com/in/ryan-westfall" 
                target="_blank" 
                rel="noopener noreferrer"
                title="Connect with me on LinkedIn!"
              >
                <img src="/LinkedinNav.png" alt="LinkedIn" />
              </a>
            </li>
            <li>
              <a 
                href="https://github.com/Ryan-Westfall" 
                target="_blank" 
                rel="noopener noreferrer"
                title="Browse my GitHub!"
              >
                <img src="/GithubNav.png" alt="GitHub" />
              </a>
            </li>
            <li>
              <a 
                href="/ryan-resume.pdf" 
                download
                title="Download my Resume!"
              >
                <img src="/resume-logo.png" alt="Resume" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
