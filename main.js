// 1. REFACTORED SNARKY COMMENTS LIST (CATEGORIZED)
const SNARKY_COMMENTS = {
  // --- Error and Default Comments ---
  error: [
    "Oops! I can't find that city. Maybe check your spelling, I'm not a mind reader.",
    "That place doesn't exist, try again. Maybe reality is the problem.",
    "Error 404: City not found. Did you make that up?",
  ],
  default: [
    "Weather outside? Meh. Try harder, nature.",
    "Temperature: somewhere between 'ugh' and 'ugh'.",
    "Weather forecast: unpredictable… like life. Enjoy the ambiguity.",
    "The sky is throwing a tantrum, enjoy the mess.",
    "Nature: still trolling humans. Just another day.",
  ],

  // --- Condition-Based Comments ---
  clear: [
    "Sunshine? Rare sighting. Don’t trust it.",
    "Perfect day to stay in bed… just kidding, go exploit the light.",
    "Sun's out, which means you're obligated to complain about the heat later.",
    "Sunny and bright? Are we sure this is reality?",
  ],
  clouds: [
    "Ah yes, another gloomy masterpiece. Clouds: the sky’s version of an excuse.",
    "Cloudy with a chance of sarcasm. Sky’s moody. Can relate.",
    "Sun’s hiding. Again. Typical.",
    "Clouds everywhere. Drama guaranteed. At least it's not raining.",
  ],
  rain: [
    "It's raining cats and dogs, literally. Umbrella? You mean that thing I never take out.",
    "Rain is just nature’s way of saying 'stay home'. Go put on some sad music.",
    "Rain check? Literally. The sequel no one asked for.",
    "Raining again. Ground must be thirsty. Not you, though. Stay dry.",
  ],
  thunderstorm: [
    "Stormy enough to cancel all plans, thankfully. Thunder: nature’s dramatic soundtrack.",
    "Thunderstorm? Nature’s dramatic flair. Hope you charged your phone.",
    "Storm? Oh goody. Don't worry, the worst is yet to come.",
  ],
  snow: [
    "Snow? Nope, not in this hemisphere. Crying inside. (Unless you live in one.)",
    "Sleet. Because why not add insult to injury? The weather just loves messing with you.",
  ],

  // --- Temperature-Based Comments (Overridden by condition) ---
  hot: [
    "Hot enough to fry an egg… or yourself. Humidity level: sauna vibes.",
    "Heatwave incoming. Hydrate or regret. And stop complaining.",
    "Hot enough to test your sweat tolerance. Good luck.",
  ],
  cold: [
    "Chilly enough to regret leaving your blanket. Cold enough to make hot chocolate mandatory.",
    "Cold enough to reconsider leaving your house. Just stay inside, it’s not worth it.",
    "Feels like… disappointment. And frostbite. Mostly frostbite.",
  ],
  windy: [
    "Windy enough to ruin your hair. Again. That breeze? Just trying to mess with you.",
    "Windy enough to lose your hat, dignity, or both. Wind? Just a reminder you exist.",
    "Windy chaos: enjoy the struggle. Don't fight it, just embrace the mess.",
  ],
};

const apiKey = "4f421049270be4a3daa9c26083adc70d";

// Declare variables at the top level
let snarkText;
let cityInput;
let unitsSelect;

// 2. NEW LOGIC FUNCTIONS

// Function to select a random comment from a category
function getRandomComment(commentArray) {
  if (!commentArray || commentArray.length === 0)
    return getRandomComment(SNARKY_COMMENTS.default);
  const randomIndex = Math.floor(Math.random() * commentArray.length);
  return commentArray[randomIndex];
}

