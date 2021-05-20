const api_key = "11b2c2e5fd8380b21f67b18f7289b0fa";
const geo_api_key = "DmS0kNlLLlhlMtyuGdNBvdgSYyudh9mj";

// SEARCH
const searchBtn = document.getElementById("searchbtn");
const searchForm = document.getElementById("searchform");
const cityName = document.getElementById("searchlocation");

searchBtn.addEventListener("click", function () {
  getPlaceSearchedFor(cityName.value);
});

cityName.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    getPlaceSearchedFor(cityName.value);
  }
});

let lat = 47;
let lon = 19;

let placeSearchedFor;
let solunarApi;
let moonIllumApi;
let moonTransitApi;

// dom variables

// catch info panel
const catchInfo = document.querySelector("#catchinfo");
const catchMoonphase = document.querySelector("#catchmoonphase");
const catchPressure = document.querySelector("#catchpressure");

// current weather info panel
const currentTemp = document.querySelector("#currenttemp");
const currentDesc = document.querySelector("#currentdesc");

const saveBtn = document.getElementById("saveplace");
const saveUserPlace = document.getElementById("save_user_place");
const currentlocation = document.querySelector("#currentlocation");

const currentSunrise = document.querySelector("#currentsunrise");
const currentSunset = document.querySelector("#currentsunset");
const dailyMaxtemp = document.querySelector("#dailymaxtemp");
const currentWind = document.querySelector("#currentwind");
const currentpressure = document.querySelector("#currentpressure");
const currentUvi = document.querySelector("#currentuvi");

// solunar info panel
const moonRise = document.querySelector("#moonrise");
const moonSet = document.querySelector("#moonset");
const moonTransit = document.querySelector("#moontransit");
const moonIllumination = document.querySelector("#moonillumination");

function getPlaceSearchedFor(cityName) {
  fetch(
    "http://www.mapquestapi.com/geocoding/v1/address?key=" +
      geo_api_key +
      "&boundingBox=48.71151565582443,15.763360269906011,45.76408154695575,23.456176456578515&location=" +
      cityName
  )
    .then(function (u) {
      return u.json();
    })
    .then(function (json) {
      placeSearchedFor = json;
      console.log(placeSearchedFor);
      displayCityName();
      setLocationCookie(cityName, 7);
    })
    .catch((err) => {
      alert("A keresett település nem található.");
      console.error(err);
    });
}

function displayCityName() {
  cityName.value = "";

  let lat = placeSearchedFor.results[0].locations[0].displayLatLng.lat;
  let lon = placeSearchedFor.results[0].locations[0].displayLatLng.lng;

  cLocation = placeSearchedFor.results[0].locations[0].adminArea5;
  currentlocation.innerHTML = cLocation;

  if (cLocation) {
    saveUserPlace.value = cLocation;
    saveBtn.disabled = false;
    saveBtn.style.display = "block";
  } else {
    currentlocation.innerHTML = "Magyarország";
    saveBtn.disabled = true;
    saveBtn.style.display = "none";
  }

  getOneCallWeatherData(lat, lon);
  solunarApi = SunCalc.getMoonTimes(new Date(), lat, lon, true);
  moonIllumApi = SunCalc.getMoonIllumination(new Date());
  moonTransitApi = SunCalc.getMoonPosition(new Date(), lat, lon);
  console.log(solunarApi, moonIllumApi);
  displaySolunarData();
}

function getOneCallWeatherData(lat, lon) {
  fetch(
    "https://api.openweathermap.org/data/2.5/onecall?lat=" +
      lat +
      "&lon=" +
      lon +
      "&units=metric&lang=hu&exclude=minutely&appid=" +
      api_key
  )
    .then(function (u) {
      return u.json();
    })
    .then(function (json) {
      oneCallWeatherData = json;
      console.log(oneCallWeatherData);
      displayOneCallWeatherData();
      displayCatchinfo();
      createTableTwentyFour();
      createTableWeek();
    })
    .catch((err) => {
      alert("Időjárásadatok nem találhatóak");
      console.error(err);
    });
}

/* function fetchSolunarApi(lat, lon) {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1;

  var yyyy = today.getFullYear();
  if (dd < 10) {
    dd = "0" + dd;
  }
  if (mm < 10) {
    mm = "0" + mm;
  }
  var today = yyyy + mm + dd;

  fetch(
    "https://api.solunar.org/solunar/" +
      lat +
      "," +
      lon +
      "," +
      today +
      "," +
      "+1"
  )
    .then(function (s) {
      return s.json();
    })
    .then(function (json) {
      solunarApi = json;
      console.log(solunarApi);
      displaySolunarData();
    })
    .catch((err) => {
      alert("A szolunáris adatbázis nem válaszol");
      console.error(err);
    });
} */

