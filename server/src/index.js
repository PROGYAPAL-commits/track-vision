import http from "http";
import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";

const app = express();
app.use(cors());
app.use(express.json());
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientPublicPath = path.resolve(__dirname, "../../client/public");
app.use(express.static(clientPublicPath));
app.get("/", (req, res) => {
  res.sendFile(path.join(clientPublicPath, "index.html"));
});


// In-Memory Seed Data
let stations = [
  { code: "NDLS", name: "New Delhi", lat: 28.6139, lng: 77.2090, zone: "NR" },
  { code: "MTJ", name: "Mathura Jn", lat: 27.4924, lng: 77.6737, zone: "NCR" },
  { code: "AGC", name: "Agra Cantt", lat: 27.1767, lng: 78.0081, zone: "NCR" },
  { code: "GWL", name: "Gwalior", lat: 26.2183, lng: 78.1828, zone: "NCR" },
  { code: "JHS", name: "Jhansi", lat: 25.4484, lng: 78.5685, zone: "NCR" },
  { code: "BPL", name: "Bhopal", lat: 23.2599, lng: 77.4126, zone: "WCR" },
  { code: "ET", name: "Itarsi", lat: 22.6155, lng: 77.7523, zone: "WCR" },
  { code: "KNW", name: "Khandwa", lat: 21.8243, lng: 76.3527, zone: "WCR" },
  { code: "BSL", name: "Bhusaval", lat: 21.0440, lng: 75.7850, zone: "CR" },
  { code: "NK", name: "Nashik Road", lat: 19.9975, lng: 73.7898, zone: "CR" },
  { code: "KYN", name: "Kalyan", lat: 19.2437, lng: 73.1355, zone: "CR" },
  { code: "BCT", name: "Mumbai Central", lat: 18.9712, lng: 72.8194, zone: "WR" },
  { code: "HWH", name: "Howrah", lat: 22.5839, lng: 88.3428, zone: "ER" },
  { code: "KGP", name: "Kharagpur", lat: 22.3460, lng: 87.3237, zone: "SER" },
  { code: "VSKP", name: "Visakhapatnam", lat: 17.7215, lng: 83.3025, zone: "ECoR" },
  { code: "BZA", name: "Vijayawada", lat: 16.5193, lng: 80.6305, zone: "SCR" },
  { code: "MAS", name: "Chennai Central", lat: 13.0827, lng: 80.2707, zone: "SR" }
];