// Function: Selects snark based on live weather data
function getConditionBasedSnark(weatherData, units) {
  const temp = weatherData.main.temp;
  const mainCondition = weatherData.weather[0].main.toLowerCase();
  const windSpeed = weatherData.wind.speed;

  let categoryKey = "default";
  let snark = "";

  // --- A. Temperature Checks ---
  if (units === "metric") {
    if (temp >= 30) {
      categoryKey = "hot";
    } else if (temp <= 5) {
      categoryKey = "cold";
    }
  } else {
    // Imperial
    if (temp >= 86) {
      categoryKey = "hot";
    } else if (temp <= 41) {
      categoryKey = "cold";
    }
  }

  // --- B. Weather Condition Checks (Overrides temp if severe) ---
  if (mainCondition.includes("thunderstorm")) {
    categoryKey = "thunderstorm";
  } else if (
    mainCondition.includes("rain") ||
    mainCondition.includes("drizzle")
  ) {
    categoryKey = "rain";
  } else if (
    mainCondition.includes("snow") ||
    mainCondition.includes("sleet")
  ) {
    categoryKey = "snow";
  } else if (mainCondition.includes("clear")) {
    categoryKey = "clear";
  } else if (mainCondition.includes("clouds")) {
    categoryKey = "clouds";
  }

  // --- C. Wind Check ---
  const isWindy = windSpeed > 6.7; // ~15 mph / ~25 km/h

  // --- D. Final Construction ---
  snark = getRandomComment(SNARKY_COMMENTS[categoryKey]);

  // Add extra snark about the wind if relevant and not already covered by a severe category
  if (isWindy && categoryKey !== "thunderstorm" && Math.random() < 0.3) {
    snark += " P.S. The wind's trying to ruin your hair. Again.";
  }

  return snark;
}

document.addEventListener("DOMContentLoaded", () => {
  // Initialize the variables
  cityInput = document.getElementById("city");
  const searchButton = document.getElementById("search-button");
  snarkText = document.getElementById("snark-text"); // Now accessible globally
  unitsSelect = document.getElementById("units-select");
  const themeToggle = document.getElementById("theme-toggle");
  const icon = themeToggle.querySelector("span");

  // NOTE: The original getRandomSnark() function is no longer needed
  // as it is replaced by getConditionBasedSnark and getRandomComment.

  searchButton.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (!city) {
      snarkText.textContent = "Whoa! I need a city, genius!"; // Use error snark
      return;
    }
    getWeather(city);
  });

  // 3. UPDATED getWeather FUNCTION
  function getWeather(city) {
    const units = unitsSelect.value;

    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (Number(data.cod) !== 200) throw new Error(data.message);
        displayWeather(data, units);

        // *** NEW SUCCESS LOGIC ***
        snarkText.textContent = getConditionBasedSnark(data, units);
        // *************************
      })
      .catch((err) => {
        console.error(err);
        // *** NEW ERROR LOGIC ***
        snarkText.textContent = getRandomComment(SNARKY_COMMENTS.error);
        // ***********************
      });
  }

  // Update weather automatically when units change
  unitsSelect.addEventListener("change", () => {
    const city = cityInput.value.trim();
    if (city) getWeather(city);
  });

  // Theme toggle functionality
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    // Toggle icon
    icon.textContent = document.body.classList.contains("dark-mode")
      ? "dark_mode"
      : "light_mode";
  });

  // Get weather for a default city on load
  getWeather("London");
});

function displayWeather(data, units) {
  const tempUnit = units === "metric" ? "°C" : "°F";
  const speedUnit = units === "metric" ? "km/h" : "mph";
  const precipitationUnit = units === "metric" ? "mm" : "in";

  document.getElementById("temperature").textContent = `${Math.round(
    data.main.temp
  )} ${tempUnit}`;

  document.getElementById("condition").textContent = data.weather[0].main;

  document.getElementById(
    "location"
  ).textContent = `${data.name}, ${data.sys.country}`;

  document.getElementById("feels-like").textContent = `${Math.round(
    data.main.feels_like
  )} ${tempUnit}`;
  document.getElementById("humidity").textContent = `${data.main.humidity} %`;

  // Wind conversion from m/s to km/h or mph
  const windSpeed =
    units === "metric"
      ? (data.wind.speed * 3.6).toFixed(1)
      : (data.wind.speed * 2.237).toFixed(1);
  document.getElementById("wind").textContent = `${windSpeed} ${speedUnit}`;

  // Precipitation if available
  const precipitation =
    data.rain && data.rain["1h"]
      ? units === "metric"
        ? data.rain["1h"]
        : (data.rain["1h"] / 25.4).toFixed(1)
      : 0;
  document.getElementById(
    "precipitation"
  ).textContent = `${precipitation} ${precipitationUnit}`;

  document.getElementById("visibility").textContent = `${(
    data.visibility / 1000
  ).toFixed(1)} km`;

  document.getElementById("pressure").textContent = `${data.main.pressure} hPa`;

  const sunrise = new Date(data.sys.sunrise * 1000);
  const sunset = new Date(data.sys.sunset * 1000);
  document.getElementById("sunrise").textContent = sunrise.toLocaleTimeString(
    [],
    { hour: "2-digit", minute: "2-digit" }
  );
  document.getElementById("sunset").textContent = sunset.toLocaleTimeString(
    [],
    { hour: "2-digit", minute: "2-digit" }
  );

  document.getElementById("uv").textContent = "--";
}