function displayOneCallWeatherData() {
  cTemp = Math.round(oneCallWeatherData.current.temp) + "&#xb0;";
  cDesc = oneCallWeatherData.current.weather[0].description;

  cSunrise = convertTimestampToHours(oneCallWeatherData.current.sunrise);
  cSunset = convertTimestampToHours(oneCallWeatherData.current.sunset);
  dMaxtemp = Math.floor(oneCallWeatherData.daily[0].temp.max);
  cWind =
    convertWind(oneCallWeatherData.current.wind_deg) +
    " " +
    Math.floor(oneCallWeatherData.current.wind_speed * 3.6) +
    " km/h";
  cPressure = oneCallWeatherData.current.pressure;
  cUvi = oneCallWeatherData.current.uvi;

  currentTemp.innerHTML = cTemp;
  currentDesc.innerHTML = cDesc + " itt:";

  currentSunrise.innerHTML = cSunrise;
  currentSunset.innerHTML = cSunset;
  dailyMaxtemp.innerHTML = dMaxtemp;
  currentWind.innerHTML = cWind;
  currentpressure.innerHTML = cPressure;
  currentUvi.innerHTML = cUvi;
}

function displaySolunarData() {
  mRise = formatTime(solunarApi.rise);
  mSet = formatTime(solunarApi.set);
  mTransit = Math.floor(moonTransitApi.altitude * 100) + "&#176;";

  moonRise.innerHTML = mRise;
  moonSet.innerHTML = mSet;
  moonTransit.innerHTML = mTransit;
}

function createTableTwentyFour() {
  let tabledaily = document.getElementById("twentyfourtable");
  let deletedaily = document.getElementById("deletedaily");
  let createdaily = document.createElement("tbody");
  let row;
  let cell;

  let yesnodaily = tabledaily.contains(deletedaily);
  // console.log("daily" + yesnodaily);

  if (yesnodaily) {
    tabledaily.removeChild(deletedaily);
    tabledaily.appendChild(createdaily);
    createdaily.id = "deletedaily";
  }

  row = tabledaily.insertRow(0);
  for (i = 23; i >= 0; i--) {
    cell = row.insertCell(0);
    cell.innerHTML =
      "<span class='gray'>" +
      convertWind(oneCallWeatherData.hourly[i].wind_deg) +
      "</span><br>" +
      Math.floor(oneCallWeatherData.hourly[i].wind_speed * 3.6) +
      " km/h";
  }
  cell = row.insertCell(0);
  cell.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler                          icon-tabler-wind" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#040F16" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
    '<path stroke="none" d="M0 0h24v24H0z"></path>' +
    '<path d="M5 8h8.5a2.5 2.5 0 1 0 -2.34 -3.24"></path>' +
    '<path d="M3 12h15.5a2.5 2.5 0 1 1 -2.34 3.24"></path>' +
    '<path d="M4 16h5.5a2.5 2.5 0 1 1 -2.34 3.24"></path>' +
    "</svg>";

  row = tabledaily.insertRow(0);
  for (i = 23; i >= 0; i--) {
    cell = row.insertCell(0);
    cell.innerHTML = oneCallWeatherData.hourly[i].pressure;
  }
  cell = row.insertCell(0);
  cell.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-dashboard" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#040F16" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
    '<path stroke="none" d="M0 0h24v24H0z"></path>' +
    '<circle cx="12" cy="13" r="2"></circle>' +
    '<line x1="13.45" y1="11.55" x2="15.5" y2="9.5"></line>' +
    '<path d="M6.4 20a9 9 0 1 1 11.2 0Z"></path>' +
    "</svg>";

  row = tabledaily.insertRow(0);
  for (i = 23; i >= 0; i--) {
    cell = row.insertCell(0);
    cell.innerHTML = (oneCallWeatherData.hourly[i].pop) * 100 + "%";
  }
  cell = row.insertCell(0);
  cell.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-cloud-rain" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#040F16" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
    '<path stroke="none" d="M0 0h24v24H0z"></path>' +
    '<path d="M7 18a4.6 4.4 0 0 1 0 -9h0a5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7"></path>' +
    '<path d="M11 13v2m0 3v2m4 -5v2m0 3v2"></path>' +
    "</svg>";

  row = tabledaily.insertRow(0);
  for (i = 23; i >= 0; i--) {
    cell = row.insertCell(0);
    cell.innerHTML = Math.round(oneCallWeatherData.hourly[i].temp) + "&#xb0;";
  }
  cell = row.insertCell(0);
  cell.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-temperature" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#040F16" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
    '<path stroke="none" d="M0 0h24v24H0z"></path>' +
    '<path d="M10 13.5a4 4 0 1 0 4 0v-8.5a2 2 0 0 0 -4 0v8.5"></path>' +
    '<line x1="10" y1="9" x2="14" y2="9"></line>' +
    "</svg>";

  row = tabledaily.insertRow(0);
  for (i = 23; i >= 0; i--) {
    cell = row.insertCell(0);
    cell.innerHTML =
      '<img class="weathericon" src="https://openweathermap.org/img/wn/' +
      oneCallWeatherData.hourly[i].weather[0].icon +
      '@2x.png">';
  }
  cell = row.insertCell(0);
  cell.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-cloud" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#040F16" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
    '<path stroke="none" d="M0 0h24v24H0z"></path>' +
    '<path d="M7 18a4.6 4.4 0 0 1 0 -9h0a5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7h-12"></path>' +
    "</svg>";

  row = tabledaily.insertRow(0);
  for (i = 23; i >= 0; i--) {
    cell = row.insertCell(0);
    cell.innerHTML = convertTimestampToHours(oneCallWeatherData.hourly[i].dt);
  }
  cell = row.insertCell(0);
  cell.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-clock" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#040F16" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
    '<path stroke="none" d="M0 0h24v24H0z"></path>' +
    '<circle cx="12" cy="12" r="9"></circle>' +
    '<polyline points="12 7 12 12 15 15"></polyline>' +
    "</svg>";
}

