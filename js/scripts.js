/*eslint-env browser*/
var todayCalArr = [],
  today,
  yesterday,
  tomorrow,
  indexes = [],
  datePickedArr = [],
  allCalArr = [],
  eventMapLinks = [],
  writeAll,
  updatedThisSession = false;

// I eventually want to grab the google calendar api data for today, and they format it in yy-mm-dd so this function helps setDates()
function convertDateFormat(date) {
  "use strict";
  var placeholder = date;
  // var placeholder = new Date(date);
  date = placeholder.getFullYear() + "-";

  if (placeholder.getMonth() + 1 < 10) {
    date = date + "0" + (placeholder.getMonth() + 1) + "-";
  } else {
    date = date + (placeholder.getMonth() + 1) + "-";
  }
  if (placeholder.getDate() < 10) {
    date = date + "0" + placeholder.getDate();
  } else {
    date = date + placeholder.getDate();
  }
  return date;
}

//Set yesterday, today, and tomorrow as dates
function setDates(datePicked) {
  "use strict";
  if (datePicked) {
    today = new Date(datePicked);
    console.log("date was picked successfully");
  } else {
    today = new Date();
  }
  yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  console.log(yesterday + "\n" + today + "\n" + tomorrow);

  //Convert yesterday, today, and tomorrow in yy-mm-dd format through convertDateFormat() helper function
  yesterday = convertDateFormat(yesterday);
  today = convertDateFormat(today);
  tomorrow = convertDateFormat(tomorrow);
  console.log(yesterday + "\n" + today + "\n" + tomorrow);

  getCalDataLocal();
}

// loop through and pull todays events, but get at least 4 upcoming events even if they're in the future
function setUpcomingArray() {
  "use strict";
  for (var i = 0, atLeastFour = 0; i < allCalArr.items.length; i++) {
    if (
      allCalArr.items[i].start.dateTime.slice(0, 10) === today ||
      allCalArr.items[i].end.dateTime.slice(0, 10) === today ||
      (allCalArr.items[i].start.dateTime.slice(0, 10) === yesterday &&
        allCalArr.items[i].end.dateTime.slice(0, 10) === tomorrow) ||
      i < atLeastFour
    ) {
      if (atLeastFour === 0) {
        atLeastFour = Number(i + 4);
      }
      todayCalArr.push([
        allCalArr.items[i].summary,
        allCalArr.items[i].location,
        [
          allCalArr.items[i].start.dateTime,
          allCalArr.items[i].start.dateTime.slice(0, 10),
          allCalArr.items[i].start.dateTime.slice(11, 16)
        ],
        [
          allCalArr.items[i].start.dateTime,
          allCalArr.items[i].end.dateTime.slice(0, 10),
          allCalArr.items[i].end.dateTime.slice(11, 16)
        ]
      ]);
    }
  }
  set12Hour();
}

// if it's stored in localStorage and last updated today get from localstorage, otherwise get from google calendars api
function getCalDataLocal() {
  "use strict";
  if (localStorage.storedallCalArr && updatedThisSession) {
    allCalArr = JSON.parse(localStorage.storedallCalArr);
    console.log("Got Calendar Data from localStorage");
    setUpcomingArray();
  } else {
    getCalDataApi();
  }
}

function getCalDataApi() {
  console.log("Getting Calendar Data from Google Calendar API");
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      window.allCalArr = xhttp.responseText;
      // allCalArr = allCalArr.slice(allCalArr.indexOf("{"));
      // allCalArr = allCalArr.slice(0, allCalArr.lastIndexOf(')'));
      localStorage.setItem("storedallCalArr", allCalArr);
      console.log("Stored Map Data in localStorage");
      updatedThisSession = true;
      allCalArr = JSON.parse(allCalArr);
      setUpcomingArray();
    }
  };
  // could add ability to use any google calendar link
  // var calLink = window.prompt("Type your calendar link");
  // xhttp.open("GET", calLink, true);
  xhttp.open("GET", "{your calendar link goes here}", true);
  xhttp.send();
}

