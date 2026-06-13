import ApexCharts from "apexcharts";

// line chart
const lineChartElement = document.querySelector("#react-chart");

if (lineChartElement) {
  const lineChartOptions = {
    series: [
      { data: [38, 39, 19, 19.5, 19, 35, 34, 27, 27, 8, 8, 25] },
      { data: [18, 18, 31, 32, 8, 8, 30, 30, 20, 20, 40, 40] },
    ],
    chart: {
      height: 350,
      type: "line",
      dropShadow: { enabled: false },
      zoom: { enabled: false },
      toolbar: { show: false },
    },
    colors: ["#066AC9", "#F37639"],
    dataLabels: { enabled: false },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    grid: {
      borderColor: "#e7e7e7",
      row: {
        colors: ["#f3f3f3", "transparent"],
        opacity: 0.5,
      },
    },
    markers: { size: 1 },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Jul",
        "Aug",
        "Aug",
      ],
    },
    yaxis: {
      min: 5,
      max: 40,
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      floating: true,
      offsetY: -25,
      offsetX: -5,
      show: false,
    },
  };

  const lineChart = new ApexCharts(lineChartElement, lineChartOptions);
  lineChart.render();
}

// donut chart
const donutChartElement = document.querySelector("#donutChart");

if (donutChartElement) {
  const donutChartOptions = {
    series: [44, 55, 41, 17, 15],
    chart: {
      type: "donut",
      height: 240,
    },
    colors: ["#00B8D9", "#066AC9", "#FFAB00", "#F37639", "#8E33FF"],
    legend: { show: false },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: { width: 200 },
          legend: { position: "bottom" },
        },
      },
    ],
  };

  const donutChart = new ApexCharts(donutChartElement, donutChartOptions);
  donutChart.render();
}
