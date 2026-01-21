import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTrades } from '../../context/TradeContext'
import { Save, ArrowLeft } from 'lucide-react'

export default function TradeForm() {
    const { addTrade, updateTrade, trades } = useTrades()
    const navigate = useNavigate()
    const { id } = useParams()
    const isEditMode = Boolean(id)

    const [formData, setFormData] = useState({
        date: (() => {
            const now = new Date()
            return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0')
        })(),
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        pair: '',
        direction: 'Long',
        entry_price: '',
        stop_loss: '',
        timeframe: '',
        target_rr: '',
        pnl: '',
        setup: '',
        strategy: '',
        result: 'Win',
        comment: '',
        chart_url: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isEditMode && trades.length > 0) {
            const tradeToEdit = trades.find(t => t.id === id)
            if (tradeToEdit) {
                setFormData({
                    ...tradeToEdit,
                    pnl: tradeToEdit.pnl || '',
                    target_rr: tradeToEdit.target_rr || '', // ensure naming matches
                    entry_price: tradeToEdit.entry_price || '',
                    stop_loss: tradeToEdit.stop_loss || '',
                    chart_url: tradeToEdit.chart_url || ''
                })
            }
        }
    }, [id, isEditMode, trades])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            if (isEditMode) {
                const { success, error } = await updateTrade(id, formData)
                if (!success) throw new Error(error)
            } else {
                const { success, error } = await addTrade(formData)
                if (!success) throw new Error(error)
            }
            navigate('/trades')
        } catch (err) {
            console.error(err)
            setError(err.message || 'Failed to save trade')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-full">
                    <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold">{isEditMode ? 'Edit Trade' : 'New Trade Log'}</h2>
                    <p className="text-muted-foreground">Record details about your execution.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-card border border-border p-6 rounded-xl space-y-6 shadow-sm">
                {error && <div className="p-3 bg-red-500/10 text-red-500 text-sm rounded-md">{error}</div>}

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="date" className="text-sm font-medium">Date</label>
                        <input id="date" name="date" type="date" required value={formData.date} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="time" className="text-sm font-medium">Time</label>
                        <input id="time" name="time" type="time" required value={formData.time} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Pair / Ticker</label>
                        <input name="pair" placeholder="BTC/USD" required value={formData.pair} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none uppercase" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Direction</label>
                        <select name="direction" value={formData.direction} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none">
                            <option value="Long">Long</option>
                            <option value="Short">Short</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Entry Price</label>
                        <input name="entry_price" type="number" step="any" placeholder="0.00" value={formData.entry_price} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Stop Loss</label>
                        <input name="stop_loss" type="number" step="any" placeholder="0.00" value={formData.stop_loss} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none" />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Timeframe</label>
                        <input name="timeframe" placeholder="e.g. 15m" value={formData.timeframe} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Strategy</label>
                        <input name="strategy" placeholder="e.g. Breakout" value={formData.strategy} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Target RR</label>
                        <input name="target_rr" type="number" step="0.1" placeholder="2.0" value={formData.target_rr} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Setup / Entry Reason</label>
                    <textarea name="setup" rows="2" placeholder="Describe why you took this trade..." value={formData.setup} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none resize-none" />
                </div>

                <div className="border-t border-border pt-4 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Result</label>
                        <select name="result" value={formData.result} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none">
                            <option value="Win">Win</option>
                            <option value="Lose">Lose</option>
                            <option value="BE">Break Even</option>
                            <option value="Pending">Pending</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">P&L ($)</label>
                        <input name="pnl" type="number" step="0.01" placeholder="0.00" value={formData.pnl} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Chart URL (TradingView)</label>
                    <input name="chart_url" type="url" placeholder="https://www.tradingview.com/x/..." value={formData.chart_url} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none" />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Comment</label>
                    <textarea name="comment" rows="3" placeholder="Post-trade reflections..." value={formData.comment} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none resize-none" />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                    <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
                    <button type="submit" disabled={loading} className="px-6 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        {loading ? 'Saving...' : 'Save Trade'}
                    </button>
                </div>
            </form>
        </div>
    )
}
