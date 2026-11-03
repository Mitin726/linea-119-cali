import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing.jsx'
import Reportar from './pages/Reportar.jsx'
import Operador from './pages/Operador.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/reportar" element={<Reportar />} />
        <Route path="/operador" element={<Operador />} />
      </Routes>
    </BrowserRouter>
  );
}