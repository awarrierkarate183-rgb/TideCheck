import os
import math
import time
import requests
from geopy.geocoders import Nominatim
 
 
CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY")
if not CLAUDE_API_KEY:
    raise ValueError("Set your CLAUDE_API_KEY environment variable before running this.")
 
 
def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
 
 
def get_coordinates(zip_code):
    try:
        geo = Nominatim(user_agent="hab_tracker")
        loc = geo.geocode(zip_code, timeout=10)
        if loc:
            print(f"Found location: {loc.address}")
            return loc.latitude, loc.longitude
        raise ValueError("No results for that zip code.")
    except Exception as e:
        print(f"Geocoding failed ({e}), falling back to center of USA.")
        return 39.8283, -98.5795
 
 
def get_river_name(lat, lon):
    try:
        geo = Nominatim(user_agent="hab_tracker_reverse")
        loc = geo.reverse((lat, lon), timeout=10, language="en")
        if loc and loc.raw:
            addr = loc.raw.get("address", {})
            water = (
                addr.get("river") or addr.get("stream") or addr.get("lake") or
                addr.get("water") or addr.get("waterway") or addr.get("reservoir") or
                addr.get("bay") or addr.get("natural")
            )
            if water:
                return water
            region = addr.get("county") or addr.get("state_district") or addr.get("state")
            if region:
                return f"{region} area"
    except Exception:
        pass
    return "Unknown water body"
 
 
def fetch_epa_data(lat, lon, radius_miles=50):
    url = (
        f"https://www.waterqualitydata.us/data/Result/search"
        f"?lat={lat}&long={lon}&within={radius_miles}"
        f"&characteristicName=Microcystin&characteristicName=Chlorophyll"
        f"&mimeType=json&zip=no"
    )
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
    }
 
    for attempt in range(3):
        try:
            print(f"Fetching EPA data, attempt {attempt + 1} of 3...")
            r = requests.get(url, headers=headers, timeout=30)
            r.raise_for_status()
            results = r.json()
 
            records = []
            for rec in results:
                char = rec.get("CharacteristicName", "").lower()
                if not any(k in char for k in ("microcystin", "chlorophyll", "cyanotoxin")):
                    continue
                try:
                    rlat = float(rec.get("LatitudeMeasure", lat))
                    rlon = float(rec.get("LongitudeMeasure", lon))
                except (TypeError, ValueError):
                    rlat, rlon = lat, lon
 
                records.append({
                    "site":      rec.get("MonitoringLocationName", "Unknown site"),
                    "lat":       rlat,
                    "lon":       rlon,
                    "parameter": rec.get("CharacteristicName", "Unknown"),
                    "value":     rec.get("ResultMeasureValue", "N/A"),
                    "unit":      rec.get("ResultMeasureUnitCode", ""),
                    "river":     None,
                })
 
            print(f"Got {len(records)} records from EPA.")
            return records
 
        except Exception as e:
            print(f"Attempt {attempt + 1} failed: {e}")
            if attempt < 2:
                print("Waiting 3 seconds before retrying...")
                time.sleep(3)
 
    print("EPA fetch failed after 3 attempts, using sample data instead.")
    return []
 
 
def get_sample_data(user_lat, user_lon):
    print("No EPA data available, running on sample data.")
    return [
        {"site": "Local Lake",        "lat": user_lat + 0.05, "lon": user_lon + 0.05, "parameter": "Microcystin",  "value": 8.3,  "unit": "ug/L", "river": None},
        {"site": "Nearby Reservoir",  "lat": user_lat - 0.08, "lon": user_lon + 0.12, "parameter": "Chlorophyll a","value": 22.1, "unit": "ug/L", "river": None},
        {"site": "River Tributary",   "lat": user_lat + 0.15, "lon": user_lon - 0.07, "parameter": "Cyanotoxin",   "value": 3.9,  "unit": "ug/L", "river": None},
        {"site": "Community Pond",    "lat": user_lat - 0.12, "lon": user_lon - 0.10, "parameter": "Microcystin",  "value": 1.2,  "unit": "ug/L", "river": None},
        {"site": "State Park Lake",   "lat": user_lat + 0.20, "lon": user_lon + 0.18, "parameter": "Chlorophyll a","value": 15.7, "unit": "ug/L", "river": None},
    ]
 
 
def analyze_with_claude(hab_data):
    prompt = (
        "You are an environmental scientist specializing in harmful algal blooms. "
        "Analyze the water quality measurements below and write a 2-3 paragraph summary that covers: "
        "what the data suggests about current bloom conditions, the severity and health risks to people, "
        "pets, and wildlife, and what people should do to stay safe. Where you have a water body name, "
        "mention it by name.\n\nData:\n"
    )
    for rec in hab_data:
        river_note = f" ({rec['river']})" if rec.get("river") else ""
        prompt += f"- {rec['site']}{river_note}, {rec['dist']:.1f} km away: {rec['parameter']} = {rec['value']} {rec['unit']}\n"
 
    try:
        print("Sending data to Claude for analysis...")
        r = requests.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key":         CLAUDE_API_KEY,
                "Content-Type":      "application/json",
                "anthropic-version": "2023-06-01",
            },
            json={
                "model":      "claude-sonnet-4-20250514",
                "max_tokens": 800,
                "messages":   [{"role": "user", "content": prompt}],
            },
            timeout=30,
        )
        r.raise_for_status()
        return r.json()["content"][0]["text"]
    except Exception as e:
        return f"Claude API call failed: {e}"
 
 
def main():
    print("HAB Tracker - Harmful Algal Bloom Analyzer\n")
 
    zip_code = input("Enter your ZIP code: ").strip()
    user_lat, user_lon = get_coordinates(zip_code)
    print(f"Using coordinates: {user_lat:.4f}, {user_lon:.4f}\n")
 
    data = fetch_epa_data(user_lat, user_lon)
    if not data:
        data = get_sample_data(user_lat, user_lon)
 
    for rec in data:
        rec["dist"] = haversine(user_lat, user_lon, rec["lat"], rec["lon"])
    data = sorted(data, key=lambda x: x["dist"])[:5]
 
    print("\nLooking up water body names...")
    for rec in data:
        rec["river"] = get_river_name(rec["lat"], rec["lon"])
        print(f"  {rec['site']} -> {rec['river']}")
 
    print("\nTop 5 nearby HAB sites:")
    print("-" * 50)
    for i, rec in enumerate(data, 1):
        print(f"{i}. {rec['site']}")
        print(f"   Water body : {rec['river']}")
        print(f"   Distance   : {rec['dist']:.1f} km")
        print(f"   Parameter  : {rec['parameter']}")
        print(f"   Value      : {rec['value']} {rec['unit']}")
        print()
 
    summary = analyze_with_claude(data)
    print("-" * 50)
    print("AI Analysis:\n")
    print(summary)
    print("-" * 50)
 
 
if __name__ == "__main__":
    main()
