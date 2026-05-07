import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  FileText,
  Plus
} from "lucide-react";
import "./styles.css";

const initialAsset = {
  header: "2019 Freightliner Cascadia",
  location: "Memphis, TN",
  year: 2019,
  make: "Freightliner",
  model: "Cascadia",
  mileage: 410000,
  age: 4,
  conditionScore: 3.2,
  conditionBand: "Fair",
  financial: {
    bookedResidual: 36000
  },
  components: [
    ["Engine", "Poor", 2400, 5800, "Turbo failure materially suppresses buyer demand."],
    ["Drivetrain", "Fair", 1200, 2100, "Usable, but below benchmark."],
    ["Brakes", "Fair", 900, 1500, "Adds reconditioning friction."],
    ["Tires", "Fair", 1100, 1700, "Affects retail presentation."]
  ],
  configuration: [
    ["Sleeper Cab Configuration", 0.06, "Supports stronger wholesale and retail demand."],
    ["APU Unit", 0.07, "Adds buyer appeal for owner-operators and wholesale buyers."],
    ["Aero Package", 0.03, "Improves presentation and modestly supports value."],
    ["Full Service Records", 0.04, "Improves buyer confidence and valuation support."],
    ["Known Critical Defect", -0.08, "Material repair issue limits retail demand."]
  ]
};

const initialComps = [
  {
    id: 1,
    asset: "2019 Freightliner Cascadia",
    mileage: 482000,
    value: 46500,
    channel: "Wholesale",
    source: "Ritchie Bros.",
    saleDate: "Mar 2025",
    relevance: 87,
    included: true,
    saleType: "Auction Result"
  },
  {
    id: 2,
    asset: "2018 Freightliner Cascadia",
    mileage: 515000,
    value: 42000,
    channel: "Auction",
    source: "IronPlanet",
    saleDate: "Feb 2025",
    relevance: 78,
    included: true,
    saleType: "Auction Result"
  },
  {
    id: 3,
    asset: "2020 Peterbilt 579",
    mileage: 438000,
    value: 51200,
    channel: "Retail",
    source: "Dealer Listing",
    saleDate: "Apr 2025",
    relevance: 61,
    included: true,
    saleType: "Dealer Listing"
  },
  {
    id: 4,
    asset: "2017 Kenworth T680",
    mileage: 601000,
    value: 38400,
    channel: "Auction",
    source: "Auction Result",
    saleDate: "Jan 2025",
    relevance: 54,
    included: false,
    saleType: "Auction Result"
  },
  {
    id: 5,
    asset: "2019 Volvo VNL",
    mileage: 490000,
    value: 44800,
    channel: "Wholesale",
    source: "Internal Sale",
    saleDate: "Mar 2025",
    relevance: 74,
    included: true,
    saleType: "Internal Sale"
  }
];

const conditionMultiplierTable = [
  { min: 4.5, label: "Excellent", multiplier: 1.1 },
  { min: 3.5, label: "Good", multiplier: 1.05 },
  { min: 2.5, label: "Fair", multiplier: 1.0 },
  { min: 1.5, label: "Poor", multiplier: 0.9 },
  { min: 1.0, label: "Bad", multiplier: 0.75 }
];

const channelFactors = [
  { channel: "Retail", factor: 1.08, fee: 0.03, days: 35, risk: "Higher", note: "Highest FMV reference, but slow and condition-sensitive for this asset." },
  { channel: "Wholesale", factor: 0.96, fee: 0.015, days: 14, risk: "Low", note: "Most predictable buyer base for this fair-condition truck after focused reconditioning." },
  { channel: "Marketplace", factor: 1.0, fee: 0.025, days: 21, risk: "Medium", note: "Best balance when records and condition support buyer confidence." },
  { channel: "Auction", factor: 0.88, fee: 0.045, days: 9, risk: "Low", note: "Fastest path, but typically lowest recovery." }
];

