import { useEffect, useState } from "react"

const STEPS = [
  { id: 1, label: "🔍 Agent 1 — Researching prospect & company..." },
  { id: 2, label: "🎯 Agent 2 — Identifying best hook..." },
  { id: 3, label: "✍️ Agent 3 — Drafting personalised email..." },
]

export default function RunStatus() {
  const [currentStep, setCurrentStep] = useState(1)

  useEffect(() => {
    const t1 = setTimeout(() => setCurrentStep(2), 4000)
    const t2 = setTimeout(() => setCurrentStep(3), 8000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  return (
    <div className="card">
      <h2>⚡ Pipeline Running</h2>
      <div className="status-steps">
        {STEPS.map(step => (
          <div
            key={step.id}
            className={`step ${
              currentStep === step.id
                ? "active"
                : currentStep > step.id
                ? "done"
                : ""
            }`}
          >
            {currentStep === step.id && (
              <div className="spinner" />
            )}
            {currentStep > step.id && <span>✅</span>}
            {currentStep < step.id && <span>⏳</span>}
            {step.label}
          </div>
        ))}
      </div>
    </div>
  )
}