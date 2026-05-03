import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const asset = {
  header: "2019 Freightliner Cascadia",
  location: "Memphis, TN",
  conditionScore: 62,
  conditionBand: "Fair",
  comps: 42,
  recommendation: {
    action: "Repair critical + move to Wholesale",
    expectedNet: 35100,
    lift: 3900,
    days: 14,
    why: [
      "Engine condition suppresses retail buyer demand.",
      "Wholesale comps are tighter and more predictable for this defect profile.",
      "Sleeper and APU configuration add value, but not enough to justify longer retail exposure."
    ]
  },
  scenarios: [
    ["Retail", 31200, 28, "Higher gross potential, but slower and more condition-sensitive."],
    ["Wholesale as-is", 31800, 12, "Faster recovery path, discounted for unresolved defects."],
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
    ["Sleeper Cab Configuration", 3800, "Supports stronger wholesale and retail demand."],
    ["APU Unit", 1200, "Adds buyer appeal for owner-operators and wholesale buyers."],
    ["Aero Package", 700, "Improves presentation and modestly supports value."]
  ],
  compsBreakdown: [
    ["Retail", 15, "$35,900 – $37,900", "Slower, more condition-sensitive"],
    ["Wholesale", 17, "$30,200 – $32,200", "Most predictable for this defect profile"],
    ["Auction", 10, "$27,500 – $29,500", "Fastest, lowest recovery"]
  ],
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

function Card({ children, dark = false }) {
  return <div className={dark ? "card dark" : "card"}>{children}</div>;
}

function App() {
  const [started, setStarted] = useState(false);
  const [tab, setTab] = useState("recommendation");
  const [showComps, setShowComps] = useState(false);
  const [showCompDetail, setShowCompDetail] = useState(false);
  const variance = asset.financial.expectedRecovery - asset.financial.bookedResidual;

  return (
    <div className="page"><section className="grid two">
  <Card>
    <h2>Current Channel Mix</h2>
    <p className="muted">How the company currently routes assets</p>

    <div className="barrow">
      <span>Retail</span>
      <div><b style={{ width: "65%" }} /></div>
      <strong>65%</strong>
    </div>

    <div className="barrow">
      <span>Wholesale</span>
      <div><b style={{ width: "25%" }} /></div>
      <strong>25%</strong>
    </div>

    <div className="barrow">
      <span>Auction</span>
      <div><b style={{ width: "10%" }} /></div>
      <strong>10%</strong>
    </div>
  </Card>

  <Card>
    <h2>NRE Predicted Channel Mix</h2>
    <p className="muted">How NRE predicts assets should be routed</p>

    <div className="barrow">
      <span>Retail</span>
      <div><b style={{ width: "30%" }} /></div>
      <strong>30%</strong>
    </div>

    <div className="barrow">
      <span>Wholesale</span>
      <div><b style={{ width: "50%" }} /></div>
      <strong>50%</strong>
    </div>

    <div className="barrow">
      <span>Auction</span>
      <div><b style={{ width: "20%" }} /></div>
      <strong>20%</strong>
    </div>
  </Card>
</section>
      <header className="hero">
        <div>
          <h1>Net Recovery Engine™</h1>
          <p>Inspection upload → condition intelligence → configuration intelligence → channel decision</p>
        </div>
        <button onClick={() => setStarted(true)}>Upload Inspection</button>
      </header>

      {!started ? (
        <Card>
          <h2>Ready for inspection upload</h2>
          <p className="muted">Click Upload Inspection to generate the decision report.</p>
        </Card>
      ) : (
        <>
          <Card>
            <h2>{asset.header}</h2>
            <p className="muted">
              {asset.location} · Score {asset.conditionScore} ({asset.conditionBand}) · {asset.comps} comps
            </p>
          </Card>

          <nav className="tabs">
            {["recommendation", "scenarios", "condition", "configuration", "fmv", "comps", "financial"].map((t) => (
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

                <div className="summary-row">
                  <div><span>Net</span><strong>{money(asset.recommendation.expectedNet)}</strong></div>
                  <div><span>Lift</span><strong>+{money(asset.recommendation.lift)}</strong></div>
                  <div><span>Days</span><strong>{asset.recommendation.days}</strong></div>
                </div>
              </Card>

              <Card>
                <h2>Why This Decision</h2>
                <ul>{asset.recommendation.why.map((x) => <li key={x}>{x}</li>)}</ul>
              </Card>
            </>
          )}

          {tab === "scenarios" && (
            <Card>
              <h2>Scenario Comparison</h2>
              {asset.scenarios.map(([name, net, days, note]) => (
                <div className="scenario" key={name}>
                  <div>
                    <strong>{name}</strong>
                    <p>{note}</p>
                  </div>
                  <div className="right-value">
                    <strong>Net {money(net)}, {days} days</strong>
                  </div>
                </div>
              ))}
            </Card>
          )}

          {tab === "condition" && (
            <Card>
              <h2>Major Component Condition</h2>
              {asset.components.map(([name, band, impact, note]) => (
                <div className="scenario" key={name}>
                  <div>
                    <strong>{name}</strong>
                    <p>{note}</p>
                  </div>
                  <div className="right-value">
                    <strong>{band}, {impact} impact</strong>
                  </div>
                </div>
              ))}
            </Card>
          )}

          {tab === "configuration" && (
            <Card>
              <h2>Configuration & Attachments</h2>
              {asset.configuration.map(([name, value, note]) => (
                <div className="scenario" key={name}>
                  <div>
                    <strong>{name}</strong>
                    <p>{note}</p>
                  </div>
                  <div className="right-value">
                    <strong>Value {money(value)}</strong>
                  </div>
                </div>
              ))}
            </Card>
          )}

          {tab === "fmv" && (
            <Card>
              <h2>Fair Market Value</h2>
              <div className="summary-row light">
                <div><span>Retail</span><strong>$35,900 – $37,900</strong></div>
                <div><span>Wholesale</span><strong>$30,200 – $32,200</strong></div>
                <div><span>Auction</span><strong>$27,500 – $29,500</strong></div>
              </div>
            </Card>
          )}

          {tab === "comps" && (
            <Card>
              <h2>Comparable Asset Outcomes</h2>
              <p className="muted">Comps show observed market pricing ranges by channel.</p>
              {asset.compsBreakdown.map(([channel, count, range, note]) => (
                <div className="scenario" key={channel}>
                  <div>
                    <strong>{channel}</strong>
                    <p>{count} comps · {note}</p>
                  </div>
                  <div className="right-value">
                    <strong>FMV Range {range}</strong>
                  </div>
                </div>
              ))}
              <button onClick={() => setShowComps(true)}>
  View Comps (42)
</button>
              {showComps && (
  <div style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999
  }}>
    <div style={{
      background: "white",
      padding: "24px",
      borderRadius: "12px",
      width: "720px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
    }}>
      <h2>Comparable Sales</h2>
      <p>Page 1 of 9</p>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr onClick={() => setShowCompDetail(true)} style={{ cursor: "pointer" }}>
            <td>2019 Freightliner Cascadia</td>
            <td>482K miles</td>
            <td>$46,500</td>
            <td>Wholesale</td>
          </tr>
          <tr onClick={() => setShowCompDetail(true)} style={{ cursor: "pointer" }}>
            <td>2018 Freightliner Cascadia</td>
            <td>515K miles</td>
            <td>$42,000</td>
            <td>Auction</td>
          </tr>
          <tr>
            <td>2020 Peterbilt 579</td>
            <td>438K miles</td>
            <td>$51,200</td>
            <td>Retail</td>
          </tr>
          <tr>
            <td>2017 Kenworth T680</td>
            <td>601K miles</td>
            <td>$38,400</td>
            <td>Auction</td>
          </tr>
          <tr>
            <td>2019 Volvo VNL</td>
            <td>490K miles</td>
            <td>$44,800</td>
            <td>Wholesale</td>
          </tr>
        </tbody>
      </table>

      <button onClick={() => setShowComps(false)}>
        Close
      </button>
    </div>
  </div>
)}
              {showComps && (
  ...
)}

{showCompDetail && (
  ...
)}
            </Card>
          )}

          {tab === "financial" && (
            <Card>
              <h2>Financial Impact</h2>
              <div className="summary-row light">
                <div><span>Residual</span><strong>{money(asset.financial.bookedResidual)}</strong></div>
                <div><span>Recovery</span><strong>{money(asset.financial.expectedRecovery)}</strong></div>
                <div><span>Variance</span><strong>{money(variance)}</strong></div>
              </div>
            </Card>
          )}
        </>
      )}

      <footer>© 2026 Net Recovery Engine. All rights reserved.</footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
