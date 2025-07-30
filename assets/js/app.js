/**
 * Main application module
 * Handles initialization and user interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize modules
    MapModule.initMap();
    SliderModule.initSlider();
    
    // Get user's location if supported
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                MapModule.updateMapLocation(latitude, longitude);
                PollutionModule.fetchCurrentPollution(latitude, longitude);
                PollutionModule.fetchHistoricalPollution(latitude, longitude);
                MapModule.getLocationName(latitude, longitude);
            },
            error => {
                console.warn('Error getting user location:', error);
                // Default to a location (London)
                PollutionModule.fetchCurrentPollution(51.505, -0.09);
                PollutionModule.fetchHistoricalPollution(51.505, -0.09);
                MapModule.getLocationName(51.505, -0.09);
            }
        );
    } else {
        // Default to a location (London)
        PollutionModule.fetchCurrentPollution(51.505, -0.09);
        PollutionModule.fetchHistoricalPollution(51.505, -0.09);
        MapModule.getLocationName(51.505, -0.09);
    }
    
    // Setup search button event
    document.getElementById('search-btn').addEventListener('click', handleSearch);
    
    // Setup enter key in search box
    document.getElementById('city-search').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Handle search functionality
    function handleSearch() {
        const cityName = document.getElementById('city-search').value.trim();
        
        if (!cityName) {
            alert('Please enter a city name');
            return;
        }
        
        // Use OpenWeatherMap Geocoding API to get coordinates
        const API_KEY = PollutionModule.getApiKey();
        const geocodingUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${API_KEY}`;
        
        fetch(geocodingUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.length === 0) {
                    throw new Error('City not found');
                }
                
                const { lat, lon } = data[0];
                MapModule.updateMapLocation(lat, lon);
                PollutionModule.fetchCurrentPollution(lat, lon);
                PollutionModule.fetchHistoricalPollution(lat, lon);
                MapModule.getLocationName(lat, lon);
            })
            .catch(error => {
                console.error('Error searching city:', error);
                alert('City not found or error occurred. Please try another city name.');
            });
    }
});