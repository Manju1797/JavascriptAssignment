//Declare a variable to store the searched city
var city = "";
// variable declaration
var searchCity = $("#search-city");
var searchButton = $("#search-button");
var clearButton = $("#clear-history");
var currentCity = $("#current-city");
var currentTemperature = $("#temperature");
var currentHumidty = $("#humidity");
var currentWSpeed = $("#wind-speed");
var currentUvindex = $("#uv-index");
var sCity = [];
// searches the city to see if it exists in the entries from the storage
function find(c) {
 
  for (var i = 0; i < sCity.length; i++) {
    if (c.toUpperCase() === sCity[i]) {
      return -1;
    }
  }
  return 1;
}
//Generate the API key from the service
var APIKey = "";
// Display the curent and future weather to the user after grabing the city form the input text box.
function displayWeather(event) {
  event.preventDefault();
  console.log(event.target.value)
  if (searchCity.val().trim() !== "") {

    city = searchCity.val().trim();
    currentWeather(city);
  }
  else{
    alert("enter city name")
  }
}

// Here we create the AJAX call
function currentWeather(city) {
  // Here we build the URL so we can get a data from server side.
  var queryURL =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    city +
    "&APPID=" +
    APIKey;
    $.ajax({
      url: queryURL,
    method: "GET",
      success: function(response) {
          try {
            var weathericon = response.weather[0].icon;
            var iconurl =
              "https://openweathermap.org/img/wn/" + weathericon + "@2x.png";
            var date = new Date(response.dt * 1000).toLocaleDateString();
            $(currentCity).html(
              response.name + "(" + date + ")" + "<img src=" + iconurl + ">"
            );
            var tempF = (response.main.temp - 273.15) * 1.8 + 32;
            $(currentTemperature).html(tempF.toFixed(2) + "&#8457");
            $(currentHumidty).html(response.main.humidity + "%");
            var ws = response.wind.speed;
            var windsmph = (ws * 2.237).toFixed(1);
            $(currentWSpeed).html(windsmph + "MPH");
            UVIndex(response.coord.lon, response.coord.lat);
            forecast(response.id);
            if (response.cod == 200) {
              sCity = JSON.parse(localStorage.getItem("cityname"));
              console.log(sCity);
              if (sCity == null) {
                sCity = [];
                sCity.push(city.toUpperCase());
                localStorage.setItem("cityname", JSON.stringify(sCity));
                addToList(city);
              } else {
                if (find(city) > 0) {
                  sCity.push(city.toUpperCase());
                  localStorage.setItem("cityname", JSON.stringify(sCity));
                  addToList(city);
                }
              }
            }
          
          } catch (e) {
              alert('json parse error');
          }
      },
      error: function() {
          alert('Enter valid city');
      }
  });
  }
// This function returns the UVIindex response.
function UVIndex(ln, lt) {
  //lets build the url for uvindex.
  var uvqURL =
    "https://api.openweathermap.org/data/2.5/uvi?appid=" +  APIKey +  "&lat=" + lt + "&lon=" +  ln;
  $.ajax({
    url: uvqURL,
    method: "GET",
  }).then(function (response) {
    $(currentUvindex).html(response.value);
  });
}
// Here we display the 5 days forecast for the current city.
function forecast(cityid) {
  var queryforcastURL =
    "https://api.openweathermap.org/data/2.5/forecast?id=" + cityid + "&appid=" + APIKey;
  $.ajax({
    url: queryforcastURL,
    method: "GET",
  }).then(function (response) {
    console.log("response list", response.list);
    for (i = 0; i < 5; i++) {
      let index = (i + 1) * 8 - 1;
      var iconcode = response.list[index].weather[0].icon;
      var iconurl = "https://openweathermap.org/img/wn/" + iconcode + ".png";
      $("#fDate" + i).html( new Date(response.list[index].dt * 1000).toLocaleDateString());
      $("#fImg" + i).html("<img src=" + iconurl + ">");
      $("#fTemp" + i).html(((response.list[index].main.temp - 273.5) * 1.8 + 32).toFixed(2) +  "&#8457" );
      $("#fHumidity" + i).html(response.list[index].main.humidity + "%");
    }
  });
}
//Daynamically add the passed city on the search history
function addToList(c) {
  var listEl = $("<li>" + c.toUpperCase() + "</li>");
  $(listEl).attr("class", "list-group-item");
  $(listEl).attr("data-value", c.toUpperCase());
  $(".list-group").append(listEl);
}
// display the past search again when the list group item is clicked in search history
function invokePastSearch(event) {
  var liEl = event.target;
  if (event.target.matches("li")) {
    city = liEl.textContent.trim();
    currentWeather(city);
  }
}

// render function
function loadlastCity() {
  $("ul").empty();
  var sCity = JSON.parse(localStorage.getItem("cityname"));
  if (sCity !== null) {
    sCity = JSON.parse(localStorage.getItem("cityname"));
    for (i = 0; i < sCity.length; i++) {
      addToList(sCity[i]);
    }
    city = sCity[i - 1];
    currentWeather(city);
  }
}
$(document).ready(function() {
  localStorage.clear();
});


//Clear the search history from the page
function clearHistory(event) {
  event.preventDefault();
  sCity = [];
  localStorage.removeItem("cityname");
  document.location.reload();
}
//Click Handlers
$("#search-button").on("click", displayWeather);
$(document).on("click", invokePastSearch);
$(window).on("load", loadlastCity);
$("#clear-history").on("click", clearHistory);
