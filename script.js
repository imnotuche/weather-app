const generalContainer=document.querySelector('.general-container');
const weatherDetails=document.querySelector('.weather-details');
const searchBox=document.querySelector('.search-city');
const searchButton=document.querySelector('.search-button');
const locationButton=document.querySelector('.location');
const loading=document.querySelector('.loading');
const loadingMessage=document.querySelector('.loading-message');
const optionContainer=document.querySelector('.option-container');
const weatherIcon=document.querySelector('.weather-icon');
const cityTemperature=document.querySelector('.temperature');
const cityName=document.querySelector('.city-name');
const weatherInfo=document.querySelector('.weather-info');
const humidity=document.querySelector('.humidity');
const windSpeed=document.querySelector('.wind-speed');
const WEATHER_API_KEY="7570efae07684e95a00165420250604";    //https://www.weatherapi.com/
const CITY_API_KEY="e9c0aae4d6b04f0ca196a2c40961e066";      //https://opencagedata.com/
const LOCATION_API_KEY="f866dcf601df4331acc8d602c14876ca";  //https://www.geoapify.com/
const error=document.querySelector('.error');
const errorMessage=document.querySelector('.error-message');

// Fetch possible location matches for a free-text input using OpenCage Geocoding API.
// Input: a string like "London" or "San Francisco".
// Output: an array of result objects from OpenCage (may be empty).
async function getOptions(input) {

    // Build request URL (convert input to lowercase for consistency)
    const URL = `https://api.opencagedata.com/geocode/v1/json?q=${input.toLowerCase()}&key=${CITY_API_KEY}`;
    const response = await fetch(URL);

    // Basic HTTP error handling
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    // API-specific error handling
    if (data.error) {
        throw new Error(data.error.message);
    }

    // Filter results to those that include a type in the components object
    // (these are typically city/country/region results that are useful to the user)
    const citiesOnly = data.results.filter(loc => loc.components._type);
    return citiesOnly; // array of possible cities

}

// Fetch current weather for a location specified by latitude and longitude.
// Returns the parsed JSON response from WeatherAPI (current weather + location).
async function getCityWeather(latitude, longitude) {

    const URL = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${latitude},${longitude}`;
    const response = await fetch(URL);

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
        throw new Error(data.error.message);
    }
    return data;

}

// Toggle visibility of the loading indicator.
// When show=true: display loading, and hide main detail sections so they don't flash.
function showLoading(show = true) {

    if (show) {
        loading.classList.add('display');
        // Hide the weather details and option container while loading
        weatherDetails.classList.remove('display');
        optionContainer.classList.remove('display');
        error.classList.remove('display');

    } else {
        // Hide loading overlay only (leave other UI state unchanged)
        loading.classList.remove('display');
    }

}


// Given a free-text search (e.g. typed by user), show matching location options
// or directly fetch weather when there is exactly one match.
async function showOptions(search) {

    // Show the loading animation while we fetch results
    showLoading(true);

    try {

        const data = await getOptions(search); // fetch options from OpenCage

        if (data.length > 1) {
            // Many possible matches: present a list of clickable options to the user
            showLoading(false); // stop loading spinner
            optionContainer.innerHTML = '';
            weatherDetails.classList.remove('display');
            error.classList.remove('display');

            const searchResponse = document.createElement('p');
            searchResponse.innerHTML = `We found ${data.length} results for <span>${search.toUpperCase()}</span>, 
            select the one you're searching for`;
            searchResponse.classList.add('search-response');
            optionContainer.appendChild(searchResponse);
            optionContainer.classList.add('display');

            // Create a clickable element for each option returned by the API
            data.forEach(element => {

                const userOption = document.createElement('div');
                userOption.classList.add('user-option');

                // When the user clicks an option, fetch weather for that location
                userOption.addEventListener('click', async () => {

                    showLoading(true);
                    const weather = await getCityWeather(element.geometry.lat, element.geometry.lng);
                    showLoading(false);
                    optionContainer.classList.remove('display');
                    error.classList.remove('display');

                    // Update UI elements with weather data
                    weatherIcon.src = `${weather.current.condition.icon}`;
                    cityTemperature.innerHTML = `${Math.round(weather.current.temp_c)}<span>°C</span>`;

                    // Attach a click handler to toggle Celsius/Fahrenheit on the temperature element.
                    // Note: this adds a new listener each time an option is clicked. In practice you
                    // might remove previous listeners or use a single listener that reads current state.
                    let isCelsius = true;
                    cityTemperature.addEventListener("click", () => {
                        if (isCelsius) {
                            cityTemperature.innerHTML = `${Math.round(weather.current.temp_f)}<span>°F</span>`;
                            cityTemperature.title = "click to display in Celsius";
                        } else {
                            cityTemperature.innerHTML = `${Math.round(weather.current.temp_c)}<span>°C</span>`;
                            cityTemperature.title = "click to display in Fahrenheit";
                        }
                        isCelsius = !isCelsius;
                    });

                    cityName.textContent = (`${weather.location.region}, ${weather.location.country}`).toUpperCase();
                    weatherInfo.textContent = weather.current.condition.text;
                    humidity.innerHTML = `${Math.round(weather.current.humidity)}<span>%</span>`;
                    windSpeed.innerHTML = `${Math.round(weather.current.wind_kph)}<span>km/h</span>`;
                    weatherDetails.classList.add('display');

                });

                optionContainer.appendChild(userOption);

                const optionName = document.createElement('p');
                optionName.classList.add('option-name');
                optionName.textContent = element.formatted;
                userOption.appendChild(optionName);

                const optionType = document.createElement('p');
                optionType.classList.add('option-type');

                // Display a human-readable type (country/continent or "type in country")
                if (element.components._type == "country" || element.components._type == "continent") {
                    optionType.textContent = element.components._type;
                } else optionType.textContent = `${element.components._type} in ${element.components.country}`

                userOption.appendChild(optionType);

            });

        } else if (data.length < 1) {
            // No matches found; surface an error to the user
            throw new Error(`No results for "${search}" did you spell it correctly?`);
        } else {
            // Exactly one match: fetch weather directly and display it
            showLoading(false);
            optionContainer.classList.remove('display');
            const weather = await getCityWeather(data[0].geometry.lat, data[0].geometry.lng);
            error.classList.remove('display');
            weatherIcon.src = `${weather.current.condition.icon}`;
            cityTemperature.innerHTML = `${Math.round(weather.current.temp_c)}<span>°C</span>`;

            // Temperature toggle (same caveat about multiple listeners applies)
            let isCelsius = true;
            cityTemperature.addEventListener("click", () => {
                if (isCelsius) {
                    cityTemperature.innerHTML = `${Math.round(weather.current.temp_f)}<span>°F</span>`;
                    cityTemperature.title = "click to display in Celsius";
                } else {
                    cityTemperature.innerHTML = `${Math.round(weather.current.temp_c)}<span>°C</span>`;
                    cityTemperature.title = "click to display in Fahrenheit";
                }
                isCelsius = !isCelsius;
            });

            cityName.textContent = (`${weather.location.region}, ${weather.location.country}`).toUpperCase();
            weatherInfo.textContent = weather.current.condition.text;
            humidity.innerHTML = `${Math.round(weather.current.humidity)}<span>%</span>`;
            windSpeed.innerHTML = `${Math.round(weather.current.wind_kph)}<span>km/h</span>`;
            weatherDetails.classList.add('display');

        }

    } catch (err) {

        // On any error, hide loading and show the error container with the message
        showLoading(false);
        optionContainer.classList.remove('display');
        weatherDetails.classList.remove('display');
        errorMessage.textContent = `Error: ${err.message}`;
        error.classList.add('display');

    }

}