// MICROPHONE FUNCTIONALITY
const voiceBtn = document.getElementById("voice-btn"); // Ensure this element exists in your HTML
initVoiceRecognition();

function initVoiceRecognition() {
  let recognition;

  // Check if browser supports speech recognition
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      voiceBtn.classList.add("listening"); // Add listening class
      snarkText.textContent = "I'm listening... speak now!";
    };

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      cityInput.value = speechResult;
      getWeather(speechResult); // Trigger weather fetch
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      snarkText.textContent = "Voice error: " + event.error;
      voiceBtn.classList.remove("listening");
    };

    recognition.onend = () => {
      voiceBtn.classList.remove("listening"); // Remove listening class
    };

    voiceBtn.addEventListener("click", () => {
      try {
        recognition.start();
      } catch (error) {
        console.error("Recognition start error:", error);
        snarkText.textContent = "Mic access denied. Check permissions.";
      }
    });
  } else {
    // Browser doesn't support speech recognition
    if (voiceBtn) voiceBtn.style.display = "none"; // Hide the button if it exists
    console.warn("Your browser does not support voice recognition.");
  }
}

// ======== Sample Data Structure ========
// hourlyDataByDay[0] → Today, hourlyDataByDay[1] → Tomorrow, etc.
// Each day contains 24 hours of data
const hourlyDataByDay = [
  Array.from({ length: 24 }, (_, i) => ({
    time: `2025-09-18T${String(i).padStart(2, "0")}:00:00`,
    temp: 20 + (i % 5), // example temperatures
    icon: i % 2 === 0 ? "sun" : "moon", // example icons
  })),
  Array.from({ length: 24 }, (_, i) => ({
    time: `2025-09-19T${String(i).padStart(2, "0")}:00:00`,
    temp: 21 + (i % 5),
    icon: i % 3 === 0 ? "cloud" : "sun",
  })),
  // add more days similarly
];

// ======== Day Selector Setup ========
const daySelector = document.querySelector(".day-selector");
const days = ["Today", "Tomorrow", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Clear existing buttons
if (daySelector) daySelector.innerHTML = "";

// Create day buttons dynamically
if (daySelector) {
  days.forEach((day, index) => {
    const btn = document.createElement("button");
    btn.classList.add("day-btn");
    if (index === 0) btn.classList.add("active"); // default active day
    btn.textContent = day;
    btn.dataset.index = index; // store day index
    daySelector.appendChild(btn);
  });
}

// ======== Handle Day Button Click ========
if (daySelector) {
  daySelector.addEventListener("click", (e) => {
    if (!e.target.classList.contains("day-btn")) return;

    // Remove active from all buttons
    document
      .querySelectorAll(".day-btn")
      .forEach((btn) => btn.classList.remove("active"));

    // Set clicked button as active
    e.target.classList.add("active");

    const dayIndex = e.target.dataset.index;
    displayHourlyForecast(hourlyDataByDay[dayIndex]);
  });
}

// ======== Display Hourly Forecast ========
function displayHourlyForecast(hourlyData) {
  const container = document.getElementById("hourly-forecast");
  if (!container) return; // Prevent error if container doesn't exist

  container.innerHTML = ""; // clear previous cards

  hourlyData.forEach((hour) => {
    const card = document.createElement("div");
    card.classList.add("hourly-card");
    card.innerHTML = `
            <h5 class="hour-text">${formatHour(hour.time)}</h5>
            <img src="${getWeatherIcon(
              hour.icon
            )}" alt="hour-icon" class="hourly-icon" />
            <h5 class="temp-text">${hour.temp}°C</h5>
        `;
    container.appendChild(card);
  });
}

// ======== Helper: Format Hour ========
function formatHour(hourString) {
  const date = new Date(hourString);
  let hours = date.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours} ${ampm}`;
}

// ======== Helper: Map API Icon to Local Image ========
function getWeatherIcon(iconCode) {
  // Adjust mapping to match your local icon filenames
  return `./images/${iconCode}.png`;
}

// ======== Initialize: Show Today by default ========
displayHourlyForecast(hourlyDataByDay[0]);