let sections = [
  { id: "sec-1", fromStation: "NDLS", toStation: "MTJ", distanceKm: 141, scheduledMinutes: 95, currentSignalAspect: "green", congestionLevel: 0.15, activeTSR: { active: false, maxSpeedKmh: 110, reason: null } },
  { id: "sec-2", fromStation: "MTJ", toStation: "AGC", distanceKm: 54, scheduledMinutes: 40, currentSignalAspect: "green", congestionLevel: 0.2, activeTSR: { active: false, maxSpeedKmh: 100, reason: null } },
  { id: "sec-3", fromStation: "AGC", toStation: "GWL", distanceKm: 118, scheduledMinutes: 80, currentSignalAspect: "yellow", congestionLevel: 0.45, activeTSR: { active: true, maxSpeedKmh: 45, reason: "Track Renewal" } },
  { id: "sec-4", fromStation: "GWL", toStation: "JHS", distanceKm: 101, scheduledMinutes: 70, currentSignalAspect: "green", congestionLevel: 0.1, activeTSR: { active: false, maxSpeedKmh: 110, reason: null } },
  { id: "sec-5", fromStation: "JHS", toStation: "BPL", distanceKm: 292, scheduledMinutes: 185, currentSignalAspect: "green", congestionLevel: 0.35, activeTSR: { active: false, maxSpeedKmh: 120, reason: null } },
  { id: "sec-6", fromStation: "BPL", toStation: "ET", distanceKm: 90, scheduledMinutes: 55, currentSignalAspect: "double-yellow", congestionLevel: 0.65, activeTSR: { active: false, maxSpeedKmh: 80, reason: null } },
  { id: "sec-7", fromStation: "ET", toStation: "KNW", distanceKm: 167, scheduledMinutes: 110, currentSignalAspect: "green", congestionLevel: 0.3, activeTSR: { active: false, maxSpeedKmh: 100, reason: null } },
  { id: "sec-8", fromStation: "KNW", toStation: "BSL", distanceKm: 128, scheduledMinutes: 85, currentSignalAspect: "green", congestionLevel: 0.25, activeTSR: { active: false, maxSpeedKmh: 110, reason: null } },
  { id: "sec-9", fromStation: "BSL", toStation: "NK", distanceKm: 189, scheduledMinutes: 130, currentSignalAspect: "green", congestionLevel: 0.15, activeTSR: { active: false, maxSpeedKmh: 110, reason: null } },
  { id: "sec-10", fromStation: "NK", toStation: "KYN", distanceKm: 153, scheduledMinutes: 105, currentSignalAspect: "green", congestionLevel: 0.5, activeTSR: { active: false, maxSpeedKmh: 75, reason: "Ghat Section" } },
  { id: "sec-11", fromStation: "KYN", toStation: "BCT", distanceKm: 54, scheduledMinutes: 40, currentSignalAspect: "yellow", congestionLevel: 0.7, activeTSR: { active: false, maxSpeedKmh: 60, reason: "Suburban Traffic" } },
  { id: "sec-12", fromStation: "HWH", toStation: "KGP", distanceKm: 114, scheduledMinutes: 75, currentSignalAspect: "green", congestionLevel: 0.3, activeTSR: { active: false, maxSpeedKmh: 100, reason: null } },
  { id: "sec-13", fromStation: "KGP", toStation: "VSKP", distanceKm: 600, scheduledMinutes: 450, currentSignalAspect: "green", congestionLevel: 0.2, activeTSR: { active: false, maxSpeedKmh: 110, reason: null } },
  { id: "sec-14", fromStation: "VSKP", toStation: "BZA", distanceKm: 350, scheduledMinutes: 270, currentSignalAspect: "green", congestionLevel: 0.25, activeTSR: { active: false, maxSpeedKmh: 110, reason: null } },
  { id: "sec-15", fromStation: "BZA", toStation: "MAS", distanceKm: 432, scheduledMinutes: 330, currentSignalAspect: "green", congestionLevel: 0.4, activeTSR: { active: false, maxSpeedKmh: 110, reason: null } }
];

