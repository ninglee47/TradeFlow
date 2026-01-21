import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTrades } from '../context/TradeContext'
import { ArrowLeft, Edit2, Trash2, ExternalLink, Calendar, Clock, DollarSign, TrendingUp, TrendingDown, Target, Shield, Hash, Info } from 'lucide-react'

export default function TradeDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { trades, deleteTrade, loading } = useTrades()

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading trade details...</div>

    const trade = trades.find(t => t.id === id)

    if (!trade) {
        return (
            <div className="text-center py-12 space-y-4">
                <h2 className="text-2xl font-bold">Trade not found</h2>
                <button onClick={() => navigate('/trades')} className="text-primary hover:underline">
                    Back to Journal
                </button>
            </div>
        )
    }

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this trade?')) {
            await deleteTrade(id)
            navigate('/trades')
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            {trade.pair}
                            <span className={`text-sm px-3 py-1 rounded-full border ${trade.direction === 'Long'
                                ? 'border-green-500/30 bg-green-500/10 text-green-500'
                                : 'border-red-500/30 bg-red-500/10 text-red-500'
                                }`}>
                                {trade.direction}
                            </span>
                        </h1>
                        <div className="flex items-center gap-4 text-muted-foreground text-sm mt-1">
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {trade.date}</span>
                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {trade.time}</span>
                            <span>{trade.timeframe}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link to={`/edit/${id}`} className="flex items-center gap-2 px-4 py-2 hover:bg-muted rounded-lg transition-colors text-sm font-medium">
                        <Edit2 className="w-4 h-4" /> Edit
                    </Link>
                    <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-sm font-medium text-muted-foreground">
                        <Trash2 className="w-4 h-4" /> Delete
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Details */}
                <div className="md:col-span-2 space-y-6">
                    {/* Outcome Card */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Outcome</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="p-4 bg-muted/30 rounded-lg">
                                <div className="text-xs text-muted-foreground mb-1">Result</div>
                                <div className={`text-xl font-bold ${trade.result === 'Win' ? 'text-green-500' :
                                    trade.result === 'Lose' ? 'text-red-500' :
                                        'text-foreground'
                                    }`}>{trade.result}</div>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-lg">
                                <div className="text-xs text-muted-foreground mb-1">P&L</div>
                                <div className={`text-xl font-bold ${Number(trade.pnl) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {Number(trade.pnl) > 0 ? '+' : ''}{trade.pnl}
                                </div>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-lg">
                                <div className="text-xs text-muted-foreground mb-1">RR</div>
                                <div className="text-xl font-bold">{trade.target_rr || '-'}</div>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-lg">
                                <div className="text-xs text-muted-foreground mb-1">Strategy</div>
                                <div className="text-lg font-medium truncate" title={trade.strategy}>{trade.strategy || '-'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Setup & Review */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                <ActivityIcon className="w-5 h-5 text-primary" /> Setup / Entry Reason
                            </h3>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {trade.setup || 'No setup description provided.'}
                            </p>
                        </div>
                        <div className="border-t border-border pt-6">
                            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                <MessageSquareIcon className="w-5 h-5 text-primary" /> Post-Trade Comments
                            </h3>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {trade.comment || 'No comments.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
                        <h3 className="font-semibold text-muted-foreground">Trade Metrics</h3>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-border/50">
                                <span className="text-sm text-muted-foreground flex items-center gap-2"><Target className="w-4 h-4" /> Entry Price</span>
                                <span className="font-mono font-medium">{trade.entry_price || '-'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-border/50">
                                <span className="text-sm text-muted-foreground flex items-center gap-2"><Shield className="w-4 h-4" /> Stop Loss</span>
                                <span className="font-mono font-medium">{trade.stop_loss || '-'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
                        <h3 className="font-semibold text-muted-foreground">System Info</h3>
                        <div className="space-y-3 text-xs">
                            <div className="flex flex-col py-2 border-b border-border/50">
                                <span className="text-muted-foreground flex items-center gap-2 mb-1"><Info className="w-3 h-3" /> Created At</span>
                                <span className="font-mono text-muted-foreground">{new Date(trade.created_at).toLocaleString() || '-'}</span>
                            </div>
                            <div className="flex flex-col py-2">
                                <span className="text-muted-foreground flex items-center gap-2 mb-1"><Hash className="w-3 h-3" /> User ID</span>
                                <span className="font-mono text-[10px] text-muted-foreground break-all">{trade.user_id || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col py-2">
                                <span className="text-muted-foreground flex items-center gap-2 mb-1"><ExternalLink className="w-3 h-3" /> Chart URL</span>
                                <a href={trade.chart_url} target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] text-primary hover:underline break-all">{trade.chart_url || 'N/A'}</a>
                            </div>
                        </div>
                    </div>

                    {trade.chart_url && (
                        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                                <h3 className="font-semibold text-muted-foreground">Chart</h3>
                                <a href={trade.chart_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                                    Open original <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                            <div className="aspect-video bg-muted relative group">
                                <img
                                    src={trade.chart_url}
                                    alt="Trade Chart"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.style.display = 'none';
                                        e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                                        e.target.parentElement.innerHTML = '<span class="text-sm text-muted-foreground">Preview unavailable</span>';
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Icons
function ActivityIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}

function MessageSquareIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    )
}
