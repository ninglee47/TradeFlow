import { useState, useEffect, useRef } from 'react'
import { Save, BookOpen, PenTool, Loader2 } from 'lucide-react'
import { supabase } from '../services/supabase'

export default function Strategy() {
    const [strategy, setStrategy] = useState('')
    const [notes, setNotes] = useState('')
    const [lastSaved, setLastSaved] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [id, setId] = useState(null)

    // To prevent autosave on initial load
    const isFirstLoad = useRef(true)

    // Load initial state from Supabase
    useEffect(() => {
        fetchStrategy()
    }, [])

    const fetchStrategy = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('strategies')
                .select('*')
                .limit(1)
                .single()

            if (data) {
                setStrategy(data.strategy || '')
                setNotes(data.notes || '')
                setId(data.id)
                if (data.updated_at) {
                    setLastSaved(new Date(data.updated_at))
                }
            } else if (error && error.code !== 'PGRST116') { // PGRST116 is "The result contains 0 rows"
                console.error('Error fetching strategy:', error)
            }
        } catch (err) {
            console.error('Unexpected error fetching strategy:', err)
        } finally {
            setLoading(false)
            // Small delay to ensure we don't trigger autosave immediately after setting state
            setTimeout(() => {
                isFirstLoad.current = false
            }, 500)
        }
    }

    // Combined save function
    const saveData = async (newStrategy, newNotes) => {
        try {
            setSaving(true)
            const timestamp = new Date()

            const payload = {
                strategy: newStrategy,
                notes: newNotes,
                updated_at: timestamp.toISOString()
            }

            // If we have an ID, update that row. Otherwise insert a new one (or upsert if we had a fixed ID)
            // Since we want a singleton, if we don't have an ID yet, we insert.

            let result

            if (id) {
                result = await supabase
                    .from('strategies')
                    .update(payload)
                    .eq('id', id)
                    .select()
            } else {
                result = await supabase
                    .from('strategies')
                    .insert([payload])
                    .select()
            }

            const { data, error } = result

            if (error) throw error

            if (data && data[0]) {
                setId(data[0].id)
                setLastSaved(timestamp)
            }
        } catch (err) {
            console.error('Error saving strategy:', err)
        } finally {
            setSaving(false)
        }
    }

    // Effect to autosave when strategy or notes change
    useEffect(() => {
        if (loading || isFirstLoad.current) return

        const timeoutId = setTimeout(() => {
            saveData(strategy, notes)
        }, 2000) // Debounce save by 2 seconds to reduce DB calls

        return () => clearTimeout(timeoutId)
    }, [strategy, notes])

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Strategy & Notes
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Define your edge and keep track of your thoughts.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {saving && (
                        <div className="text-sm text-yellow-500 flex items-center gap-2 animate-in fade-in">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Saving...
                        </div>
                    )}
                    {!saving && lastSaved && (
                        <div className="text-sm text-muted-foreground flex items-center gap-2 animate-in fade-in">
                            <Save className="w-4 h-4" />
                            Saved {lastSaved.toLocaleTimeString()}
                        </div>
                    )}
                </div>
            </header>

            <div className="grid gap-6 lg:grid-cols-2 h-[calc(100vh-12rem)]">
                {/* Strategy Section */}
                <div className="flex flex-col gap-4 h-full">
                    <div className="flex items-center gap-2 text-primary font-medium">
                        <BookOpen className="w-5 h-5" />
                        <h2>Trading Strategy</h2>
                    </div>
                    <div className="relative flex-1 group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <textarea
                            value={strategy}
                            onChange={(e) => setStrategy(e.target.value)}
                            placeholder="Define your strategy here...
e.g.
- Entry Criteria:
  1. Trend alignment
  2. Key support/resistance
  3. Signal candle
- Risk Management:
  - Max 1% per trade
  - Minimum 1:2 RR"
                            className="relative w-full h-full p-6 rounded-xl bg-card border border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none resize-none transition-all shadow-sm hover:shadow-md text-base leading-relaxed placeholder:text-muted-foreground/30 font-mono"
                            spellCheck={false}
                        />
                    </div>
                </div>

                {/* Notes Section */}
                <div className="flex flex-col gap-4 h-full">
                    <div className="flex items-center gap-2 text-primary font-medium">
                        <PenTool className="w-5 h-5" />
                        <h2>Daily Notes / Ideas</h2>
                    </div>
                    <div className="relative flex-1 group">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Write down your thoughts, market observations, or lessons learned..."
                            className="relative w-full h-full p-6 rounded-xl bg-card border border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none resize-none transition-all shadow-sm hover:shadow-md text-base leading-relaxed placeholder:text-muted-foreground/30 font-sans"
                            spellCheck={false}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
