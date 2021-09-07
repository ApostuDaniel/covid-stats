import { getLocation } from './modules/location.js';
import { populateMain, populateDataList } from './modules/dom-manipulation.js';
import { countryList } from './modules/data-procesing.js';
import { isDataPresent } from './modules/canvas-manipulation.js';
import { addLoading, removeLoading } from './modules/utility.js';

const main = document.querySelector('main');
const mainWrapper = document.querySelector('.main-wrapper');
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

const expandTag = document.querySelector('#expand-nav');
const nav = document.querySelector('nav');
expandTag.addEventListener('click', () => {
  if (nav.classList.contains('hidden')) {
    nav.classList.remove('hidden');
    nav.classList.add('showing');
    expandTag.firstElementChild.textContent = ' keyboard_double_arrow_right ';
  } else {
    nav.classList.remove('showing');
    nav.classList.add('hidden');
    expandTag.firstElementChild.textContent = ' menu_open ';
  }
});

main.addEventListener('click', () => {
  if (nav.classList.contains('showing')) {
    nav.classList.remove('showing');
    nav.classList.add('hidden');
    expandTag.firstElementChild.textContent = ' menu_open ';
  }
});

window.onload = async () => {
  addLoading(main, mainWrapper);
  await isDataPresent('general');
  const locationsList = await countryList();
  populateDataList(locationsList);
  removeLoading(main, mainWrapper, 'block');
  input.setAttribute('placeholder', 'Type here...');
  input.disabled = false;
  getInfoButton.disabled = false;
  currentLocationButton.disabled = false;
};
