import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, PlusCircle, List, LineChart, BookOpen, Brain } from 'lucide-react'

export default function Layout({ children }) {
    const location = useLocation()

    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/trades', label: 'Journal', icon: List },
        { path: '/analysis', label: 'Pattern AI', icon: Brain },
        { path: '/add', label: 'Add Trade', icon: PlusCircle },
        { path: '/strategy', label: 'Strategy', icon: BookOpen },
    ]

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
            {/* Sidebar / Mobile Nav */}
            <aside className="w-full md:w-64 bg-card border-b md:border-r border-border p-4 flex flex-col justify-between md:h-screen sticky top-0 z-50">
                <div>
                    <div className="flex items-center gap-2 mb-8 px-2">
                        <LineChart className="w-8 h-8 text-primary" />
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            TradeFlow
                        </h1>
                    </div>

                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = location.pathname === item.path
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                <div className="p-4 bg-muted/20 rounded-lg text-xs text-muted-foreground mt-4 md:mt-0 hidden md:block">
                    <p>Trading Journal v1.0</p>
                    <p className="mt-1 opacity-50">Stay green.</p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
