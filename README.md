# TrackVision (SIH26028)
### Dynamic Forecast of Expected Time of Arrival (ETA) for Coaching Trains
**Ministry of Railways — Smart India Hackathon**

TrackVision is a real-time, explainable, and forward-looking train-ETA prediction platform engineered specifically for Indian Railways operations and passengers.

---

## 🌟 Key Differentiators (Built & Demonstrated)

1. **Confidence-Scored ETAs with Margin Windows:**
   - Every forecast delivers `{ eta: "19:29", confidence: 0.88, marginMinutes: 6, primaryCause: "..." }`.
   - Never returns a bare timestamp. The Control Room and Passenger views both feature a visual confidence band.

2. **Signal-Aspect-Aware Delay Modeling:**
   - Ingests interlocking signal states (`green`, `double-yellow`, `yellow`, `red`) per block section.
   - Deceleration and signal holds are reflected in ETA drift *before* positional GPS lag appears.

3. **Downstream Congestion Propagation:**
   - Uses graph-based forward sweeps across upcoming route sections (up to 3 blocks downstream).
   - If a bottleneck exists at section C, trains approaching sections A and B are re-forecast proactively before encountering congestion.

4. **Multi-Day Journey Re-anchoring:**
   - Designed for long-distance multi-day coaching trains (e.g. 12952 Mumbai Rajdhani, 12621 Tamil Nadu Express).
   - Demonstrates day-by-day drift, overnight recovery-slack absorption, and morning re-anchoring.

5. **Explainable Delay-Cause Tagging:**
   - Delays are automatically classified and tagged: Temporary Speed Restrictions (TSR), downstream congestion, signal aspect dwell, or weather alerts.
   - Visual breakdown chart displays network-wide cause attribution.

---

## 🛠️ Architecture & Tech Stack

- **Backend:** Node.js (v26+) + Express REST API + WebSocket Server (`ws`)
- **Prediction Engine:** Integrated forward-pass graph propagation with signal multipliers, TSR adjustments, and dynamic confidence estimation
- **Frontend:** Responsive Control Room Dashboard & Passenger Reference Client built with Tailwind CSS, Leaflet for GIS track visualization, and Chart.js for cause analytics
- **Real-Time Feed:** Live WebSocket channel (`train:update`, `event:injected`) with fallback polling

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+) & npm

### Running the Platform
1. **Navigate to server:**
   ```bash
   cd server
   npm install
   npm start
   ```

2. **Open the Live Application:**
   Open your browser and navigate to:
   ```
   http://localhost:3001
   ```

---

## 🧭 Live Demo Script for Judges

1. **Control Room Overview:**
   - View all trains active on the Indian Railways schematic map with real-time positional interpolations.
   - Click any train from the left roster to view its specific ETA, route progress, and confidence score.
2. **Explainable Delay Tagging:**
   - Note the right panel's confidence band and the tagged cause (e.g. `TSR Section 3 (Track Renewal 45 km/h)`).
3. **Simulate Downstream Congestion Propagation:**
   - In the bottom simulation bar, select **"Congestion Spike (Downstream)"** on `sec-3 (AGC → GWL)`.
   - Click **"Trigger Re-Forecast"**.
   - Watch downstream trains re-forecast in real time before reaching the section.
4. **Multi-Day Re-Anchoring:**
   - Select multi-day train `12621 Tamil Nadu Express` (Day 2 of 3).
   - Click **"Advance Journey Day ⏩"** to see the system absorb overnight slack and re-anchor next-day predictions.
5. **Passenger Reference Client:**
   - Switch views via the **"Passenger App"** button in the header.
   - Search train `12952` to verify the same core API powers a clean, passenger-facing card with confidence and delay explanations.
