//---------------------------------------------------------------------------------------------
//Current Date
function updateProgressBars() {
    const now = new Date();

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]; // Array of day names
    const dayOfWeek = dayNames[now.getDay()];
    document.getElementById('day').innerText = dayOfWeek;

    const day = String(now.getDate()).padStart(2, '0'); // Get the day and pad with leading zero if needed
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Get the month and pad with leading zero (months are 0-based)
    const year = String(now.getFullYear() % 100).padStart(2, '0');

    var formattedDate = `${day}.${month}.${year}`.trim(); // Return the date in DD.MM.YYYY format
    document.getElementById('date').innerText = formattedDate;

    // Day progress
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const dayProgress = Math.round(((now - startOfDay) / (endOfDay - startOfDay)) * 100);

    // Month progress
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const monthProgress = Math.round(((now - startOfMonth) / (endOfMonth - startOfMonth)) * 100);

    // Year progress
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear() + 1, 0, 1);
    const yearProgress = Math.round(((now - startOfYear) / (endOfYear - startOfYear)) * 100);

    // Update DOM
    document.getElementById('day-progress').innerText = `${dayProgress}%`;
    document.getElementById('day-progress-bar').style.width = `${dayProgress}%`;
    document.getElementById('month-progress').innerText = `${monthProgress}%`;
    document.getElementById('month-progress-bar').style.width = `${monthProgress}%`;
    document.getElementById('year-progress').innerText = `${yearProgress}%`;
    document.getElementById('year-progress-bar').style.width = `${yearProgress}%`;
}
updateProgressBars();// Initial call
setInterval(updateProgressBars, 1000);// Update every second

// Weather Code
const weatherConditions = {
    0: { description: 'Clear sky', icon: 'wi-day-sunny' },
    1: { description: 'Mainly clear', icon: 'wi-day-sunny-overcast' },
    2: { description: 'Partly cloudy', icon: 'wi-day-cloudy' },
    3: { description: 'Overcast', icon: 'wi-cloudy' },
    45: { description: 'Fog', icon: 'wi-fog' },
    48: { description: 'Depositing rime fog', icon: 'wi-fog' },
    51: { description: 'Light rain drizzle', icon: 'wi-raindrops' },
    53: { description: 'Moderate rain drizzle', icon: 'wi-raindrops' },
    55: { description: 'Dense rain drizzle', icon: 'wi-rain' },
    56: { description: 'Light freezing drizzle', icon: 'wi-rain-mix' },
    57: { description: 'Dense freezing drizzle', icon: 'wi-sleet' },
    61: { description: 'Light rain', icon: 'wi-showers' },
    63: { description: 'Moderate rain', icon: 'wi-rain' },
    65: { description: 'Heavy rain', icon: 'wi-rain-wind' },
    66: { description: 'Light freezing rain', icon: 'wi-sleet' },
    67: { description: 'Heavy freezing rain', icon: 'wi-sleet' },
    71: { description: 'Light snow', icon: 'wi-snow' },
    73: { description: 'Moderate snow', icon: 'wi-snow' },
    75: { description: 'Heavy snow', icon: 'wi-snow' },
    77: { description: 'Snow grains', icon: 'wi-snowflake-cold' },
    80: { description: 'Light rain showers', icon: 'wi-showers' },
    81: { description: 'Moderate rain showers', icon: 'wi-rain' },
    82: { description: 'Heavy rain showers', icon: 'wi-rain-wind' },
    85: { description: 'Light snow showers', icon: 'wi-snow' },
    86: { description: 'Heavy snow showers', icon: 'wi-snow-wind' },
    95: { description: 'Thunderstorm', icon: 'wi-thunderstorm' },
    96: { description: 'Thunderstorm with light hail', icon: 'wi-hail' },
    99: { description: 'Thunderstorm with heavy hail', icon: 'wi-hail' }
};

