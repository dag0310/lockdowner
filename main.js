const buildEntriesFuture = (entriesPast, targetDate, targetValue) => {
  if (entriesPast.length < 1) {
    return [];
  }
  const entriesFuture = JSON.parse(JSON.stringify(entriesPast));
  entriesFuture.pop();
  for (const entry of entriesFuture) {
    entry.sevenDayIncidency = null;
  }
  const mostRecentDay = entriesPast[entriesPast.length - 1];
  const daysDiff = targetDate.diff(mostRecentDay.date, 'day');
  const valueDiff = targetValue - mostRecentDay.sevenDayIncidency;
  const valuePerDay = valueDiff / daysDiff;
  for (let day = 0; day <= daysDiff; day += 1) {
    entriesFuture.push({
      date: dayjs(mostRecentDay.date).add(day, 'days').format('YYYY-MM-DD'),
      sevenDayIncidency: mostRecentDay.sevenDayIncidency + (valuePerDay * day),
    });
  }
  return entriesFuture;
};

const updateChart = (chart, entries) => {
  const targetDate = dayjs(document.getElementById('targetDate').value);
  const targetValue = document.getElementById('targetValue').valueAsNumber;

  const pastDays = parseInt(document.getElementById('pastDays').value, 10);
  const entriesPast = (pastDays != null) ? entries.slice(Math.max(0, entries.length - pastDays)) : entries;
  const entriesFuture = buildEntriesFuture(entriesPast, targetDate, targetValue);

  chart.data.labels = entriesFuture.map((entry) => dayjs(entry.date).format('DD.MM.YYYY'));
  chart.data.datasets[0].data = entriesPast.map((entry) => entry.sevenDayIncidency);
  chart.data.datasets[1].data = entriesFuture.map((entry) => entry.sevenDayIncidency);
  chart.update();

  document.getElementById('chartText').innerText = `Die blaue Linie zeigt den benötigten Verlauf an, um den Inzidenz-Wert ${targetValue} bis zum ${targetDate.format('DD.MM.YYYY')} zu erreichen.`;
};

const openTip = (chart, datasetIndex, pointIndex) => {
  if (chart.tooltip._active == null) {
    chart.tooltip._active = [];
  }
  const activeElements = chart.tooltip._active;
  const requestedElem = chart.getDatasetMeta(datasetIndex).data[pointIndex];
  for (let idx = 0; idx < activeElements.length; idx += 1) {
    if (requestedElem._index === activeElements[idx]._index) {
      return;
    }
  }
  activeElements.push(requestedElem);
  chart.tooltip._active = activeElements;
  chart.tooltip.update(true);
  chart.draw();
};

(async () => {
  const ctx = document.getElementById('chart').getContext('2d');
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'Verlauf bis jetzt',
          pointRadius: 0,
          pointHoverRadius: 0,
          hitRadius: 5,
          backgroundColor: 'transparent',
          borderColor: 'red',
          borderWidth: 2,
        },
        {
          label: 'notwendiger Verlauf',
          pointRadius: 0,
          pointHoverRadius: 0,
          hitRadius: 5,
          backgroundColor: 'transparent',
          borderColor: 'blue',
          borderWidth: 2,
          borderDash: [4, 2],
        },
      ],
    },
    options: {
      title: {
        text: '7-Tage-Inzidenz Österreich',
      },
      tooltips: {
        intersect: false,
        mode: 'index',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        callbacks: {
          label: (tooltipItem) => tooltipItem.yLabel.toFixed(0),
        },
      },
      legend: {
        onClick: null,
      },
      elements: {
        line: {
          tension: 0,
        },
      },
      animation: {
        duration: 0,
      },
      scales: {
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Datum',
          },
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: '7-Tage-Inzidenz',
          },
          ticks: {
            beginAtZero: true,
          },
        }],
      },
    },
  });
  const entries = await (await fetch('covid-austria.json')).json();
  const config = await (await fetch('config.json')).json();
  document.getElementById('targetDate').value = (config.targetDate && dayjs(config.targetDate) >= dayjs().startOf('day')) ? dayjs(config.targetDate).format('YYYY-MM-DD') : dayjs().add(1, 'month').format('YYYY-MM-DD');
  document.getElementById('targetValue').value = (entries.length > 0 && entries[entries.length - 1].sevenDayIncidency >= config.targetValue) ? config.targetValue : 0;

  document.getElementById('pastDays').addEventListener('input', () => { updateChart(chart, entries); });
  document.getElementById('targetValue').addEventListener('input', () => { updateChart(chart, entries); });
  document.getElementById('targetDate').addEventListener('input', () => { updateChart(chart, entries); });

  updateChart(chart, entries);
  openTip(chart, 0, chart.data.datasets[0].data.length - 1);
})();
