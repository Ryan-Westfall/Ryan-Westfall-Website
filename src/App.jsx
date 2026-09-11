import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Hero from './components/Hero';
import CompetitiveProgramming from './components/CompetitiveProgramming';
import Projects from './components/Projects';
import Archive from './components/Archive';
import './css/main.css';

function Home() {
  return (
    <>
      <Hero />
      <CompetitiveProgramming />
      <div className="projects-section">
        <h1>Projects:</h1>
        <Projects />
      </div>
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <div>
          <Helmet>
            <meta charSet="utf-8" />
            <title>Ryan Portfolio</title>
            <meta name="description" content="Ryan Westfall's portfolio website" />
          </Helmet>
          <Nav />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/solutions" element={<Archive />} />
            <Route path="/leetcode" element={<Archive />} />
            <Route path="/cp" element={<Archive />} />
          </Routes>
        </div>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
