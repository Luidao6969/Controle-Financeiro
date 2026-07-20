import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'economias', name: 'Economias' },
    { id: 'gastos', name: 'Gastos Mensais' },
    { id: 'planejamentos', name: 'Planejamentos' },
  ];

  return (
    <aside style={{ width: '250px', height: '100vh', background: '#1e293b', color: '#fff', padding: '20px' }}>
      <h2 style={{ marginBottom: '30px', textAlign: 'center' }}>Finanças</h2>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              width: '100%',
              padding: '12px',
              textAlign: 'left',
              background: activeTab === item.id ? '#10b981' : 'transparent',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: activeTab === item.id ? 'bold' : 'normal',
              transition: 'background 0.2s'
            }}
          >
            {item.name}
          </button>
        ))}
      </nav>
    </aside>
  );
};