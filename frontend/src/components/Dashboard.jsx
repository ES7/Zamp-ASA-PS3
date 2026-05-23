import { useEffect, useState } from "react"
import axios from "axios"

export default function Dashboard() {
  const [runs, setRuns] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/runs")
      .then(res => setRuns(res.data))
  }, [])

  const edgeCaseLabel = {
    none: "Happy Path",
    no_news: "No Recent News",
    job_change: "Recent Job Change",
    bad_news: "Company in Bad News",
    competitor: "Uses Competitor"
  }

  return (
    <div className="card">
      <h2>📊 Run History</h2>
      {runs.length === 0 ? (
        <div className="empty">
          No runs yet — go to New Run tab to start!
        </div>
      ) : (
        <div className="runs-grid">
          {runs.map(run => (
            <div key={run.id}>
              <div
                className="run-card"
                onClick={() => setSelected(
                  selected?.id === run.id ? null : run
                )}
              >
                <span className="run-id">#{run.id}</span>
                <span className="run-prospect">
                  {run.prospect} @ {run.company}
                </span>
                <span className="badge none">
                  {edgeCaseLabel[run.edge_case]}
                </span>
                <span className="badge completed">
                  {run.status}
                </span>
                <span className="run-time">
                  {new Date(run.timestamp)
                    .toLocaleString()}
                </span>
              </div>

              {selected?.id === run.id && (
                <div style={{
                  padding: "16px 20px",
                  background: "#f8f9fa",
                  borderRadius: "0 0 8px 8px",
                  border: "1px solid #e0e0e0",
                  borderTop: "none"
                }}>
                  <p style={{
                    fontSize: "12px",
                    color: "#6c63ff",
                    fontWeight: 600,
                    marginBottom: "8px"
                  }}>
                    🎯 Hook
                  </p>
                  <p style={{
                    fontSize: "13px",
                    marginBottom: "16px",
                    lineHeight: 1.6
                  }}>
                    {run.hook}
                  </p>
                  <p style={{
                    fontSize: "12px",
                    color: "#555",
                    fontWeight: 600,
                    marginBottom: "8px"
                  }}>
                    ✉️ Email Draft
                  </p>
                  <pre style={{
                    fontSize: "13px",
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                    fontFamily: "monospace"
                  }}>
                    {run.email_draft}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}