import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const assets = [
  {
    id: "high",
    label: "High Confidence Asset",
    header: "2019 Freightliner Cascadia",
    location: "Memphis, TN",
    conditionScore: 62,
    conditionBand: "Fair",
    comps: 42,
    compsBreakdown: { retail: 15, wholesale: 17, auction: 10 },
    compsDescription: "2018–2021 Cascadia · fair condition · engine-related defects · similar sleeper configuration",
    confidenceText:
      "Based on 42 comparable assets, similar units historically sold for higher net recovery in wholesale versus retail or auction, with more predictable outcomes.",
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
  },
  {
    id: "low",
    label: "Low Confidence Asset",
    header: "2018 Komatsu PC210LC",
    location: "Houston, TX",
    conditionScore: 58,
    conditionBand: "Fair",
    comps: 12,
    compsBreakdown: { retail: 3, wholesale: 5, auction: 4 },
    compsDescription: "2017–2019 excavators · mixed condition · hydraulic and undercarriage issues · variable attachment packages",
    confidenceText:
      "Based on 12 comparable assets, similar units sold across channels with wide variation in realized prices, making it harder to determine a clear best-performing path.",
    fmv: {
      retail: { low: 70800, high: 75600 },
      wholesale: { low: 66200, high: 71900 },
      auction: { low: 61500, high: 68700 },
    },
    components: [
      { name: "Hydraulics", score: 4, band: "Poor", impact: "High", note: "Major driver of buyer uncertainty across all channels." },
      { name: "Undercarriage", score: 5, band: "Fair", impact: "High", note: "Wide valuation spread because replacement timing is uncertain." },
      { name: "Engine", score: 7, band: "Fair", impact: "Medium", note: "Not a primary issue, but not a premium signal either." },
      { name: "Cab / Controls", score: 6, band: "Fair", impact: "Low", note: "Secondary influence on channel preference." },
    ],
    attachments: [
      { name: "Hydraulic Thumb", valueImpact: 6200, channelImpact: "Meaningfully improves retail and wholesale buyer appeal, but comparable sets are thin.", included: true },
      { name: "Quick Coupler", valueImpact: 2100, channelImpact: "Adds flexibility for end users, improving retail upside when condition supports it.", included: true },
      { name: "Auxiliary Piping", valueImpact: 900, channelImpact: "Minor positive impact, but not enough to overcome core hydraulic uncertainty.", included: true },
    ],
    defects: [
      { component: "Hydraulics", name: "Hydraulic seep", action: "Repair hydraulic seep", impact: -3800, repair: 2200, recommended: false },
      { component: "Undercarriage", name: "Track wear", action: "Evaluate track replacement", impact: -2900, repair: 3100, recommended: false },
      { component: "Cab / Controls", name: "Cab glass crack", action: "Replace cab glass", impact: -700, repair: 350, recommended: false },
    ],
    baseline: { path: "Retail (default)", net: 64800, days: 31 },
    recommendation: {
      action: "Consider Wholesale, but review case-by-case",
      channel: "Wholesale",
      expectedNet: 65700,
      lift: 900,
      days: 18,
      why: [
        "Wholesale may reduce time exposure, but the outcome spread is wide.",
        "Hydraulic and undercarriage condition create more channel uncertainty than normal.",
        "Attachments add upside, but comparable attachment-adjusted cases are limited."
      ]
    },
    scenarios: [
      { name: "Retail (baseline)", net: 64800, days: 31, note: "Potential upside exists, but time and condition exposure are elevated." },
      { name: "Wholesale (as-is)", net: 65700, days: 18, note: "Slight expected lift, but not a decisive advantage.", recommended: true },
      { name: "Repair + Wholesale", net: 65100, days: 23, note: "Repair case is inconclusive with current comp set." },
      { name: "Auction", net: 63100, days: 11, note: "Useful for speed, but expected recovery is lower." },
    ],
  },
];

const portfolioBehavior = {
  current: { retail: 65, wholesale: 25, auction: 10 },
  suggested: { retail: 30, wholesale: 50, auction: 20 },
};

