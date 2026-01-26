import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TradeProvider } from './context/TradeContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import TradeList from './components/TradeList/TradeList.jsx'
import TradeForm from './components/TradeForm/TradeForm.jsx'
import TradeDetails from './pages/TradeDetails.jsx'
import PatternAnalysis from './pages/PatternAnalysis.jsx'

import Strategy from './pages/Strategy'

// Placeholder components until we implement them
// const Dashboard = () => <h2 className="text-2xl font-bold">Dashboard</h2>
// const TradeList = () => <h2 className="text-2xl font-bold">Journal Logs</h2>
// const TradeForm = () => <h2 className="text-2xl font-bold">Add Trade</h2>

function App() {
  return (
    <TradeProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/trades" element={<TradeList />} />
            <Route path="/trades/:id" element={<TradeDetails />} />
            <Route path="/analysis" element={<PatternAnalysis />} />
            <Route path="/add" element={<TradeForm />} />
            <Route path="/edit/:id" element={<TradeForm />} />
            <Route path="/strategy" element={<Strategy />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TradeProvider>
  )
}

export default App
