import { useTrades } from '../context/TradeContext'
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react'

export default function Dashboard() {
    const { trades, loading } = useTrades()

    if (loading) return <div className="p-8 text-center">Loading stats...</div>

    // Calculations
    const totalTrades = trades.length
    const wins = trades.filter(t => t.result === 'Win').length
    const losses = trades.filter(t => t.result === 'Lose').length
    // const be = trades.filter(t => t.result === 'BE').length
    const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : 0
    const netPnL = trades.reduce((acc, t) => acc + (Number(t.pnl) || 0), 0)

    const StatCard = ({ title, value, sub, icon: Icon, colorClass }) => (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
                <div className={`p-2 rounded-full ${colorClass} bg-opacity-10`}>
                    <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
                </div>
            </div>
            <div>
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-xs text-muted-foreground mt-1">{sub}</div>
            </div>
        </div>
    )

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">Overview of your trading performance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Net P&L"
                    value={`$${netPnL.toLocaleString()}`}
                    sub="All time"
                    icon={DollarSign}
                    colorClass={netPnL >= 0 ? "text-green-500 bg-green-500" : "text-red-500 bg-red-500"}
                />
                <StatCard
                    title="Win Rate"
                    value={`${winRate}%`}
                    sub={`${wins}W - ${losses}L`}
                    icon={Activity}
                    colorClass="text-blue-500 bg-blue-500"
                />
                <StatCard
                    title="Total Trades"
                    value={totalTrades}
                    sub=" entries"
                    icon={TrendingUp}
                    colorClass="text-purple-500 bg-purple-500"
                />
                <StatCard
                    title="Profit Factor"
                    value="N/A"
                    sub="Coming soon"
                    icon={TrendingDown}
                    colorClass="text-orange-500 bg-orange-500"
                />
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                {trades.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No trades logged yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="border-b border-border/50 text-muted-foreground">
                                    <th className="pb-3 font-medium">Date</th>
                                    <th className="pb-3 font-medium">Pair</th>
                                    <th className="pb-3 font-medium">Direction</th>
                                    <th className="pb-3 font-medium text-right">Result</th>
                                    <th className="pb-3 font-medium text-right">P&L</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trades.slice(0, 5).map((trade) => (
                                    <tr key={trade.id} className="border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors">
                                        <td className="py-3">{trade.date}</td>
                                        <td className="py-3 font-medium">{trade.pair}</td>
                                        <td className="py-3">
                                            <span className={`px-2 py-1 rounded text-xs ${trade.direction === 'Long' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                {trade.direction}
                                            </span>
                                        </td>
                                        <td className="py-3 text-right">
                                            <span className={`
                        ${trade.result === 'Win' ? 'text-green-500' : ''}
                        ${trade.result === 'Lose' ? 'text-red-500' : ''}
                        ${trade.result === 'BE' ? 'text-gray-500' : ''}
                      `}>
                                                {trade.result}
                                            </span>
                                        </td>
                                        <td className={`py-3 text-right font-medium ${Number(trade.pnl) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {Number(trade.pnl) > 0 ? '+' : ''}{Number(trade.pnl)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
