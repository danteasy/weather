const API_KEY = "a82dcd3c7961435dad5192631232809";
const currentWeatherAPI =
    "https://api.weatherapi.com/v1/current.json?key=" + API_KEY;
const hourlyWeatherAPI =
    "https://api.weatherapi.com/v1/forecast.json?key=" + API_KEY;

let input = document.querySelector(".weather__input input");
let weatherNow = document.querySelector(".weather__now .weather__card");
let hourlyGrid = document.querySelector(".hourly__container .hourly__grid");

(function currentTime() {
    window.addEventListener("DOMContentLoaded", () => {
        t();
        setInterval(() => {
            t();
        }, 10000);
    });
    function t() {
        let timeContainer = document.querySelector(".time");
        let time = `${new Date().getHours()}:${new Date()
            .getMinutes()
            .toString()
            .padStart(2, "0")}`;
        timeContainer.innerHTML = "";
        timeContainer.innerHTML = time;
    }
})();

(function weatherSearch() {
    let inputValue;
    input.addEventListener("keyup", (e) => {
        inputValue = input.value;
        input.parentElement.classList.remove("error");
        input.value = input.value.replace(/[^a-zA-Z\s]/g, "");
        if (e.keyCode == 13) {
            if (inputValue.trim().length == 0) return;
            getWeather(inputValue);
            input.value = "";
        }
    });
    let searchIcon = document.querySelector(".search__icon");
    searchIcon.addEventListener("click", () => {
        getWeather(inputValue);
    });
})();

async function currentWeather(location) {
    weatherNow.classList.add("loading");

    try {
        response = await fetch(currentWeatherAPI + `&q=${location}`);
        if (response.ok) {
            response.json().then((data) => {
                [description, degrees, location, icon, humidity, lastUpdate] =
                    weatherNow.children;
                let temperature = data.current.temp_c;
                let place = `${data.location.name}, ${data.location.region}`;
                let weather = data.current.condition.text.toLowerCase();
                description.innerHTML = data.current.condition.text;
                degrees.innerHTML = temperature;
                location.innerHTML = place;
                lastUpdate.innerHTML = `Last updated: ${data.current.last_updated}`;
                humidity.innerHTML = "Humidity: " + data.current.humidity;
                icon.setAttribute("src", data.current.condition.icon);
                weatherNow.setAttribute("weather", weather);
            });
        } else {
            input.parentElement.classList.add("error");
            console.log("error");
        }
    } catch (err) {
        console.log(err);
    }
    weatherNow.classList.remove("loading");
    hourlyGrid.classList.remove("loading");
}

async function hourlyWeather(location) {
    try {
        response = await fetch(hourlyWeatherAPI + `&q=${location}`);
        if (response.ok) {
            response.json().then((data) => {
                hourlyGrid.innerHTML = "";
                let start = new Date().getHours() + 1;
                let forecastArray = data.forecast.forecastday[0].hour;

                for (let i = start; i < forecastArray.length; i++) {
                    let condition = forecastArray[i].condition.text;
                    let temp = forecastArray[i].temp_c;
                    let forecastTime = forecastArray[i].time.slice(
                        forecastArray[i].time.length - 5
                    );
                    let weatherIcon = forecastArray[i].condition.icon;
                    let card = `
                     <div class="weather__card">
                     <img class="icon" src="${weatherIcon}" alt="" />
                    <div class="weather__desc">${condition}</div>
                    <div class="degrees">${temp}</div>
                    <div class="hour">${forecastTime}</div>
                    </div>
                `;
                    hourlyGrid.insertAdjacentHTML("beforeend", card);
                }
            });
        }
    } catch (err) {
        console.log(err);
    }
}

(async function userBasedLocation() {
    const userIp = await fetch("https://api.ipify.org?format=json")
        .then((res) => res.json())
        .then((data) => data.ip);

    fetch("https://freeipapi.com/api/json/" + userIp)
        .then((res) => {
            if (res.ok) return res.json();
        })
        .then((data) => {
            let userLocation = data.countryName + " " + data.cityName;
            getWeather(userLocation);
        })
        .catch((err) => console.log(err));
})();

function getWeather(location) {
    currentWeather(location);
    hourlyWeather(location);
}
