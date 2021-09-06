import { getLocation } from './modules/location.js';
import { populateMain, populateDataList } from './modules/dom-manipulation.js';
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

const selectSection = async (section) => {
  mainContent.setAttribute('data-current-section', section.id);
  navSections.forEach((selection) => {
    if (selection.classList.contains('selected')) {
      selection.classList.remove('selected');
    }
  });
  section.classList.add('selected');
  if (input.value) {
    await populateMain(input.getAttribute('data-iso'));
  }
};

navSections.forEach((section) => {
  section.addEventListener('click', async () => {
    selectSection(section);
  });
  section.addEventListener('keydown', async (e) => {
    if (e.code === 'Enter') {
      selectSection(section);
    }
  });
});

getInfoButton.addEventListener('click', async () => {
  if (input.value) {
    await populateMain(input.getAttribute('data-iso'));
  }
});

currentLocationButton.addEventListener('click', async () => {
  const location = await getLocation();
  input.value = location[1];
  input.setAttribute('data-iso', location[0]);
  await populateMain(input.getAttribute('data-iso'));
});

window.onload = async () => {
  await isDataPresent('general');
  const locationsList = await countryList();
  populateDataList(locationsList);
  input.setAttribute('placeholder', 'Type here...');
  input.disabled = false;
  getInfoButton.disabled = false;
  currentLocationButton.disabled = false;
};