const nreDisposition = {
  action: "Repair critical items + move to Wholesale",
  expectedNet: 35100,
  lift: 3900,
  days: 14,
  channel: "Wholesale",
  why: [
    "Engine condition suppresses retail buyer demand and increases buyer diligence.",
    "Wholesale comps are tighter and more predictable for this defect profile.",
    "Sleeper, APU, and aero configuration add value, but not enough to justify longer retail exposure before targeted reconditioning."
  ]
};

const inspectionReport = {
  fileName: "Freightliner_Cascadia_Inspection_Report.pdf",
  uploadedBy: "Customer / Vendor",
  uploadedDate: "May 6, 2026",
  status: "Received and processed",
  reportId: "INSP-2019-FC-001"
};

const valuationBasis = "Verified auction results, wholesale transactions, internal sale history, and listing indicators";


function money(v) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(Number.isFinite(v) ? v : 0);
}

function pct(v) {
  return `${(v * 100).toFixed(1)}%`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getConditionMultiplier(score) {
  return conditionMultiplierTable.find((row) => score >= row.min) || conditionMultiplierTable[conditionMultiplierTable.length - 1];
}

function weightedCompAnchor(comps) {
  const included = comps.filter((c) => c.included && c.value > 0 && c.relevance > 0);
  const weightedTotal = included.reduce((sum, c) => sum + c.value * c.relevance, 0);
  const relevanceTotal = included.reduce((sum, c) => sum + c.relevance, 0);
  return relevanceTotal ? weightedTotal / relevanceTotal : 0;
}

function compQualityScore(comps) {
  const included = comps.filter((c) => c.included);
  const countScore = included.length >= 3 ? 100 : included.length === 2 ? 70 : included.length === 1 ? 40 : 0;
  const avgRelevance = included.length ? included.reduce((s, c) => s + c.relevance, 0) / included.length : 0;
  const dataQuality = included.length
    ? included.reduce((s, c) => s + (c.saleType === "Dealer Listing" ? 60 : 100), 0) / included.length
    : 0;
  const values = included.map((c) => c.value).sort((a, b) => a - b);
  const spread = values.length ? (values[values.length - 1] - values[0]) / values[Math.floor(values.length / 2)] : 1;
  const spreadScore = spread < 0.15 ? 100 : spread <= 0.3 ? 70 : 40;
  const recencyScore = 90;
  return countScore * 0.25 + avgRelevance * 0.35 + recencyScore * 0.15 + dataQuality * 0.15 + spreadScore * 0.1;
}

function calculateFMV(asset, comps) {
  const baseComp = weightedCompAnchor(comps);
  const condition = getConditionMultiplier(asset.conditionScore);
  const rawConfig = 1 + asset.configuration.reduce((sum, [, adj]) => sum + adj, 0);
  const configMultiplier = clamp(rawConfig, 0.75, 1.3);
  const expectedUsage = asset.age * 120000;
  const usageVariance = expectedUsage ? (asset.mileage - expectedUsage) / expectedUsage : 0;
  const usageMultiplier = clamp(1 - usageVariance * 0.15, 0.8, 1.12);
  const regionMultiplier = 1.0;
  const fmv = baseComp * condition.multiplier * configMultiplier * usageMultiplier * regionMultiplier;
  const compQuality = compQualityScore(comps);
  const inspectionCompleteness = 88;
  const evidenceQuality = 82;
  const usageReliability = 90;
  const recordsQuality = asset.configuration.some(([name]) => name === "Full Service Records") ? 85 : 60;
  const confidence = compQuality * 0.35 + inspectionCompleteness * 0.25 + evidenceQuality * 0.15 + usageReliability * 0.1 + recordsQuality * 0.15;
  const repairs = asset.components.map(([name, band, repairCost, valueLift, note]) => ({
    name,
    band,
    repairCost,
    valueLift,
    note,
    roi: valueLift - repairCost,
    multiple: repairCost ? valueLift / repairCost : 0
  }));
  const recommendedRepairCost = repairs.filter((r) => r.roi > 0).reduce((s, r) => s + r.repairCost, 0);
  const channelScenarios = channelFactors.map((ch) => {
    const gross = fmv * ch.factor;
    const fees = gross * ch.fee;
    const net = gross - fees - (ch.channel === "Wholesale" || ch.channel === "Marketplace" ? recommendedRepairCost : 0);
    let score = net / 1000;
    if (asset.conditionScore < 3.5 && ch.channel === "Wholesale") score += 5;
    if (asset.conditionScore >= 3.5 && ch.channel === "Marketplace") score += 5;
    if (asset.conditionScore < 2.5 && ch.channel === "Auction") score += 6;
    return { ...ch, gross, fees, net, score };
  }).sort((a, b) => b.score - a.score);
  const recommendedChannel = channelScenarios.find((row) => row.channel === nreDisposition.channel) || channelScenarios[0];

  const reviewFlags = [];
  const includedComps = comps.filter((c) => c.included);
  if (confidence < 65) reviewFlags.push("Confidence below 65% requires review.");
  if (includedComps.length < 2) reviewFlags.push("Fewer than 2 included comps.");
  if (includedComps.some((c) => c.saleType === "Dealer Listing")) reviewFlags.push("Listing price used as one comp; verify against sold data.");
  if (asset.components.some(([name, band]) => name === "Engine" && band === "Poor")) reviewFlags.push("Poor engine condition should be reviewed before release.");

  return {
    baseComp,
    condition,
    configMultiplier,
    expectedUsage,
    usageVariance,
    usageMultiplier,
    regionMultiplier,
    fmv,
    fmvLow: fmv * 0.92,
    fmvHigh: fmv * 1.08,
    listingPrice: Math.round(fmv / 500) * 500,
    confidence,
    compQuality,
    repairs,
    recommendedRepairCost,
    channelScenarios,
    recommendedChannel,
    reviewFlags
  };
}

function Card({ children, dark = false }) {
  return <div className={dark ? "card dark" : "card"}>{children}</div>;
}

function Metric({ label, value, note }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
      {note ? <small>{note}</small> : null}
    </div>
  );
}

