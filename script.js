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

async function getOptions(input) {
    
    const URL=`https://api.opencagedata.com/geocode/v1/json?q=${input.toLowerCase()}&key=${CITY_API_KEY}`;
    const response=await fetch(URL);

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data=await response.json();

    if (data.error) {
        throw new Error(data.error.message);
    }

    const citiesOnly = data.results.filter(loc => loc.components._type);
    return citiesOnly;

}


async function getCityWeather(latitude, longitude){

    const URL=`https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${latitude},${longitude}`
    const response=await fetch(URL);

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data=await response.json();

    if (data.error) {
        throw new Error(data.error.message);
    }
    return data;
   
}


function showLoading(show=true){

    if(show){

        loading.classList.add('display');
        weatherDetails.classList.remove('display');
        optionContainer.classList.remove('display');
        error.classList.remove('display');

    } else loading.classList.remove('display');

}



async function showOptions(search) {

    showLoading(true);

    try{

        const data=await getOptions(search); 

        if(data.length>1){
            
            showLoading(false)
            optionContainer.innerHTML='';
            weatherDetails.classList.remove('display');
            error.classList.remove('display');
            const searchResponse=document.createElement('p');
            searchResponse.innerHTML=`We found ${data.length} results for <span>${search.toUpperCase()}</span>, 
            select the one you're searching for`;
            searchResponse.classList.add('search-response');
            optionContainer.appendChild(searchResponse);
            optionContainer.classList.add('display');
            data.forEach(element => {

                const userOption=document.createElement('div');
                userOption.classList.add('user-option');
    
                userOption.addEventListener('click', async ()=>{
                
                    showLoading(true);
                    const weather=await getCityWeather(element.geometry.lat, element.geometry.lng);
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
                
                    cityName.textContent=(`${weather.location.region}, ${weather.location.country}`).toUpperCase();
                    weatherInfo.textContent=weather.current.condition.text;
                    humidity.innerHTML=`${Math.round(weather.current.humidity)}<span>%</span>`;
                    windSpeed.innerHTML=`${Math.round(weather.current.wind_kph)}<span>km/h</span>`;
                    weatherDetails.classList.add('display');
            
                })
    
                optionContainer.appendChild(userOption);
    
                const optionName=document.createElement('p');
                optionName.classList.add('option-name');
                optionName.textContent=element.formatted;
                userOption.appendChild(optionName);
    
                const optionType=document.createElement('p');
                optionType.classList.add('option-type');
            
                if (element.components._type=="country" || element.components._type=="continent"){
                optionType.textContent=element.components._type;
                } else optionType.textContent=`${element.components._type} in ${element.components.country}`
    
                userOption.appendChild(optionType);
    
            });

        } else if (data.length<1) {
            throw new Error(`No results for "${search}" did you spell it correctly?`);
        } else {

            showLoading(false);
            optionContainer.classList.remove('display');
            const weather=await getCityWeather(data[0].geometry.lat, data[0].geometry.lng);
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
        

            cityName.textContent=(`${weather.location.region}, ${weather.location.country}`).toUpperCase();
            weatherInfo.textContent=weather.current.condition.text;
            humidity.innerHTML=`${Math.round(weather.current.humidity)}<span>%</span>`;
            windSpeed.innerHTML=`${Math.round(weather.current.wind_kph)}<span>km/h</span>`;
            weatherDetails.classList.add('display');
            
        }

    } catch (err) {
        
        showLoading(false);
        optionContainer.classList.remove('display');
        weatherDetails.classList.remove('display');
        errorMessage.textContent=`Error: ${err.message}`;
        error.classList.add('display');

    }

}


function clearInput(){
    if(searchBox.value!="") searchBox.value="";
}


async function getInput(event){

    const city = searchBox.value.trim();
    
    if ((event.type === "keyup" && event.key == "Enter")||event.type==="click"){

        if (city === ""){

            loading.classList.remove('display');
            optionContainer.classList.remove('display');
            weatherDetails.classList.remove('display');
            errorMessage.textContent="Search field is empty!";
            error.classList.add('display');
            
        } else {
            await showOptions(city);
        }
        
    }
    
}

cityTemperature.title="click to display in Fahrenheit"; //initial title for city temperature
clearInput();
searchBox.addEventListener("keyup", getInput);
searchButton.addEventListener("click", getInput);
locationButton.addEventListener("click", async ()=>{

try{   

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

    cityName.textContent=(`${weather.location.country} (approximate location)`).toUpperCase();
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