// Function to fetch city name from latitude and longitude using Nominatim API
async function getCityName(lat, lon) {
    const geoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;

    try {
        const response = await fetch(geoUrl);
        const data = await response.json();
        return data.address.city || data.address.town || data.address.village || 'Unknown City';
    } catch (error) {
        console.error('Error fetching city name:', error);
        return 'Unknown City';
    }
}

// Function to fetch weather based on latitude and longitude using Open-Meteo API
async function getWeather(lat, lon) {
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (response.ok) {
            const cityName = await getCityName(lat, lon);
            const weatherElement = document.getElementById('weather');
            const weatherIcon = document.getElementById('weather-icon');
            const temperature = data.current_weather.temperature;
            const weatherCode = data.current_weather.weathercode;
            const weatherData = weatherConditions[weatherCode] || { description: 'Unknown', icon: 'wi-na' };

            weatherElement.innerHTML = `
                <p>City: ${cityName}</p>
                <p>Temperature: ${temperature}°C</p>
                <p>Condition: ${weatherData.description}</p>`;
            weatherIcon.innerHTML = `<i class="wi ${weatherData.icon}"></i>`;
        } else {
            document.getElementById('weather').innerHTML = `<p>Weather data not available</p>`;
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        document.getElementById('weather').innerHTML = `<p>Error fetching weather data</p>`;
    }
}

// Function to get the user's location using the Geolocation API
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                getWeather(lat, lon); // Call weather API with the coordinates
            },
            (error) => {
                console.error('Error getting location:', error);
                document.getElementById('weather').innerHTML = `<p>Unable to retrieve your location</p>`;
            }
        );
    } else {
        document.getElementById('weather').innerHTML = `<p>Geolocation is not supported by this browser</p>`;
    }
}
getLocation();// Automatically fetch the location and weather when the page loads

//-----------------------------------------------------------------------------------------------------------------
//TODO list
document.addEventListener('DOMContentLoaded', loadTasks); // Load tasks on page load //maybe remove

// Function to add a new task
function addTask() {
    const taskInput = document.getElementById('new-task');
    const taskValue = taskInput.value.trim();

    if (taskValue) {
        const taskList = document.getElementById('todo-list');

        // Create new list item
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${taskValue}</span>
            <button class="delete-btn" onclick="deleteTask(this)">Delete</button>
        `;

        // Add event listener to mark the task as complete
        li.addEventListener('click', function () {
            this.classList.toggle('completed');
            saveTasks(); // Save updated tasks
        });

        taskList.appendChild(li);
        taskInput.value = '';  // Clear the input

        saveTasks(); // Save the tasks to localStorage
    } else {
        alert('Please enter a task!');
    }
}

// Function to delete a task
function deleteTask(taskButton) {
    const taskItem = taskButton.parentElement;
    taskItem.remove();
    saveTasks(); // Save updated tasks after deletion
}

// Save tasks to localStorage
function saveTasks() {
    const taskList = document.getElementById('todo-list');
    const tasks = [];

    taskList.querySelectorAll('li').forEach((task) => {
        const taskText = task.querySelector('span').textContent;
        const isCompleted = task.classList.contains('completed');
        tasks.push({ text: taskText, completed: isCompleted });
    });

    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Load tasks from localStorage
function loadTasks() {
    const savedTasks = JSON.parse(localStorage.getItem('tasks'));

    if (savedTasks) {
        const taskList = document.getElementById('todo-list');

        savedTasks.forEach((task) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${task.text}</span>
                <button class="delete-btn" onclick="deleteTask(this)">Delete</button>
            `;

            if (task.completed) {
                li.classList.add('completed'); // Mark as completed if previously done
            }

            li.addEventListener('click', function () {
                this.classList.toggle('completed');
                saveTasks();
            });

            taskList.appendChild(li);
        });
    }
}

// Function to save the note to localStorage
function saveNote() {
    const noteInput = document.getElementById('note-input').value;
    localStorage.setItem('note', noteInput); // Save the note in localStorage
}

