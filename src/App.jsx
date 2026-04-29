import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Upload, Clock3, AlertTriangle, CheckCircle2, Settings2 } from "lucide-react";
import "./styles.css";

function Card({ className = "", children }) { return <div className={`card ${className}`}>{children}</div>; }
function CardHeader({ children }) { return <div className="card-header">{children}</div>; }
function CardTitle({ children }) { return <div className="card-title">{children}</div>; }
function CardDescription({ children }) { return children ? <div className="card-description">{children}</div> : null; }
function CardContent({ className = "", children }) { return <div className={`card-content ${className}`}>{children}</div>; }
function Button({ className = "", children, ...props }) { return <button className={`button ${className}`} {...props}>{children}</button>; }
function Badge({ children }) { return <span className="badge">{children}</span>; }
function Tabs({ value, onValueChange, children }) { return <div>{React.Children.map(children, child => React.isValidElement(child) ? React.cloneElement(child, { activeTab: value, onValueChange }) : child)}</div>; }
function TabsList({ children, onValueChange, activeTab }) { return <div className="tabs-list">{React.Children.map(children, child => React.isValidElement(child) ? React.cloneElement(child, { activeTab, onValueChange }) : child)}</div>; }
function TabsTrigger({ value, children, activeTab, onValueChange }) { return <button className={`tab-trigger ${activeTab === value ? "active" : ""}`} onClick={() => onValueChange(value)}>{children}</button>; }
function TabsContent({ value, activeTab, children }) { return activeTab === value ? <div className="tab-content">{children}</div> : null; }

const assets = [
  {
    id: "high",
    header: "2019 Freightliner Cascadia",
    location: "Memphis, TN",
    conditionScore: 62,
    conditionBand: "Fair",
    comps: 42,
    compsBreakdown: { retail: 15, wholesale: 17, auction: 10 },
    compsDescription: "2018-2021 Cascadia - fair condition - engine-related defects - similar sleeper configuration",
    fmv: {
      retail: { low: 35900, high: 37900 },
      wholesale: { low: 30200, high: 32200 },
      auction: { low: 27500, high: 29500 },
    },
    components: [
      { name: "Engine", score: 3, band: "Poor", impact: "High", note: "Turbo failure materially suppresses retail and wholesale buyer demand." },
      { name: "Drivetrain", score: 6, band: "Fair", impact: "Medium", note: "Usable, but below benchmark for late-model fleet units." },
      { name: "Brakes", score: 5, band: "Fair", impact: "Medium", note: "Adds reconditioning friction for retail disposition." },
      { name: "Tires", score: 7, band: "Fair", impact: "Low", note: "Affects retail presentation more than auction speed." },
      { name: "Electrical", score: 9, band: "Good", impact: "Low", note: "No meaningful drag on channel selection." },
    ],
    attachments: [
      { name: "Sleeper Cab Configuration", valueImpact: 3800, channelImpact: "Supports stronger retail and wholesale demand, but not enough to offset engine drag in retail.", included: true },
      { name: "APU Unit", valueImpact: 1200, channelImpact: "Adds incremental buyer appeal in wholesale and owner-operator retail segments.", included: true },
      { name: "Aero Package", valueImpact: 700, channelImpact: "Improves retail presentation but has modest net effect on channel ranking.", included: true },
    ],
    defects: [
      { component: "Engine", name: "Blown turbo", action: "Repair turbo", impact: -4200, repair: 1800, recommended: true },
      { component: "Tires", name: "Tire damage", action: "Buy new tires", impact: -1200, repair: 700, recommended: true },
      { component: "Brakes", name: "Brake wear", action: "Repair brakes", impact: -900, repair: 500, recommended: true },
    ],
    baseline: { path: "Retail (default)", net: 31200, days: 28 },
    recommendation: {
      action: "Repair critical + move to Wholesale",
      channel: "Wholesale",
      expectedNet: 35100,
      lift: 3900,
      days: 14,
      why: [
        "Engine condition suppresses retail buyer demand more than wholesale demand.",
        "Wholesale comps are tighter and more predictable for this defect profile.",
        "Sleeper and APU configuration add value, but not enough to justify the longer retail exposure."
      ]
    },
    scenarios: [
      { name: "Retail (baseline)", net: 31200, days: 28, note: "Higher gross potential, but slower and more condition-sensitive." },
      { name: "Wholesale (as-is)", net: 31800, days: 12, note: "Stronger demand for fair-condition units with known engine issues, but discounted due to unresolved defects." },
      { name: "Repair + Wholesale", net: 35100, days: 14, note: "Best net recovery after focused reconditioning.", recommended: true },
      { name: "Auction", net: 28100, days: 9, note: "Fastest path, but lowest expected recovery." },
    ],
  }
];

