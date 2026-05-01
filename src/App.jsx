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
    ["Retail", 31200, 28, "Expected net after fees and condition discounts."],
    ["Wholesale as-is", 31800, 12, "Faster recovery, discounted for defects."],
    ["Repair + Wholesale", 35100, 14, "Best net after focused repairs."],
    ["Auction", 28100, 9, "Fastest, lowest recovery."]
  ],
  components: [
    ["Engine", "Poor", "High", "Turbo failure suppresses demand."],
    ["Drivetrain", "Fair", "Medium", "Below benchmark."],
    ["Brakes", "Fair", "Medium", "Adds friction."],
    ["Tires", "Fair", "Low", "Impacts presentation."]
  ],
  configuration: [
    ["Sleeper Cab", 3800, "Supports demand."],
    ["APU Unit", 1200, "Adds appeal."],
    ["Aero Package", 700, "Improves presentation."]
  ],
  compsBreakdown: [
    ["Retail", 15, "$35,900 – $37,900", "Slower, condition-sensitive"],
    ["Wholesale", 17, "$30,200 – $32,200", "Most predictable"],
    ["Auction", 10, "$27,500 – $29,500", "Fastest"]
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

  const variance = asset.financial.expectedRecovery - asset.financial.bookedResidual;

  return (
    <div className="page">
      <header className="hero">
        <div>
          <h1>Net Recovery Engine™</h1>
          <p>Inspection → intelligence → decision</p>
        </div>
        <button onClick={() => setStarted(true)}>Upload Inspection</button>
      </header>

      {!started ? (
        <Card>
          <h2>Ready for inspection</h2>
        </Card>
      ) : (
        <>
          <Card>
            <h2>{asset.header}</h2>
            <p className="muted">{asset.location} · Score {asset.conditionScore}</p>
          </Card>

          <nav className="tabs">
            {["recommendation", "scenarios", "condition", "configuration", "fmv", "comps", "financial"].map(t => (
              <button key={t} onClick={() => setTab(t)} className={tab === t ? "active" : ""}>
                {t}
              </button>
            ))}
          </nav>

          {tab === "recommendation" && (
            <Card dark>
              <h2>{asset.recommendation.action}</h2>
              <p>Net: {money(asset.recommendation.expectedNet)}</p>
              <p>Lift: +{money(asset.recommendation.lift)}</p>
              <p>Days: {asset.recommendation.days}</p>
            </Card>
          )}

          {tab === "scenarios" && (
            <Card>
              {asset.scenarios.map(([name, net, days]) => (
                <div className="scenario" key={name}>
                  <strong>{name}</strong>
                  <div>
                    <span>Net</span>
                    <strong>{money(net)}</strong>
                    <span>{days} days</span>
                  </div>
                </div>
              ))}
            </Card>
          )}

          {tab === "condition" && (
            <Card>
              {asset.components.map(([name, band, impact]) => (
                <div className="scenario" key={name}>
                  <strong>{name}</strong>
                  <div>
                    <strong>{band}</strong>
                    <span>{impact} impact</span>
                  </div>
                </div>
              ))}
            </Card>
          )}

          {tab === "configuration" && (
            <Card>
              {asset.configuration.map(([name, value]) => (
                <div className="scenario" key={name}>
                  <strong>{name}</strong>
                  <div>
                    <span>Value</span>
                    <strong>{money(value)}</strong>
                  </div>
                </div>
              ))}
            </Card>
          )}

          {tab === "fmv" && (
            <Card>
              <p>Retail: {asset.fmv.retail}</p>
              <p>Wholesale: {asset.fmv.wholesale}</p>
              <p>Auction: {asset.fmv.auction}</p>
            </Card>
          )}

          {tab === "comps" && (
            <Card>
              {asset.compsBreakdown.map(([channel, count, range]) => (
                <div className="scenario" key={channel}>
                  <strong>{channel}</strong>
                  <div>
                    <span>{count} comps</span>
                    <strong>{range}</strong>
                  </div>
                </div>
              ))}
            </Card>
          )}

          {tab === "financial" && (
            <Card>
              <p>Residual: {money(asset.financial.bookedResidual)}</p>
              <p>Recovery: {money(asset.financial.expectedRecovery)}</p>
              <p>Variance: {money(variance)}</p>
            </Card>
          )}
        </>
      )}

      <footer>© 2026 Net Recovery Engine</footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