function createTableWeek() {
  let tableweekly = document.getElementById("weeklytable");
  let deleteweekly = document.getElementById("deleteweekly");
  let createweekly = document.createElement("tbody");
  let row;
  let cell;

  let yesnoweekly = tableweekly.contains(deleteweekly);
  // console.log("weekly" + yesnoweekly);

  if (yesnoweekly) {
    tableweekly.removeChild(deleteweekly);
    tableweekly.appendChild(createweekly);
    createweekly.id = "deleteweekly";
  }

  mIllumination =
    Math.floor(moonIllumApi.fraction * 100) + "%";
  // console.log(new Date().getTime());
  moonIllumination.innerHTML = mIllumination;

  row = tableweekly.insertRow(0);
  for (i = 7; i > 0; i--) {
    cell = row.insertCell(0);
    cell.innerHTML =
      Math.floor(SunCalc.getMoonIllumination(oneCallWeatherData.daily[i].dt * 1000).fraction * 100) + "%";
  }
  cell = row.insertCell(0);
  cell.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-moon" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#040F16" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
    '<path stroke="none" d="M0 0h24v24H0z"></path>' +
    '<path d="M16.2 4a9.03 9.03 0 1 0 3.9 12a6.5 6.5 0 1 1 -3.9 -12"></path>' +
    "</svg>";

  row = tableweekly.insertRow(0);
  for (i = 7; i > 0; i--) {
    cell = row.insertCell(0);
    cell.innerHTML = oneCallWeatherData.daily[i].pressure;
  }
  cell = row.insertCell(0);
  cell.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-dashboard" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#040F16" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
    '<path stroke="none" d="M0 0h24v24H0z"></path>' +
    '<circle cx="12" cy="13" r="2"></circle>' +
    '<line x1="13.45" y1="11.55" x2="15.5" y2="9.5"></line>' +
    '<path d="M6.4 20a9 9 0 1 1 11.2 0Z"></path>' +
    "</svg>";

  row = tableweekly.insertRow(0);
  for (i = 7; i > 0; i--) {
    cell = row.insertCell(0);
    cell.innerHTML = (oneCallWeatherData.daily[i].pop) * 100 + "%";
  }
  cell = row.insertCell(0);
  cell.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-cloud-rain" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#040F16" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
    '<path stroke="none" d="M0 0h24v24H0z"></path>' +
    '<path d="M7 18a4.6 4.4 0 0 1 0 -9h0a5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7"></path>' +
    '<path d="M11 13v2m0 3v2m4 -5v2m0 3v2"></path>' +
    "</svg>";

  row = tableweekly.insertRow(0);
  for (i = 7; i > 0; i--) {
    cell = row.insertCell(0);
    cell.innerHTML =
      Math.floor(oneCallWeatherData.daily[i].temp.max) +
      "&#176<br>" +
      "<span class='gray'>" +
      Math.floor(oneCallWeatherData.daily[i].temp.min) +
      "&#176" +
      "</span>";
  }
  cell = row.insertCell(0);
  cell.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-temperature" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#040F16" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
    '<path stroke="none" d="M0 0h24v24H0z"></path>' +
    '<path d="M10 13.5a4 4 0 1 0 4 0v-8.5a2 2 0 0 0 -4 0v8.5"></path>' +
    '<line x1="10" y1="9" x2="14" y2="9"></line>' +
    "</svg>";

  row = tableweekly.insertRow(0);
  for (i = 7; i > 0; i--) {
    cell = row.insertCell(0);
    cell.innerHTML =
      '<img class="weathericon" src="https://openweathermap.org/img/wn/' +
      oneCallWeatherData.daily[i].weather[0].icon +
      '@2x.png">';
  }
  cell = row.insertCell(0);
  cell.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-cloud" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#040F16" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
    '<path stroke="none" d="M0 0h24v24H0z"></path>' +
    '<path d="M7 18a4.6 4.4 0 0 1 0 -9h0a5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7h-12"></path>' +
    "</svg>";

  row = tableweekly.insertRow(0);
  for (i = 7; i > 0; i--) {
    cell = row.insertCell(0);
    cell.innerHTML = convertTimestampToDay(oneCallWeatherData.daily[i].dt);
  }
  cell = row.insertCell(0);
  cell.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-calendar-event" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#040F16" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
    '<path stroke="none" d="M0 0h24v24H0z"></path>' +
    '<rect x="4" y="5" width="16" height="16" rx="2"></rect>' +
    '<line x1="16" y1="3" x2="16" y2="7"></line>' +
    '<line x1="8" y1="3" x2="8" y2="7"></line>' +
    '<line x1="4" y1="11" x2="20" y2="11"></line>' +
    '<rect x="8" y="15" width="2" height="2"></rect>' +
    "</svg>";
}

