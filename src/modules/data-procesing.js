import csv from 'csvtojson/v2';
import { get } from 'request';
import { covidData } from './commons';

async function getJSON(url) {
  const data = await fetch(url);
  const result = await data.json();
  return result;
}

const csvtojson = async (csvUrl) => {
  const json = await csv().fromStream(get(csvUrl));
  return json;
};

async function countryList() {
  let result = [];
  Object.keys(covidData.general).forEach((key) => {
    if (key.length <= 3) {
      result.push({ iso: key, name: covidData.general[key]['location'] });
    }
  });
  return result;
}

export { csvtojson, getJSON, countryList };