let trains = [
  {
    number: "12952",
    name: "Mumbai Rajdhani Express",
    type: "rajdhani",
    sourceStation: "NDLS",
    destStation: "BCT",
    multiDay: true,
    totalDays: 2,
    currentStatus: { currentSectionIndex: 2, positionInSection: 0.45, currentDelayMinutes: 14, speed: 78, dayOfJourney: 1 },
    route: [
      { stationCode: "NDLS", scheduledDeparture: "16:55", dayNumber: 1, distKm: 0 },
      { stationCode: "MTJ", scheduledArrival: "18:30", scheduledDeparture: "18:32", dayNumber: 1, distKm: 141 },
      { stationCode: "AGC", scheduledArrival: "19:12", scheduledDeparture: "19:15", dayNumber: 1, distKm: 195 },
      { stationCode: "GWL", scheduledArrival: "20:35", scheduledDeparture: "20:37", dayNumber: 1, distKm: 313 },
      { stationCode: "JHS", scheduledArrival: "21:45", scheduledDeparture: "21:50", dayNumber: 1, distKm: 414 },
      { stationCode: "BPL", scheduledArrival: "00:55", scheduledDeparture: "01:00", dayNumber: 2, distKm: 706 },
      { stationCode: "ET", scheduledArrival: "01:55", scheduledDeparture: "02:00", dayNumber: 2, distKm: 796 },
      { stationCode: "KNW", scheduledArrival: "03:50", scheduledDeparture: "03:52", dayNumber: 2, distKm: 963 },
      { stationCode: "BSL", scheduledArrival: "05:15", scheduledDeparture: "05:20", dayNumber: 2, distKm: 1091 },
      { stationCode: "NK", scheduledArrival: "07:25", scheduledDeparture: "07:30", dayNumber: 2, distKm: 1280 },
      { stationCode: "KYN", scheduledArrival: "09:15", scheduledDeparture: "09:20", dayNumber: 2, distKm: 1433 },
      { stationCode: "BCT", scheduledArrival: "10:00", dayNumber: 2, distKm: 1487 }
    ]
  },
  {
    number: "12621",
    name: "Tamil Nadu Express",
    type: "superfast",
    sourceStation: "MAS",
    destStation: "NDLS",
    multiDay: true,
    totalDays: 3,
    currentStatus: { currentSectionIndex: 1, positionInSection: 0.7, currentDelayMinutes: 28, speed: 82, dayOfJourney: 2 },
    route: [
      { stationCode: "MAS", scheduledDeparture: "22:00", dayNumber: 1, distKm: 0 },
      { stationCode: "BZA", scheduledArrival: "04:15", scheduledDeparture: "04:25", dayNumber: 2, distKm: 432 },
      { stationCode: "VSKP", scheduledArrival: "09:30", scheduledDeparture: "09:50", dayNumber: 2, distKm: 782 },
      { stationCode: "GWL", scheduledArrival: "03:10", scheduledDeparture: "03:15", dayNumber: 3, distKm: 1869 },
      { stationCode: "AGC", scheduledArrival: "04:30", scheduledDeparture: "04:35", dayNumber: 3, distKm: 1987 },
      { stationCode: "NDLS", scheduledArrival: "07:05", dayNumber: 3, distKm: 2182 }
    ]
  },
  {
    number: "12002",
    name: "Bhopal Shatabdi",
    type: "shatabdi",
    sourceStation: "NDLS",
    destStation: "BPL",
    multiDay: false,
    totalDays: 1,
    currentStatus: { currentSectionIndex: 1, positionInSection: 0.85, currentDelayMinutes: 2, speed: 115, dayOfJourney: 1 },
    route: [
      { stationCode: "NDLS", scheduledDeparture: "06:00", dayNumber: 1, distKm: 0 },
      { stationCode: "MTJ", scheduledArrival: "07:19", scheduledDeparture: "07:20", dayNumber: 1, distKm: 141 },
      { stationCode: "AGC", scheduledArrival: "07:50", scheduledDeparture: "07:55", dayNumber: 1, distKm: 195 },
      { stationCode: "GWL", scheduledArrival: "09:23", scheduledDeparture: "09:28", dayNumber: 1, distKm: 313 },
      { stationCode: "JHS", scheduledArrival: "10:45", scheduledDeparture: "10:50", dayNumber: 1, distKm: 414 },
      { stationCode: "BPL", scheduledArrival: "14:05", dayNumber: 1, distKm: 706 }
    ]
  },
  {
    number: "12839",
    name: "Howrah - Chennai Mail",
    type: "mail",
    sourceStation: "HWH",
    destStation: "MAS",
    multiDay: true,
    totalDays: 2,
    currentStatus: { currentSectionIndex: 0, positionInSection: 0.6, currentDelayMinutes: 9, speed: 85, dayOfJourney: 1 },
    route: [
      { stationCode: "HWH", scheduledDeparture: "23:55", dayNumber: 1, distKm: 0 },
      { stationCode: "KGP", scheduledArrival: "01:30", scheduledDeparture: "01:35", dayNumber: 2, distKm: 114 },
      { stationCode: "VSKP", scheduledArrival: "10:20", scheduledDeparture: "10:40", dayNumber: 2, distKm: 714 },
      { stationCode: "BZA", scheduledArrival: "16:45", scheduledDeparture: "17:00", dayNumber: 2, distKm: 1064 },
      { stationCode: "MAS", scheduledArrival: "03:15", dayNumber: 3, distKm: 1496 }
    ]
  }
];

// Graph helper for downstream congestion propagation
function getDownstreamCongestionMultiplier(fromCode, toCode, remainingRoute) {
  let impactDelay = 0;
  let penaltyCause = null;
  
  // Check direct section
  const directSec = sections.find(s => s.fromStation === fromCode && s.toStation === toCode);
  if (directSec) {
    if (directSec.currentSignalAspect === "red") impactDelay += 18;
    else if (directSec.currentSignalAspect === "yellow") impactDelay += 7;
    else if (directSec.currentSignalAspect === "double-yellow") impactDelay += 3;
    
    if (directSec.activeTSR?.active) {
      impactDelay += Math.round((100 / (directSec.activeTSR.maxSpeedKmh || 40)) * 6);
      penaltyCause = `TSR (${directSec.activeTSR.reason || "Speed Limit"})`;
    }
    if (directSec.congestionLevel > 0.4) {
      impactDelay += Math.round(directSec.congestionLevel * 14);
      if (!penaltyCause) penaltyCause = `Downstream Congestion (${Math.round(directSec.congestionLevel * 100)}%)`;
    }
  }

  // Forward looking: inspect up to 3 blocks ahead in remainingRoute
  for (let k = 0; k < Math.min(3, remainingRoute.length - 1); k++) {
    const sF = remainingRoute[k].stationCode;
    const sT = remainingRoute[k + 1].stationCode;
    const sec = sections.find(s => s.fromStation === sF && s.toStation === sT);
    if (sec && sec.congestionLevel >= 0.5) {
      const propImpact = Math.round((sec.congestionLevel * 8) / (k + 1));
      impactDelay += propImpact;
      if (!penaltyCause) {
        penaltyCause = `Bottleneck at ${sF}-${sT} (${Math.round(sec.congestionLevel*100)}% load)`;
      }
    }
  }

  return { impactDelay, penaltyCause };
}

