import {
  getConfirmedData,
  getMortalityData,
  getOverviewData,
  getTestingData,
  getVaccinationsData,
  getVariantsData,
} from './canvas-manipulation.js';

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
    const para = document.createElement('p');
    placeholder.textContent =
      "We are sorry, we don't have the data you want for this particular country";
    placeholder.appendChild(para);
    parent.appendChild(placeholder);
  }
}

async function getInfo(countryCode) {
  const mainContent = document.querySelector('#main-content-area');
  const currentSection = mainContent.getAttribute('data-current-section');
  let content;

  while (mainContent.firstChild) {
    mainContent.removeChild(mainContent.firstChild);
  }

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
  attachContent(content, mainContent);
}

export { getInfo, populateDataList };
