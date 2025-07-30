/**
 * Map functionality module
 * Handles the Leaflet map initialization and pollution overlays
 */

const MapModule = (() => {
    // Private variables
    let map;
    let marker;
    let pollutionCircle;
    let locationInfo;
    
    // AQI color mapping
    const aqiColors = {
        1: '#009966', // Good
        2: '#ffde33', // Fair
        3: '#ff9933', // Moderate
        4: '#cc0033', // Poor
        5: '#660099'  // Very Poor
    };
    
    // Initialize map
    function initMap(lat = 51.505, lng = -0.09) {
        map = L.map('map').setView([lat, lng], 10);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18
        }).addTo(map);
        
        // Create location info control
        locationInfo = L.control({position: 'bottomleft'});
        locationInfo.onAdd = function() {
            this._div = L.DomUtil.create('div', 'location-info');
            this.update(lat, lng);
            return this._div;
        };
        locationInfo.update = function(lat, lng) {
            this._div.innerHTML = `<strong>Location:</strong> <span id="location-name">Loading...</span><br>
                                  <strong>Coordinates:</strong> ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        };
        locationInfo.addTo(map);
        
        // Add initial marker and pollution circle
        marker = L.marker([lat, lng]).addTo(map);
        pollutionCircle = L.circle([lat, lng], {
            color: '#3498db',
            fillColor: '#3498db',
            fillOpacity: 0.5,
            radius: 10000  // 10km
        }).addTo(map);
        
        // Add click event to map
        map.on('click', function(e) {
            updateMapLocation(e.latlng.lat, e.latlng.lng);
            PollutionModule.fetchCurrentPollution(e.latlng.lat, e.latlng.lng);
            PollutionModule.fetchHistoricalPollution(e.latlng.lat, e.latlng.lng);
            getLocationName(e.latlng.lat, e.latlng.lng);
        });

        // Initial location name
        getLocationName(lat, lng);
    }
    
    // Update map location
    function updateMapLocation(lat, lng) {
        map.setView([lat, lng], 10);
        marker.setLatLng([lat, lng]);
        pollutionCircle.setLatLng([lat, lng]);
        locationInfo.update(lat, lng);
    }
    
    // Update pollution circle with AQI data
    function updatePollutionDisplay(aqi) {
        const color = aqiColors[aqi] || '#3498db';
        pollutionCircle.setStyle({
            color: color,
            fillColor: color
        });
    }

    // Get location name from coordinates using reverse geocoding
    function getLocationName(lat, lng) {
        // Use OpenWeatherMap Geocoding API for reverse geocoding
        const API_KEY = PollutionModule.getApiKey();
        const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lng}&limit=1&appid=${API_KEY}`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    const location = data[0];
                    let locationName = location.name;
                    if (location.state) locationName += `, ${location.state}`;
                    if (location.country) locationName += `, ${location.country}`;
                    
                    document.getElementById('location-name').textContent = locationName;
                } else {
                    document.getElementById('location-name').textContent = 'Unknown location';
                }
            })
            .catch(error => {
                console.error('Error fetching location name:', error);
                document.getElementById('location-name').textContent = 'Unknown location';
            });
    }
    
    return {
        initMap,
        updateMapLocation,
        updatePollutionDisplay,
        getLocationName
    };
})();