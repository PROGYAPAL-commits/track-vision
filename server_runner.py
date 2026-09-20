import http.server
import socketserver
import json
import os
import urllib.parse
from datetime import datetime

PORT = 3001
BASE_DIR = "/Users/progyapal/.gemini/antigravity/scratch/trackvision/client/public"

stations = [
  { "code": "NDLS", "name": "New Delhi", "lat": 28.6139, "lng": 77.2090, "zone": "NR" },
  { "code": "MTJ", "name": "Mathura Jn", "lat": 27.4924, "lng": 77.6737, "zone": "NCR" },
  { "code": "AGC", "name": "Agra Cantt", "lat": 27.1767, "lng": 78.0081, "zone": "NCR" },
  { "code": "GWL", "name": "Gwalior", "lat": 26.2183, "lng": 78.1828, "zone": "NCR" },
  { "code": "JHS", "name": "Jhansi", "lat": 25.4484, "lng": 78.5685, "zone": "NCR" },
  { "code": "BPL", "name": "Bhopal", "lat": 23.2599, "lng": 77.4126, "zone": "WCR" },
  { "code": "ET", "name": "Itarsi", "lat": 22.6155, "lng": 77.7523, "zone": "WCR" },
  { "code": "KNW", "name": "Khandwa", "lat": 21.8243, "lng": 76.3527, "zone": "WCR" },
  { "code": "BSL", "name": "Bhusaval", "lat": 21.0440, "lng": 75.7850, "zone": "CR" },
  { "code": "NK", "name": "Nashik Road", "lat": 19.9975, "lng": 73.7898, "zone": "CR" },
  { "code": "KYN", "name": "Kalyan", "lat": 19.2437, "lng": 73.1355, "zone": "CR" },
  { "code": "BCT", "name": "Mumbai Central", "lat": 18.9712, "lng": 72.8194, "zone": "WR" },
  { "code": "HWH", "name": "Howrah", "lat": 22.5839, "lng": 88.3428, "zone": "ER" },
  { "code": "KGP", "name": "Kharagpur", "lat": 22.3460, "lng": 87.3237, "zone": "SER" },
  { "code": "VSKP", "name": "Visakhapatnam", "lat": 17.7215, "lng": 83.3025, "zone": "ECoR" },
  { "code": "BZA", "name": "Vijayawada", "lat": 16.5193, "lng": 80.6305, "zone": "SCR" },
  { "code": "MAS", "name": "Chennai Central", "lat": 13.0827, "lng": 80.2707, "zone": "SR" }
]

sections = [
  { "id": "sec-1", "fromStation": "NDLS", "toStation": "MTJ", "distanceKm": 141, "currentSignalAspect": "green", "congestionLevel": 0.15, "activeTSR": { "active": False } },
  { "id": "sec-2", "fromStation": "MTJ", "toStation": "AGC", "distanceKm": 54, "currentSignalAspect": "green", "congestionLevel": 0.2, "activeTSR": { "active": False } },
  { "id": "sec-3", "fromStation": "AGC", "toStation": "GWL", "distanceKm": 118, "currentSignalAspect": "yellow", "congestionLevel": 0.55, "activeTSR": { "active": True, "maxSpeedKmh": 45, "reason": "Track Renewal" } },
  { "id": "sec-4", "fromStation": "GWL", "toStation": "JHS", "distanceKm": 101, "currentSignalAspect": "green", "congestionLevel": 0.1, "activeTSR": { "active": False } },
  { "id": "sec-5", "fromStation": "JHS", "toStation": "BPL", "distanceKm": 292, "currentSignalAspect": "green", "congestionLevel": 0.35, "activeTSR": { "active": False } },
  { "id": "sec-6", "fromStation": "BPL", "toStation": "ET", "distanceKm": 90, "currentSignalAspect": "double-yellow", "congestionLevel": 0.65, "activeTSR": { "active": False } },
  { "id": "sec-7", "fromStation": "ET", "toStation": "KNW", "distanceKm": 167, "currentSignalAspect": "green", "congestionLevel": 0.3, "activeTSR": { "active": False } },
  { "id": "sec-8", "fromStation": "KNW", "toStation": "BSL", "distanceKm": 128, "currentSignalAspect": "green", "congestionLevel": 0.25, "activeTSR": { "active": False } },
  { "id": "sec-9", "fromStation": "BSL", "toStation": "NK", "distanceKm": 189, "currentSignalAspect": "green", "congestionLevel": 0.15, "activeTSR": { "active": False } },
  { "id": "sec-10", "fromStation": "NK", "toStation": "KYN", "distanceKm": 153, "currentSignalAspect": "green", "congestionLevel": 0.5, "activeTSR": { "active": False } },
  { "id": "sec-11", "fromStation": "KYN", "toStation": "BCT", "distanceKm": 54, "currentSignalAspect": "yellow", "congestionLevel": 0.7, "activeTSR": { "active": False } }
]