// Utility: clear the search input field if it contains text
function clearInput() {
    if (searchBox.value != "") searchBox.value = "";
}


// Handle user input from the search box or search button
// Triggers when the user presses Enter in the input or clicks the search button.
async function getInput(event) {

    const city = searchBox.value.trim();

    // Only react to Enter keypresses or clicks
    if ((event.type === "keyup" && event.key == "Enter") || event.type === "click") {

        if (city === "") {
            // Empty input: hide other UI parts and show an error message
            loading.classList.remove('display');
            optionContainer.classList.remove('display');
            weatherDetails.classList.remove('display');
            errorMessage.textContent = "Search field is empty!";
            error.classList.add('display');

        } else {
            // Non-empty: proceed to fetch and display options/weather
            await showOptions(city);
        }

    }

}

// Initial UI setup: temperature tooltip and clearing input on load
cityTemperature.title = "click to display in Fahrenheit"; // initial title for city temperature
clearInput();

// Wire up event listeners for user interactions
searchBox.addEventListener("keyup", getInput); // Enter key handling
searchButton.addEventListener("click", getInput); // Click on search button

// Handle "use my location" button: fetch approximate location via Geoapify IP API
locationButton.addEventListener("click", async () => {

    try {

    clearInput();
    showLoading(true);
    const URL=`https://api.geoapify.com/v1/ipinfo?&apiKey=${LOCATION_API_KEY}`;
    const response=await fetch(URL);
    const data=await response.json();
    const weather=await getCityWeather(data.location.latitude, data.location.longitude);
    
    showLoading(false);
    optionContainer.classList.remove('display');
    error.classList.remove('display');
    weatherIcon.src=`${weather.current.condition.icon}`;
    cityTemperature.innerHTML=`${Math.round(weather.current.temp_c)}<span>°C</span>`;

    let isCelsius = true;
    cityTemperature.addEventListener("click", () => {
        if (isCelsius) {
            cityTemperature.innerHTML = `${Math.round(weather.current.temp_f)}<span>°F</span>`;
            cityTemperature.title="click to display in Celsius";
        } else {
            cityTemperature.innerHTML = `${Math.round(weather.current.temp_c)}<span>°C</span>`;
            cityTemperature.title="click to display in Fahrenheit";
        }
        isCelsius = !isCelsius;
    });

    cityName.textContent=(`${weather.location.region}, ${weather.location.country} (approximate location)`).toUpperCase();
    weatherInfo.textContent=weather.current.condition.text;
    humidity.innerHTML=`${Math.round(weather.current.humidity)}<span>%</span>`;
    windSpeed.innerHTML=`${Math.round(weather.current.wind_kph)}<span>km/h</span>`;
    weatherDetails.classList.add('display');
    
}catch(err){

    showLoading(false);
    optionContainer.classList.remove('display');
    weatherDetails.classList.remove('display');
    errorMessage.textContent=`Error: ${err.message}`;
    error.classList.add('display');

}

})
