import googlemaps
from config import get_settings
from typing import List, Dict

settings = get_settings()

class MapsService:
    def __init__(self):
        try:
            self.gmaps = googlemaps.Client(key=settings.GOOGLE_MAPS_API_KEY)
        except Exception as e:
            print(f"Error initializing Google Maps: {e}")
            self.gmaps = None
    
    def find_nearby_hospitals(self, location: str, radius: int = 5000) -> List[Dict]:
        """Find nearby hospitals with their details including open/closed status"""
        if not self.gmaps:
            return []
        
        try:
            # Geocode the location
            geocode_result = self.gmaps.geocode(location)
            if not geocode_result:
                return []
            
            lat = geocode_result[0]['geometry']['location']['lat']
            lng = geocode_result[0]['geometry']['location']['lng']
            
            # Search for nearby hospitals
            places_result = self.gmaps.places_nearby(
                location=(lat, lng),
                radius=radius,
                type='hospital'
            )
            
            hospitals = []
            for place in places_result.get('results', [])[:10]:  # Limit to 10 results
                place_id = place.get('place_id')
                
                # Get detailed information including opening hours
                details = self.gmaps.place(place_id, fields=[
                    'name', 'formatted_address', 'formatted_phone_number',
                    'rating', 'opening_hours', 'geometry', 'website'
                ])
                
                result = details.get('result', {})
                opening_hours = result.get('opening_hours', {})
                
                hospital_info = {
                    'name': result.get('name', 'Unknown'),
                    'address': result.get('formatted_address', 'Address not available'),
                    'phone': result.get('formatted_phone_number', 'Phone not available'),
                    'rating': result.get('rating', 'No rating'),
                    'is_open': opening_hours.get('open_now', None),
                    'website': result.get('website', 'Not available'),
                    'location': {
                        'lat': result.get('geometry', {}).get('location', {}).get('lat'),
                        'lng': result.get('geometry', {}).get('location', {}).get('lng')
                    }
                }
                
                hospitals.append(hospital_info)
            
            return hospitals
        except Exception as e:
            print(f"Error finding nearby hospitals: {e}")
            return []

# Singleton instance
maps_service = MapsService()