trains = [
  {
    "number": "12952", "name": "Mumbai Rajdhani Express", "type": "rajdhani",
    "sourceStation": "NDLS", "destStation": "BCT", "multiDay": True, "totalDays": 2,
    "currentStatus": { "currentSectionIndex": 2, "positionInSection": 0.45, "currentDelayMinutes": 14, "speed": 78, "dayOfJourney": 1 },
    "route": [
      { "stationCode": "NDLS", "scheduledDeparture": "16:55", "dayNumber": 1, "distKm": 0 },
      { "stationCode": "MTJ", "scheduledArrival": "18:30", "dayNumber": 1, "distKm": 141 },
      { "stationCode": "AGC", "scheduledArrival": "19:12", "dayNumber": 1, "distKm": 195 },
      { "stationCode": "GWL", "scheduledArrival": "20:35", "dayNumber": 1, "distKm": 313 },
      { "stationCode": "JHS", "scheduledArrival": "21:45", "dayNumber": 1, "distKm": 414 },
      { "stationCode": "BPL", "scheduledArrival": "00:55", "dayNumber": 2, "distKm": 706 },
      { "stationCode": "ET", "scheduledArrival": "01:55", "dayNumber": 2, "distKm": 796 },
      { "stationCode": "KNW", "scheduledArrival": "03:50", "dayNumber": 2, "distKm": 963 },
      { "stationCode": "BSL", "scheduledArrival": "05:15", "dayNumber": 2, "distKm": 1091 },
      { "stationCode": "NK", "scheduledArrival": "07:25", "dayNumber": 2, "distKm": 1280 },
      { "stationCode": "KYN", "scheduledArrival": "09:15", "dayNumber": 2, "distKm": 1433 },
      { "stationCode": "BCT", "scheduledArrival": "10:00", "dayNumber": 2, "distKm": 1487 }
    ]
  },
  {
    "number": "12621", "name": "Tamil Nadu Express", "type": "superfast",
    "sourceStation": "MAS", "destStation": "NDLS", "multiDay": True, "totalDays": 3,
    "currentStatus": { "currentSectionIndex": 1, "positionInSection": 0.7, "currentDelayMinutes": 28, "speed": 82, "dayOfJourney": 2 },
    "route": [
      { "stationCode": "MAS", "scheduledDeparture": "22:00", "dayNumber": 1, "distKm": 0 },
      { "stationCode": "BZA", "scheduledArrival": "04:15", "dayNumber": 2, "distKm": 432 },
      { "stationCode": "VSKP", "scheduledArrival": "09:30", "dayNumber": 2, "distKm": 782 },
      { "stationCode": "GWL", "scheduledArrival": "03:10", "dayNumber": 3, "distKm": 1869 },
      { "stationCode": "AGC", "scheduledArrival": "04:30", "dayNumber": 3, "distKm": 1987 },
      { "stationCode": "NDLS", "scheduledArrival": "07:05", "dayNumber": 3, "distKm": 2182 }
    ]
  },
  {
    "number": "12002", "name": "Bhopal Shatabdi", "type": "shatabdi",
    "sourceStation": "NDLS", "destStation": "BPL", "multiDay": False, "totalDays": 1,
    "currentStatus": { "currentSectionIndex": 1, "positionInSection": 0.85, "currentDelayMinutes": 2, "speed": 115, "dayOfJourney": 1 },
    "route": [
      { "stationCode": "NDLS", "scheduledDeparture": "06:00", "dayNumber": 1, "distKm": 0 },
      { "stationCode": "MTJ", "scheduledArrival": "07:19", "dayNumber": 1, "distKm": 141 },
      { "stationCode": "AGC", "scheduledArrival": "07:50", "dayNumber": 1, "distKm": 195 },
      { "stationCode": "GWL", "scheduledArrival": "09:23", "dayNumber": 1, "distKm": 313 },
      { "stationCode": "JHS", "scheduledArrival": "10:45", "dayNumber": 1, "distKm": 414 },
      { "stationCode": "BPL", "scheduledArrival": "14:05", "dayNumber": 1, "distKm": 706 }
    ]
  },
  {
    "number": "12839", "name": "Howrah - Chennai Mail", "type": "mail",
    "sourceStation": "HWH", "destStation": "MAS", "multiDay": True, "totalDays": 3,
    "currentStatus": { "currentSectionIndex": 0, "positionInSection": 0.6, "currentDelayMinutes": 9, "speed": 85, "dayOfJourney": 1 },
    "route": [
      { "stationCode": "HWH", "scheduledDeparture": "23:55", "dayNumber": 1, "distKm": 0 },
      { "stationCode": "KGP", "scheduledArrival": "01:30", "dayNumber": 2, "distKm": 114 },
      { "stationCode": "VSKP", "scheduledArrival": "10:20", "dayNumber": 2, "distKm": 714 },
      { "stationCode": "BZA", "scheduledArrival": "16:45", "dayNumber": 2, "distKm": 1064 },
      { "stationCode": "MAS", "scheduledArrival": "03:15", "dayNumber": 3, "distKm": 1496 }
    ]
  }
]

