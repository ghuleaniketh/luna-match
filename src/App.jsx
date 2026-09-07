import React from 'react';
import Hero from './components/Hero/Hero';

export default function App() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col relative space-grid">
      <main className="flex-1">
        <Hero />
      </main>
    </div>
  );
}
