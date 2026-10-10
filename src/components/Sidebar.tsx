import { useState } from 'react';
import { Logo } from './Logo';
import {
  LayoutDashboard,
  Search,
  GitBranch,
  Bell,
  FlaskConical,
  FileText,
  Menu,
  X,
} from 'lucide-react';

export type Page =
  | 'overview'
  | 'analyse'
  | 'journey'
  | 'alerts'
  | 'scenarios'
  | 'methodology';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const NAV_ITEMS: { page: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { page: 'overview', label: 'Overview', icon: LayoutDashboard },
  { page: 'analyse', label: 'Analyse a Message', icon: Search },
  { page: 'journey', label: 'Scam Journey', icon: GitBranch },
  { page: 'alerts', label: 'Alert Intelligence', icon: Bell },
  { page: 'scenarios', label: 'Scenario Lab', icon: FlaskConical },
  { page: 'methodology', label: 'Methodology & Privacy', icon: FileText },
];

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (page: Page) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile header */}
      <div className="mobile-header">
        <button
          className="hamburger-btn"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>
        <div className="sidebar-brand">
          <Logo size={28} />
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>ScamShield AI</span>
        </div>
      </div>

      {/* Mobile overlay */}
      <div
        className={`mobile-overlay ${mobileOpen ? 'visible' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <nav className={`sidebar ${mobileOpen ? 'open' : ''}`} aria-label="Main navigation">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-icon">
              <Logo size={36} />
            </div>
            <div className="brand-text">
              <h1>ScamShield AI</h1>
              <span className="tagline">Pattern Intelligence</span>
            </div>
          </div>
          {/* Mobile close button */}
          <button
            className="hamburger-btn"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
            style={{
              display: mobileOpen ? 'flex' : 'none',
              position: 'absolute',
              top: '16px',
              right: '16px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-nav">
          {NAV_ITEMS.map(({ page, label, icon: Icon }) => (
            <button
              key={page}
              id={`nav-${page}`}
              className={`nav-item ${currentPage === page ? 'active' : ''}`}
              onClick={() => handleNav(page)}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              <Icon className="nav-icon" size={18} />
              {label}
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <p>Hackathon prototype</p>
          <p>All data is synthetic</p>
        </div>
      </nav>
    </>
  );
}
