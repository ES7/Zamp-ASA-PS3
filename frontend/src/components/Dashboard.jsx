import { useEffect, useState } from "react"
import axios from "axios"

const BACKEND_URL = "http://127.0.0.1:8000"

export default function Dashboard() {
  const [runs, setRuns] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    axios.get(`${BACKEND_URL}/runs`)
      .then(res => setRuns(res.data))
  }, [])

  const edgeCaseLabel = {
    none: "Happy Path",
    no_news: "No Recent News",
    job_change: "Recent Job Change",
    bad_news: "Company in Bad News",
    competitor: "Uses Competitor"
  }

  const totalRuns = runs.length
  const completedRuns = runs.filter(r => r.status === "completed").length
  const successRate = totalRuns ? Math.round((completedRuns / totalRuns) * 100) : 0
  const scenarioCounts = runs.reduce((acc, r) => {
    acc[r.edge_case] = (acc[r.edge_case] || 0) + 1
    return acc
  }, {})
  const topScenario = Object.entries(scenarioCounts).sort((a, b) => b[1] - a[1])[0]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
        <div className="card" style={{ textAlign: "center", padding: "20px" }}>
          <div style={{ fontSize: "36px", fontWeight: 700, color: "#6c63ff" }}>{totalRuns}</div>
          <div style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>Total Runs</div>
        </div>
        <div className="card" style={{ textAlign: "center", padding: "20px" }}>
          <div style={{ fontSize: "36px", fontWeight: 700, color: "#2e7d32" }}>{successRate}%</div>
          <div style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>Success Rate</div>
        </div>
        <div className="card" style={{ textAlign: "center", padding: "20px" }}>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a1a" }}>
            {topScenario ? edgeCaseLabel[topScenario[0]] : "—"}
          </div>
          <div style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>Most Used Scenario</div>
        </div>
      </div>

      {/* Run History */}
      <div className="card">
        <h2>📊 Run History</h2>
        {runs.length === 0 ? (
          <div className="empty">No runs yet — go to New Run tab to start!</div>
        ) : (
          <div className="runs-grid">
            {runs.map(run => (
              <div key={run.id}>
                <div
                  className="run-card"
                  onClick={() => setSelected(selected?.id === run.id ? null : run)}
                >
                  <span className="run-id">#{run.id}</span>
                  <span className="run-prospect">{run.prospect} @ {run.company}</span>
                  <span className="badge none">{edgeCaseLabel[run.edge_case]}</span>
                  <span className="badge completed">{run.status}</span>
                  <span className="run-time">{new Date(run.timestamp).toLocaleString()}</span>
                </div>

                {selected?.id === run.id && (
                  <div style={{
                    padding: "16px 20px",
                    background: "#f8f9fa",
                    borderRadius: "0 0 8px 8px",
                    border: "1px solid #e0e0e0",
                    borderTop: "none"
                  }}>
                    <p style={{ fontSize: "12px", color: "#6c63ff", fontWeight: 600, marginBottom: "8px" }}>
                      🎯 Hook
                    </p>
                    <p style={{ fontSize: "13px", marginBottom: "16px", lineHeight: 1.6 }}>
                      {run.hook}
                    </p>

                    {run.sources && run.sources.length > 0 && (
                      <>
                        <p style={{ fontSize: "12px", color: "#555", fontWeight: 600, marginBottom: "8px" }}>
                          🔗 Sources
                        </p>
                        <div style={{ marginBottom: "16px" }}>
                          {run.sources.map((src, i) => (
                            <div key={i}>
                              <a href={src} target="_blank" rel="noopener noreferrer"
                                style={{ fontSize: "12px", color: "#6c63ff", wordBreak: "break-all" }}>
                                {src}
                              </a>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    <p style={{ fontSize: "12px", color: "#555", fontWeight: 600, marginBottom: "8px" }}>
                      ✉️ Email Draft
                    </p>
                    <pre style={{ fontSize: "13px", lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
                      {run.email_draft}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
