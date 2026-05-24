export default function EmailOutput({ result }) {
  const copy = () => {
    navigator.clipboard.writeText(result.email_draft)
    alert("Copied!")
  }

  const download = () => {
    const blob = new Blob([result.email_draft], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `outreach_${result.prospect.replace(" ", "_")}.txt`
    a.click()
  }

  const edgeCaseLabel = {
    none: "Happy Path",
    no_news: "No Recent News",
    job_change: "Recent Job Change",
    bad_news: "Company in Bad News",
    competitor: "Uses Competitor"
  }

  return (
    <div className="card">
      <h2>📧 Generated Outreach</h2>

      <div className="meta">
        <span className="meta-item">🏃 Run ID: {result.run_id}</span>
        <span className="meta-item">👤 {result.prospect}</span>
        <span className="meta-item">🏢 {result.company}</span>
        <span className="meta-item">🎭 {edgeCaseLabel[result.edge_case]}</span>
        <span className="meta-item">✅ {result.status}</span>
      </div>

      <h3 style={{ fontSize: "13px", color: "#6c63ff", marginBottom: "8px", fontWeight: 600 }}>
        🎯 Hook Identified
      </h3>
      <div className="hook-box">{result.hook}</div>

      {result.sources && result.sources.length > 0 && (
        <>
          <h3 style={{ fontSize: "13px", color: "#555", marginBottom: "8px", fontWeight: 600, marginTop: "16px" }}>
            🔗 Sources Used
          </h3>
          <div style={{
            background: "#f8f9fa",
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "16px"
          }}>
            {result.sources.map((src, i) => (
              <div key={i} style={{ marginBottom: "4px" }}>
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "12px", color: "#6c63ff", wordBreak: "break-all" }}
                >
                  {src}
                </a>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <h3 style={{ fontSize: "13px", color: "#555", fontWeight: 600 }}>
          ✉️ Email Draft
        </h3>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={copy} style={{
            background: "none", border: "1px solid #e0e0e0",
            padding: "4px 12px", borderRadius: "6px",
            fontSize: "12px", cursor: "pointer"
          }}>
            Copy
          </button>
          <button onClick={download} style={{
            background: "none", border: "1px solid #6c63ff",
            padding: "4px 12px", borderRadius: "6px",
            fontSize: "12px", cursor: "pointer", color: "#6c63ff"
          }}>
            Download
          </button>
        </div>
      </div>
      <div className="email-box">{result.email_draft}</div>
    </div>
  )
}