const portfolioBehavior = { current: { retail: 65, wholesale: 25, auction: 10 }, suggested: { retail: 30, wholesale: 50, auction: 20 } };
const impactAssumptions = { misroutedRate: 0.20, avgLiftPerAssetLow: 1500, avgLiftPerAssetHigh: 4000 };

function money(v) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v); }
function bandColor(score) { if (score <= 4) return "red"; if (score <= 6) return "amber"; return "green"; }
function PercentBar({ label, value, dark = false }) { return <div className="percent-row"><div className="percent-label"><span>{label}</span><strong>{value}%</strong></div><div className="bar-track"><div className={dark ? "bar-fill dark" : "bar-fill"} style={{ width: `${value}%` }} /></div></div>; }
function FMVCard({ label, data }) { return <Card><CardContent><div className="muted small">{label}</div><div className="metric">{money(data.low)} - {money(data.high)}</div></CardContent></Card>; }
function NumberInput({ label, value, onChange, prefix = "" }) {
  const formatNumber = (num) => (!num && num !== 0) ? "" : new Intl.NumberFormat("en-US").format(num);
  const [text, setText] = useState(formatNumber(value));
  function handleChange(e) {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    if (raw === "") { setText(""); onChange(0); return; }
    const num = parseInt(raw, 10);
    setText(formatNumber(num));
    onChange(num);
  }
  return <label className="number-input"><span>{label}</span><div className="input-shell">{prefix && <span className="input-prefix">{prefix}</span>}<input inputMode="numeric" placeholder="Enter value" value={text} onChange={handleChange} /></div></label>;
}

