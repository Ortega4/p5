//Global variables
let map;
let currentIndex = 0;
let correctCount = 0;
let incorrectCount = 0;
let currentShape = null;
let answeredCurrent = false;
let tries = 3;

// dom elements
const locationNumber = document.getElementById("location-number");
const locationTotal = document.getElementById("location-total");
const locationPrompt = document.getElementById("location-prompt");
const messageBox = document.getElementById("message-box");
const scoreCorrect = document.getElementById("score-correct");
const scoreIncorrect = document.getElementById("score-incorrect");
const nextButton = document.getElementById("next-button");
const restartButton = document.getElementById("restartBtn");
const triesCount = document.getElementById("tries-count");


// array for locations
const locations = [
    {
        name: "CSUN Bookstore",
        prompt: "Double click where you think the CSUN Bookstore is.",
        bounds: {
            west: -118.528644,
            south: 34.237062,
            east: -118.527697,
            north: 34.237748
        }
    },
    {
        name: "Library",
        prompt: "Double click where you think the CSUN Library is.",
        bounds: {
            south: 34.239785,
            west: -118.530005,
            north: 34.240379,
            east: -118.528611
        }
    },
    {
        name: "Orange Grove",
        prompt: "Double click where you think Orange Grove is.",
        bounds: {
            south: 34.235712,
            west: -118.527237,
            north: 34.237251,
            east: -118.525677
        }
    },
    {
        name: "Student Recreation Center",
        prompt: "Double click where you think the Student Recreation Center is.",
        bounds: {
            south: 34.239341,
            west: -118.525215,
            north: 34.240566,
            east: -118.524660
        }
    },
    {
        name: "Chaparral Hall",
        prompt: "Double-click where you think Chaparral Hall is.",
        polygon: [
            { lat: 34.23857, lng: -118.52723 },
            { lat: 34.23828, lng: -118.52724 },
            { lat: 34.23797, lng: -118.52708 },
            { lat: 34.23789, lng: -118.52692 },
            { lat: 34.23790, lng: -118.52673 },
            { lat: 34.23858, lng: -118.52673 }
        ]
    }
];

// Total questions
const TOTAL_QUESTIONS = locations.length;

// Overlay style function
function overlayStyle(color) {
    return {
        strokeColor: color,
        strokeOpacity: 1,
        strokeWeight: 2,
        fillColor: color,
        fillOpacity: 0.35,
        map: map
    };
}

// GOOGLE MAP
function initMap() {
    const csunCenter = { lat: 34.239026, lng: -118.529097 };

    map = new google.maps.Map(document.getElementById("map"), {
        center: csunCenter,
        zoom: 17,
        disableDoubleClickZoom: true,
        draggable: false,
        scrollwheel: false,
        keyboardShortcuts: false,
        gestureHandling: "none"
    });
    
    map.addListener("dblclick", handleMapDoubleClick);
    nextButton.addEventListener("click", goToNextLocation);
    restartButton.addEventListener("click",restart);
    locationTotal.textContent = TOTAL_QUESTIONS;
    updatetries();
    showCurrentLocationMsg();
    
}

// Show current question
function showCurrentLocationMsg() {
    const currentLocation = locations[currentIndex];
    locationNumber.textContent = currentIndex + 1;
    locationPrompt.textContent = currentLocation.prompt;
    clearMessage();
    clearShape();
    answeredCurrent = false;
    nextButton.disabled = true;
}

// Handle map db click
function handleMapDoubleClick(event) {
    if (answeredCurrent) return;

    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    const location = locations[currentIndex];
    let isInside = false;

    if (location.polygon) {
        const clickedPoint = new google.maps.LatLng(lat, lng);
        const polygonShape = new google.maps.Polygon({ paths: location.polygon });
        isInside = google.maps.geometry.poly.containsLocation(clickedPoint, polygonShape);
        drawPolygon(location.polygon, isInside ? "green" : "red");
    } else {
        isInside =
            lat >= location.bounds.south &&
            lat <= location.bounds.north &&
            lng >= location.bounds.west &&
            lng <= location.bounds.east;
        drawRectangle(location.bounds, isInside ? "green" : "red");
    }

    if (isInside) {
        correctCount++;
        showMessage("Correct!", "correct");
        ShowConfetti();
    } else {
       incorrectCount++;
       tries--;
       updatetries();

        if(tries <= 0) {
        showMessage("You ran out of tires.", "incorrect");
        answeredCurrent = true;
        nextButton.disabled = true;
        updateScore();
        return; 
    }

    showMessage("Incorrect, the correct area is highlighted.", "incorrect");
    
}

    updateScore();
    answeredCurrent = true;

    if (currentIndex === TOTAL_QUESTIONS - 1) {
        setTimeout(function () {
            showMessage(
                "You got " + correctCount + " out of " + TOTAL_QUESTIONS + " correct.",
                correctCount >= TOTAL_QUESTIONS / 2 ? "correct" : "incorrect"
            );
        }, 800);
        return;
    }

    nextButton.disabled = false;
}

// DRAW RECTANGLE
function drawRectangle(bounds, color) {

    // Remove previous shape
    clearShape();

    // Create new rectangle
    currentShape =
        new google.maps.Rectangle({

            strokeColor: color,
            strokeOpacity: 1,
            strokeWeight: 2,

            fillColor: color,
            fillOpacity: 0.35,

            bounds: bounds,

            map: map
        });
}

// DRAW POLYGON
function drawPolygon(paths, color) {

    // Remove previous shape
    clearShape();

    // Create new polygon
    currentShape =
        new google.maps.Polygon({

            strokeColor: color,
            strokeOpacity: 1,
            strokeWeight: 2,
            fillColor: color,
            fillOpacity: 0.35,
            paths: paths,
            map: map
        });
}

// Clear shape
function clearShape() {
    if (currentShape) {
        currentShape.setMap(null);
        currentShape = null;
    }
}

// show message
function showMessage(text, type = "correct") {
    messageBox.textContent = text;
    messageBox.className = type;
}

// clear message
function clearMessage() {
    messageBox.textContent = "";
    messageBox.className = "";
}

// update score
function updateScore() {
    scoreCorrect.textContent = correctCount;
    scoreIncorrect.textContent = incorrectCount;
}

// go to next location
function goToNextLocation() {
    currentIndex++;
    showCurrentLocationMsg();
}

// CONFETTI EFFECT
function ShowConfetti() {

    confetti({
        particleCount: 100,
        spread: 70,
        origin: {
            y: 0.6
        }
    });
}
// restart 
function restart() {
    // Reset question index
    currentIndex = 0;
    // Reset scores
    correctCount = 0;
    incorrectCount = 0;
    updateScore();
    clearShape();
    clearMessage();
    // Show first question again
    showCurrentLocationMsg();
    tries = 3;
    updatetries();
}

// update tries left
function updatetries() {
    triesCount.textContent = tries;
}
