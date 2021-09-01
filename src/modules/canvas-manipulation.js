import { getJSON, csvtojson } from './data-procesing';
import { dataURLs, covidData } from './commons';
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
  const jsonData = covidData.general[countryCode];

  const info = document.createElement('div');
  info.id = 'main-info';
  console.log(jsonData);
  const searchTerm =
    jsonData['location'].toLowerCase().replace(' ', '-') + '-map';

  const iconInfo = await getJSON(
    `https://search.icons8.com/api/iconsets/v5/search?term=${searchTerm}&token=${API_KEY}&amount=1`
  );

  const icon = await getJSON(
    `https://api-icons.icons8.com/publicApi/icons/icon?id=${iconInfo['icons'][0]['id']}&token=${API_KEY}`
  );

  console.log(icon);

  if (icon && icon['icon']['category'] === 'maps') {
    const countryMap = document.createElement('div');
    countryMap.innerHTML = icon['icon']['svg'];
    countryMap.id = 'country-map-icon';
    info.appendChild(countryMap);
  }

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
    if (jsonData[key]) {
      const para = document.createElement('p');
      para.id = key;
      para.textContent = `${infoSkeleton.textContent[index]}: ${jsonData[key]} ${infoSkeleton.unit[index]}`;
      info.appendChild(para);
    }
  });
  return info;
}

async function getTestingData(countryCode) {
  const para = document.createElement('p');
  para.textContent = `The country code for testing is ${countryCode}, link is ${dataURLs.testing}`;
  return para;
}

async function getConfirmedData(countryCode) {
  const para = document.createElement('p');
  para.textContent = `The country code for confirmed is ${countryCode}, ${dataURLs.confirmed}`;
  return para;
}

async function getVaccinationsData(countryCode) {
  const para = document.createElement('p');
  para.textContent = `The country code for vaccinations is ${countryCode}, ${dataURLs.vaccinations}}`;
  return para;
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