function calcMoonIllumination(timestamp) {
  let moonIllumination;

  currentDate = timestamp * 1000;

  let year = new Date(currentDate).getFullYear();
  let month = new Date(currentDate).getMonth() + 1;
  let day = new Date(currentDate).getDate();

  let moonPhase = Conway(year, month, day);

  if (moonPhase <= 15) {
    moonIllumination = (moonPhase / 15) * 100;
  } else {
    let moonWaning = moonPhase - 15;
    moonIllumination = (((15 - moonWaning) * 2) / 30) * 100;
  }

  return moonIllumination;
}

// get moon illumination - source: http://www.ben-daglish.net/moon.shtml
function Conway(year, month, day) {
  var r = year % 100;
  r %= 19;
  if (r > 9) {
    r -= 19;
  }
  r = ((r * 11) % 30) + parseInt(month) + parseInt(day);
  if (month < 3) {
    r += 2;
  }
  r -= year < 2000 ? 4 : 8.3;
  r = Math.floor(r + 0.5) % 30;
  return r < 0 ? r + 30 : r;
}

// catch info panel
function displayCatchinfo() {
  let t0Pressure = oneCallWeatherData.hourly[0].pressure;
  let t1Pressure = oneCallWeatherData.hourly[2].pressure;
  let todayMoonPhase = Math.floor(
    calcMoonIllumination(oneCallWeatherData.current.dt)
  );
  let tomorrowMoonPhase = Math.floor(
    calcMoonIllumination(oneCallWeatherData.daily[1].dt)
  );

  if (
    t0Pressure < t1Pressure &&
    (todayMoonPhase >= 95 || todayMoonPhase <= 5)
  ) {
    catchInfo.innerHTML = "Kiváló <span class='gray'>fogási esély</span>";
  } else if (t0Pressure < t1Pressure) {
    catchInfo.innerHTML = "Jó <span class='gray'>fogási esély</span>";
  } else if (t0Pressure > t1Pressure) {
    catchInfo.innerHTML = "Gyenge <span class='gray'>fogási esély</span>";
  } else {
    catchInfo.innerHTML = "Közepes <span class='gray'>fogási esély</span>";
  }

  if (todayMoonPhase >= 99) {
    catchMoonphase.innerHTML = "Újhold";
  }
  if (todayMoonPhase < tomorrowMoonPhase) {
    catchMoonphase.innerHTML = "Növő <span class='gray'>Hold</span>";
  }
  if (todayMoonPhase > tomorrowMoonPhase) {
    catchMoonphase.innerHTML = "Fogyó <span class='gray'>Hold</span>";
  }
  if (todayMoonPhase <= 1) {
    catchMoonphase.innerHTML = "Újhold";
  }

  if (t0Pressure > t1Pressure) {
    catchPressure.innerHTML = "Csökkenő <span class='gray'>légnyomás</span>";
  } else if (t0Pressure < t1Pressure) {
    catchPressure.innerHTML = "Növekvő <span class='gray'>légnyomás</span>";
  } else {
    catchPressure.innerHTML = "Stagnáló <span class='gray'>légnyomás</span>";
  }
}

