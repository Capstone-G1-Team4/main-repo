import requests
import os
from urllib.parse import urlparse, parse_qs
from dotenv import load_dotenv

load_dotenv()

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")


def extract_place_id(gmaps_url: str):
    """
    Extract Place ID from Google Maps URL
    """
    parsed = urlparse(gmaps_url)
    qs = parse_qs(parsed.query)
    if 'q' in qs:
        return qs['q'][0]
    return None


def geocode_address(address: str):
    """
    Convert address or place_id to structured address using Google Maps API
    """
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "address": address,
        "key": GOOGLE_MAPS_API_KEY
    }
    response = requests.get(url, params=params).json()

    if response.get("status") == "OK":
        result = response["results"][0]
        return {
            "formatted_address": result["formatted_address"],
            "lat": result["geometry"]["location"]["lat"],
            "lng": result["geometry"]["location"]["lng"]
        }
    else:
        return {"error": response.get("status")}