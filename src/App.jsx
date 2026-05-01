import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const asset = {
  header: "2019 Freightliner Cascadia",
  location: "Memphis, TN",
  conditionScore: 62,
  conditionBand: "Fair",
  comps: 42,
  baseline: { path: "Retail", net: 31200, days: 28 },
  recommendation: {
    action: "Repair critical + move to Wholesale",
    channel: "Wholesale",
    expectedNet: 35100,
    lift: 3900,
    days: 14,
    why: [
      "Engine condition suppresses retail buyer demand.",
      "Wholesale comps are tighter and more predictable.",
      "Sleeper and APU configuration add value, but not enough to justify longer retail exposure."
    ]
  },
  scenarios: [
    ["Retail", 31200, 28, "Higher gross potential, but slower and more condition-sensitive."],
    ["Wholesale as-is", 31800, 12, "Better speed, discounted for unresolved defects."],
    ["Repair + Wholesale", 35100, 14, "Best net recovery after focused reconditioning."],
    ["Auction", 28100, 9, "Fastest path, but lowest expected recovery."]
  ],
  components: [
    ["Engine", "Poor", "High", "Turbo failure materially suppresses buyer demand."],
    ["Drivetrain", "Fair", "Medium", "Usable, but below benchmark."],
    ["Brakes", "Fair", "Medium", "Adds reconditioning friction."],
    ["Tires", "Fair", "Low", "Affects retail presentation."]
  ],
  configuration: [
    ["Sleeper Cab Configuration", "$3,800", "Supports stronger wholesale and retail demand."],
    ["APU Unit", "$1,200", "Adds buyer appeal for owner-operators and wholesale buyers."],
    ["Aero Package", "$700", "Improves presentation and modestly supports value."]
  ],
  compsBreakdown: [
    ["Retail", 15, "$35,900 – $37,900", "$31,200", "Slower, more condition-sensitive"],
    ["Wholesale", 17, "$30,200 – $32,200", "$31,800", "Most predictable for this defect profile"],
    ["Auction", 10, "$27,500 – $29,500", "$28,100", "Fastest, lowest expected recovery"]
  ],
  fmv: {
    retail: "$35,900 – $37,900",
    wholesale: "$30,200 – $32,200",
    auction: "$27,500 – $29,500"
  },
  financial: {
    bookedResidual: 36000,
    expectedRecovery: 35100
  }
};

function money(v) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(v);
}

function Card({ children, dark }) {
  return <div className={dark ? "card dark" : "card"}>{children}</div>;
}

