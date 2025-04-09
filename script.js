const weatherDetails=document.querySelector('.weather-details');
const searchBox=document.querySelector('.search-city');
const searchButton=document.querySelector('.search-button');
const weatherIcon=document.querySelector('.weather-icon');
const cityTemperature=document.querySelector('.temperature');
const cityName=document.querySelector('.city-name');
const weatherInfo=document.querySelector('.weather-info');
const humidity=document.querySelector('.humidity');
const windSpeed=document.querySelector('.wind-speed');
const API_KEY="7570efae07684e95a00165420250604";
const error=document.querySelector('.error');
const errorMessage=document.querySelector('.error-message');

async function getCityWeather(city){

        const URL=`http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}&aqi=yes`
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

async function showWeather(city) {

    try {

        const data=await getCityWeather(city);
        error.classList.remove('display');
        weatherIcon.src=`${data.current.condition.icon}`;
        cityTemperature.innerHTML=`${Math.round(data.current.temp_c)}<span>°C</span>`;
        cityName.textContent=data.location.country.toUpperCase();
        weatherInfo.textContent=data.current.condition.text;
        humidity.innerHTML=`${Math.round(data.current.humidity)}<span>%</span>`;
        windSpeed.innerHTML=`${Math.round(data.current.wind_kph)}<span>km/h</span>`;
        weatherDetails.classList.add('display');
        console.log(data);

    } catch (err) {

        weatherDetails.classList.remove('display');
        errorMessage.textContent=`Error: ${err.message}`;
        error.classList.add('display');
        console.log(err.message);

    }

}

function clearInput(){
    if(searchBox.value!="") searchBox.value="";
}

function showElements(){
    
}

async function getInput(event){

    const city = searchBox.value.trim();
    
    
    if ((event.type === "keyup" && event.key == "Enter")||event.type==="click"){

        if (city === ""){

            weatherDetails.classList.remove('display');
            errorMessage.textContent="Search field is empty!";
            error.classList.add('display');
     
        } else await showWeather(city);
        
    }
    
    

}

clearInput();
searchBox.addEventListener("keyup", getInput);
searchButton.addEventListener("click", getInput);