function set12Hour() {
  for (var i = 0; i < todayCalArr.length; i++) {
    // Set times to 12 hour format including am or pm
    // start times
    if (Number(todayCalArr[i][2][2].slice(0, 2)) > 12) {
      todayCalArr[i][2][2] =
        Number(todayCalArr[i][2][2].slice(0, 2) - 12) +
        todayCalArr[i][2][2].slice(2, 5) +
        " P.M.";
    } else {
      todayCalArr[i][2][2] = todayCalArr[i][2][2] + " A.M.";
    }
    // end times
    if (Number(todayCalArr[i][3][2].slice(0, 2)) > 12) {
      todayCalArr[i][3][2] =
        Number(todayCalArr[i][3][2].slice(0, 2) - 12) +
        todayCalArr[i][3][2].slice(2, 5) +
        " P.M.";
    } else {
      todayCalArr[i][3][2] = todayCalArr[i][2][2] + " A.M.";
    }
  }
  getMapLinks();
}

function getMapLinks() {
  console.log("Setting Map Links");
  var baseUrl = "https://maps.google.com/maps?q=";
  for (var i = 0; i < todayCalArr.length; i++) {
    todayCalArr[i].push(baseUrl + encodeURI(todayCalArr[i][1]));
  }
  writeEvents();
}

function getDayFromDate(date) {
  var days = [
    "Sunday ",
    "Monday ",
    "Tuesday ",
    "Wednesday ",
    "Thursday ",
    "Friday ",
    "Saturday "
  ];
  var placeholder = new Date(convertDateFormatToSlash(date));
  return days[placeholder.getDay()];
}

function writeEvents() {
  console.log("Writing Map Links to visible page");
  // writeAll div contains all the HTML I want to write onto the screen
  writeAll = "";
  document.getElementById("eventMapLinks").innerHTML = "";
  var placeholder;

  for (var i = 0; i < todayCalArr.length; i++) {
    var placeholder =
      '<div class="eventInfoAndMap"><h2>' +
      // add day of week that event starts
      getDayFromDate(todayCalArr[i][2][1]) +
      todayCalArr[i][2][2] +
      " - " +
      // add day of end
      getDayFromDate(todayCalArr[i][3][1]) +
      todayCalArr[i][3][2] +
      "</h2>" +
      // description or title
      "<p>" +
      todayCalArr[i][0] +
      "<br>";
    // calendar doesn't always have a location/address set, so try catch here
    try {
      placeholder +=
        todayCalArr[i][1].slice(0, -5) +
        "<br>" +
        // could enable the line below to get a link to google maps, but the map already has a "view larger map" link so I took it out
        // "<a href=\"" + todayCalArr[i][4] + "\">" + "Open In Google Maps</a></p>" +
        '<div class="mapouter"> ' +
        '<div class="gmap_cavas"> ' +
        '<iframe width="250" height="250" id="gmap_canvas" src="' +
        todayCalArr[i][4] +
        '&t=&z=9&ie=UTF8&iwloc=&output=embed" frameborder="0" scrolling="no" marginheight="0" marginwidth="0">' +
        "</iframe>" +
        "</div></div></div>";
    } catch {
      placeholder += "<p>Address Not Found</p></div>";
    }
    // add to HTML div
    writeAll += placeholder;
  }
  document.getElementById("eventMapLinks").innerHTML = writeAll;


function convertDateFormatToSlash(date) {
  "use strict";
  var dateToPass = date.split("");
  dateToPass[4] = dateToPass[7] = "/";
  dateToPass = dateToPass.join("");
  return dateToPass;
}

// when picking a day is enabled this gets called after clicking "get map for this day"
function dateSubmitted() {
  window.datePicked = document.getElementById("datePicker");
  dateToPass = convertDateFormatToSlash(datePicked.value);
  console.log(datePicked.value);
  todayCalArr = [];
  setDates(dateToPass);
}

function inputSetToday() {
  document.getElementById("datePicker").value = convertDateFormat(new Date());
}

window.addEventListener("load", function() {
  setDates();
  inputSetToday();
  document.getElementById("datePicker").addEventListener("change", function(e) {
    if (e.target.value !== today) {
      dateSubmitted();
    }
  });
});

