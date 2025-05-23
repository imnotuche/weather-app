# Weather App

A simple weather app built with vanilla JavaScript, HTML, and CSS.

## Features

- Search weather by city name.
- Detect your location via IP-based lookup (triggered by clicking a button).
- Displays current temperature, condition, and other weather details.
- Uses three APIs:
  - WeatherAPI (https://www.weatherapi.com/) for weather data.
  - OpenCageData (https://opencagedata.com/) to convert city names into coordinates.
  - Geoapify (https://www.geoapify.com/) to detect location from IP and get coordinates.

## How to Use

1. Open `index.html` in your browser.
2. Enter a city name and click search, **or**
3. Click the "Detect Location" button to get weather based on your current IP location.
4. Weather information will update dynamically.

## API Keys

You need API keys for all three services. They are hardcoded inside the frontend JavaScript file.

- `WEATHER_API_KEY` — from WeatherAPI.
- `CITY_API_KEY` — from OpenCageData.
- `LOCATION_API_KEY` — from Geoapify.

## Notes

- This app does **not** use Vue.js or any frontend frameworks.
- No smooth transitions or animations implemented.
- No backend server — purely frontend.
- API keys are included directly in the frontend JavaScript (not recommended for production).

## How to Run

Just open `index.html` in your browser (no server needed).

---

my apologies for lack of comments in this project---rookie mistake  (might fix later)
