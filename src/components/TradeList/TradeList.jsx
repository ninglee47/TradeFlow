import { useTrades } from '../../context/TradeContext'
import { Link } from 'react-router-dom'
import { ExternalLink, Edit2, Trash2 } from 'lucide-react'

export default function TradeList() {
    const { trades, deleteTrade, loading } = useTrades()

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading journal...</div>

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this trade?')) {
            await deleteTrade(id)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Journal</h2>
                    <p className="text-muted-foreground">Manage and review your trading history.</p>
                </div>
                <Link to="/add" className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Add Log
                </Link>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="px-6 py-4 font-medium">Date/Time</th>
                                <th className="px-6 py-4 font-medium">Pair</th>
                                <th className="px-6 py-4 font-medium">Setup</th>
                                <th className="px-6 py-4 font-medium">Direction</th>
                                <th className="px-6 py-4 font-medium">RR</th>
                                <th className="px-6 py-4 font-medium text-right">Result</th>
                                <th className="px-6 py-4 font-medium text-right">P&L</th>
                                <th className="px-6 py-4 font-medium text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {trades.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-8 text-center text-muted-foreground">
                                        No trades found. Start by adding one!
                                    </td>
                                </tr>
                            ) : (
                                trades.map((trade) => (
                                    <tr key={trade.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{trade.date}</div>
                                            <div className="text-xs text-muted-foreground">{trade.time}</div>
                                        </td>
                                        <td className="px-6 py-4 font-medium">{trade.pair}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{trade.setup || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${trade.direction === 'Long'
                                                ? 'bg-green-500/10 text-green-500'
                                                : 'bg-red-500/10 text-red-500'
                                                }`}>
                                                {trade.direction}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{trade.targetRR || '-'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${trade.result === 'Win' ? 'bg-green-500/10 text-green-500' :
                                                    trade.result === 'Lose' ? 'bg-red-500/10 text-red-500' :
                                                        trade.result === 'Pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                                            'bg-gray-500/10 text-gray-500'
                                                }`}>
                                                {trade.result}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold ${Number(trade.pnl) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {Number(trade.pnl) > 0 ? '+' : ''}{Number(trade.pnl)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {trade.chart_url && (
                                                    <a href={trade.chart_url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors" title="View Chart">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                )}
                                                <Link to={`/edit/${trade.id}`} className="p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-blue-500 transition-colors" title="Edit">
                                                    <Edit2 className="w-4 h-4" />
                                                </Link>
                                                <button onClick={() => handleDelete(trade.id)} className="p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-red-500 transition-colors" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
