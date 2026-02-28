import { useEffect, useState } from 'react'

type Prospect = {
  id: number
  brand: string
  trigger: string
  score: number
  decision_maker: string
  next_action: string
}

const TRIGGER_OPTIONS = [
  { label: 'New R&D hire / Formulation Specialist', value: 'New R&D hire', bonus: 3 },
  { label: 'Facility / Line expansion', value: 'Facility expansion', bonus: 3 },
  { label: 'Reformulation / Ingredient change', value: 'Reformulation', bonus: 4 },
  { label: 'New product launch (sleep/energy/functional)', value: 'New product launch', bonus: 3 },
  { label: 'New co-packer partnership', value: 'New co-packer', bonus: 2 },
  { label: 'Funding round / Investment', value: 'Funding round', bonus: 2 },
  { label: 'Other / Custom', value: '', bonus: 0 }
]

function App() {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [filteredProspects, setFilteredProspects] = useState<Prospect[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [newProspect, setNewProspect] = useState({
    brand: '',
    trigger: '',
    score: 5.0,
    decision_maker: '',
    next_action: ''
  })
  const [sortConfig, setSortConfig] = useState<{ key: keyof Prospect; direction: 'asc' | 'desc' } | null>(null)

  const fetchProspects = () => {
    fetch('http://localhost:3000/api/prospects')
      .then(r => r.json())
      .then(data => {
        setProspects(data)
        setFilteredProspects(data) // reset filter on load
      })
      .catch(() => console.log('Backend not ready'))
  }

  useEffect(() => {
    fetchProspects()
  }, [])

  useEffect(() => {
    const term = searchTerm.toLowerCase().trim()
    if (!term) {
      setFilteredProspects(prospects)
      return
    }

    const filtered = prospects.filter(p =>
      p.brand.toLowerCase().includes(term) ||
      p.trigger.toLowerCase().includes(term) ||
      p.decision_maker.toLowerCase().includes(term) ||
      p.next_action.toLowerCase().includes(term)
    )
    setFilteredProspects(filtered)
  }, [searchTerm, prospects])

  const loadExamples = () => {
    fetch('http://localhost:3000/api/seed')
      .then(() => fetchProspects())
  }

  const addProspect = async () => {
    if (!newProspect.brand.trim()) return alert('Brand is required')
    await fetch('http://localhost:3000/api/prospects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProspect)
    })
    setShowModal(false)
    setNewProspect({ brand: '', trigger: '', score: 5.0, decision_maker: '', next_action: '' })
    fetchProspects()
  }

  const deleteProspect = async (id: number) => {
    if (!window.confirm('Delete this prospect permanently?')) return
    await fetch(`http://localhost:3000/api/prospects/${id}`, { method: 'DELETE' })
    fetchProspects()
  }

  const handleTriggerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = TRIGGER_OPTIONS.find(opt => opt.value === e.target.value)
    setNewProspect({
      ...newProspect,
      trigger: selected?.value || '',
      score: 5.0 + (selected?.bonus || 0)
    })
  }

  const exportToCSV = () => {
    const dataToExport = filteredProspects.length > 0 ? filteredProspects : prospects
    if (dataToExport.length === 0) return alert('No prospects to export')

    const headers = ['Brand', 'Trigger', 'Score', 'Decision Maker', 'Next Action']
    const rows = dataToExport.map(p => [
      `"${p.brand.replace(/"/g, '""')}"`,
      `"${p.trigger.replace(/"/g, '""')}"`,
      p.score,
      `"${p.decision_maker.replace(/"/g, '""')}"`,
      `"${p.next_action.replace(/"/g, '""')}"`
    ])

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `stoneforged-prospects-${new Date().toISOString().slice(0,10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const sortedProspects = [...filteredProspects].sort((a, b) => {
    if (!sortConfig) return 0
    const { key, direction } = sortConfig
    if (a[key] < b[key]) return direction === 'asc' ? -1 : 1
    if (a[key] > b[key]) return direction === 'asc' ? 1 : -1
    return 0
  })

  const requestSort = (key: keyof Prospect) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getSortIndicator = (key: keyof Prospect) => {
    if (!sortConfig || sortConfig.key !== key) return ''
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓'
  }

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      <div className="border-b border-stone-800 bg-stone-900 py-6">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🪨</div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-amber-400">StoneForged-Intel</h1>
              <p className="text-xs text-stone-500">12-Week Intelligence Playbook Dashboard</p>
            </div>
          </div>
          <div className="text-sm text-stone-400">v0.6 • Local</div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="grid grid-cols-4 gap-6 mb-10">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6">
            <div className="text-amber-400 text-sm tracking-widest">TOTAL PROSPECTS</div>
            <div className="text-6xl font-bold mt-3 text-amber-300">{prospects.length}</div>
          </div>
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6">
            <div className="text-amber-400 text-sm tracking-widest">HIGH READINESS</div>
            <div className="text-6xl font-bold mt-3 text-green-400">{prospects.filter(p => p.score >= 8).length}</div>
          </div>
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6">
            <div className="text-amber-400 text-sm tracking-widest">AVG SCORE</div>
            <div className="text-6xl font-bold mt-3">
              {prospects.length ? (prospects.reduce((sum, p) => sum + p.score, 0) / prospects.length).toFixed(1) : '0.0'}
            </div>
          </div>
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6">
            <div className="text-amber-400 text-sm tracking-widest">NEXT EVENT</div>
            <div className="text-2xl font-bold mt-3">SupplySide West</div>
            <div className="text-stone-400 mt-1">~18 days</div>
          </div>
        </div>

        <div className="flex gap-8">
          <div className="flex-1 bg-stone-900 border border-stone-800 rounded-3xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Hot Prospects</h2>
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  placeholder="Search brand, trigger, person..."
                  className="bg-stone-800 border border-stone-700 rounded-2xl px-4 py-2 text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-stone-400 hover:text-amber-400 text-sm"
                  >
                    Clear
                  </button>
                )}
                <button onClick={loadExamples} className="bg-stone-700 hover:bg-stone-600 px-5 py-2.5 rounded-2xl text-sm font-medium transition">
                  Load Examples
                </button>
                <button onClick={exportToCSV} className="bg-emerald-700 hover:bg-emerald-600 px-5 py-2.5 rounded-2xl text-sm font-medium transition">
                  Export CSV
                </button>
                <button onClick={() => setShowModal(true)} className="bg-amber-600 hover:bg-amber-500 px-5 py-2.5 rounded-2xl text-sm font-medium transition">
                  + Add Prospect
                </button>
              </div>
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-700 text-left text-stone-400 text-sm">
                  <th className="pb-4 font-medium cursor-pointer hover:text-amber-400" onClick={() => requestSort('brand')}>
                    BRAND {getSortIndicator('brand')}
                  </th>
                  <th className="pb-4 font-medium">TRIGGER</th>
                  <th className="pb-4 font-medium cursor-pointer hover:text-amber-400" onClick={() => requestSort('score')}>
                    SCORE {getSortIndicator('score')}
                  </th>
                  <th className="pb-4 font-medium">DECISION MAKER</th>
                  <th className="pb-4 font-medium">NEXT ACTION</th>
                  <th className="pb-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {sortedProspects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-stone-500">
                      {searchTerm ? 'No matches found' : 'No prospects yet — add one!'}
                    </td>
                  </tr>
                ) : (
                  sortedProspects.map(p => (
                    <tr key={p.id} className="hover:bg-stone-800/50 transition-colors">
                      <td className="py-6 font-medium">{p.brand}</td>
                      <td className="py-6 text-stone-300">{p.trigger}</td>
                      <td className="py-6">
                        <span className={`font-mono text-xl font-bold ${p.score >= 8 ? 'text-green-400' : p.score >= 6 ? 'text-amber-300' : 'text-red-400'}`}>
                          {p.score.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-6 text-stone-300">{p.decision_maker}</td>
                      <td className="py-6 text-amber-400 font-medium">{p.next_action}</td>
                      <td className="py-6 text-center">
                        <button onClick={() => deleteProspect(p.id)} className="text-red-500 hover:text-red-400 text-xl font-bold">
                          ×
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="w-96 bg-stone-900 border border-stone-800 rounded-3xl p-8 h-fit">
            <h3 className="text-lg font-semibold mb-6 text-amber-400">Live Intelligence</h3>
            <div className="space-y-4 text-sm">
              <div className="bg-stone-800/70 p-5 rounded-2xl border border-stone-700">
                <div className="text-emerald-400 text-xs">System • now</div>
                <div className="mt-2">Added real-time search/filter</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl p-8 w-full max-w-md">
            <h3 className="text-2xl font-semibold mb-6">Add New Prospect</h3>
            
            <div className="space-y-4">
              <input
                placeholder="Brand Name *"
                className="w-full bg-stone-800 border border-stone-700 rounded-2xl px-4 py-3 text-white placeholder:text-stone-500"
                value={newProspect.brand}
                onChange={e => setNewProspect({...newProspect, brand: e.target.value})}
              />
              <select
                className="w-full bg-stone-800 border border-stone-700 rounded-2xl px-4 py-3 text-white"
                value={TRIGGER_OPTIONS.find(opt => opt.value === newProspect.trigger)?.value || ''}
                onChange={handleTriggerChange}
              >
                <option value="">Select Trigger (auto-scores)</option>
                {TRIGGER_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} (+{opt.bonus} bonus)
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                placeholder="Readiness Score (auto-set from trigger)"
                className="w-full bg-stone-800 border border-stone-700 rounded-2xl px-4 py-3 text-white"
                value={newProspect.score}
                onChange={e => setNewProspect({...newProspect, score: parseFloat(e.target.value) || 5.0})}
              />
              <input
                placeholder="Decision Maker / Title"
                className="w-full bg-stone-800 border border-stone-700 rounded-2xl px-4 py-3 text-white placeholder:text-stone-500"
                value={newProspect.decision_maker}
                onChange={e => setNewProspect({...newProspect, decision_maker: e.target.value})}
              />
              <input
                placeholder="Next Action / Outreach Plan"
                className="w-full bg-stone-800 border border-stone-700 rounded-2xl px-4 py-3 text-white placeholder:text-stone-500"
                value={newProspect.next_action}
                onChange={e => setNewProspect({...newProspect, next_action: e.target.value})}
              />
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-2xl border border-stone-700 hover:bg-stone-800 transition">
                Cancel
              </button>
              <button onClick={addProspect} className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 rounded-2xl font-medium transition">
                Save Prospect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App