export default function EmailOutput({ result }) {
  const copy = () => { navigator.clipboard.writeText(result.email_draft); alert("Copied!") }

  const download = () => {
    const blob = new Blob([result.email_draft], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `outreach_${result.prospect.replace(" ", "_")}.txt`
    a.click()
  }

  const edgeCaseLabel = {
    none: "Happy Path", no_news: "No Recent News",
    job_change: "Recent Job Change", bad_news: "Company in Bad News", competitor: "Uses Competitor"
  }

  let score = null
  try { score = typeof result.email_score === "string" ? JSON.parse(result.email_score) : result.email_score } catch (_) {}

  const scoreColor = (v) => v >= 8 ? "#2e7d32" : v >= 6 ? "#e65100" : "#cc0000"

  return (
    <div className="card">
      <h2>📧 Generated Outreach</h2>

      <div className="meta">
        <span className="meta-item">🏃 Run ID: {result.run_id}</span>
        <span className="meta-item">👤 {result.prospect}</span>
        <span className="meta-item">🏢 {result.company}</span>
        <span className="meta-item">🎭 {edgeCaseLabel[result.edge_case]}</span>
        {result.duration && <span className="meta-item">⏱️ {result.duration}s</span>}
        <span className="meta-item">✅ {result.status}</span>
      </div>

      {/* Score */}
      {score && score.overall && (
        <div style={{ background: "#f8f9fa", borderRadius: "8px", padding: "16px", marginBottom: "16px" }}>
          <p style={{ fontSize: "13px", fontWeight: 600, marginBottom: "12px" }}>📊 Email Quality Score</p>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {[
              { label: "Overall", value: score.overall },
              { label: "Specificity", value: score.specificity },
              { label: "Hook Strength", value: score.hook_strength },
              { label: "CTA Quality", value: score.cta_quality }
            ].map(item => (
              <div key={item.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "24px", fontWeight: 700, color: scoreColor(item.value) }}>{item.value}/10</div>
                <div style={{ fontSize: "11px", color: "#888" }}>{item.label}</div>
              </div>
            ))}
          </div>
          {score.reasoning && <p style={{ fontSize: "12px", color: "#666", marginTop: "8px", fontStyle: "italic" }}>{score.reasoning}</p>}
        </div>
      )}

      {/* Hook */}
      <h3 style={{ fontSize: "13px", color: "#6c63ff", marginBottom: "8px", fontWeight: 600 }}>🎯 Hook Identified</h3>
      <div className="hook-box">{result.hook}</div>

      {/* Subject Variants */}
      {result.subject_variants && result.subject_variants.length > 0 && (
        <>
          <h3 style={{ fontSize: "13px", color: "#555", marginBottom: "8px", fontWeight: 600, marginTop: "16px" }}>
            📝 Subject Line Variants
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
            {result.subject_variants.map((v, i) => (
              <div key={i} style={{ background: "#f0edff", borderRadius: "6px", padding: "8px 12px", fontSize: "13px", color: "#4a4a4a" }}>
                {i + 1}. {v}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Sources */}
      {result.sources && result.sources.length > 0 && (
        <>
          <h3 style={{ fontSize: "13px", color: "#555", marginBottom: "8px", fontWeight: 600 }}>🔗 Sources Used</h3>
          <div style={{ background: "#f8f9fa", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px" }}>
            {result.sources.map((src, i) => (
              <div key={i} style={{ marginBottom: "4px" }}>
                <a href={src} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: "12px", color: "#6c63ff", wordBreak: "break-all" }}>{src}</a>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Email */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <h3 style={{ fontSize: "13px", color: "#555", fontWeight: 600 }}>✉️ Email Draft</h3>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={copy} style={{ background: "none", border: "1px solid #e0e0e0", padding: "4px 12px", borderRadius: "6px", fontSize: "12px", cursor: "pointer" }}>Copy</button>
          <button onClick={download} style={{ background: "none", border: "1px solid #6c63ff", padding: "4px 12px", borderRadius: "6px", fontSize: "12px", cursor: "pointer", color: "#6c63ff" }}>Download</button>
        </div>
      </div>
      <div className="email-box">{result.email_draft}</div>
    </div>
  )
}