// Function to load the note from localStorage
function loadNote() {
    const savedNote = localStorage.getItem('note');
    if (savedNote) {
        document.getElementById('note-input').value = savedNote; // Load the saved note into the textarea
    }
}

// Automatically save the note when the user types
document.getElementById('note-input').addEventListener('input', saveNote);

// Load the note when the page loads
document.addEventListener('DOMContentLoaded', loadNote);//maybe remove

//------------------------------------------------------------------------------------------------------------------
// Get references to the necessary DOM elements
const modal = document.getElementById('link-dialog');
const linkAddModal = document.getElementById('add-modal');
const editListBtn = document.getElementById('edit-link-btn');
const closeModalBtn = document.getElementById('close-btn');
const addLinkBtn = document.getElementById('add-link-btn');
const submitLinkBtn = document.getElementById('submit-link');
const primaryList = document.getElementById('primary-list');
const secondaryList = document.getElementById('secondary-list');

// Limits for primary and secondary lists
const primaryListLimit = 6;
const secondaryListLimit = 60;

// Flag to track whether in edit mode or not
let isEditMode = false;

// Open the modal when "Add Link" button is clicked
addLinkBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
    linkAddModal.style.display = 'flex';
});

// Open edit mode when "Edit List" button is clicked
editListBtn.addEventListener('click', () => {
    isEditMode = !isEditMode; // Toggle edit mode
    loadLinksFromLocalStorage(); // Reload the links to show/hide delete buttons
});

// Close the modal when the close button is clicked
closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    linkAddModal.style.display = 'none';
    isEditMode = false; // Exit edit mode when closing
    loadLinksFromLocalStorage(); // Refresh the list to hide delete buttons
});

// Close the modal when clicking outside of the modal content
window.addEventListener('click', (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
        linkAddModal.style.display = 'none';
        isEditMode = false; // Exit edit mode
        loadLinksFromLocalStorage(); // Refresh the list to hide delete buttons
    }
});

// Function to add link to the appropriate list and store in localStorage
submitLinkBtn.addEventListener('click', () => {
    const linkName = document.getElementById('link-name').value.trim();
    const linkURL = document.getElementById('link-url').value.trim();
    const selectedList = document.querySelector('input[name="link-list"]:checked').value;

    if (linkName && linkURL) {
        const newLink = {
            name: linkName,
            url: linkURL
        };

        if (selectedList === 'primary') {
            // Check if the primary list has reached the limit
            if (primaryList.childElementCount < primaryListLimit) {
                addLinkToList(newLink, primaryList, 'primaryLinks');
            } else {
                alert('Primary list can only have 6 items.');
            }
        } else {
            // Check if the secondary list has reached the limit
            if (secondaryList.childElementCount < secondaryListLimit) {
                addLinkToList(newLink, secondaryList, 'secondaryLinks');
            } else {
                alert('Secondary list can only have 60 items.');
            }
        }

        // Clear inputs and close modal
        document.getElementById('link-name').value = '';
        document.getElementById('link-url').value = '';
        modal.style.display = 'none';
    }
});

// Function to add link to the respective list and update localStorage
function addLinkToList(link, listElement, storageKey) {
    const li = document.createElement('li');
    li.innerHTML = `
        <a href="${link.url}" target="_blank">${link.name}</a>
        ${isEditMode ? `<button class="delete-btn" onclick="deleteLink('${link.url}', '${storageKey}')">&times;</button>` : ''}`;
    listElement.appendChild(li);

    let storedLinks = JSON.parse(localStorage.getItem(storageKey)) || [];
    // Ensure no duplicate entries in localStorage
    if (!storedLinks.find(storedLink => storedLink.url === link.url)) {
        storedLinks.push(link);
        localStorage.setItem(storageKey, JSON.stringify(storedLinks));
    }
}

// Function to delete link from the list and update localStorage
function deleteLink(url, storageKey) {
    // Retrieve the list from localStorage
    let links = JSON.parse(localStorage.getItem(storageKey)) || [];

    // Filter out the link with the matching URL
    links = links.filter(link => link.url !== url);

    // Update localStorage with the new list
    localStorage.setItem(storageKey, JSON.stringify(links));

    // Refresh the displayed links
    loadLinksFromLocalStorage();
}