// convert timestamp to hours
function convertTimestampToHours(timestamp) {
  let time = timestamp * 1000;
  let h = new Date(time).getHours();
  let m = new Date(time).getMinutes();

  h = h < 10 ? "0" + h : h;
  m = m < 10 ? "0" + m : m;

  let output = h + ":" + m;

  return output;
}

// time format
function formatTime(giventime) {
  let h = new Date(giventime).getHours();
  let m = new Date(giventime).getMinutes();

  h = h < 10 ? "0" + h : h;
  m = m < 10 ? "0" + m : m;

  let output = h + ":" + m;

  return output;
};

// convert timestamp to days
function convertTimestampToDay(timestamp) {
  let time = timestamp * 1000;
  let day = new Date(time).getDay();

  let days = [
    "Vasárnap",
    "Hétfő",
    "Kedd",
    "Szerda",
    "Csütörtök",
    "Péntek",
    "Szombat",
  ];

  return days[day];
}

// convert timestamp to days month years
function convertTimestamptoddmmyy(timestamp) {
  currentDate = timestamp * 1000;

  let currentDayOfMonth = new Date(currentDate).getDate();
  let currentMonth = new Date(currentDate).getMonth(); // Be careful! January is 0, not 1
  let currentYear = new Date(currentDate).getFullYear();

  let dateString =
    currentYear + ", " + (currentMonth + 1) + ", " + currentDayOfMonth;

  return dateString;
}

// convert wind degree to Cardinal direction
function convertWind(deg) {
  if (deg > 22 && deg <= 67) {
    return "ÉK";
  }
  if (deg > 68 && deg <= 112) {
    return "K";
  }
  if (deg > 113 && deg <= 157) {
    return "DK";
  }
  if (deg > 158 && deg <= 202) {
    return "D";
  }
  if (deg > 203 && deg <= 247) {
    return "DNy";
  }
  if (deg > 248 && deg <= 292) {
    return "Ny";
  }
  if (deg > 293 && deg <= 337) {
    return "ÉNy";
  } else {
    return "É";
  }
}

function RemoveAccents(strAccents) {
  var strAccents = strAccents.split("");
  var strAccentsOut = new Array();
  var strAccentsLen = strAccents.length;
  var accents =
    "ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž";
  var accentsOut =
    "AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz";
  for (var y = 0; y < strAccentsLen; y++) {
    if (accents.indexOf(strAccents[y]) != -1) {
      strAccentsOut[y] = accentsOut.substr(accents.indexOf(strAccents[y]), 1);
    } else strAccentsOut[y] = strAccents[y];
  }
  strAccentsOut = strAccentsOut.join("");
  return strAccentsOut;
}

// set locaion cookie

function setLocationCookie(cvalue, exdays) {
  cvalue = RemoveAccents(cvalue);
  let d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = "expires=" + d.toUTCString();
  document.cookie = "search_location=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function checkCookie() {
  let location = getCookie("search_location");
  if (location != "") {
    return location;
  } else {
    return 0;
  }
}

function gsapAnimations() {
  gsap.from(".gsapdelay1", {delay: 0.3, duration: 1, opacity: 0, y: -35, ease: "power2.out"});
  gsap.from(".gsapdelay2", {delay: 0.6, duration: 1.1, opacity: 0, y: -35, ease: "power2.out"});
  gsap.from(".gsapdelay3", {delay: 0.8, duration: 1.2, opacity: 0, y: -25, ease: "power2.out"});
  gsap.from("#logo", {delay: 1.3, duration: 1, opacity: 0, y: -25, ease: "power2.out"});
  gsap.from(".gsapdelay4", {delay: 1, duration: 1.3, opacity: 0, y: -35, ease: "power2.out"});
  gsap.from(".gsapdelay5", {delay: 1.2, duration: 1.4, opacity: 0, y: -35, ease: "power2.out"});
}

window.onload = () => {
  if (checkCookie()) {
    let location = checkCookie();
    getPlaceSearchedFor(location);
  } else {
    getPlaceSearchedFor("magyarország");
  }
};
