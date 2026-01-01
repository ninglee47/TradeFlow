import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

const TradeContext = createContext()

export function TradeProvider({ children }) {
    const [trades, setTrades] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchTrades()
    }, [])

    const fetchTrades = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('trades')
                .select('*')
                .order('date', { ascending: false })

            if (error) throw error
            setTrades(data || [])
        } catch (err) {
            console.error('Error fetching trades:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const addTrade = async (newTrade) => {
        try {
            const { data, error } = await supabase
                .from('trades')
                .insert([newTrade])
                .select()

            if (error) throw error
            setTrades([data[0], ...trades])
            return { success: true }
        } catch (err) {
            console.error('Error adding trade:', err)
            return { success: false, error: err.message }
        }
    }

    const updateTrade = async (id, updatedFields) => {
        try {
            const { data, error } = await supabase
                .from('trades')
                .update(updatedFields)
                .eq('id', id)
                .select()

            if (error) throw error

            setTrades(trades.map(t => t.id === id ? data[0] : t))
            return { success: true }
        } catch (err) {
            console.error('Error updating trade:', err)
            return { success: false, error: err.message }
        }
    }

    const deleteTrade = async (id) => {
        try {
            const { error } = await supabase
                .from('trades')
                .delete()
                .eq('id', id)

            if (error) throw error

            setTrades(trades.filter(t => t.id !== id))
            return { success: true }
        } catch (err) {
            console.error('Error deleting trade:', err)
            return { success: false, error: err.message }
        }
    }

    return (
        <TradeContext.Provider value={{ trades, loading, error, addTrade, updateTrade, deleteTrade, refresh: fetchTrades }}>
            {children}
        </TradeContext.Provider>
    )
}

export function useTrades() {
    return useContext(TradeContext)
}
