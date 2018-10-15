/* Interactive 2D plot of a system of oblate spheroidal coordinates
            Semidan Robaina Estevez, September 2018
*/

let zoomFactor = 3.5;
let leftArrowPressed = false;
let rightArrowPressed = false;
let playButtonPressed = false;
let numberOfHyperbolae = 24;
let numberOfEllipses = 10;
let resolution = 100;
let varFocalDistance = 100;
let focalDistanceIncrement = (1 / 150) * window.innerWidth;
let timeStep = 100;
let textValue = document.getElementById("focalDistance");
let leftArrow = document.getElementById('leftArrow');
let pauseButton = document.getElementById('pauseButton');
let playButton = document.getElementById('playButton');
let rightArrow = document.getElementById('rightArrow');
let buttonsContainer = document.getElementById('buttonsContainer');
let maxRadius = math.max(window.innerWidth, window.innerHeight) / 2;
let layout = {
  xaxis: {
    autorange: false,
    showgrid: false,
    zeroline: false,
    showline: false,
    autotick: true,
    ticks: '',
    range: [-window.innerWidth / zoomFactor, window.innerWidth / zoomFactor],
    showticklabels: false,
  },
  yaxis: {
    autorange: false,
    showgrid: false,
    zeroline: false,
    showline: false,
    autotick: true,
    ticks: '',
    range: [-window.innerHeight / zoomFactor, window.innerHeight / zoomFactor],
    showticklabels: false,
  },
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)',
  showlegend: false,
  autosize: true,
  useResizeHandler: true,
  margin: {
    l: 0,
    r: 0,
    b: 0,
    t: 0
  }
};
let options = {
  staticPlot: true,
  responsive: true
};

// initialize plot
setupPlot();

// generate data
function getEllipseData(focalDistance, radius) {

  let thetas = math.range(0, 2 * math.PI, 2 * math.PI / resolution).toArray();
  let data = {
    x: thetas.map(theta => math.sqrt(math.pow(radius, 2) + math.pow(focalDistance, 2)) * math.sin(theta)),
    y: thetas.map(theta => radius * math.cos(theta)),
    mode: 'lines',
    line: {
      color: 'rgb(123, 213, 224)',
      width: 1.5
    }
  };

  return data

}

function getHyperbolaData(focalDistance, theta) {

  let radii = math.range(-maxRadius, maxRadius, maxRadius / resolution).toArray();
  let data = {
    x: radii.map(radius => math.sqrt(math.pow(radius, 2) + math.pow(focalDistance, 2)) * math.sin(theta)),
    y: radii.map(radius => radius * math.cos(theta)),
    mode: 'lines',
    line: {
      color: 'rgb(237, 188, 79)',
      width: 1.5
    }
  };

  return data

}

function getDataPoints(focalDistance) {

  let ellipseData = [];
  let maxAngle = 2 * math.PI;

  for (let radius of math.range(0, maxRadius, maxRadius / numberOfEllipses).toArray()) {
    ellipseData.push(getEllipseData(focalDistance, radius));
  };

  let hyperbolaData = [];
  for (let theta of math.range(0, maxAngle, maxAngle / numberOfHyperbolae).toArray()) {
    hyperbolaData.push(getHyperbolaData(focalDistance, theta));
  };

  return ellipseData.concat(hyperbolaData)
};

function setupPlot() {
  // detect touch input
  window.addEventListener('touchstart', function onFirstTouch() {

    textValue.style.opacity = 1;
    document.getElementById('fullscreenButton').style.visibility = 'hidden';

    window.removeEventListener('touchstart', onFirstTouch, false);
  }, false);

  // detect arrow clicked
  window.addEventListener('mousedown', function onFirstClick() {

    textValue.style.opacity = 1;
    document.getElementById('fullscreenButton').style.visibility = 'hidden';

    window.removeEventListener('mousedown', onFirstClick, false);
  }, false);

  // plot ellipses and hyperbolae
  Plotly.newPlot('plot', getDataPoints(focalDistance=varFocalDistance), layout, options);

  textValue.innerHTML = 'focal distance = ' + math.round(varFocalDistance / 100, 2);
  if (window.innerWidth > window.innerHeight) {
    textValue.style.fontSize = "2.5vw";
  }
  else {
    textValue.style.fontSize = "2.5vh";
  }
}

function updatePlot() {
  //focalDistanceIncrement = (1 / 150) * window.innerWidth;
  let focalDistanceLimit = 1.1 * window.innerWidth;
            
  focalDistanceIncrement = 1 / math.abs(varFocalDistance - 0.5*focalDistanceLimit);
  

  if (leftArrowPressed) {
    varFocalDistance -= focalDistanceIncrement;
    leftArrowPressed = false;
  }
  if (rightArrowPressed || playButtonPressed) {
    varFocalDistance += focalDistanceIncrement;
    rightArrowPressed = false;
  }

  //let focalDistanceLimit = 1.1 * window.innerWidth;
  if (math.abs(varFocalDistance) > focalDistanceLimit) {
    varFocalDistance *= -1;
  }

  Plotly.newPlot('plot', getDataPoints(focalDistance=varFocalDistance), layout, options);

  textValue.innerHTML = 'focal distance = ' + math.round(varFocalDistance / 100, 2);

}

function resizePlot() {

  maxRadius = math.max(window.innerWidth, window.innerHeight) / 2;
  layout.xaxis.range = [-window.innerWidth / zoomFactor, window.innerWidth / zoomFactor];
  layout.yaxis.range = [-window.innerHeight / zoomFactor, window.innerHeight / zoomFactor];
  if (window.innerWidth > window.innerHeight) {
    textValue.style.fontSize = "2.5vw";
  }
  else {
    textValue.style.fontSize = "2.5vh";
  }
  Plotly.newPlot('plot', getDataPoints(focalDistance=varFocalDistance), layout, options);

}

function moveLeftArrow() {
  leftArrowPressed = true;
  leftArrow.style.width = "30.5%";
  updatePlot();
}

function stopLeftArrow() {
  leftArrow.style.width = "30%";
}

function moveRightArrow() {
  rightArrowPressed = true;
  rightArrow.style.width = "30.5%";
  updatePlot();
}

function stopRightArrow() {
  rightArrow.style.width = "30%";
}

function movePauseButton() {
  playButtonPressed = false;
  pauseButton.style.width = "23.5%";
  clearInterval(playVideo);
}

function stopPauseButton() {
  pauseButton.style.width = "23%";
}

function movePlayButton() {
  playButtonPressed = true;
  playButton.style.width = "25.5%";
  playVideo = setInterval(updatePlot, timeStep);
}

function stopPlayButton() {
  playButton.style.width = "25%";
}

function hideButtons() {
  buttonsContainer.style.opacity = 0;
}

function showButtons() {
  buttonsContainer.style.opacity = 1;
}

// Request fullscreen
function openFullscreen() {

  let elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) {
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen();
  }
  document.getElementById('fullscreenButton').style.visibility = 'hidden';
  document.querySelector("[href='https://github.com/Robaina/OblateSpheroidal']").style.display = 'none';

}
