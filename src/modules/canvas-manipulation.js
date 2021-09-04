import { getJSON, csvtojson } from './data-procesing';
import { dataURLs, covidData } from './commons';
import {
  shadeColor,
  ChartsSkeleton,
  createDateLabel,
  createInfoSource,
  getRandomInt,
} from './utility';
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
    case 'locations':
      if (!covidData.locations) {
        covidData.locations = await csvtojson(dataURLs.locations);
      }
      break;
    default:
      console.log('Invalid type', type);
  }
}

async function getOverviewData(countryCode) {
  await isDataPresent('general');
  const data = covidData.general[countryCode];
  console.log(data);

  const info = document.createElement('div');
  info.id = 'main-info';
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
            above: 'rgba(135, 206, 250, 0.5)',
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
            above: 'rgba(135, 206, 250, 0.5)',
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
            above: 'rgba(247, 0, 0, 0.5)',
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
  await isDataPresent('locations');
  let vaccineData = null;
  let locationData = null;
  for (let i = 0; i < covidData['vaccinations'].length; ++i) {
    if (covidData['vaccinations'][i]['iso_code'] === countryCode) {
      vaccineData = covidData['vaccinations'][i]['data'];
      break;
    }
  }

  for (let elem of covidData['locations']) {
    if (elem['iso_code'] === countryCode) {
      locationData = elem;
      break;
    }
  }

  if (!vaccineData) return null;

  const chartsWrapper = document.createElement('div');
  chartsWrapper.id = 'charts-wrapper';

  const vaccineSkeleton = new ChartsSkeleton(
    ['total_vaccinations', 'daily_vaccinations'],
    400,
    400
  );
  const totalData = {
    labels: [],
    vaccinations: [],
    peopleVaccinatedOnce: [],
    peopleFullyVaccinated: [],
  };
  const dailyData = { data: [], labels: [] };

  vaccineData.forEach((dailyReport) => {
    if (dailyReport['daily_vaccinations']) {
      dailyData['data'].push(dailyReport['daily_vaccinations']);
      dailyData['labels'].push(createDateLabel(dailyReport['date']));
    }
    if (dailyReport['total_vaccinations']) {
      if (
        !(
          dailyReport['people_vaccinated'] ||
          dailyReport['people_fully_vaccinated']
        )
      ) {
        return;
      }
      totalData['vaccinations'].push(dailyReport['total_vaccinations']);
      totalData['labels'].push(createDateLabel(dailyReport['date']));
      dailyReport['people_fully_vaccinated']
        ? totalData['peopleFullyVaccinated'].push(
            dailyReport['people_fully_vaccinated']
          )
        : totalData['peopleFullyVaccinated'].push(0);
      dailyReport['people_vaccinated']
        ? totalData['peopleVaccinatedOnce'].push(
            dailyReport['people_vaccinated']
          )
        : totalData['peopleVaccinatedOnce'].push(
            dailyReport['total_vaccinations'] -
              dailyReport['people_fully_vaccinated'] / 2
          );
    }
  });

  console.log(vaccineData);

  const chartTotal = new Chart(vaccineSkeleton['ctx'][0], {
    type: 'line',
    data: {
      labels: totalData['labels'],
      datasets: [
        {
          label: 'Total Vaccines administered',
          data: totalData['vaccinations'],
          borderColor: 'rgba(38, 73, 154, 0.9)',
          backgroundColor: 'rgba(118, 208, 232, 0.8)',
          fill: {
            target: 1,
            above: 'rgba(118, 208, 232, 0.5)',
          },
          cubicInterpolationMode: 'monotone',
          pointRadius: 2,
        },
        {
          label: 'People that received at least one vaccine dose',
          data: totalData['peopleVaccinatedOnce'],
          borderColor: 'rgba(171, 5, 1, 0.9)',
          backgroundColor: 'rgba(247, 0, 0, 0.8)',
          fill: {
            target: 2,
            above: 'rgba(247, 0, 0, 0.5)',
          },
          cubicInterpolationMode: 'monotone',
          pointRadius: 2,
        },
        {
          label: 'People fully vaccinated',
          data: totalData['peopleFullyVaccinated'],
          borderColor: 'rgba(98, 175, 68, 0.9)',
          backgroundColor: 'rgba(81, 233, 0, 0.8)',
          fill: {
            target: 'origin',
            above: 'rgba(81, 233, 0, 0.5)',
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
          text: 'Vaccinations per total',
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
      },
    },
  });

  const chartDaily = new Chart(vaccineSkeleton['ctx'][1], {
    type: 'bar',
    data: {
      labels: dailyData['labels'],
      datasets: [
        {
          label: 'Daily Vaccinations',
          data: dailyData['data'],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Daily Vaccinations(7-day smoothed)',
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
            text: 'Vaccinations',
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

  const vaccineTypes = locationData['vaccines'].split(', ');
  const vaccinesDiv = document.createElement('div');
  vaccinesDiv.id = 'vaccine-types';
  const para = document.createElement('p');
  para.textContent = `Vaccines administered:`;
  vaccinesDiv.appendChild(para);

  const ul = document.createElement('ul');
  vaccinesDiv.appendChild(ul);
  vaccineTypes.forEach((vaccine) => {
    const li = document.createElement('li');
    li.textContent = vaccine;
    ul.appendChild(li);
  });

  chartsWrapper.appendChild(vaccinesDiv);

  vaccineSkeleton['div'].forEach((div) => {
    chartsWrapper.appendChild(div);
  });

  chartsWrapper.appendChild(
    createInfoSource(
      locationData['last_observation_date'],
      locationData['source_website'],
      locationData['source_name']
    )
  );

  return chartsWrapper;
}

async function getMortalityData(countryCode) {
  await isDataPresent('general');
  const mortalityData = covidData.general[countryCode]['data'];
  if (mortalityData.length == 0) return null;

  const chartsWrapper = document.createElement('div');
  chartsWrapper.id = 'charts-wrapper';

  const mortalitySkeleton = new ChartsSkeleton(
    ['new_deaths_smoothed', 'total_deaths'],
    400,
    400
  );
  const new_deathsData = { data: [], labels: [] };
  const total_deathsData = { data: [], labels: [] };

  mortalityData.forEach((dailyReport) => {
    if (dailyReport['new_deaths_smoothed'] !== '') {
      new_deathsData['data'].push(dailyReport['new_deaths_smoothed']);
      new_deathsData['labels'].push(createDateLabel(dailyReport['date']));
    }
    if (dailyReport['total_deaths'] !== '') {
      total_deathsData['data'].push(dailyReport['total_deaths']);
      total_deathsData['labels'].push(createDateLabel(dailyReport['date']));
    }
  });

  const newChart = new Chart(mortalitySkeleton['ctx'][0], {
    type: 'bar',
    data: {
      labels: new_deathsData['labels'],
      datasets: [
        {
          label: 'New deaths',
          data: new_deathsData['data'],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'New registered deaths attributed to Covid-19(7-day smoothed)',
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
            text: 'Deaths',
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

  const totalChart = new Chart(mortalitySkeleton['ctx'][1], {
    type: 'line',
    data: {
      labels: total_deathsData['labels'],
      datasets: [
        {
          label: 'Total deaths',
          data: total_deathsData['data'],
          borderColor: 'rgba(171, 12, 12, 0.9)',
          backgroundColor: 'rgba(25, 25, 25, 0.8)',
          fill: {
            target: 'origin',
            above: 'rgba(25, 25, 25, 0.5)',
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
          text: 'Cumulative Total Deaths attributed to Covid-19',
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
            text: 'Total deaths',
          },
        },
      },
    },
  });

  mortalitySkeleton['div'].forEach((div) => {
    chartsWrapper.appendChild(div);
  });
  return chartsWrapper;
}

async function getVariantsData(countryCode) {
  await isDataPresent('variants');
  await isDataPresent('general');
  const location = covidData['general'][countryCode]['location'];
  console.log(location);

  const variantsDataRaw = covidData['variants'].filter((dailyReport) => {
    return dailyReport['location'] === location;
  });

  if (variantsDataRaw.length == 0) return null;
  const chartsWrapper = document.createElement('div');
  chartsWrapper.id = 'charts-wrapper';

  console.log(variantsDataRaw);
  const variantsSkeleton = new ChartsSkeleton(
    ['total_variants', 'progress_variants'],
    400,
    400
  );

  const parsedData = {
    date: [],
    num_sequences_total: [],
    variants: {},
  };

  variantsDataRaw.forEach((dailyReport) => {
    if (dailyReport['variant'] === 'non_who') return;

    const date = createDateLabel(dailyReport['date']);
    if (
      parsedData['date'].length === 0 ||
      parsedData['date'][parsedData['date'].length - 1] !== date
    ) {
      parsedData['date'].push(date);
      parsedData['num_sequences_total'].push(
        Number(dailyReport['num_sequences_total'])
      );
    }
    if (!parsedData['variants'][dailyReport['variant']]) {
      parsedData['variants'][dailyReport['variant']] = { new: [], total: [] };
    }
    parsedData['variants'][dailyReport['variant']]['new'].push(
      Number(dailyReport['num_sequences'])
    );

    const variantTotal =
      parsedData['variants'][dailyReport['variant']]['total'];

    variantTotal.push(
      variantTotal.length === 0
        ? Number(dailyReport['num_sequences'])
        : variantTotal[variantTotal.length - 1] +
            Number(dailyReport['num_sequences'])
    );
  });

  const variantDatasets = [];
  const kelly_colors = [
    '#F2F3F4',
    '#222222',
    '#F3C300',
    '#875692',
    '#F38400',
    '#A1CAF1',
    '#BE0032',
    '#C2B280',
    '#848482',
    '#8856',
    '#E68FAC',
    '#0067A5',
    '#F99379',
    '#604E97',
    '#F6A600',
    '#B3446C',
    '#DCD300',
    '#882D17',
    '#8DB600',
    '#654522',
    '#E25822',
    '#2B3D26',
  ];

  Object.keys(parsedData['variants']).forEach((variantName, index) => {
    const total = parsedData['variants'][variantName]['total'];
    if (total[total.length - 1] === 0) {
      delete parsedData['variants'][variantName];
    } else {
      const darkColor = shadeColor(kelly_colors[index], -30);
      variantDatasets.push({
        label: variantName,
        data: total,
        backgroundColor: kelly_colors[index],
        borderColor: darkColor,
      });
    }
  });

  console.log(parsedData);

  const chartTotal = new Chart(variantsSkeleton['ctx'][0], {
    type: 'bar',
    data: {
      labels: parsedData['date'],
      datasets: variantDatasets,
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Total number of cases registered per variant',
        },
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
      elements: {
        bar: {
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Date',
          },
          stacked: true,
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Confirmed Cases',
          },
          stacked: true,
        },
      },
    },
  });

  let index = 0;
  let interval;
  const progressState = {
    state: null,
    usedColors: [],
    labels: [],
    data: [],
    chart: null,
    changeState: function (newState) {
      this.state = newState;
      this.usedColors = [];
      this.labels = [];
      this.data = [];
      Object.keys(parsedData['variants']).forEach(
        (variantName, variantIndex) => {
          let value = parsedData['variants'][variantName]['new'][this.state];
          if (value && value > 0) {
            this.usedColors.push(kelly_colors[variantIndex]);
            this.labels.push(variantName);
            this.data.push(value);
          }
        }
      );
      if (this.chart) {
        this.chart.data.labels = this.labels;
        this.chart.datasets[0].data = this.data;
        this.chart.datasets[0].backgroundColor = this.usedColors;
        this.chart.datasets[0].borderColor = this.usedColors.map((color) => {
          return shadeColor(color, -30);
        });
      } else {
        this.chart = new Chart(variantsSkeleton['ctx'][1], {
          type: 'pie',
          data: {
            labels: this.labels,
            datasets: [
              {
                data: this.data,
                backgroundColor: this.usedColors,
                borderColor: this.usedColors.map((color) => {
                  return shadeColor(color, -30);
                }),
                borderWidth: 1,
              },
            ],
          },
          options: {
            plugins: {
              title: {
                display: true,
                text: 'New Cases per variant',
              },
            },
            responsive: true,
          },
        });
      }
    },
  };

  progressState.changeState(index);

  console.log(progressState);

  const player = document.createElement('div');
  player.id = 'player';
  const playerButton = document.createElement('div');
  player.appendChild(playerButton);
  playerButton.id = 'play-button';
  playerButton.innerHTML = `<span class="material-icons-outlined md-24">
  play_arrow
  </span>`;
  const resetButton = document.createElement('div');
  player.appendChild(resetButton);
  resetButton.id = 'reset-button';
  resetButton.innerHTML = `<span class="material-icons-outlined md-24">
  replay
  </span>`;
  const progressBar = document.createElement('div');
  player.appendChild(progressBar);
  const progress = document.createElement('div');
  progress.id = 'progress-amount';
  progressBar.appendChild(progress);
  progress.style.width = 0;
  const para = document.createElement('p');
  progressBar.appendChild(para);
  para.textContent = parsedData['date'][index];

  const updateProgress = (currentIndex, limit, parent) => {
    const children = parent.childNodes;

    children[0].style.width = (currentIndex / limit) * parent.clientWidth;
    children[1].textContent = parsedData['date'][currentIndex];
  };

  playerButton.addEventListener('click', () => {
    if (playerButton.classList.contains('paused')) {
      playerButton.classList.remove('paused');
      playerButton.classList.add('playing');
      playerButton.firstChild.textContent = 'pause';
      if (index >= parsedData['date'].length - 1) {
        index = 0;
      }
      interval = setInterval(() => {
        ++index;
        if (index > parsedData['date'].length - 1) {
          playerButton.click;
        }
        progressState.changeState(index);
        updateProgress(index, parsedData['date'].length - 1, progressBar);
      }, 1000);
    } else {
      clearInterval(interval);
      playerButton.classList.remove('playing');
      playerButton.classList.add('paused');
      playerButton.firstChild.textContent = 'play_arrow';
    }
  });
  resetButton.addEventListener('click', () => {
    if (playerButton.classList.contains('playing')) {
      playerButton.click;
    }
    index = 0;
    progressState.changeState(0);
    updateProgress(index, parsedData['date'].length - 1, progressBar);
  });

  variantsSkeleton['div'].forEach((div) => {
    chartsWrapper.appendChild(div);
  });

  return chartsWrapper;
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
