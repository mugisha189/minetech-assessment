import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Triage } from './pages/Triage';
import { Assistant } from './pages/Assistant';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/triage" element={<Triage />} />
      <Route path="/assistant" element={<Assistant />} />
    </Routes>
  );
}