function App() {
  const [started, setStarted] = useState(false);
  const [tab, setTab] = useState("decision");
  const [assetCount, setAssetCount] = useState(8000);
  const [averageAssetValue, setAverageAssetValue] = useState(65000);
  const asset = useMemo(() => assets[0], []);
  const estimatedMisroutedAssets = Math.round(assetCount * impactAssumptions.misroutedRate);
  const estimatedOpportunityLow = estimatedMisroutedAssets * impactAssumptions.avgLiftPerAssetLow;
  const estimatedOpportunityHigh = estimatedMisroutedAssets * impactAssumptions.avgLiftPerAssetHigh;
  const recommendedRepairs = asset.defects.filter((d) => d.recommended);
  const totalRepairCost = recommendedRepairs.reduce((sum, d) => sum + d.repair, 0);
  const totalValueImpactAddressed = recommendedRepairs.reduce((sum, d) => sum + Math.abs(d.impact), 0);
  const netRepairBenefit = totalValueImpactAddressed - totalRepairCost;
  const channelLift = ((asset.scenarios.find((s) => s.name === "Wholesale (as-is)")?.net ?? asset.baseline.net) - asset.baseline.net);

  return <div className="app-shell"><main className="container">
    <header className="header"><div><h1>Net Recovery Engine</h1><p>From inspection upload to channel decision</p></div><Button onClick={() => setStarted(true)}><Upload size={16} /> Upload Inspection</Button></header>

    <Card><CardHeader><CardTitle>Portfolio Behavior</CardTitle><CardDescription>How current channel behavior compares to NRE-guided channel mix</CardDescription></CardHeader><CardContent className="two-col"><div><div className="section-label">Current Portfolio Behavior</div><PercentBar label="Retail" value={portfolioBehavior.current.retail} dark /><PercentBar label="Wholesale" value={portfolioBehavior.current.wholesale} dark /><PercentBar label="Auction" value={portfolioBehavior.current.auction} dark /></div><div><div className="section-label">NRE Suggested Distribution</div><PercentBar label="Retail" value={portfolioBehavior.suggested.retail} /><PercentBar label="Wholesale" value={portfolioBehavior.suggested.wholesale} /><PercentBar label="Auction" value={portfolioBehavior.suggested.auction} /></div></CardContent></Card>

    <Card><CardHeader><CardTitle>Portfolio Impact</CardTitle><CardDescription>Portfolio Impact is driven by optimizing channel behavior above.</CardDescription></CardHeader><CardContent><div className="input-grid"><NumberInput label="Assets per Year" value={assetCount} onChange={setAssetCount} /><NumberInput label="Average Asset Value" value={averageAssetValue} onChange={setAverageAssetValue} prefix="$" /></div><div className="metric-grid"><div className="metric-box"><span>Estimated Annual Opportunity</span><strong>{money(estimatedOpportunityLow)} - {money(estimatedOpportunityHigh)}</strong><small>Scaled to this portfolio size</small></div><div className="metric-box"><span>Avg Lift per Missed Decision</span><strong>{money(impactAssumptions.avgLiftPerAssetLow)} - {money(impactAssumptions.avgLiftPerAssetHigh)}</strong><small>Estimated across misrouted assets</small></div><div className="metric-box"><span>Opportunity Assets</span><strong>~{estimatedMisroutedAssets}</strong><small>Based on ~20% potential misrouting</small></div></div><div className="assumption">Assumption for demo: ~20% of assets may be misrouted, with ~$1.5K-$4K lift per misrouted asset based on observed differences across channels.</div></CardContent></Card>

    {!started && <Card className="empty-card"><CardContent>Upload an inspection to generate the decision report, FMV ranges, component condition, configuration analysis, comparable asset set, and recommendation logic.</CardContent></Card>}

    {started && <><Card><CardHeader><CardTitle>{asset.header}</CardTitle><CardDescription>{asset.location} - Condition Score {asset.conditionScore} ({asset.conditionBand})</CardDescription></CardHeader><CardContent className="summary-grid"><div className="summary-box"><span>Comparable Assets</span><strong>{asset.comps}</strong><small>{asset.compsDescription}</small></div><div className="summary-box"><span>Current Path</span><strong>{asset.baseline.path}</strong><small>{money(asset.baseline.net)} - {asset.baseline.days} days</small></div><div className="summary-box"><span>Recommended Channel</span><strong>{asset.recommendation.channel}</strong><small>Expected Lift {money(asset.recommendation.lift)}</small></div><div className="summary-box"><span>Configuration</span><strong>{asset.attachments.filter(a => a.included).length}</strong><small>Included in pricing and channel logic</small></div></CardContent></Card>

    <Tabs value={tab} onValueChange={setTab}><TabsList><TabsTrigger value="decision">Recommendation</TabsTrigger><TabsTrigger value="scenarios">Scenarios</TabsTrigger><TabsTrigger value="condition">Condition</TabsTrigger><TabsTrigger value="attachments">Configuration</TabsTrigger><TabsTrigger value="valuation">FMV</TabsTrigger><TabsTrigger value="comps">Comps</TabsTrigger><TabsTrigger value="financial">Financial</TabsTrigger></TabsList>
      <TabsContent value="decision"><Card className="hero-card"><CardContent><div className="eyebrow">ACTION</div><h2>{asset.recommendation.action}</h2><div className="hero-metrics"><div><span>Expected Net Recovery</span><strong>{money(asset.recommendation.expectedNet)}</strong></div><div><span>Improvement vs Current Path</span><strong>+{money(asset.recommendation.lift)}</strong><small>Channel: +{money(channelLift)} - Repairs: +{money(netRepairBenefit)}</small></div><div><span>Time to Liquidation</span><strong>{asset.recommendation.days} days</strong></div></div></CardContent></Card><div className="two-col"><Card><CardHeader><CardTitle>Why This Decision</CardTitle></CardHeader><CardContent>{asset.recommendation.why.map((line) => <div key={line} className="check-line"><CheckCircle2 size={16} /> <span>{line}</span></div>)}</CardContent></Card><Card><CardHeader><CardTitle>Why Not Other Options</CardTitle></CardHeader><CardContent>{asset.scenarios.filter((s) => !s.recommended).map((s) => <div key={s.name} className="note-row"><strong>{s.name}</strong><span>{s.note}</span></div>)}</CardContent></Card></div></TabsContent>
      <TabsContent value="scenarios"><Card><CardHeader><CardTitle>Scenario Comparison</CardTitle><CardDescription>Each path reflects how similar assets have actually sold and how long they took to liquidate.</CardDescription></CardHeader><CardContent>{asset.scenarios.map((s) => <div key={s.name} className={`scenario-row ${s.recommended ? "recommended" : ""}`}><div><strong>{s.name}</strong><span>{s.note}</span></div><div><strong>{money(s.net)}</strong><span><Clock3 size={14} /> {s.days} days</span>{s.recommended && <Badge>Recommended</Badge>}</div></div>)}</CardContent></Card></TabsContent>
      <TabsContent value="condition"><Card><CardHeader><CardTitle>Major Component Condition</CardTitle><CardDescription>These component scores feed channel FMV and recommendation logic.</CardDescription></CardHeader><CardContent>{asset.components.map((c) => <div key={c.name} className="component-row"><div><strong>{c.name}</strong><span>{c.note}</span></div><div className="condition-score"><span>{c.band}</span><strong><i className={bandColor(c.score)} />{c.score}/10</strong><small>Impact: {c.impact}</small></div></div>)}</CardContent></Card><Card><CardHeader><CardTitle>Recommended Repairs</CardTitle><CardDescription>Repairs selected for the recommended path, grouped by major component.</CardDescription></CardHeader><CardContent>{recommendedRepairs.map((d) => <div key={d.name} className="repair-row"><div><AlertTriangle size={16} /><div><strong>{d.component}: {d.name}</strong><span>Action: {d.action}</span></div></div><div><span>Value Impact: {money(d.impact)}</span><span>Repair Cost: {money(d.repair)}</span></div></div>)}<div className="total-row"><span>Total Recommended Repair Cost</span><strong>{money(totalRepairCost)}</strong></div><div className="total-row"><span>Estimated Value Restored</span><strong>{money(totalValueImpactAddressed)}</strong></div><div className="total-row"><span>Net Repair Benefit</span><strong>{money(netRepairBenefit)}</strong></div></CardContent></Card></TabsContent>
      <TabsContent value="attachments"><Card><CardHeader><CardTitle>Attachments & Configuration</CardTitle><CardDescription>Included directly in pricing and channel recommendation logic.</CardDescription></CardHeader><CardContent>{asset.attachments.map((a) => <div key={a.name} className="attachment-row"><div><Settings2 size={18} /><div><strong>{a.name}</strong><span>{a.channelImpact}</span></div></div><div><span>Value Contribution</span><strong>+{money(a.valueImpact)}</strong>{a.included && <Badge>Included</Badge>}</div></div>)}</CardContent></Card><Card><CardHeader><CardTitle>How Attachments Influence the Decision</CardTitle></CardHeader><CardContent><p>Attachments and configuration are not treated as notes. They change buyer demand, use-case fit, and effective pricing by channel.</p><p>In some cases, attachments increase retail viability. In others, they add value but do not overcome major component condition issues. The engine weighs both together.</p></CardContent></Card></TabsContent>
      <TabsContent value="valuation"><div className="three-col"><FMVCard label="Retail FMV" data={asset.fmv.retail} /><FMVCard label="Wholesale FMV" data={asset.fmv.wholesale} /><FMVCard label="Auction FMV" data={asset.fmv.auction} /></div><Card><CardHeader><CardTitle>How Condition + Configuration Affect FMV</CardTitle><CardDescription>Major component condition and configuration drive how similar assets have historically sold in each channel, which sets the FMV ranges and recommendation.</CardDescription></CardHeader><CardContent><p>The engine does not treat value as a single condition score. Major component condition changes buyer confidence, while attachments and configuration change buyer demand, use-case fit, and upside by channel.</p><p>In this asset, both condition and configuration materially shape the FMV spread and the recommended path.</p></CardContent></Card></TabsContent>
      <TabsContent value="comps"><Card><CardHeader><CardTitle>Comparable Asset Outcomes</CardTitle></CardHeader><CardContent className="comps-layout"><div className="comps-table"><div className="comps-row comps-header"><span>Channel</span><span># Comps</span><span>Expected Net</span><span>Price Range</span></div>{Object.entries(asset.compsBreakdown).map(([channel, count]) => { const scenario = asset.scenarios.find((s) => s.name.toLowerCase().includes(channel)); const range = asset.fmv[channel]?.low ? `${money(asset.fmv[channel].low)} - ${money(asset.fmv[channel].high)}` : "N/A"; return <div key={channel} className={`comps-row ${channel === "wholesale" ? "highlight-row" : ""}`}><span>{channel}</span><span>{count} comps</span><span>{scenario ? money(scenario.net) : "N/A"}</span><span>{range}</span></div>; })}</div><div className="chart-placeholder">Dot chart placeholder</div></CardContent></Card></TabsContent>
      <TabsContent value="financial"><Card><CardHeader><CardTitle>Financial Impact</CardTitle><CardDescription>How expected recovery compares to booked residual assumptions.</CardDescription></CardHeader><CardContent><div className="three-col"><div className="metric-box"><span>Booked Residual</span><strong>$36,000</strong></div><div className="metric-box"><span>Expected Recovery</span><strong>{money(asset.recommendation.expectedNet)}</strong></div><div className="metric-box"><span>Variance</span><strong className={asset.recommendation.expectedNet >= 36000 ? "positive" : "negative"}>{money(asset.recommendation.expectedNet - 36000)}</strong></div></div><div className="metric-box"><span>Interpretation</span><p>This asset is projected {asset.recommendation.expectedNet >= 36000 ? "above" : "below"} residual based on channel selection and repair strategy.</p></div></CardContent></Card></TabsContent>
    </Tabs></>}
  </main></div>;
}

createRoot(document.getElementById("root")).render(<App />);