// Prediction Generator with Confidence & Explainability
function calculatePredictions(train) {
  const currentIdx = train.currentStatus.currentSectionIndex;
  const currentDelay = train.currentStatus.currentDelayMinutes;
  const route = train.route;
  let accumulatedDelay = currentDelay;
  
  const predictions = [];
  const remaining = route.slice(currentIdx);

  for (let i = currentIdx + 1; i < route.length; i++) {
    const prevStop = route[i - 1];
    const targetStop = route[i];
    
    const { impactDelay, penaltyCause } = getDownstreamCongestionMultiplier(
      prevStop.stationCode,
      targetStop.stationCode,
      remaining
    );
    
    accumulatedDelay += impactDelay;

    // Confidence decreases with distance and congestion volatility
    const distanceFactor = (i - currentIdx) * 0.04;
    const congestionFactor = Math.min(0.25, accumulatedDelay * 0.005);
    const confidence = Math.max(0.45, Math.min(0.96, Number((0.98 - distanceFactor - congestionFactor).toFixed(2))));
    const marginMinutes = Math.max(2, Math.round((1 - confidence) * 22));

    // Determine primary cause
    let primaryCause = "Normal Running";
    let breakdown = [];
    if (accumulatedDelay > 2) {
      if (penaltyCause) {
        primaryCause = penaltyCause;
      } else if (accumulatedDelay > 15) {
        primaryCause = "Operational Dwell & Cascading Congestion";
      } else {
        primaryCause = "Section Line Occupancy";
      }
      breakdown = [
        { cause: "Congestion", contributionMinutes: Math.round(accumulatedDelay * 0.45) },
        { cause: "Signal Aspect Dwell", contributionMinutes: Math.round(accumulatedDelay * 0.3) },
        { cause: "TSR Restrictions", contributionMinutes: Math.round(accumulatedDelay * 0.25) }
      ];
    }

    // Synthesize ETA Time
    const schedTime = targetStop.scheduledArrival || targetStop.scheduledDeparture || "12:00";
    const [hh, mm] = schedTime.split(":").map(Number);
    const now = new Date();
    const scheduledDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (targetStop.dayNumber - 1), hh, mm);
    const predictedDate = new Date(scheduledDate.getTime() + accumulatedDelay * 60000);

    predictions.push({
      trainNumber: train.number,
      stationCode: targetStop.stationCode,
      scheduledETA: scheduledDate.toISOString(),
      predictedETA: predictedDate.toISOString(),
      delayMinutes: accumulatedDelay,
      confidence,
      marginMinutes,
      primaryCause,
      causeBreakdown: breakdown
    });
  }

  return predictions;
}

// REST Endpoints
app.get("/api/trains", (req, res) => {
  const enriched = trains.map(t => {
    const preds = calculatePredictions(t);
    return {
      ...t,
      nextPrediction: preds[0] || null,
      predictions: preds
    };
  });
  res.json(enriched);
});

app.get("/api/trains/:id", (req, res) => {
  const train = trains.find(t => t.number === req.params.id);
  if (!train) return res.status(404).json({ error: "Train not found" });
  const preds = calculatePredictions(train);
  res.json({ ...train, predictions: preds });
});

app.get("/api/trains/:id/eta", (req, res) => {
  const train = trains.find(t => t.number === req.params.id);
  if (!train) return res.status(404).json({ error: "Train not found" });
  const preds = calculatePredictions(train);
  res.json({ predictions: preds });
});

app.get("/api/sections", (req, res) => {
  res.json(sections);
});

