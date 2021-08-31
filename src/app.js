import { getLocation } from './modules/location.js';
import { getInfo, populateDataList } from './modules/dom-manipulation.js';
import { countryList } from './modules/data-procesing.js';
import { isDataPresent } from './modules/canvas-manipulation.js';

const mainContent = document.querySelector('#main-content-area');
const navList = document.querySelector('#nav-list');
const navSections = [...navList.children];
const input = document.querySelector('#country');
const getInfoButton = document.querySelector('#get-info');
const currentLocationButton = document.querySelector('#localization');

input.onclick = () => {
  input.value = '';
};

navSections.forEach((section) => {
  section.addEventListener('click', async () => {
    mainContent.setAttribute('data-current-section', section.id);
    if (input.value) {
      await getInfo(input.getAttribute('data-iso'));
    }
  });
});

getInfoButton.addEventListener('click', async () => {
  if (input.value) {
    await getInfo(input.getAttribute('data-iso'));
  }
});

currentLocationButton.addEventListener('click', async () => {
  const location = await getLocation();
  input.value = location[1];
  input.setAttribute('data-iso', location[0]);
  await getInfo(input.getAttribute('data-iso'));
});

window.onload = async () => {
  await isDataPresent('general');
  const locationsList = await countryList();
  populateDataList(locationsList);
  input.setAttribute('placeholder', 'Type here...');
  input.disabled = false;
};
