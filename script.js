const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const statusBox = document.getElementById("statusBox");
const errorBox = document.getElementById("errorBox");
const ctx = document.getElementById("weatherChart").getContext("2d");

let chartInstance = null;

/* Coordenadas por defecto (CDMX) */
const DEFAULT_COORDS = {
    lat: 19.43,
    lon: -99.13
};

searchBtn.addEventListener("click", () => {
    const value = cityInput.value.trim();
    let coords = DEFAULT_COORDS;

    if (value.includes(",")) {
        const [lat, lon] = value.split(",");
        coords = { lat: lat.trim(), lon: lon.trim() };
    }

    fetchWeather(coords.lat, coords.lon);
});

async function fetchWeather(lat, lon) {
    try {
        showLoading();

        const url = `
        https://api.open-meteo.com/v1/forecast
        ?latitude=${lat}
        &longitude=${lon}
        &daily=temperature_2m_max
        &timezone=auto
        `;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Error al obtener los datos");

        const data = await response.json();
        processData(data.daily);

    } catch (error) {
        showError(error.message);
    }
}

function processData(dailyData) {
    const labels = dailyData.time;
    const temps = dailyData.temperature_2m_max;

    const maxTemp = Math.max(...temps);
    let color = "#4caf50";

    if (maxTemp > 30) color = "red";
    if (maxTemp < 10) color = "blue";

    drawChart(labels, temps, color);
}

function drawChart(labels, data, color) {
    hideStatus();

    if (chartInstance) {
        chartInstance.destroy(); // Control de memoria
    }

    chartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Temperatura Máxima (°C)",
                data: data,
                borderColor: color,
                backgroundColor: color,
                tension: 0.3,
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    enabled: true
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: "Temperatura (°C)"
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: "Fecha"
                    }
                }
            }
        }
    });
}

function showLoading() {
    statusBox.classList.remove("hidden");
    errorBox.classList.add("hidden");
}

function hideStatus() {
    statusBox.classList.add("hidden");
}

function showError(msg) {
    statusBox.classList.add("hidden");
    errorBox.classList.remove("hidden");
    errorBox.textContent = msg;
}
