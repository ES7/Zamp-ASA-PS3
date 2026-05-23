export default function EmailOutput({ result }) {
  const copy = () => {
    navigator.clipboard.writeText(result.email_draft)
    alert("Copied!")
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
        <span className="meta-item">
          🏃 Run ID: {result.run_id}
        </span>
        <span className="meta-item">
          👤 {result.prospect}
        </span>
        <span className="meta-item">
          🏢 {result.company}
        </span>
        <span className="meta-item">
          🎭 {edgeCaseLabel[result.edge_case]}
        </span>
        <span className="meta-item">
          ✅ {result.status}
        </span>
      </div>

      <h3 style={{
        fontSize: "13px",
        color: "#6c63ff",
        marginBottom: "8px",
        fontWeight: 600
      }}>
        🎯 Hook Identified
      </h3>
      <div className="hook-box">
        {result.hook}
      </div>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "8px"
      }}>
        <h3 style={{
          fontSize: "13px",
          color: "#555",
          fontWeight: 600
        }}>
          ✉️ Email Draft
        </h3>
        <button
          onClick={copy}
          style={{
            background: "none",
            border: "1px solid #e0e0e0",
            padding: "4px 12px",
            borderRadius: "6px",
            fontSize: "12px",
            cursor: "pointer"
          }}
        >
          Copy
        </button>
      </div>
      <div className="email-box">
        {result.email_draft}
      </div>
    </div>
  )
}