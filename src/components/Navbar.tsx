import { truncateAddress, CONTRACT_ID } from '@/lib/constants'
import { DEMO_SENDER } from '@/lib/constants'

type NavTab = 'send' | 'claim' | 'verify' | 'savings'

interface NavbarProps {
  activeTab: NavTab
  onTabChange: (tab: NavTab) => void
}

const TABS: { id: NavTab; label: string }[] = [
  { id: 'send',    label: 'Send'    },
  { id: 'claim',   label: 'Claim'   },
  { id: 'verify',  label: 'Verify'  },
  { id: 'savings', label: 'Savings' },
]

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-bg-base/90 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-4 max-w-screen-xl mx-auto">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 bg-cyan flex items-center justify-center animate-spin-slow"
            style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
          />
          <span className="font-display font-extrabold text-lg tracking-tight text-ink">
            Remit<span className="text-cyan">Chain</span>
          </span>
        </div>

        {/* Tab pills */}
        <div className="hidden sm:flex gap-1 bg-bg-raised border border-border rounded-lg p-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={[
                'px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest font-display transition-all duration-200',
                activeTab === tab.id
                  ? 'bg-cyan-dim text-cyan border border-cyan/20'
                  : 'text-ink-faint hover:text-ink-muted',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Wallet status */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80] animate-pulse-dot" />
          <code className="hidden md:block text-ink-faint font-mono text-xs border border-border bg-bg-raised px-3 py-1.5 rounded-md">
            {truncateAddress(DEMO_SENDER)}
          </code>
          <code className="hidden md:block text-ink-faint font-mono text-[10px] border border-border-subtle bg-bg-raised px-2 py-1 rounded-md">
            {truncateAddress(CONTRACT_ID, 4, 4)}
          </code>
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="sm:hidden flex border-t border-border">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={[
              'flex-1 py-2 text-xs font-bold uppercase tracking-wider font-display border-b-2 transition-colors',
              activeTab === tab.id
                ? 'text-cyan border-cyan'
                : 'text-ink-faint border-transparent',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
