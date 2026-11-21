import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { RevealManager, ScrollManager } from './components/Effects';
import { hasCases } from './content';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
        <ScrollManager />
        <RevealManager />
        <Navbar />
        <main id="conteudo">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cases" element={hasCases ? <Projects /> : <Navigate to="/" replace />} />
            <Route path="/projetos" element={<Navigate to="/cases" replace />} />
            {/* Rotas antigas viram âncoras da home */}
            <Route path="/sobre" element={<Navigate to="/#sobre" replace />} />
            <Route path="/servicos" element={<Navigate to="/#servicos" replace />} />
            <Route path="/contato" element={<Navigate to="/#contato" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
