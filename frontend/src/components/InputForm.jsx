import { useState } from "react"

const BACKEND_URL = "https://zamp-asa-backend.onrender.com"

export default function InputForm({ setResult, setLoading, setStages, loading }) {
  const [form, setForm] = useState({
    prospect_name: "",
    company_name: "",
    edge_case: "none"
  })
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    if (!form.prospect_name || !form.company_name) return
    setLoading(true)
    setResult(null)
    setError(null)
    setStages({
      research: "waiting",
      hook: "waiting",
      draft: "waiting"
    })

    try {
      const response = await fetch(`${BACKEND_URL}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop()

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith("data:")) continue

          const jsonStr = trimmed.slice(5).trim()
          if (!jsonStr) continue

          try {
            const data = JSON.parse(jsonStr)

            if (data.stage === "error") {
              setError(data.message)
              setLoading(false)
              return
            }

            if (data.stage === "complete") {
              setResult(data.result)
              setLoading(false)
              setStages({
                research: "done",
                hook: "done",
                draft: "done"
              })
              return
            }

            if (data.stage && data.status) {
              setStages(prev => ({
                ...prev,
                [data.stage]: data.status
              }))
            }

          } catch (e) {
            // skip malformed
          }
        }
      }
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2>🎯 New Outreach Run</h2>
      <div className="form-grid">
        <div className="form-group">
          <label>Prospect Name</label>
          <input
            placeholder="e.g. Dara Khosrowshahi"
            value={form.prospect_name}
            onChange={e => setForm({ ...form, prospect_name: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Company Name</label>
          <input
            placeholder="e.g. Uber"
            value={form.company_name}
            onChange={e => setForm({ ...form, company_name: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Scenario</label>
          <select
            value={form.edge_case}
            onChange={e => setForm({ ...form, edge_case: e.target.value })}
          >
            <option value="none">Happy Path</option>
            <option value="no_news">No Recent News</option>
            <option value="job_change">Recent Job Change</option>
            <option value="bad_news">Company in Bad News</option>
            <option value="competitor">Uses Competitor</option>
          </select>
        </div>
      </div>

      {error && (
        <div style={{
          background: "#fff0f0",
          border: "1px solid #ffcccc",
          borderRadius: "8px",
          padding: "12px 16px",
          color: "#cc0000",
          fontSize: "13px",
          marginBottom: "12px"
        }}>
          ❌ {error}
        </div>
      )}

      <button
        className="btn-primary"
        onClick={handleSubmit}
        disabled={loading || !form.prospect_name || !form.company_name}
      >
        {loading ? "Running..." : "Generate Outreach ✨"}
      </button>
    </div>
  )
}
