/**
 * Slider module for historical data
 * Handles the timeline slider for viewing historical pollution data
 */

const SliderModule = (() => {
    // Private variables
    let slider;
    let pollutionDataPoints = [];
    
    // Initialize slider
    function initSlider() {
        const sliderElement = document.getElementById('time-slider');
        
        slider = noUiSlider.create(sliderElement, {
            start: [100],
            connect: 'lower',
            range: {
                'min': 0,
                'max': 100
            },
            step: 1,
            tooltips: false
        });
        
        // Add event listener
        slider.on('update', function(values, handle) {
            const value = parseInt(values[handle]);
            
            // When slider is at 100%, show current data
            if (value === 100) {
                PollutionModule.resetToCurrentData();
                return;
            }
            
            // Otherwise map value to index in historical data
            if (pollutionDataPoints.length > 0) {
                const index = Math.floor((value / 100) * (pollutionDataPoints.length - 1));
                PollutionModule.updateUIWithHistoricalData(index);
            }
        });
    }
    
    // Update slider with new data points
    function updateSlider(dataPoints) {
        pollutionDataPoints = dataPoints;
        
        // Reset slider to current position
        slider.set(100);
        
        // Update time labels
        if (dataPoints.length > 0) {
            const oldestTime = new Date(dataPoints[0].dt * 1000);
            document.querySelector('.start-time').textContent = 
                `${oldestTime.toLocaleDateString()} ${oldestTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
            
            const newestTime = new Date();
            document.querySelector('.current-time').textContent = 
                `${newestTime.toLocaleDateString()} ${newestTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        }
    }
    
    return {
        initSlider,
        updateSlider
    };
})();