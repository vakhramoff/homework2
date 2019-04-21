import "babel-polyfill";
import Chart from "chart.js";

const meteoURL = "/xml.meteoservice.ru/export/gismeteo/point/140.xml";

const buttonFetchData = document.getElementById("buttonFetchData");
const canvasContext = document.getElementById("weatherCanvas").getContext("2d");

var months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
var weekdays = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

function convertMonth(t)
{
    if(t>=1&&t<=12)
        return months[t-1];
    else
        return "";
}

function convertWeekday(w)
{
    if(w>=1&&w<=7)
        return weekdays[w-1];
    else
        return "";
}

async function loadWeatherData() {
  const res = await fetch(meteoURL);
  const xml = await res.text();
  const parser = new DOMParser();
  const data = parser.parseFromString(xml, "text/xml");

  const result = [];

  const forecasts = data.querySelectorAll("FORECAST");

  for (let forecast of forecasts) {
    result.push({
      hour: forecast.getAttribute("hour"),
      day: forecast.getAttribute("day"),
      month: forecast.getAttribute("month"),
      weekday: forecast.getAttribute("weekday"),

      minTemp: parseInt(forecast.querySelector("TEMPERATURE").getAttribute("min")),
      maxTemp: parseInt(forecast.querySelector("TEMPERATURE").getAttribute("max")),

      minFeelingTemp: parseInt(forecast.querySelector("HEAT").getAttribute("min")),
      maxFeelingTemp: parseInt(forecast.querySelector("HEAT").getAttribute("max"))
      
    });
  }

  return result;
}

buttonFetchData.addEventListener("click", async function() {
  const weatherData = await loadWeatherData();

  const labels = weatherData.map((value) => {
    return convertWeekday(value.weekday)+", "+value.day+" "+convertMonth(value.month)+", "+value.hour+":00"
  });

  const tempAvg = weatherData.map((value) => {
    return (value.minTemp + value.maxTemp) / 2;
  });

  const feelingTempAvg = weatherData.map((value) => {
    return (value.minFeelingTemp + value.maxFeelingTemp) / 2;
  });

  const chartConfig = {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Температура, °C",
          backgroundColor: "rgba(39,170,225,0.5)",
          borderColor: "rgba(39,170,225,1)",
          data: tempAvg
        },
        {
          label: "Температура по ощущениям, °C",
          backgroundColor: "rgba(75,192,192,0.5)",
          borderColor: "rgba(148.8,148.8,148.8,1)",
          data: feelingTempAvg
        }
      ]
    }
  };

  if (window.chart) {
    chart.data.labels = chartConfig.data.labels;
    chart.data.datasets[0].data = chartConfig.data.datasets[0].data;
    chart.data.datasets[1].data = chartConfig.data.datasets[1].data;

    chart.update({
      duration: 800,
      easing: "easeOutSine"
    });
  } else {
    window.chart = new Chart(canvasContext, chartConfig);
  }
});