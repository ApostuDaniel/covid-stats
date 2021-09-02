import { getJSON, csvtojson } from './data-procesing';
import { dataURLs, covidData } from './commons';
import Chart from 'chart.js/auto';

const API_KEY = 'zMJpTq2kJPv6NHOFDyPpgUoOpMgOsBOerfYHAefz';

async function isDataPresent(type) {
  switch (type) {
    case 'general':
      if (!covidData.general) {
        covidData.general = await getJSON(dataURLs.overview);
      }
      break;
    case 'testing':
      if (!covidData.testing) {
        covidData.testing = await csvtojson(dataURLs.testing);
      }
      break;
    case 'vaccinations':
      if (!covidData.vaccinations) {
        covidData.vaccinations = await getJSON(dataURLs.vaccinations);
      }
      break;
    case 'variants':
      if (!covidData.variants) {
        covidData.variants = await csvtojson(dataURLs.variants);
      }
      break;
    default:
      console.log('Invalid type', type);
  }
}

async function getOverviewData(countryCode) {
  await isDataPresent('general');
  const data = covidData.general[countryCode];

  const info = document.createElement('div');
  info.id = 'main-info';
  console.log(data);
  // const searchTerm =
  //   jsonData['location'].toLowerCase().replace(' ', '-') + '-map';

  // const iconInfo = await getJSON(
  //   `https://search.icons8.com/api/iconsets/v5/search?term=${searchTerm}&token=${API_KEY}&amount=1`
  // );

  // const icon = await getJSON(
  //   `https://api-icons.icons8.com/publicApi/icons/icon?id=${iconInfo['icons'][0]['id']}&token=${API_KEY}`
  // );

  // console.log(icon);

  // if (icon && icon['icon']['category'] === 'maps') {
  //   const countryMap = document.createElement('div');
  //   countryMap.innerHTML = icon['icon']['svg'];
  //   countryMap.id = 'country-map-icon';
  //   info.appendChild(countryMap);
  // }

  const infoSkeleton = {
    textContent: [
      'Population',
      'Population density',
      'Median age',
      'GDP per capita',
      'Aged 65 or older',
      'Aged 70 or older',
      'Male smokers',
      'Female smokers',
      'Diabetes prevalence',
      'Cardiovascular death rate',
      'Extreme poverty',
      'Human Development Index',
      'Life expectancy',
      'Hospital beds per a thousand people',
    ],
    dataKey: [
      'population',
      'population_density',
      'median_age',
      'gdp_per_capita',
      'aged_65_older',
      'aged_70_older',
      'male-smokers',
      'female-smokers',
      'diabetes_prevalence',
      'cardiovasc_death_rate',
      'extreme-poverty',
      'human_development_index',
      'life_expectancy',
      'hospital_beds_per_thousand',
    ],
    unit: [
      '',
      'people per km²',
      'years',
      '$',
      '%',
      '%',
      '% of males',
      '% of females',
      '% of population (aged 20 to 79)',
      'deaths per 100,000 people',
      'share of population',
      '',
      'years',
      '',
    ],
  };

  infoSkeleton.dataKey.forEach((key, index) => {
    if (data[key]) {
      const para = document.createElement('p');
      para.id = key;
      para.textContent = `${infoSkeleton.textContent[index]}: ${data[key]} ${infoSkeleton.unit[index]}`;
      info.appendChild(para);
    }
  });
  return info;
}

class ChartsSkeleton {
  constructor(chartIDArray, canvasWidth, canvasHeight) {
    this.chartsID = [...chartIDArray];
    this.div = [];
    this.canvas = [];
    this.ctx = [];
    this.chartsID.forEach((chartID) => {
      const newDiv = document.createElement('div');
      const newCanvas = document.createElement('canvas');
      newCanvas.id = chartID;
      newCanvas.width = canvasWidth;
      newCanvas.height = canvasHeight;
      newDiv.id = `${chartID}-div`;
      newDiv.style.position = 'relative';
      newDiv.appendChild(newCanvas);
      const newCtx = newCanvas.getContext('2d');
      this.div.push(newDiv);
      this.canvas.push(newCanvas);
      this.ctx.push(newCtx);
    });
  }
}

function createDateLabel(date) {
  let day = new Date(date);
  return day.toDateString().slice(3);
}

function createInfoSource(lastObservationDate, sourceURL, sourceLabel) {
  const source = document.createElement('div');
  source.classList.add('source');
  const para = document.createElement('p');
  const a = document.createElement('a');

  let textContent = new Date(lastObservationDate).toDateString();
  para.textContent = `Last observation date: ${textContent}`;
  a.textContent = `Source: ${sourceLabel}`;
  a.href = sourceURL;
  a.target = '_blank';

  source.appendChild(para);
  source.appendChild(a);
  return source;
}