function App() {
  const [started, setStarted] = useState(false);
  const [tab, setTab] = useState("recommendation");
  const [assetCount, setAssetCount] = useState(8000);
  const [averageValue, setAverageValue] = useState(65000);

  const opportunityLow = Math.round(assetCount * 0.2 * 1500);
  const opportunityHigh = Math.round(assetCount * 0.2 * 4000);
  const variance = asset.financial.expectedRecovery - asset.financial.bookedResidual;

  return (
    <div className="page">
      <header className="hero">
        <div>
          <h1>Net Recovery Engine™</h1>
          <p>Inspection upload → condition intelligence → configuration intelligence → channel decision</p>
        </div>
        <button onClick={() => setStarted(true)}>Upload Inspection</button>
      </header>

      <section className="grid two">
        <Card>
          <h2>Portfolio Behavior</h2>
          <p className="muted">Current channel behavior</p>
          <div className="barrow"><span>Retail</span><div><b style={{ width: "65%" }} /></div><strong>65%</strong></div>
          <div className="barrow"><span>Wholesale</span><div><b style={{ width: "25%" }} /></div><strong>25%</strong></div>
          <div className="barrow"><span>Auction</span><div><b style={{ width: "10%" }} /></div><strong>10%</strong></div>
        </Card>

        <Card>
          <h2>NRE Suggested Mix</h2>
          <p className="muted">Optimized for net recovery and speed</p>
          <div className="barrow"><span>Retail</span><div><b style={{ width: "30%" }} /></div><strong>30%</strong></div>
          <div className="barrow"><span>Wholesale</span><div><b style={{ width: "50%" }} /></div><strong>50%</strong></div>
          <div className="barrow"><span>Auction</span><div><b style={{ width: "20%" }} /></div><strong>20%</strong></div>
        </Card>
      </section>

      <Card>
        <h2>Portfolio Impact</h2>
        <div className="inputs">
          <label>Assets per Year
            <input value={assetCount} onChange={e => setAssetCount(Number(e.target.value || 0))} />
          </label>
          <label>Average Asset Value
            <input value={averageValue} onChange={e => setAverageValue(Number(e.target.value || 0))} />
          </label>
        </div>
        <div className="grid three">
          <div className="metric"><span>Estimated Annual Opportunity</span><strong>{money(opportunityLow)} – {money(opportunityHigh)}</strong></div>
          <div className="metric"><span>Opportunity Assets</span><strong>~{Math.round(assetCount * 0.2)}</strong></div>
          <div className="metric"><span>Avg Lift per Missed Decision</span><strong>$1,500 – $4,000</strong></div>
        </div>
      </Card>

      {!started ? (
        <Card>
          <h2>Ready for inspection upload</h2>
          <p className="muted">Click Upload Inspection to generate the decision report.</p>
        </Card>
      ) : (
        <>
          <Card>
            <h2>{asset.header}</h2>
            <p className="muted">{asset.location} · Condition Score {asset.conditionScore} ({asset.conditionBand}) · {asset.comps} comparable assets</p>
            <div className="grid three">
              <div className="metric"><span>Current Path</span><strong>{asset.baseline.path}</strong><small>{money(asset.baseline.net)} · {asset.baseline.days} days</small></div>
              <div className="metric"><span>Recommended Channel</span><strong>{asset.recommendation.channel}</strong><small>Lift: {money(asset.recommendation.lift)}</small></div>
              <div className="metric"><span>Expected Recovery</span><strong>{money(asset.recommendation.expectedNet)}</strong><small>{asset.recommendation.days} days</small></div>
            </div>
          </Card>

          <nav className="tabs">
            {["recommendation", "scenarios", "condition", "configuration", "fmv", "comps", "financial"].map(t => (
              <button key={t} onClick={() => setTab(t)} className={tab === t ? "active" : ""}>
                {t.toUpperCase()}
              </button>
            ))}
          </nav>

          {tab === "recommendation" && (
            <>
              <Card dark>
                <span className="eyebrow">ACTION</span>
                <h2>{asset.recommendation.action}</h2>
                <div className="grid three">
                  <div><span>Expected Net Recovery</span><strong>{money(asset.recommendation.expectedNet)}</strong></div>
                  <div><span>Improvement</span><strong>+{money(asset.recommendation.lift)}</strong></div>
                  <div><span>Time to Liquidation</span><strong>{asset.recommendation.days} days</strong></div>
                </div>
              </Card>

              <Card>
                <h2>Why This Decision</h2>
                <ul>{asset.recommendation.why.map(x => <li key={x}>{x}</li>)}</ul>
              </Card>
            </>
          )}

          {tab === "scenarios" && (
            <Card>
              <h2>Scenario Comparison</h2>
              {asset.scenarios.map(([name, net, days, note]) => (
                <div className="scenario" key={name}>
                  <div><strong>{name}</strong><p>{note}</p></div>
                  <div><strong>{money(net)}</strong><span>{days} days</span></div>
                </div>
              ))}
            </Card>
          )}

          {tab === "condition" && (
            <Card>
              <h2>Major Component Condition</h2>
              {asset.components.map(([name, band, impact, note]) => (
                <div className="scenario" key={name}>
                  <div><strong>{name}</strong><p>{note}</p></div>
                  <div><strong>{band}</strong><span>Impact: {impact}</span></div>
                </div>
              ))}
            </Card>
          )}

          {tab === "configuration" && (
            <Card>
              <h2>Configuration & Attachments</h2>
              <p className="muted">Included directly in pricing and channel recommendation logic.</p>
              {asset.configuration.map(([name, value, note]) => (
                <div className="scenario" key={name}>
                  <div><strong>{name}</strong><p>{note}</p></div>
                  <div><strong>{value}</strong><span>Value contribution</span></div>
                </div>
              ))}
            </Card>
          )}

          {tab === "fmv" && (
            <Card>
              <h2>Fair Market Value</h2>
              <div className="grid three">
                <div className="metric"><span>Retail FMV</span><strong>{asset.fmv.retail}</strong></div>
                <div className="metric"><span>Wholesale FMV</span><strong>{asset.fmv.wholesale}</strong></div>
                <div className="metric"><span>Auction FMV</span><strong>{asset.fmv.auction}</strong></div>
              </div>
            </Card>
          )}

          {tab === "comps" && (
            <Card>
              <h2>Comparable Asset Outcomes</h2>
              <p className="muted">42 comparable assets across retail, wholesale, and auction outcomes.</p>
              {asset.compsBreakdown.map(([channel, count, range, net, note]) => (
                <div className="scenario" key={channel}>
                  <div>
                    <strong>{channel}</strong>
                    <p>{count} comps · {note}</p>
                  </div>
                  <div>
                    <strong>{net}</strong>
                    <span>{range}</span>
                  </div>
                </div>
              ))}
            </Card>
          )}

          {tab === "financial" && (
            <Card>
              <h2>Financial Impact</h2>
              <p className="muted">Expected recovery compared to booked residual assumption.</p>
              <div className="grid three">
                <div className="metric"><span>Booked Residual</span><strong>{money(asset.financial.bookedResidual)}</strong></div>
                <div className="metric"><span>Expected Recovery</span><strong>{money(asset.financial.expectedRecovery)}</strong></div>
                <div className="metric"><span>Variance</span><strong>{money(variance)}</strong></div>
              </div>
              <p>
                This asset is projected {variance >= 0 ? "above" : "below"} residual based on channel selection and repair strategy.
              </p>
            </Card>
          )}
        </>
      )}

      <footer>© 2026 Net Recovery Engine. All rights reserved.</footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
