//Used for ligthening/darkening colors
function shadeColor(color, percent) {
  var R = parseInt(color.substring(1, 3), 16);
  var G = parseInt(color.substring(3, 5), 16);
  var B = parseInt(color.substring(5, 7), 16);

  R = parseInt((R * (100 + percent)) / 100);
  G = parseInt((G * (100 + percent)) / 100);
  B = parseInt((B * (100 + percent)) / 100);

  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;

  var RR = R.toString(16).length == 1 ? '0' + R.toString(16) : R.toString(16);
  var GG = G.toString(16).length == 1 ? '0' + G.toString(16) : G.toString(16);
  var BB = B.toString(16).length == 1 ? '0' + B.toString(16) : B.toString(16);

  return '#' + RR + GG + BB;
}

class ChartsSkeleton {
  constructor(chartIDArray, canvasWidth, canvasHeight) {
    this.chartsID = [...chartIDArray];
    this.div = [];
    this.canvas = [];
    this.ctx = [];
    this.chartsID.forEach((chartID) => {
      const newDiv = document.createElement('div');
      const newCanvas = document.createElement('canvas');
      newCanvas.id = chartID;
      newCanvas.width = canvasWidth;
      newCanvas.height = canvasHeight;
      newDiv.id = `${chartID}-div`;
      newDiv.classList.add('canvas-wrapper');
      newDiv.style.position = 'relative';
      newDiv.appendChild(newCanvas);
      const newCtx = newCanvas.getContext('2d');
      this.div.push(newDiv);
      this.canvas.push(newCanvas);
      this.ctx.push(newCtx);
    });
  }
}

function createDateLabel(date) {
  let day = new Date(date);
  return day.toDateString().slice(4);
}

function createInfoSource(lastObservationDate, sourceURL, sourceLabel) {
  const source = document.createElement('div');
  source.classList.add('source');
  const para = document.createElement('p');
  const a = document.createElement('a');

  let textContent = new Date(lastObservationDate).toDateString();
  para.textContent = `Last observation date: ${textContent}`;
  a.textContent = `Source: ${sourceLabel}`;
  a.href = sourceURL;
  a.target = '_blank';

  source.appendChild(para);
  source.appendChild(a);
  return source;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function createLoadingIcon() {
  const div0 = document.createElement('div');
  div0.classList.add('loading-wrapper');
  const div1 = document.createElement('div');
  div1.classList.add('loadingio-spinner-pulse-fy6fkd7vgx');
  div0.appendChild(div1);
  const div2 = document.createElement('div');
  div2.classList.add('ldio-7p3pmrtnzis');
  div1.appendChild(div2);
  for (let i = 0; i < 3; ++i) {
    div2.appendChild(document.createElement('div'));
  }
  return div0;
}

function addLoading(parent, div) {
  const loading = createLoadingIcon();
  let currentDisplay = null;
  if (div) {
    currentDisplay = div.style.display;
    div.style.display = 'none';
  }
  parent.appendChild(loading);
  return currentDisplay;
}

function removeLoading(parent, div, display) {
  if (div) {
    div.style.display = display;
  }
  parent.removeChild(document.querySelector('.loading-wrapper'));
}

export {
  shadeColor,
  ChartsSkeleton,
  createDateLabel,
  createInfoSource,
  getRandomInt,
  addLoading,
  removeLoading,
};
