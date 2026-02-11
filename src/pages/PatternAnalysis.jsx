import { useState } from 'react'
import { useTrades } from '../context/TradeContext'
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Key, Sparkles, Loader2 } from 'lucide-react'

export default function PatternAnalysis() {
    const { trades, loading } = useTrades()
    const [apiKey, setApiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || '')
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [llmInsights, setLlmInsights] = useState(null)
    const [showKeyInput, setShowKeyInput] = useState(false)

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading analysis...</div>
    }

    if (!trades || trades.length === 0) {
        return (
            <div className="p-8 text-center">
                <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Data for Analysis</h2>
                <p className="text-muted-foreground">Log more trades to unlock AI patterns.</p>
            </div>
        )
    }

    // --- Analysis Logic ---
    const analyzePatterns = (trades) => {
        const patterns = {
            hourly: {},
            pairs: {},
            strategies: {},
            directions: {}
        }

        trades.forEach(trade => {
            const isWin = trade.result === 'Win'
            const isLoss = trade.result === 'Lose'
            if (!isWin && !isLoss && trade.result !== 'BE') return // Skip pending or others for win rate

            // Helper to update stats
            const updateStat = (category, key) => {
                if (!category[key]) category[key] = { wins: 0, losses: 0, total: 0, pnl: 0 }
                category[key].total++
                if (isWin) category[key].wins++
                if (isLoss) category[key].losses++
                category[key].pnl += Number(trade.pnl || 0)
            }

            // Hourly
            if (trade.time) {
                const hour = trade.time.split(':')[0]
                updateStat(patterns.hourly, `${hour}:00`)
            }

            // Pairs
            if (trade.pair) updateStat(patterns.pairs, trade.pair)

            // Strategies
            if (trade.strategy) updateStat(patterns.strategies, trade.strategy)

            // Direction
            if (trade.direction) updateStat(patterns.directions, trade.direction)
        })

        // Process into arrays
        const process = (category) => Object.entries(category).map(([key, stats]) => ({
            key,
            ...stats,
            winRate: stats.total > 0 ? (stats.wins / stats.total) * 100 : 0
        }))

        return {
            hourly: process(patterns.hourly),
            pairs: process(patterns.pairs),
            strategies: process(patterns.strategies),
            directions: process(patterns.directions)
        }
    }

    const stats = analyzePatterns(trades)

    // Find anomalies (min 3 trades)
    const findAnomalies = (list) => {
        const sweetSpots = list.filter(i => i.total >= 3 && i.winRate >= 70).sort((a, b) => b.winRate - a.winRate)
        const dangerZones = list.filter(i => i.total >= 3 && i.winRate <= 40).sort((a, b) => a.winRate - b.winRate) // Sort ascension for low win rate
        return { sweetSpots, dangerZones }
    }

    const allStats = [...stats.hourly, ...stats.pairs, ...stats.strategies, ...stats.directions]
    const { sweetSpots, dangerZones } = findAnomalies(allStats)

    // --- LLM Analysis ---
    const generateInsights = async () => {
        if (!apiKey) {
            setShowKeyInput(true)
            return
        }

        setIsAnalyzing(true)
        try {
            // Format recent trades for context
            const recentTrades = trades.slice(0, 30).map(t =>
                `- Result: ${t.result}, Pair: ${t.pair}, Strategy: ${t.strategy}, PnL: ${t.pnl}, Comment: "${t.comment || ''}", Setup: "${t.setup || ''}"`
            ).join('\n')

            const prompt = `
                You are a professional trading coach. Analyze these recent trade logs from a trader's journal.
                Identify patterns in their behavior, winning conditions, and losing conditions.
                Pay special attention to their comments and mental state if mentioned.
                
                Trade Logs:
                ${recentTrades}
                
                Provide 3 concise, actionable insights to help them improve. 
                Format as a simple bulleted list in Markdown.
            `

            // Using Google Gemini API (Free Tier compatible)
            // switched to gemini-1.5-flash for better stability
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            })

            const data = await response.json()

            if (response.status === 429) {
                // Try to extract specific error message from Google
                const errorMsg = data.error?.message || 'Rate limit exceeded.'
                throw new Error(`${errorMsg} (Please check your Google AI Studio quota)`)
            }

            if (data.error) throw new Error(data.error.message)

            // Extract text from Gemini response structure
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text
            if (!text) throw new Error('No insights generated.')

            setLlmInsights(text)
            setShowKeyInput(false)
        } catch (err) {
            console.error(err)
            alert('AI Coach Error: ' + err.message)
        } finally {
            setIsAnalyzing(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Brain className="w-8 h-8 text-purple-500" />
                        Pattern AI
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Statistical & Semantic analysis of your {trades.length} trades.
                    </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                    {showKeyInput ? (
                        <div className="flex gap-2 animate-in slide-in-from-right">
                            <input
                                type="password"
                                placeholder="Gemini Key (AIza...)"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="bg-background border border-input px-3 py-2 rounded-md text-sm w-48 focus:outline-none focus:ring-2 ring-primary"
                            />
                            <button
                                onClick={() => generateInsights()}
                                disabled={!apiKey || isAnalyzing}
                                className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                            >
                                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Run'}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowKeyInput(true)}
                            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-purple-500/20 transition-all"
                        >
                            <Sparkles className="w-4 h-4" />
                            Ask AI Coach
                        </button>
                    )}
                </div>
            </header>

            {/* AI Insights Section */}
            {llmInsights && (
                <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-l-4 border-purple-500 p-6 rounded-r-xl">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-purple-400">
                        <Sparkles className="w-5 h-5" />
                        AI Coach Insights
                    </h3>
                    <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                        {llmInsights}
                    </div>
                </div>
            )}

            {/* Insights Board */}
            <div className="grid md:grid-cols-2 gap-6">

                {/* Sweet Spots */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-green-500">
                        <TrendingUp className="w-5 h-5" />
                        Sweet Spots (High Win Rate)
                    </h3>
                    {sweetSpots.length > 0 ? (
                        <div className="space-y-3">
                            {sweetSpots.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                                    <span className="font-medium">{item.key}</span>
                                    <div className="text-right">
                                        <div className="text-green-500 font-bold">{item.winRate.toFixed(0)}% WR</div>
                                        <div className="text-xs text-muted-foreground">{item.wins}W / {item.losses}L</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">Not enough data to find consistent winning patterns.</p>
                    )}
                </div>

                {/* Danger Zones */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-red-500">
                        <AlertTriangle className="w-5 h-5" />
                        Danger Zones (Low Win Rate)
                    </h3>
                    {dangerZones.length > 0 ? (
                        <div className="space-y-3">
                            {dangerZones.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                                    <span className="font-medium">{item.key}</span>
                                    <div className="text-right">
                                        <div className="text-red-500 font-bold">{item.winRate.toFixed(0)}% WR</div>
                                        <div className="text-xs text-muted-foreground">{item.wins}W / {item.losses}L</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">Great job! No consistent losing patterns found.</p>
                    )}
                </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="grid md:grid-cols-2 gap-8">
                <CategoryBreakdown title="Best Pairs" data={stats.pairs} />
                <CategoryBreakdown title="Best Times" data={stats.hourly} />
                <CategoryBreakdown title="Best Strategies" data={stats.strategies} />
                <CategoryBreakdown title="Direction" data={stats.directions} />
            </div>
        </div>
    )
}

function CategoryBreakdown({ title, data }) {
    // Sort by Total trades to show most relevant first
    const sortedDetails = [...data].sort((a, b) => b.total - a.total).slice(0, 5)

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <div className="space-y-2">
                {sortedDetails.map((item) => (
                    <div key={item.key} className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span>{item.key}</span>
                            <span className={item.winRate >= 50 ? 'text-green-500' : 'text-red-500'}>
                                {item.winRate.toFixed(0)}%
                            </span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <div
                                className={`h-full ${item.winRate >= 50 ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{ width: `${item.winRate}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
