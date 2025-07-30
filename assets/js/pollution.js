/**
 * Pollution data module
 * Handles fetching and processing pollution data from OpenWeather API
 */

const PollutionModule = (() => {
    // Your OpenWeather API key will be inserted here
    const API_KEY = 'b6ee3a3097d23d0ff78252d47099372b';
    
    // Store data
    let currentPollutionData = null;
    let historicalPollutionData = [];
    
    // AQI classes for styling
    const aqiClasses = [
        'aqi-good',      // 1
        'aqi-fair',      // 2
        'aqi-moderate',  // 3
        'aqi-poor',      // 4
        'aqi-very-poor'  // 5
    ];
    
    // Get API key
    function getApiKey() {
        return API_KEY;
    }
    
    // Fetch current pollution data
    function fetchCurrentPollution(lat, lng) {
        const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lng}&appid=${API_KEY}`;
        
        showLoading();
        
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                currentPollutionData = data;
                updateCurrentPollutionUI(data);
                MapModule.updatePollutionDisplay(data.list[0].main.aqi);
            })
            .catch(error => {
                console.error('Error fetching pollution data:', error);
                showError('Failed to fetch current pollution data. Please try again.');
            })
            .finally(() => {
                hideLoading();
            });
    }
    
    // Fetch historical pollution data (48 hours)
    function fetchHistoricalPollution(lat, lng) {
        // Get timestamp for 48 hours ago
        const now = Math.floor(Date.now() / 1000);
        const fortyEightHoursAgo = now - (48 * 60 * 60);
        
        const url = `https://api.openweathermap.org/data/2.5/air_pollution/history?lat=${lat}&lon=${lng}&start=${fortyEightHoursAgo}&end=${now}&appid=${API_KEY}`;
        
        showLoading();
        
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                historicalPollutionData = data.list;
                SliderModule.updateSlider(data.list);
            })
            .catch(error => {
                console.error('Error fetching historical pollution data:', error);
                showError('Failed to fetch historical pollution data. Please try again.');
            })
            .finally(() => {
                hideLoading();
            });
    }
    
    // Update UI with current pollution data
    function updateCurrentPollutionUI(data) {
        const pollutionItem = data.list[0];
        const aqiValue = pollutionItem.main.aqi;
        const components = pollutionItem.components;
        
        // Update AQI value and apply appropriate color class
        const aqiDisplay = document.querySelector('.aqi-value');
        aqiDisplay.textContent = aqiValue;
        
        // Remove all previous aqi classes
        aqiClasses.forEach(cls => {
            aqiDisplay.parentElement.classList.remove(cls);
        });
        
        // Add appropriate class
        aqiDisplay.parentElement.classList.add(aqiClasses[aqiValue - 1]);
        
        // Update pollutant values
        document.querySelector('.pollutant-item:nth-child(1) .pollutant-value').textContent = 
            `${components.co.toFixed(2)} μg/m³`;
        document.querySelector('.pollutant-item:nth-child(2) .pollutant-value').textContent = 
            `${components.no2.toFixed(2)} μg/m³`;
        document.querySelector('.pollutant-item:nth-child(3) .pollutant-value').textContent = 
            `${components.o3.toFixed(2)} μg/m³`;
        document.querySelector('.pollutant-item:nth-child(4) .pollutant-value').textContent = 
            `${components.pm2_5.toFixed(2)} μg/m³`;
        document.querySelector('.pollutant-item:nth-child(5) .pollutant-value').textContent = 
            `${components.pm10.toFixed(2)} μg/m³`;
        document.querySelector('.pollutant-item:nth-child(6) .pollutant-value').textContent = 
            `${components.so2.toFixed(2)} μg/m³`;
    }
    
    // Update UI with historical data for selected time
    function updateUIWithHistoricalData(index) {
        if (historicalPollutionData.length === 0 || index < 0 || index >= historicalPollutionData.length) {
            return;
        }
        
        const pollutionItem = historicalPollutionData[index];
        const aqiValue = pollutionItem.main.aqi;
        const components = pollutionItem.components;
        const timestamp = pollutionItem.dt;
        
        // Update AQI value and apply appropriate color class
        const aqiDisplay = document.querySelector('.aqi-value');
        aqiDisplay.textContent = aqiValue;
        
        // Remove all previous aqi classes
        aqiClasses.forEach(cls => {
            aqiDisplay.parentElement.classList.remove(cls);
        });
        
        // Add appropriate class
        aqiDisplay.parentElement.classList.add(aqiClasses[aqiValue - 1]);
        
        // Update pollutant values
        document.querySelector('.pollutant-item:nth-child(1) .pollutant-value').textContent = 
            `${components.co.toFixed(2)} μg/m³`;
        document.querySelector('.pollutant-item:nth-child(2) .pollutant-value').textContent = 
            `${components.no2.toFixed(2)} μg/m³`;
        document.querySelector('.pollutant-item:nth-child(3) .pollutant-value').textContent = 
            `${components.o3.toFixed(2)} μg/m³`;
        document.querySelector('.pollutant-item:nth-child(4) .pollutant-value').textContent = 
            `${components.pm2_5.toFixed(2)} μg/m³`;
        document.querySelector('.pollutant-item:nth-child(5) .pollutant-value').textContent = 
            `${components.pm10.toFixed(2)} μg/m³`;
        document.querySelector('.pollutant-item:nth-child(6) .pollutant-value').textContent = 
            `${components.so2.toFixed(2)} μg/m³`;
        
        // Update map visualization
        MapModule.updatePollutionDisplay(aqiValue);
        
        // Update selected time
        const date = new Date(timestamp * 1000);
        document.getElementById('selected-datetime').textContent = date.toLocaleString();
    }
    
    // Reset to current data
    function resetToCurrentData() {
        if (currentPollutionData) {
            updateCurrentPollutionUI(currentPollutionData);
            MapModule.updatePollutionDisplay(currentPollutionData.list[0].main.aqi);
            document.getElementById('selected-datetime').textContent = 'Current';
        }
    }
    
    // Show loading state
    function showLoading() {
        // This could be expanded to add a spinner or other loading indicator
        document.body.style.cursor = 'wait';
    }
    
    // Hide loading state
    function hideLoading() {
        document.body.style.cursor = 'default';
    }
    
    // Show error message
    function showError(message) {
        alert(message);
    }
    
    return {
        fetchCurrentPollution,
        fetchHistoricalPollution,
        updateUIWithHistoricalData,
        resetToCurrentData,
        getApiKey
    };
})();