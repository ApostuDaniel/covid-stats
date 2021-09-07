import {
  getConfirmedData,
  getMortalityData,
  getOverviewData,
  getTestingData,
  getVaccinationsData,
  getVariantsData,
  isDataPresent,
} from './canvas-manipulation.js';
import { covidData } from './commons';

import { getJSON } from './data-procesing';

import { addLoading, removeLoading } from './utility';

function populateDataList(countryData) {
  const datalist = document.querySelector('#countries');
  const input = document.querySelector('#country');
  countryData.forEach((country) => {
    const option = document.createElement('option');
    option.value = country['name'];
    option.setAttribute('data-iso', country['iso']);
    datalist.appendChild(option);
  });
  const options = datalist.children;
  input.addEventListener('change', () => {
    for (let i = 0; i < options.length; ++i) {
      if (input.value == options[i].value) {
        input.setAttribute('data-iso', options[i].getAttribute('data-iso'));
      }
    }
  });
}

function attachContent(element, parent) {
  if (element) {
    parent.appendChild(element);
  } else {
    const placeholder = document.createElement('div');
    placeholder.classList.add('no-data');
    const h2 = document.createElement('h2');
    h2.textContent = 'No such data currently';
    const para = document.createElement('p');
    para.textContent =
      "We are sorry, we don't have the data you want for this particular country";
    placeholder.append(h2);
    placeholder.appendChild(para);
    parent.appendChild(placeholder);
  }
}

async function populateMainHeader(countryCode, headerName) {
  await isDataPresent('general');
  const jsonData = covidData.general[countryCode];

  const header = document.createElement('header');
  header.id = 'main-content-header';
  const h = document.createElement('h1');
  const countryID = document.createElement('span');
  countryID.id = 'country-id';
  const name = document.createElement('p');
  const continent = document.createElement('p');
  const flag = document.createElement('img');

  h.textContent = headerName;
  name.textContent = jsonData['location'];
  continent.textContent = jsonData['continent'];

  let iso2 = await getJSON(
    `https://api.worldbank.org/v2/country/${countryCode.toLowerCase()}?format=json`
  );

  flag.src = `https://flagcdn.com/h40/${iso2[1][0][
    'iso2Code'
  ].toLowerCase()}.png`;
  flag.id = 'flag';
  flag.alt = `The flag of ${jsonData['location']}`;

  countryID.appendChild(name);
  countryID.appendChild(flag);
  countryID.appendChild(continent);
  header.appendChild(h);
  header.appendChild(countryID);

  return header;
}

async function populateMain(countryCode) {
  const mainContent = document.querySelector('#main-content-area');
  const currentSection = mainContent.getAttribute('data-current-section');
  let content;

  while (mainContent.firstChild) {
    mainContent.removeChild(mainContent.firstChild);
  }

  addLoading(mainContent, null);

  switch (currentSection) {
    case 'overview':
      content = await getOverviewData(countryCode);
      break;
    case 'testing':
      content = await getTestingData(countryCode);
      break;
    case 'confirmed':
      content = await getConfirmedData(countryCode);
      break;
    case 'vaccinations':
      content = await getVaccinationsData(countryCode);
      break;
    case 'mortality':
      content = await getMortalityData(countryCode);
      break;
    case 'variants':
      content = await getVariantsData(countryCode);
      break;
    default:
      console.log('Invalid section', currentSection);
  }
  let sectionName = `${currentSection
    .charAt(0)
    .toUpperCase()}${currentSection.slice(1)}`;
  const header = await populateMainHeader(countryCode, sectionName);
  removeLoading(mainContent, null, null);
  mainContent.appendChild(header);
  attachContent(content, mainContent);
}

export { populateMain, populateDataList };