function App() {
  const [started, setStarted] = useState(false);
  const [tab, setTab] = useState("recommendation");
  const [comps, setComps] = useState(initialComps);
  const [showComps, setShowComps] = useState(false);
  const [showCompDetail, setShowCompDetail] = useState(null);
  const [showInspectionReport, setShowInspectionReport] = useState(false);
  const [assetCount, setAssetCount] = useState(100);
  const [currentRetail, setCurrentRetail] = useState(65);
  const [currentWholesale, setCurrentWholesale] = useState(25);
  const [currentAuction, setCurrentAuction] = useState(10);
  const [newComp, setNewComp] = useState({ asset: "", mileage: "", value: "", channel: "Wholesale", source: "", relevance: 75 });

  const result = useMemo(() => calculateFMV(initialAsset, comps), [comps]);

  const predictedRetail = 30;
  const predictedWholesale = 50;
  const predictedAuction = 20;
  const variance = nreDisposition.expectedNet - initialAsset.financial.bookedResidual;
  const totalChannelDifference = Math.abs(currentRetail - predictedRetail) + Math.abs(currentWholesale - predictedWholesale) + Math.abs(currentAuction - predictedAuction);
  const estimatedMisroutedAssets = Math.round(assetCount * (totalChannelDifference / 2 / 100));

  const inputStyle = {
    width: "32px",
    border: "none",
    background: "transparent",
    fontWeight: 800,
    fontSize: "16px",
    textAlign: "right",
    outline: "none"
  };

  const percentInput = (value, setter) => (
    <span style={{ display: "flex", alignItems: "center", gap: "2px" }}>
      <input
        type="text"
        value={value}
        onChange={(e) => setter(Number(e.target.value.replace(/[^0-9]/g, "")))}
        style={inputStyle}
      />
      <strong>%</strong>
    </span>
  );

  function updateComp(id, key, value) {
    setComps((rows) => rows.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  }

  function addComp() {
    if (!newComp.asset || !newComp.value) return;
    setComps((rows) => [
      ...rows,
      {
        id: Date.now(),
        asset: newComp.asset,
        mileage: Number(newComp.mileage || 0),
        value: Number(newComp.value || 0),
        channel: newComp.channel,
        source: newComp.source || "Manual Entry",
        saleDate: "Manual",
        relevance: Number(newComp.relevance || 0),
        included: true,
        saleType: "Manual Comp"
      }
    ]);
    setNewComp({ asset: "", mileage: "", value: "", channel: "Wholesale", source: "", relevance: 75 });
  }

  return (
    <div className="page">
      <section className="grid two">
        <Card>
          <h2>Current Channel Mix</h2>
          <p className="muted">How the company currently routes assets</p>
          <div className="barrow"><span>Retail</span><div><b style={{ width: `${currentRetail}%` }} /></div>{percentInput(currentRetail, setCurrentRetail)}</div>
          <div className="barrow"><span>Wholesale</span><div><b style={{ width: `${currentWholesale}%` }} /></div>{percentInput(currentWholesale, setCurrentWholesale)}</div>
          <div className="barrow"><span>Auction</span><div><b style={{ width: `${currentAuction}%` }} /></div>{percentInput(currentAuction, setCurrentAuction)}</div>
        </Card>
        <Card>
          <h2>NRE Predicted Channel Mix</h2>
          <p className="muted">How NRE predicts assets should be routed</p>
          <div className="barrow"><span>Retail</span><div><b style={{ width: "30%" }} /></div><strong>30%</strong></div>
          <div className="barrow"><span>Wholesale</span><div><b style={{ width: "50%" }} /></div><strong>50%</strong></div>
          <div className="barrow"><span>Auction</span><div><b style={{ width: "20%" }} /></div><strong>20%</strong></div>
        </Card>
      </section>

      <Card>
        <h2>Channel Opportunity</h2>
        <p className="muted">Estimate how many assets may be routed differently under the NRE channel mix.</p>
        <div className="summary-row light">
          <Metric label="Asset Count" value={<input type="text" value={assetCount} onChange={(e) => setAssetCount(Number(e.target.value.replace(/[^0-9]/g, "")))} style={{ width: "80px", border: "none", background: "transparent", fontWeight: 800, fontSize: "24px", textAlign: "center", outline: "none" }} />} />
          <Metric label="Estimated Misrouted Assets" value={estimatedMisroutedAssets} />
          <Metric label="Channel Mix Difference" value={`${Math.round(totalChannelDifference / 2)}%`} />
        </div>
      </Card>
<div className="upload-start">
  <button className="upload-start-button" onClick={() => setStarted(true)}>
    Upload Inspection Report
  </button>
</div>

     {!started ? null : (
        <>
          <Card>
            <h2>{initialAsset.header}</h2>
            <p className="muted">
              {initialAsset.location} · Score {initialAsset.conditionScore.toFixed(1)} ({result.condition.label}) · {comps.length} comps · FMV {money(result.fmv)}
            </p>
          </Card>

          <nav className="tabs">
            {["recommendation", "scenarios", "condition", "configuration", "fmv", "comps", "financial", "report"].map((t) => (
              <button key={t} onClick={() => setTab(t)} className={tab === t ? "active" : ""}>{t.toUpperCase()}</button>
            ))}
          </nav>

          {tab === "recommendation" && (
            <>
              <Card dark>
                <span className="eyebrow">NRE RECOMMENDED DISPOSITION</span>
                <h2>{nreDisposition.action}</h2>
                <div className="summary-row">
                  <Metric label="Expected Net Recovery" value={money(nreDisposition.expectedNet)} />
                  <Metric label="FMV Opinion" value={money(result.fmv)} />
                  <Metric label="Expected Days" value={nreDisposition.days} />
                </div>
              </Card>
              <Card>
                <h2>Why This Decision</h2>
                <ul>
                  {nreDisposition.why.map((reason) => <li key={reason}>{reason}</li>)}
                  <li>FMV is still shown separately as a market value opinion; NRE recommendation is the operating recovery path.</li>
                </ul>
              </Card>
            </>
          )}

          {tab === "scenarios" && (
            <Card>
              <h2>Scenario Comparison</h2>
              {result.channelScenarios.map((row) => (
                <div className="scenario" key={row.channel}>
                  <div><strong>{row.channel}</strong><p>{row.note}</p></div>
                  <div className="right-value"><strong>Net {money(row.net)}, {row.days} days</strong><p>Gross {money(row.gross)} · Fees {money(row.fees)}</p></div>
                </div>
              ))}
            </Card>
          )}

          {tab === "condition" && (
            <>
              <Card>
                <h2>Inspection Report</h2>
                <p className="muted">This uploaded inspection report is the source document used to generate condition intelligence, repair findings, FMV adjustments, and recommended disposition.</p>
                <div className="summary-row light">
                  <Metric label="Uploaded File" value={inspectionReport.fileName} />
                  <Metric label="Uploaded By" value={inspectionReport.uploadedBy} />
                  <Metric label="Status" value={inspectionReport.status} />
                </div>
                <div className="summary-row light">
                  <Metric label="Uploaded Date" value={inspectionReport.uploadedDate} />
                  <Metric label="Report ID" value={inspectionReport.reportId} />
                  <Metric label="Condition" value={`${result.condition.label} / ${initialAsset.conditionScore.toFixed(1)} / ${result.condition.multiplier.toFixed(2)}x`} />
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "18px" }}>
                  <button onClick={() => setShowInspectionReport(true)}>View Report</button>
                  <button onClick={() => window.print()}>Print</button>
                 
                  <button onClick={() => alert("Demo forward action. In production, this would email the inspection report.")}>Forward</button>
                  <button>
  Save as PDF
</button>
                
                </div>
              </Card>

              <Card>
                <h2>Major Component Condition</h2>
                {result.repairs.map((row) => (
                  <div className="scenario" key={row.name}>
                    <div><strong>{row.name}</strong><p>{row.note}</p></div>
                    <div className="right-value"><strong>{row.band}</strong><p>Repair {money(row.repairCost)} · Lift {money(row.valueLift)} · Net {row.roi >= 0 ? "+" : ""}{money(row.roi)}</p></div>
                  </div>
                ))}
              </Card>
            </>
          )}

          {tab === "configuration" && (
            <Card>
              <h2>Configuration & Adjustments</h2>
              {initialAsset.configuration.map(([name, value, note]) => (
                <div className="scenario" key={name}>
                  <div><strong>{name}</strong><p>{note}</p></div>
                  <div className="right-value"><strong>{value >= 0 ? "+" : ""}{pct(value)}</strong></div>
                </div>
              ))}
              <div className="summary-row light"><Metric label="Config Multiplier" value={`${result.configMultiplier.toFixed(3)}x`} /><Metric label="Usage Multiplier" value={`${result.usageMultiplier.toFixed(3)}x`} /><Metric label="Region Multiplier" value={`${result.regionMultiplier.toFixed(3)}x`} /></div>
            </Card>
          )}

          {tab === "fmv" && (
            <Card>
              <h2>Fair Market Value</h2>
              <div className="summary-row light">
                <Metric label="FMV Opinion" value={money(result.fmv)} />
                <Metric label="FMV Range" value={`${money(result.fmvLow)} – ${money(result.fmvHigh)}`} />
                <Metric label="Listing Price" value={money(result.listingPrice)} />
              </div>
              <div className="formula-grid">
                <div><span>Base Comp Anchor</span><strong>{money(result.baseComp)}</strong></div>
                <div><span>Condition</span><strong>{result.condition.label} / {initialAsset.conditionScore.toFixed(1)} / {result.condition.multiplier.toFixed(2)}x</strong></div>
                <div><span>Configuration</span><strong>{result.configMultiplier.toFixed(2)}x</strong></div>
                <div><span>Usage</span><strong>{result.usageMultiplier.toFixed(2)}x</strong></div>
                <div><span>Region</span><strong>{result.regionMultiplier.toFixed(2)}x</strong></div>
                <div><span>Confidence</span><strong>{result.confidence.toFixed(0)}%</strong></div>
              </div>
              <p className="muted">Formula: Base Comp × Condition × Configuration × Usage × Region.</p>
              <div className="explain-box">
                <strong>Plain-English valuation summary</strong>
                <p>The FMV opinion of <strong>{money(result.fmv)}</strong> is based on a weighted comparable sales anchor of <strong>{money(result.baseComp)}</strong>, adjusted for verified condition, configuration value, usage, and regional market assumptions. Configuration adds value due to sleeper/APU/aero package and service records, while the overall fair condition score keeps the condition multiplier neutral at <strong>{result.condition.multiplier.toFixed(2)}x</strong>.</p>
              </div>
            </Card>
          )}

          {tab === "comps" && (
            <Card>
              <h2>Comparable Market Support</h2>
              <p className="muted">Verified sales, wholesale transactions, internal recovery data, and listing indicators are scored and weighted to calculate the Base Comp Anchor.</p>
              <div className="summary-row light"><Metric label="Weighted Comp Anchor" value={money(result.baseComp)} /><Metric label="Comp Quality" value={`${result.compQuality.toFixed(0)}%`} /><Metric label="Included Comps" value={comps.filter((c) => c.included).length} /></div>
              {comps.map((comp) => (
                <div className="scenario" key={comp.id}>
                  <div>
                    <strong>{comp.asset}</strong>
                    <p>{comp.source} · {comp.saleDate} · {comp.channel} · {comp.saleType}</p>
                    {comp.saleType.includes("Listing") ? <span className="badge warning">Listing Only</span> : <span className="badge success">Verified Sale</span>}
                  </div>
                  <div className="right-value">
                    <strong>{money(comp.value)}</strong>
                    <p>{comp.mileage.toLocaleString()} miles · Relevance {comp.relevance}%</p>
                    <label className="toggle"><input type="checkbox" checked={comp.included} onChange={(e) => updateComp(comp.id, "included", e.target.checked)} /> Include</label>
                    <button className="small" onClick={() => setShowCompDetail(comp)}>Detail</button>
                  </div>
                </div>
              ))}
              <button onClick={() => setShowComps(true)}><Plus size={16} /> Add Comp</button>
            </Card>
          )}

          {tab === "financial" && (
            <Card>
              <h2>Financial Impact</h2>
              <div className="summary-row light">
                <Metric label="Booked Residual" value={money(initialAsset.financial.bookedResidual)} />
                <Metric label="Expected Recovery" value={money(nreDisposition.expectedNet)} />
                <Metric label="Variance" value={money(variance)} />
              </div>
            </Card>
          )}

          {tab === "report" && (
            <Card>
              <div className="report-title"><FileText /><div><h2>Equipment FMV Report</h2><p className="muted">Customer-ready valuation summary</p></div></div>
              <div className="summary-row light"><Metric label="Asset" value={initialAsset.header} /><Metric label="FMV Opinion" value={money(result.fmv)} /><Metric label="Recommended Disposition" value={nreDisposition.action} /></div>
              <div className="summary-row light"><Metric label="Valuation Basis" value={valuationBasis} /><Metric label="Expected Net Recovery" value={money(nreDisposition.expectedNet)} /><Metric label="Confidence" value={`${result.confidence.toFixed(0)}%`} /></div>
              <h2>Valuation Opinion</h2>
              <p>Based on verified auction results, wholesale transactions, internal sale history, listing indicators, qualified inspection data, configuration scoring, usage normalization, regional market conditions, repair economics, and channel performance, the fair market value of the subject asset is estimated at <strong>{money(result.fmv)}</strong>, with a reasonable range of <strong>{money(result.fmvLow)} to {money(result.fmvHigh)}</strong>. The NRE recommended disposition is <strong>{nreDisposition.action}</strong>, with expected net recovery of <strong>{money(nreDisposition.expectedNet)}</strong>.</p>
              <h2>Methodology</h2>
              <p>The FMV Engine starts with a relevance-weighted comparable sales anchor of <strong>{money(result.baseComp)}</strong>, then applies a condition multiplier of <strong>{result.condition.label} / {initialAsset.conditionScore.toFixed(1)} / {result.condition.multiplier.toFixed(2)}x</strong>, configuration multiplier of <strong>{result.configMultiplier.toFixed(2)}x</strong>, usage multiplier of <strong>{result.usageMultiplier.toFixed(2)}x</strong>, and region multiplier of <strong>{result.regionMultiplier.toFixed(2)}x</strong>.</p>
              <p><strong>Channel clarification:</strong> The FMV opinion is a market value estimate. The operating recommendation is Wholesale after targeted repair because this asset has a fair overall condition score and poor engine condition.</p>
              <h2>Review Flags</h2>
              {result.reviewFlags.length ? <ul>{result.reviewFlags.map((flag) => <li key={flag}>{flag}</li>)}</ul> : <p>No review flags.</p>}
              <h2>Disclaimer</h2>
              <p className="disclaimer">This valuation is an estimated fair market value opinion based on available inspection data, verified auction results, wholesale transactions, internal sale history, listing indicators, configuration inputs, usage assumptions, and channel performance logic. It is not a guaranteed sale price, appraisal certification, or binding offer. Final recovery may vary based on buyer demand, timing, title status, repair completion, and market conditions.</p>
              <button onClick={() => window.print()}>Export / Print PDF</button>
            </Card>
          )}
        </>
      )}

      {showComps && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Add Comparable Sale</h2>
            <div className="form-grid">
              <label>Asset<input value={newComp.asset} onChange={(e) => setNewComp({ ...newComp, asset: e.target.value })} /></label>
              <label>Mileage<input value={newComp.mileage} onChange={(e) => setNewComp({ ...newComp, mileage: e.target.value.replace(/[^0-9]/g, "") })} /></label>
              <label>Value<input value={newComp.value} onChange={(e) => setNewComp({ ...newComp, value: e.target.value.replace(/[^0-9]/g, "") })} /></label>
              <label>Channel<select value={newComp.channel} onChange={(e) => setNewComp({ ...newComp, channel: e.target.value })}><option>Retail</option><option>Wholesale</option><option>Marketplace</option><option>Auction</option></select></label>
              <label>Source<input value={newComp.source} onChange={(e) => setNewComp({ ...newComp, source: e.target.value })} /></label>
              <label>Relevance<input value={newComp.relevance} onChange={(e) => setNewComp({ ...newComp, relevance: e.target.value.replace(/[^0-9]/g, "") })} /></label>
            </div>
            <div className="modal-actions"><button onClick={addComp}>Save Comp</button><button className="secondary" onClick={() => setShowComps(false)}>Close</button></div>
          </div>
        </div>
      )}

      {showCompDetail && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Comparable Sale Detail</h2>
            <p><strong>Asset:</strong> {showCompDetail.asset}</p>
            <p><strong>Mileage:</strong> {showCompDetail.mileage.toLocaleString()} miles</p>
            <p><strong>Sale Price:</strong> {money(showCompDetail.value)}</p>
            <p><strong>Channel:</strong> {showCompDetail.channel}</p>
            <p><strong>Source:</strong> {showCompDetail.source}</p>
            <p><strong>Sale Date:</strong> {showCompDetail.saleDate}</p>
            <p><strong>Relevance:</strong> {showCompDetail.relevance}%</p>
            <button onClick={() => setShowCompDetail(null)}>Close</button>
          </div>
        </div>
      )}

      {showInspectionReport && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Inspection Report</h2>
            <p><strong>File:</strong> {inspectionReport.fileName}</p>
            <p><strong>Uploaded By:</strong> {inspectionReport.uploadedBy}</p>
            <p><strong>Uploaded Date:</strong> {inspectionReport.uploadedDate}</p>
            <p><strong>Status:</strong> {inspectionReport.status}</p>
            <p><strong>Report ID:</strong> {inspectionReport.reportId}</p>
            <div className="explain-box">
              <strong>Demo report viewer</strong>
              <p>In production, this window would display the actual uploaded PDF inspection report. The customer would be able to view, print, share, forward, or replace the stored report from the Condition tab.</p>
            </div>
            <div className="modal-actions">
              <button onClick={() => window.print()}>Print</button>
              <button onClick={() => alert("Demo share link created for the inspection report.")}>Share</button>
              <button onClick={() => alert("Demo forward action. In production, this would email the inspection report.")}>Forward</button>
              <button className="secondary" onClick={() => setShowInspectionReport(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <footer>© 2026 Net Recovery Engine. All rights reserved.</footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);





