import { getJSON, csvtojson } from './data-procesing';
import { dataURLs, covidData } from './commons';

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
  const para = document.createElement('p');
  para.textContent = `The country code for overview is ${countryCode}, link is ${dataURLs.overview}`;
  return para;
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
