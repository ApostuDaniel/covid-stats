const fs = require('fs');

import { csvtojson, getJSON } from './data-procesing.js';

async function getData(fileName, fallBackURL, sourceType) {
  return new Promise((resolve, reject) => {
    fs.stat(fileName, (err, fstat) => {
      if (err) {
        reject(err);
        return null;
      } else {
        let retData = null;
        let mtime = new Date(fstat.mtime);
        let timeElapsed = Date.now() - mtime.getTime();
        if (timeElapsed >= 86400000 || fstat.size === 0) {
          if (sourceType === 'json') {
            getJSON(fallBackURL).then((json) => (retData = json));
          } else {
            csvtojson(fallBackURL).then((json) => {
              retData = json;
            });
          }
          fs.writeFile(fileName, JSON.stringify(retData), (err, success) => {
            if (err) {
              reject(err);
            } else {
              resolve(retData);
            }
          });
        } else {
          fs.readFile(fileName, 'utf8', (err, jsonData) => {
            if (err) {
              reject(err);
            } else {
              retData = JSON.parse(jsonData);
              resolve(retData);
            }
          });
        }
      }
    });
  });
}

export { getData };