// Function to load links from localStorage on page load
function loadLinksFromLocalStorage() {
    primaryList.innerHTML = ''; // Clear the current list
    secondaryList.innerHTML = ''; // Clear the current list

    const primaryLinks = JSON.parse(localStorage.getItem('primaryLinks')) || [];
    const secondaryLinks = JSON.parse(localStorage.getItem('secondaryLinks')) || [];

    // Add stored primary links to the primary list
    primaryLinks.forEach(link => {
        if (primaryList.childElementCount < primaryListLimit) {
            addLinkToList(link, primaryList, 'primaryLinks');
        }
    });

    // Add stored secondary links to the secondary list
    secondaryLinks.forEach(link => {
        if (secondaryList.childElementCount < secondaryListLimit) {
            addLinkToList(link, secondaryList, 'secondaryLinks');
        }
    });
}

// Load the links from localStorage when the page loads
document.addEventListener('DOMContentLoaded', loadLinksFromLocalStorage);

//-------------------------------------------------------------------------
//Settings Code
document.addEventListener('DOMContentLoaded', () => {
    // Open settings modal
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-btn');
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const modal = document.getElementById('link-dialog');

    // Color pickers
    const bgColorPicker = document.getElementById('bg-color-input');
    const textColorPicker = document.getElementById('text-color-input');
    const textColorSecPicker = document.getElementById('text-color-sec-input');

    // Open the settings modal when the settings button is clicked
    settingsBtn.addEventListener('click', () => {
        updateColorPickers();
        settingsModal.style.display = 'flex';
        modal.style.display = 'flex';
    });

    // Close the settings modal
    closeSettingsBtn.addEventListener('click', () => {
        settingsModal.style.display = 'none';
        modal.style.display = 'none';
    });
    // Close the modal when clicking outside of the modal content
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            settingsModal.style.display = 'none';
            modal.style.display = 'none';// Refresh the list to hide delete buttons
        }
    });
    // Load saved settings from localStorage
    function loadSettings() {
        const savedBgColor = localStorage.getItem('bgColor');
        const savedTextColor = localStorage.getItem('textColor');
        const savedTextColorSec = localStorage.getItem('textColorSec');

        if (savedBgColor) document.documentElement.style.setProperty('--bg-color', savedBgColor);
        if (savedTextColor) document.documentElement.style.setProperty('--text-color', savedTextColor);
        if (savedTextColorSec) document.documentElement.style.setProperty('--text-color-sec', savedTextColorSec);
    }

    // Set color picker inputs to the current colors
    function updateColorPickers() {
        const currentBgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-color').trim() || '#ffffff';
        const currentTextColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim() || '#000000';
        const currentTextColorSec = getComputedStyle(document.documentElement).getPropertyValue('--text-color-sec').trim() || '#888888';

        // Set the color pickers' values to match the current styles
        bgColorPicker.value = currentBgColor;
        textColorPicker.value = currentTextColor;
        textColorSecPicker.value = currentTextColorSec;
    }

    // Save the settings when the user clicks "Save Changes"
    saveSettingsBtn.addEventListener('click', () => {
        const bgColor = bgColorPicker.value;
        const textColor = textColorPicker.value;
        const textColorSec = textColorSecPicker.value;

        // Save to localStorage
        localStorage.setItem('bgColor', bgColor);
        localStorage.setItem('textColor', textColor);
        localStorage.setItem('textColorSec', textColorSec);

        // Apply the new settings
        document.documentElement.style.setProperty('--bg-color', bgColor);
        document.documentElement.style.setProperty('--text-color', textColor);
        document.documentElement.style.setProperty('--text-color-sec', textColorSec);

        // Close the modal
        settingsModal.style.display = 'none';
        modal.style.display = 'none';
    });

    // Apply the saved settings on page load
    loadSettings();
});
