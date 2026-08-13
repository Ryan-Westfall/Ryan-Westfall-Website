import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import Nav from './components/Nav';
import Hero from './components/Hero';
import CompetitiveProgramming from './components/CompetitiveProgramming';
import Projects from './components/Projects';
import './css/main.css';

function App() {
  return (
    <HelmetProvider>
      <div>
        <Helmet>
          <meta charSet="utf-8" />
          <title>Ryan Portfolio</title>
          <meta name="description" content="Ryan Westfall's portfolio website" />
        </Helmet>
        <Nav />
        <Hero />
        <CompetitiveProgramming />
        <div className="projects-section">
          <h1>Projects:</h1>
          <Projects />
        </div>
      </div>
    </HelmetProvider>
  );
}

export default App;