// Assumptions tuned for large bank portfolios (more realistic for enterprise conversations)
// Assumptions tuned for large bank portfolios (grounded in observed dollar deltas, not % of value)
const impactAssumptions = {
  misroutedRate: 0.20, // 20% of assets meaningfully misrouted
  avgLiftPerAssetLow: 1500, // conservative observed lift per misrouted asset
  avgLiftPerAssetHigh: 4000, // upper observed lift per misrouted asset
};

function money(v) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);
}

function bandColor(score) {
  if (score <= 4) return "bg-red-500";
  if (score <= 6) return "bg-amber-500";
  return "bg-emerald-500";
}

function PercentBar({ label, value, dark = false }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
        <div className={dark ? "h-full bg-slate-900" : "h-full bg-slate-500"} style={{ width: `${value}%` }} />
    </div>
  </div>
  );
}

function FMVCard({ label, data }) {
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardContent className="p-4">
        <div className="text-sm text-slate-500">{label}</div>
        <div className="text-xl font-semibold mt-1">{money(data.low)} – {money(data.high)}</div>
      </CardContent>
    </Card>
  );
}

function deriveScaledFMV(asset) {
  const auctionMid = (asset.fmv.auction.low + asset.fmv.auction.high) / 2;
  const conditionFactor = Math.max(0.65, Math.min(1.15, asset.conditionScore / 70));
  const configValue = asset.attachments
    .filter((a) => a.included)
    .reduce((sum, a) => sum + a.valueImpact, 0);
  const configFactor = Math.min(0.08, configValue / Math.max(auctionMid, 1) * 0.35);
  const retailPremium = Math.max(0.08, Math.min(0.32, 0.18 * conditionFactor + configFactor));
  const wholesalePremium = Math.max(0.04, Math.min(0.18, 0.10 * conditionFactor + configFactor * 0.6));
  const spread = Math.max(1200, auctionMid * 0.035);

  const rangeFromMid = (mid) => ({
    low: Math.round((mid - spread) / 100) * 100,
    high: Math.round((mid + spread) / 100) * 100,
  });

  return {
    auction: asset.fmv.auction,
    wholesale: rangeFromMid(auctionMid * (1 + wholesalePremium)),
    retail: rangeFromMid(auctionMid * (1 + retailPremium)),
  };
}

function NumberInput({ label, value, onChange, prefix = "" }) {
  const formatNumber = (num) => {
    if (!num && num !== 0) return "";
    return new Intl.NumberFormat("en-US").format(num);
  };

  const [text, setText] = useState(formatNumber(value));

  function handleChange(e) {
    const raw = e.target.value.replace(/[^0-9]/g, "");

    if (raw === "") {
      setText("");
      onChange(0);
      return;
    }

    const num = parseInt(raw, 10);
    setText(formatNumber(num));
    onChange(num);
  }

  return (
    <label className="space-y-1 block">
      <div className="text-sm text-slate-600">{label}</div>
      <div className="flex items-center rounded-2xl border bg-white px-3 py-2">
        {prefix && <span className="text-slate-500 mr-1">{prefix}</span>}
        <input
          inputMode="numeric"
          placeholder="Enter value"
          value={text}
          onChange={handleChange}
          className="w-full bg-transparent outline-none text-sm"
        />
      </div>
    </label>
  );
}