async function getTestingData(countryCode) {
  await isDataPresent('testing');
  const testingData = covidData.testing.filter((testData) => {
    if (testData['ISO code'] === countryCode) return testData;
  });
  if (testingData.length == 0) return null;
  console.log(testingData);

  const chartsWrapper = document.createElement('div');
  chartsWrapper.id = 'charts-wrapper';

  const testingSkeleton = new ChartsSkeleton(
    ['cumulative-tests', 'daily-change', 'per-thousand', 'per-case'],
    400,
    400
  );

  const data_cumulative_tests = { data: [], labels: [] };
  const data_per_thousand = { data: [], labels: [] };
  const data_daily_change = { data: [], labels: [] };
  const data_per_case = { data: [], labels: [] };

  testingData.forEach((dailyReport) => {
    if (dailyReport['Cumulative total'] !== '') {
      data_cumulative_tests['labels'].push(
        createDateLabel(dailyReport['Date'])
      );
      data_cumulative_tests['data'].push(dailyReport['Cumulative total']);
    }
    if (dailyReport['Cumulative total per thousand'] !== '') {
      data_per_thousand['labels'].push(createDateLabel(dailyReport['Date']));
      data_per_thousand['data'].push(
        dailyReport['Cumulative total per thousand']
      );
    }
    if (dailyReport['7-day smoothed daily change'] !== '') {
      data_daily_change['labels'].push(createDateLabel(dailyReport['Date']));
      data_daily_change['data'].push(
        dailyReport['7-day smoothed daily change']
      );
    }
    if (dailyReport['Short-term tests per case'] !== '') {
      data_per_case['labels'].push(createDateLabel(dailyReport['Date']));
      data_per_case['data'].push(dailyReport['Short-term tests per case']);
    }
  });

  const chartCumulative = new Chart(testingSkeleton['ctx'][0], {
    type: 'line',
    data: {
      labels: data_cumulative_tests['labels'],
      datasets: [
        {
          label: 'Cumulative tests',
          data: data_cumulative_tests['data'],
          borderColor: 'rgba(64, 174, 223, 0.9)',
          backgroundColor: 'rgba(135, 206, 250, 0.8)',
          fill: {
            target: 'origin',
            below: 'rgba(135, 206, 250, 0.8)',
          },
          cubicInterpolationMode: 'monotone',
          pointRadius: 2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Cumulative Total Tests',
        },
        decimation: {
          enabled: true,
          algorithm: 'lttb',
        },
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Date',
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Total tests',
          },
        },
      },
    },
  });

  const chartDaily = new Chart(testingSkeleton['ctx'][1], {
    type: 'bar',
    data: {
      labels: data_daily_change['labels'],
      datasets: [
        {
          label: 'Daily tests',
          data: data_daily_change['data'],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Daily tests (7-day-smoothed)',
        },
        legend: {
          display: false,
        },
        decimation: {
          enabled: true,
          algorithm: 'lttb',
        },
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Date',
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Tests executed',
          },
        },
      },
      datasets: {
        bar: {
          borderColor: (context) => {
            var index = context.dataIndex;
            var value = context.dataset.data[index];
            if (index === 0) return 'rgba(98, 175, 68, 0.9)';
            else {
              return value >= context.dataset.data[index - 1]
                ? 'rgba(98, 175, 68, 0.9)'
                : 'rgba(171, 5, 1, 0.9)';
            }
          },
          backgroundColor: (context) => {
            var index = context.dataIndex;
            var value = context.dataset.data[index];
            if (index === 0) return 'rgba(81, 233, 0, 0.8)';
            else {
              return value >= context.dataset.data[index - 1]
                ? 'rgba(81, 233, 0, 0.8)'
                : 'rgba(247, 0, 0, 0.8)';
            }
          },
        },
      },
    },
  });

  const chartPerThousand = new Chart(testingSkeleton['ctx'][2], {
    type: 'line',
    data: {
      labels: data_per_thousand['labels'],
      datasets: [
        {
          label: 'Tests per a thousand people',
          data: data_per_thousand['data'],
          borderColor: 'rgba(64, 174, 223, 0.9)',
          backgroundColor: 'rgba(135, 206, 250, 0.8)',
          fill: {
            target: 'origin',
            below: 'rgba(135, 206, 250, 0.8)',
          },
          cubicInterpolationMode: 'monotone',
          pointRadius: 2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Cumulative Tests per a thousand people',
        },
        decimation: {
          enabled: true,
          algorithm: 'lttb',
        },
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Date',
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Tests per thousand',
          },
        },
      },
    },
  });

  const chartPerCase = new Chart(testingSkeleton['ctx'][3], {
    type: 'bar',
    data: {
      labels: data_per_case['labels'],
      datasets: [
        {
          label: 'Tests',
          data: data_per_case['data'],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Number of Tests per each case',
        },
        legend: {
          display: false,
        },
        decimation: {
          enabled: true,
          algorithm: 'lttb',
        },
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Date',
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Tests',
          },
        },
      },
      datasets: {
        bar: {
          borderColor: (context) => {
            var index = context.dataIndex;
            var value = context.dataset.data[index];
            if (index === 0) return 'rgba(98, 175, 68, 0.9)';
            else {
              return value >= context.dataset.data[index - 1]
                ? 'rgba(98, 175, 68, 0.9)'
                : 'rgba(171, 5, 1, 0.9)';
            }
          },
          backgroundColor: (context) => {
            var index = context.dataIndex;
            var value = context.dataset.data[index];
            if (index === 0) return 'rgba(81, 233, 0, 0.8)';
            else {
              return value >= context.dataset.data[index - 1]
                ? 'rgba(81, 233, 0, 0.8)'
                : 'rgba(247, 0, 0, 0.8)';
            }
          },
        },
      },
    },
  });

  testingSkeleton['div'].forEach((div) => {
    chartsWrapper.appendChild(div);
  });

  const source = createInfoSource(
    testingData[testingData.length - 1]['Date'],
    testingData[testingData.length - 1]['Source URL'],
    testingData[testingData.length - 1]['Source label']
  );

  chartsWrapper.appendChild(source);

  return chartsWrapper;
}