def calculate_predictions(t):
    cur_idx = t["currentStatus"]["currentSectionIndex"]
    cur_delay = t["currentStatus"]["currentDelayMinutes"]
    route = t["route"]
    preds = []
    acc_delay = cur_delay
    
    for i in range(cur_idx + 1, len(route)):
        stop = route[i]
        prev = route[i - 1]
        
        # Downstream section lookup
        sec = next((s for s in sections if s["fromStation"] == prev["stationCode"] and s["toStation"] == stop["stationCode"]), None)
        cause = "Normal Running"
        if sec:
            if sec.get("currentSignalAspect") == "yellow":
                acc_delay += 5
            elif sec.get("currentSignalAspect") == "red":
                acc_delay += 15
            if sec.get("activeTSR", {}).get("active"):
                acc_delay += 6
                cause = f"TSR ({sec['activeTSR'].get('reason', 'Speed limit 45 km/h')})"
            if sec.get("congestionLevel", 0) > 0.4:
                acc_delay += int(sec["congestionLevel"] * 10)
                if cause == "Normal Running":
                    cause = f"Downstream Congestion ({int(sec['congestionLevel']*100)}% load)"
        
        conf = max(0.45, min(0.96, round(0.98 - (i - cur_idx) * 0.04 - acc_delay * 0.005, 2)))
        margin = max(2, int((1 - conf) * 20))
        
        preds.append({
            "trainNumber": t["number"],
            "stationCode": stop["stationCode"],
            "predictedETA": datetime.now().isoformat(),
            "confidence": conf,
            "marginMinutes": margin,
            "primaryCause": cause if acc_delay > 2 else "Normal Schedule",
            "delayMinutes": acc_delay
        })
    return preds

class RequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_GET(self):
        url = urllib.parse.urlparse(self.path)
        if url.path == "/api/trains":
            self.send_json([dict(t, predictions=calculate_predictions(t)) for t in trains])
        elif url.path.startswith("/api/trains/") and url.path.endswith("/eta"):
            tnum = url.path.split("/")[3]
            t = next((x for x in trains if x["number"] == tnum), None)
            self.send_json({"predictions": calculate_predictions(t) if t else []})
        elif url.path.startswith("/api/trains/"):
            tnum = url.path.split("/")[3]
            t = next((x for x in trains if x["number"] == tnum), None)
            self.send_json(dict(t, predictions=calculate_predictions(t)) if t else {"error": "not found"})
        elif url.path == "/api/sections":
            self.send_json(sections)
        elif url.path == "/api/dashboard/summary":
            delayed = [t for t in trains if t["currentStatus"]["currentDelayMinutes"] > 5]
            self.send_json({
                "totalTrains": len(trains),
                "onTimeCount": len(trains) - len(delayed),
                "delayedCount": len(delayed),
                "avgDelay": int(sum(t["currentStatus"]["currentDelayMinutes"] for t in trains) / len(trains))
            })
        elif url.path == "/" or not url.path.startswith("/api"):
            return super().do_GET()
        else:
            self.send_error(404)

    def do_POST(self):
        length = int(self.headers.get('content-length', 0))
        body = json.loads(self.rfile.read(length).decode()) if length else {}
        if self.path == "/api/simulate/delay":
            sec_id = body.get("sectionId")
            sec = next((s for s in sections if s["id"] == sec_id), None)
            if sec:
                if body.get("type") == "tsr":
                    sec["activeTSR"] = {"active": True, "maxSpeedKmh": 30, "reason": "TSR 30 km/h Maintenance"}
                elif body.get("type") == "congestion":
                    sec["congestionLevel"] = 0.85
                elif body.get("type") == "signal":
                    sec["currentSignalAspect"] = "red"
                elif body.get("type") == "weather":
                    sec["congestionLevel"] = 0.9
                    sec["currentSignalAspect"] = "yellow"
            for t in trains:
                t["currentStatus"]["currentDelayMinutes"] += 5
            self.send_json({"success": True})
        elif self.path == "/api/simulate/reset":
            for s in sections:
                s["congestionLevel"] = 0.2
                s["currentSignalAspect"] = "green"
                s["activeTSR"] = {"active": False}
            trains[0]["currentStatus"]["currentDelayMinutes"] = 12
            trains[1]["currentStatus"]["currentDelayMinutes"] = 25
            self.send_json({"success": True})
        elif self.path == "/api/simulate/advance-day":
            for t in trains:
                if t.get("multiDay"):
                    t["currentStatus"]["dayOfJourney"] = (t["currentStatus"]["dayOfJourney"] % t["totalDays"]) + 1
                    t["currentStatus"]["currentDelayMinutes"] = max(3, int(t["currentStatus"]["currentDelayMinutes"] * 0.6))
            self.send_json({"success": True})
        else:
            self.send_error(404)

    def send_json(self, data):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

with socketserver.TCPServer(("", PORT), RequestHandler) as httpd:
    print(f"TrackVision Unified Server running at http://localhost:{PORT}")
    httpd.serve_forever()