app.get("/api/sections/:id/congestion", (req, res) => {
  const sec = sections.find(s => s.id === req.params.id);
  if (!sec) return res.status(404).json({ error: "Section not found" });
  res.json({
    section: sec,
    currentCongestion: sec.congestionLevel,
    forecast: [
      { horizonMinutes: 30, forecastedLevel: Math.min(1.0, Number((sec.congestionLevel * 1.15).toFixed(2))) },
      { horizonMinutes: 60, forecastedLevel: Math.min(1.0, Number((sec.congestionLevel * 1.05).toFixed(2))) },
      { horizonMinutes: 90, forecastedLevel: Math.max(0.1, Number((sec.congestionLevel * 0.85).toFixed(2))) }
    ]
  });
});

app.get("/api/dashboard/summary", (req, res) => {
  const totalTrains = trains.length;
  const delayedTrains = trains.filter(t => t.currentStatus.currentDelayMinutes > 5);
  const onTimeCount = totalTrains - delayedTrains.length;
  const avgDelay = Math.round(trains.reduce((a, b) => a + b.currentStatus.currentDelayMinutes, 0) / totalTrains);

  res.json({
    totalTrains,
    onTimeCount,
    delayedCount: delayedTrains.length,
    avgDelay,
    worstSections: sections.filter(s => s.congestionLevel > 0.4).sort((a,b) => b.congestionLevel - a.congestionLevel).slice(0, 4),
    causeDistribution: {
      tsr: 28,
      congestion: 45,
      weather: 12,
      crew: 10,
      other: 5
    }
  });
});

// Simulation Event Trigger
app.post("/api/simulate/delay", (req, res) => {
  const { type, sectionId, params } = req.body;
  const sec = sections.find(s => s.id === sectionId);
  if (sec) {
    if (type === "tsr") {
      sec.activeTSR = { active: true, maxSpeedKmh: params?.maxSpeedKmh || 30, reason: params?.reason || "Bridge Repair TSR" };
    } else if (type === "congestion") {
      sec.congestionLevel = Math.min(1.0, (params?.level !== undefined ? params.level : 0.85));
    } else if (type === "signal") {
      sec.currentSignalAspect = params?.aspect || "red";
    } else if (type === "weather") {
      sec.congestionLevel = 0.9;
      sec.currentSignalAspect = "yellow";
      sec.activeTSR = { active: true, maxSpeedKmh: 40, reason: "Dense Fog Alert" };
    }
  }

  // Affect trains traversing or approaching this section immediately
  trains.forEach(t => {
    t.currentStatus.currentDelayMinutes += 4;
  });

  broadcast("event:injected", { type, sectionId, params, sections });
  res.json({ success: true, updatedSection: sec });
});

app.post("/api/simulate/reset", (req, res) => {
  sections.forEach(s => {
    s.congestionLevel = 0.2;
    s.currentSignalAspect = "green";
    s.activeTSR = { active: false, maxSpeedKmh: 110, reason: null };
  });
  trains[0].currentStatus.currentDelayMinutes = 10;
  trains[1].currentStatus.currentDelayMinutes = 18;
  trains[2].currentStatus.currentDelayMinutes = 0;
  broadcast("train:update", { message: "reset" });
  res.json({ success: true });
});

app.post("/api/simulate/advance-day", (req, res) => {
  trains.filter(t => t.multiDay).forEach(t => {
    t.currentStatus.dayOfJourney = (t.currentStatus.dayOfJourney % t.totalDays) + 1;
    // Re-anchoring logic: reduce delay variance overnight
    t.currentStatus.currentDelayMinutes = Math.max(4, Math.round(t.currentStatus.currentDelayMinutes * 0.65));
  });
  broadcast("train:update", { message: "day-advanced" });
  res.json({ success: true, trains });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

function broadcast(channel, data) {
  const msg = JSON.stringify({ channel, data, timestamp: new Date() });
  wss.clients.forEach(c => {
    if (c.readyState === 1) c.send(msg);
  });
}

// Background simulation ticker
setInterval(() => {
  trains.forEach(t => {
    t.currentStatus.positionInSection += 0.05;
    if (t.currentStatus.positionInSection >= 1.0) {
      t.currentStatus.positionInSection = 0;
      if (t.currentStatus.currentSectionIndex < t.route.length - 2) {
        t.currentStatus.currentSectionIndex++;
      } else {
        t.currentStatus.currentSectionIndex = 0;
      }
    }
  });
  broadcast("train:update", { trains });
}, 6000);

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`TrackVision Server is live on http://localhost:${PORT}`);
});