async function getConfirmedData(countryCode) {
  await isDataPresent('general');
  const confirmedData = covidData.general[countryCode]['data'];
  if (confirmedData.length == 0) return null;
  console.log(confirmedData);

  const chartsWrapper = document.createElement('div');
  chartsWrapper.id = 'charts-wrapper';

  const confirmedSkeleton = new ChartsSkeleton(
    ['new_cases', 'total_cases'],
    400,
    400
  );
  const new_casesData = { data: [], labels: [] };
  const total_casesData = { data: [], labels: [] };

  confirmedData.forEach((dailyReport) => {
    if (dailyReport['new_cases'] !== '') {
      new_casesData['data'].push(dailyReport['new_cases']);
      new_casesData['labels'].push(createDateLabel(dailyReport['date']));
    }
    if (dailyReport['total_cases'] !== '') {
      total_casesData['data'].push(dailyReport['total_cases']);
      total_casesData['labels'].push(createDateLabel(dailyReport['date']));
    }
  });

  const newChart = new Chart(confirmedSkeleton['ctx'][0], {
    type: 'bar',
    data: {
      labels: new_casesData['labels'],
      datasets: [
        {
          label: 'New Cases',
          data: new_casesData['data'],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'New confirmed cases',
        },
        decimation: {
          enabled: true,
          algorithm: 'lttb',
        },
        legend: {
          display: false,
        },
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Date',
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Confirmed Cases',
          },
        },
      },
      datasets: {
        bar: {
          borderColor: (context) => {
            var index = context.dataIndex;
            var value = context.dataset.data[index];
            if (index === 0) return 'rgba(171, 5, 1, 0.9)';
            else {
              return value < context.dataset.data[index - 1]
                ? 'rgba(98, 175, 68, 0.9)'
                : 'rgba(171, 5, 1, 0.9)';
            }
          },
          backgroundColor: (context) => {
            var index = context.dataIndex;
            var value = context.dataset.data[index];
            if (index === 0) return 'rgba(247, 0, 0, 0.8)';
            else {
              return value < context.dataset.data[index - 1]
                ? 'rgba(81, 233, 0, 0.8)'
                : 'rgba(247, 0, 0, 0.8)';
            }
          },
        },
      },
    },
  });

  const totalChart = new Chart(confirmedSkeleton['ctx'][1], {
    type: 'line',
    data: {
      labels: total_casesData['labels'],
      datasets: [
        {
          label: 'Total confirmed cases',
          data: total_casesData['data'],
          borderColor: 'rgba(171, 5, 1, 0.9)',
          backgroundColor: 'rgba(247, 0, 0, 0.8)',
          fill: {
            target: 'origin',
            below: 'rgba(247, 0, 0, 0.8)',
          },
          cubicInterpolationMode: 'monotone',
          pointRadius: 2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Cumulative Total Cases',
        },
        decimation: {
          enabled: true,
          algorithm: 'lttb',
        },
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Date',
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Total cases',
          },
        },
      },
    },
  });

  confirmedSkeleton['div'].forEach((div) => {
    chartsWrapper.appendChild(div);
  });
  return chartsWrapper;
}

async function getVaccinationsData(countryCode) {
  await isDataPresent('vaccinations');
  let vaccineData = null;
  for (let i = 0; i < covidData['vaccinations'].length; ++i) {
    if (covidData['vaccinations'][i]['iso_code'] === countryCode) {
      vaccineData = covidData['vaccinations'][i]['data'];
      break;
    }
  }

  if (!vaccineData) return null;

  console.log(vaccineData);
}

async function getMortalityData(countryCode) {
  const para = document.createElement('p');
  para.textContent = `The country code for mortality is ${countryCode}, ${dataURLs.mortality}`;
  return para;
}

async function getVariantsData(countryCode) {
  const para = document.createElement('p');
  para.textContent = `The country code for variants is ${countryCode}, ${dataURLs.variants}`;
  return para;
}

export {
  getConfirmedData,
  getMortalityData,
  getOverviewData,
  getTestingData,
  getVaccinationsData,
  getVariantsData,
  isDataPresent,
};