export default function NetRecoveryEngineDemo() {
  const [selected, setSelected] = useState("high");
  const [started, setStarted] = useState(false);
  const [tab, setTab] = useState("decision");
  const [assetCount, setAssetCount] = useState(8000);
  const [averageAssetValue, setAverageAssetValue] = useState(65000);
  

  const asset = useMemo(() => assets.find((a) => a.id === selected), [selected]);
  const portfolioValue = assetCount * averageAssetValue;
  const estimatedMisroutedAssets = Math.round(assetCount * impactAssumptions.misroutedRate);
  const avgLiftPerMisroutedAssetLow = impactAssumptions.avgLiftPerAssetLow;
  const avgLiftPerMisroutedAssetHigh = impactAssumptions.avgLiftPerAssetHigh;
  const estimatedOpportunityLow = estimatedMisroutedAssets * avgLiftPerMisroutedAssetLow;
  const estimatedOpportunityHigh = estimatedMisroutedAssets * avgLiftPerMisroutedAssetHigh;
  const recommendedRepairs = asset.defects.filter((d) => d.recommended);
  const totalRepairCost = recommendedRepairs.reduce((sum, d) => sum + d.repair, 0);
  const totalValueImpactAddressed = recommendedRepairs.reduce((sum, d) => sum + Math.abs(d.impact), 0);
  const netRepairBenefit = totalValueImpactAddressed - totalRepairCost;
  const channelLift = ((asset.scenarios.find((s) => s.name === "Wholesale (as-is)")?.net ?? asset.baseline.net) - asset.baseline.net);
  const scaledFMV = deriveScaledFMV(asset);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-semibold">Net Recovery Engine<sup className="text-base ml-1">™</sup></h1>
            <p className="text-slate-600 mt-1">From inspection upload → condition intelligence → configuration intelligence → channel decision</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button onClick={() => setStarted(true)} className="rounded-2xl">
              ↥ Upload Inspection
            </Button>
          </div>
        </div>

        <Card className="rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle>Portfolio Behavior</CardTitle>
            <CardDescription>How current channel behavior compares to NRE-guided channel mix</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="text-sm font-medium text-slate-700">Current Portfolio Behavior</div>
              <PercentBar label="Retail" value={portfolioBehavior.current.retail} dark />
              <PercentBar label="Wholesale" value={portfolioBehavior.current.wholesale} dark />
              <PercentBar label="Auction" value={portfolioBehavior.current.auction} dark />
            </div>
            <div className="space-y-4">
              <div className="text-sm font-medium text-slate-700">NRE Suggested Distribution</div>
              <PercentBar label="Retail" value={portfolioBehavior.suggested.retail} />
              <PercentBar label="Wholesale" value={portfolioBehavior.suggested.wholesale} />
              <PercentBar label="Auction" value={portfolioBehavior.suggested.auction} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle>Portfolio Impact</CardTitle>
            <CardDescription>Portfolio Impact is driven by optimizing channel behavior above.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <NumberInput label="Assets per Year" value={assetCount} onChange={setAssetCount} />
              <NumberInput label="Average Asset Value" value={averageAssetValue} onChange={setAverageAssetValue} prefix="$" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl bg-slate-100 p-4">
                <div className="text-slate-500">Estimated Annual Opportunity</div>
                <div className="text-xl md:text-2xl font-semibold mt-1 whitespace-nowrap">{money(estimatedOpportunityLow)} – {money(estimatedOpportunityHigh)}</div>
                <div className="text-slate-600 mt-1">Scaled to this portfolio size</div>
              </div>
              <div className="rounded-2xl bg-slate-100 p-4">
                <div className="text-slate-500">Avg Lift per Missed Decision</div>
                <div className="text-2xl font-semibold mt-1">{money(avgLiftPerMisroutedAssetLow)} – {money(avgLiftPerMisroutedAssetHigh)}</div>
                <div className="text-slate-600 mt-1">Estimated across misrouted assets</div>
              </div>
              <div className="rounded-2xl bg-slate-100 p-4">
                <div className="text-slate-500">Opportunity Assets</div>
                <div className="text-2xl font-semibold mt-1">~{estimatedMisroutedAssets}</div>
                <div className="text-slate-600 mt-1">Based on ~20% potential misrouting</div>
              </div>
            </div>

            <div className="text-xs text-slate-500">
              Assumption for demo: ~20% of assets may be misrouted, with ~$1.5K–$4K lift per misrouted asset based on observed differences across channels.
            </div>
          </CardContent>
        </Card>

        {!started && (
          <Card className="rounded-3xl border-dashed border-2 shadow-sm">
            <CardContent className="p-8 text-center text-slate-600">
              Upload an inspection to generate the decision report, FMV ranges, major component condition, configuration analysis, comparable asset set, and recommendation logic.
            </CardContent>
          </Card>
        )}

        {started && (
          <>
            

            <Card className="rounded-3xl shadow-sm">
              <CardHeader>
                <CardTitle>{asset.header}</CardTitle>
                <CardDescription>{asset.location} · Condition Score {asset.conditionScore} ({asset.conditionBand})</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="rounded-2xl bg-slate-100 p-4">
                  <div className="text-slate-500">Comparable Assets</div>
                  <div className="text-2xl font-semibold mt-1">{asset.comps}</div>
                  <div className="text-slate-600 mt-1">{asset.compsDescription}</div>
                </div>
                <div className="rounded-2xl bg-slate-100 p-4">
                  <div className="text-slate-500">Current Path</div>
                  <div className="font-semibold mt-1">{asset.baseline.path}</div>
                  <div className="text-slate-600 mt-1">{money(asset.baseline.net)} · {asset.baseline.days} days</div>
                </div>
                <div className="rounded-2xl bg-slate-100 p-4">
                  <div className="text-slate-500">Recommended Channel</div>
                  <div className="font-semibold mt-1">{asset.recommendation.channel}</div>
                  <div className="text-slate-600 mt-1">Expected Lift {money(asset.recommendation.lift)}</div>
                </div>
                <div className="rounded-2xl bg-slate-100 p-4">
                  <div className="text-slate-500">Configuration</div>
                  <div className="text-2xl font-semibold mt-1">{asset.attachments.filter(a => a.included).length}</div>
                  <div className="text-slate-600 mt-1">Included in pricing and channel logic</div>
                </div>
              </CardContent>
            </Card>

            <Tabs value={tab} onValueChange={setTab} className="space-y-6">
              <TabsList className="sticky top-4 z-30 grid grid-cols-7 w-full max-w-5xl rounded-2xl bg-white shadow-sm">
                <TabsTrigger value="decision">Recommendation</TabsTrigger>
                <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
                <TabsTrigger value="condition">Condition</TabsTrigger>
                <TabsTrigger value="attachments">Configuration</TabsTrigger>
                <TabsTrigger value="valuation">FMV</TabsTrigger>
                <TabsTrigger value="comps">Comps</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
              </TabsList>

              <TabsContent value="decision" className="space-y-6">
                <Card className="bg-black text-white rounded-3xl shadow-sm border-0">
                  <CardContent className="p-6 space-y-4">
                    <div className="text-xs tracking-wide text-white/60">ACTION</div>
                    <div className="text-3xl font-bold">{asset.recommendation.action}</div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-white/20">
                      <div>
                        <div className="text-xs text-white/60">Expected Net Recovery</div>
                        <div className="text-xl font-semibold">{money(asset.recommendation.expectedNet)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-white/60">Improvement vs Current Path</div>
                        <div className="text-xl font-semibold">+{money(asset.recommendation.lift)}</div>
                        <div className="text-xs text-white/60 mt-1">Channel: +{money(channelLift)} · Repairs: +{money(netRepairBenefit)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-white/60">Time to Liquidation</div>
                        <div className="text-xl font-semibold">{asset.recommendation.days} days</div>
                      </div>
                    </div>

                    
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="rounded-3xl shadow-sm">
                    <CardHeader>
                      <CardTitle>Why This Decision</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-slate-700">
                      {asset.recommendation.why.map((line) => (
                        <div key={line} className="flex gap-3">
                          <span className="mt-0.5 text-slate-500">✓</span>
                          <span>{line}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="rounded-3xl shadow-sm">
                    <CardHeader>
                      <CardTitle>Why Not Other Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-slate-700">
                      {asset.scenarios.filter((s) => !s.recommended).map((s) => (
                        <div key={s.name} className="border-b pb-3 last:border-b-0">
                          <div className="font-medium text-slate-900">{s.name}</div>
                          <div>{s.note}</div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="valuation" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FMVCard label="Retail FMV" data={scaledFMV.retail} />
                  <FMVCard label="Wholesale FMV" data={scaledFMV.wholesale} />
                  <FMVCard label="Auction FMV" data={scaledFMV.auction} />
                </div>
                <Card className="rounded-3xl shadow-sm">
                  <CardHeader>
                    <CardTitle>How Condition + Configuration Affect FMV</CardTitle>
                    <CardDescription>Auction provides the market anchor. Wholesale and retail ranges scale from that anchor based on asset value, condition, and configuration.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-slate-700">
                    <p>
                      The engine does not treat value as a single condition score. Major component condition changes buyer confidence, while attachments and configuration change buyer demand, use-case fit, and upside by channel.
                    </p>
                    <p>
                      In this asset, both condition and configuration materially shape the FMV spread and the recommended path.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comps" className="space-y-6">
                <Card className="rounded-3xl shadow-sm">
                  <CardHeader>
                    <CardTitle>Comparable Asset Outcomes</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* LEFT: compact table */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-4 py-2 text-sm font-semibold text-slate-700 border-b">
                        <div className="w-24">Channel</div>
                        <div className="w-24"># Comps</div>
                        <div className="w-32">Expected Net</div>
                        <div className="w-32">Price Range</div>
                      </div>
                      {Object.entries(asset.compsBreakdown).map(([channel, count]) => {
                        const scenario = asset.scenarios.find((s) => s.name.toLowerCase().includes(channel));
                        const channelFmv = channel === "retail" ? scaledFMV.retail : channel === "wholesale" ? scaledFMV.wholesale : scaledFMV.auction;
                        const range = channelFmv?.low ? `${money(channelFmv.low)} – ${money(channelFmv.high)}` : "N/A";
                        return (
                          <div key={channel} className={`flex items-center gap-4 py-2 px-2 text-sm rounded-xl ${channel === "wholesale" ? "bg-slate-100" : "bg-white"}`}>
                            <div className="w-24 capitalize font-medium text-slate-800">{channel}</div>
                            <div className="w-24 text-slate-500">{count} comps</div>
                            <div className="w-32 font-medium text-slate-800">{scenario ? money(scenario.net) : "N/A"}</div>
                            <div className="w-32 text-slate-500">{range}</div>
                          </div>
                        );
                      })}
                    </div>

                    {/* RIGHT: reserved for dot chart */}
                    <div className="rounded-2xl bg-slate-100 p-4 aspect-square flex items-center justify-center text-sm text-slate-500 border border-dashed">
                      Dot chart placeholder
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="condition" className="space-y-6">
                <Card className="rounded-3xl shadow-sm">
                  <CardHeader>
                    <CardTitle>Major Component Condition</CardTitle>
                    <CardDescription>These component scores feed channel FMV and recommendation logic.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {asset.components.map((c) => (
                      <div key={c.name} className="rounded-2xl border p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="font-medium text-slate-900">{c.name}</div>
                            <div className="text-sm text-slate-600 mt-1">{c.note}</div>
                          </div>
                          <div className="min-w-[140px] text-right">
                            <div className="text-sm text-slate-500">{c.band}</div>
                            <div className="flex items-center justify-end gap-2 mt-1">
                              <div className={`w-2.5 h-2.5 rounded-full ${bandColor(c.score)}`} />
                              <span className="font-semibold">{c.score}/10</span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1">Impact: {c.impact}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="rounded-3xl shadow-sm">
                  <CardHeader>
                    <CardTitle>Recommended Repairs</CardTitle>
                    <CardDescription>Repairs selected for the recommended path, grouped by major component.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {recommendedRepairs.map((d) => (
                      <div key={d.name} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">⚠</span>
                          <div>
                            <div className="font-medium text-slate-900">{d.component}: {d.name}</div>
                            <div className="text-slate-600">Action: {d.action}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div>Value Impact: {money(d.impact)}</div>
                          <div>Repair Cost: {money(d.repair)}</div>
                        </div>
                      </div>
                    ))}
                    <div className="rounded-2xl bg-slate-100 p-4 flex items-center justify-between font-medium">
                      <span>Total Recommended Repair Cost</span>
                      <span>{money(totalRepairCost)}</span>
                    </div>
                    <div className="rounded-2xl bg-slate-100 p-4 flex items-center justify-between font-medium">
                      <span>Estimated Value Restored</span>
                      <span>{money(totalValueImpactAddressed)}</span>
                    </div>
                    <div className="rounded-2xl bg-slate-100 p-4 flex items-center justify-between font-medium">
                      <span>Net Repair Benefit</span>
                      <span>{money(netRepairBenefit)}</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="attachments" className="space-y-6">
                <Card className="rounded-3xl shadow-sm">
                  <CardHeader>
                    <CardTitle>Attachments & Configuration</CardTitle>
                    <CardDescription>Included directly in pricing and channel recommendation logic.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {asset.attachments.map((a) => (
                      <div key={a.name} className="rounded-2xl border p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-3">
                            <span className="text-slate-500 mt-0.5">⚙</span>
                            <div>
                              <div className="font-medium text-slate-900">{a.name}</div>
                              <div className="text-sm text-slate-600 mt-1">{a.channelImpact}</div>
                            </div>
                          </div>
                          <div className="text-right min-w-[140px]">
                            <div className="text-sm text-slate-500">Value Contribution</div>
                            <div className="font-semibold">+{money(a.valueImpact)}</div>
                            {a.included && <Badge className="rounded-full mt-2">Included</Badge>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="rounded-3xl shadow-sm">
                  <CardHeader>
                    <CardTitle>How Attachments Influence the Decision</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-slate-700">
                    <p>
                      Attachments and configuration are not treated as notes. They change buyer demand, use-case fit, and effective pricing by channel.
                    </p>
                    <p>
                      In some cases, attachments increase retail viability. In others, they add value but do not overcome major component condition issues. The engine weighs both together.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="scenarios" className="space-y-6">
                <Card className="rounded-3xl shadow-sm">
                  <CardHeader>
                    <CardTitle>Scenario Comparison</CardTitle>
                    <CardDescription>Each path reflects how similar assets have actually sold (net recovery) and how long they took to liquidate.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {asset.scenarios.map((s) => (
                      <div key={s.name} className={`rounded-2xl border p-4 ${s.recommended ? "border-slate-900 bg-slate-50" : ""}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-medium text-slate-900">{s.name}</div>
                            <div className="text-sm text-slate-600 mt-1">{s.note}</div>
                          </div>
                          <div className="flex flex-col items-end gap-1 min-w-[160px]">
                            <div className="font-semibold">{money(s.net)}</div>
                            <div className="text-sm text-slate-500">{s.days} days</div>
                            {s.recommended && (
                              <div className="mt-1 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold">
                                RECOMMENDED
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="financial" className="space-y-6">
                <Card className="rounded-3xl shadow-sm">
                  <CardHeader>
                    <CardTitle>Financial Impact</CardTitle>
                    <CardDescription>How expected recovery compares to booked residual assumptions.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="rounded-2xl bg-slate-100 p-4">
                        <div className="text-slate-500">Booked Residual</div>
                        <div className="text-2xl font-semibold mt-1">$36,000</div>
                      </div>
                      <div className="rounded-2xl bg-slate-100 p-4">
                        <div className="text-slate-500">Expected Recovery</div>
                        <div className="text-2xl font-semibold mt-1">{money(asset.recommendation.expectedNet)}</div>
                      </div>
                      <div className="rounded-2xl bg-slate-100 p-4">
                        <div className="text-slate-500">Variance</div>
                        <div className={`text-2xl font-semibold mt-1 ${asset.recommendation.expectedNet >= 36000 ? "text-emerald-600" : "text-red-600"}`}>
                          {money(asset.recommendation.expectedNet - 36000)}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-100 p-4">
                      <div className="text-slate-500">Interpretation</div>
                      <div className="mt-1 text-slate-700">
                        This asset is projected {asset.recommendation.expectedNet >= 36000 ? "above" : "below"} residual based on channel selection and repair strategy.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
        <footer className="mt-10 pt-6 border-t text-center text-xs text-slate-500">
          © 2026 Net Recovery Engine. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
