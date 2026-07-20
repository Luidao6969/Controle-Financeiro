import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Economias } from './pages/Ecomomias';
import { Gastos } from './pages/GastosMensal';
import { Planejamentos } from './pages/Planejamento';

function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main style={{ flex: 1, padding: '40px' }}>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'economias' && <Economias/>}
        {activeTab === 'gastos' && <Gastos/>}
        {activeTab === 'planejamentos' && <Planejamentos/>}
      </main>
    </div>
  );
}

export default App;