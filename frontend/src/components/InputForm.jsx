import { useState } from "react"
import axios from "axios"

export default function InputForm({ setResult, setLoading, loading }) {
  const [form, setForm] = useState({
    prospect_name: "",
    company_name: "",
    edge_case: "none"
  })

  const handleSubmit = async () => {
    if (!form.prospect_name || !form.company_name) return
    setLoading(true)
    setResult(null)
    try {
      const res = await axios.post(
        "https://zamp-asa-backend.onrender.com/run",
        form
      )
      setResult(res.data)
    } catch (err) {
      alert("Error: " + err.message)
    } finally {
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
            onChange={e => setForm({
              ...form,
              prospect_name: e.target.value
            })}
          />
        </div>
        <div className="form-group">
          <label>Company Name</label>
          <input
            placeholder="e.g. Uber"
            value={form.company_name}
            onChange={e => setForm({
              ...form,
              company_name: e.target.value
            })}
          />
        </div>
        <div className="form-group">
          <label>Scenario</label>
          <select
            value={form.edge_case}
            onChange={e => setForm({
              ...form,
              edge_case: e.target.value
            })}
          >
            <option value="none">Happy Path</option>
            <option value="no_news">No Recent News</option>
            <option value="job_change">Recent Job Change</option>
            <option value="bad_news">Company in Bad News</option>
            <option value="competitor">Uses Competitor</option>
          </select>
        </div>
      </div>
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
