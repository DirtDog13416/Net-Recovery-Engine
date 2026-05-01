import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function App() {
  const [started, setStarted] = useState(false);

  return (
    <div style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
      <h1>Net Recovery Engine™</h1>
      <p>
        From inspection upload → condition intelligence → configuration intelligence → channel decision
      </p>

      {!started ? (
        <button onClick={() => setStarted(true)}>Upload Inspection</button>
      ) : (
        <div style={{ marginTop: 20 }}>
          <h2>2019 Freightliner Cascadia</h2>
          <p>Memphis, TN · Condition Score 62 (Fair)</p>

          <h3>Recommendation</h3>
          <p><strong>Repair critical + move to Wholesale</strong></p>
          <p>Expected Net Recovery: $35,100</p>
          <p>Improvement: +$3,900</p>
          <p>Time to Liquidation: 14 days</p>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
