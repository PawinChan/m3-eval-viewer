window.addEventListener('load', checkEncodedData)
window.addEventListener('load', makeIt4ColumnsIfRequired)

function makeIt4ColumnsIfRequired() {
  if (getArg('merge') == "true") {
    graphingArea.style.gridTemplateColumns = "repeat(4, 1fr)"
  }

}
function doCapitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function openFile(event) {
  console.log("File Opened")
  var input = event.target;
  document.querySelector('h2').innerHTML = `Evaluation Result of <u>${input.files[0]['name'].split('.')[0].split('-').slice(-1)[0]}</u>`
  var reader = new FileReader();
  reader.onload = function() {
    var text = reader.result;
    console.log("File Successfully Loaded")
    load_data(text)
  };
  reader.readAsText(input.files[0]);
};

function getArg(key) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(key)
}

function checkEncodedData() {
  const b64Data = getArg('data')
  if (b64Data) {
    load_data(atob(b64Data))
  }
}


function getCorrectPercent(data) {
  console.log(data)
  return ((data[0] / (data[0] + data[1] + data[2])) * 100)

}

async function load_data(jsonData) {
  const data = JSON.parse(jsonData)

  const mergeEnabled = getArg('merge') == "true"
  const chartLabels = ['Correct', 'Invalid', 'Incorrect']

  for (const [subjectName, subjectData] of Object.entries(data)) {
    if (mergeEnabled) {
      var chartData = [0, 0, 0]
      var invalidAnswerData = []
      for (const difficulty of ['low', 'mid', 'high']) {
        const evaluation = subjectData[difficulty]
        chartData[0] += evaluation['correct']
        chartData[1] += evaluation['invalidChoices'].length
        chartData[2] += evaluation['incorrect']
        invalidAnswerData = invalidAnswerData.concat(evaluation['invalidChoices'])
      }
      console.log(invalidAnswerData)
      invalidAnswers = [...new Set(invalidAnswerData)].join(', ').slice(0, 200) || "None"
      addChart(`${doCapitalize(subjectName)}`, chartLabels, chartData, `Invalid Answers: ${invalidAnswers}`, `${getCorrectPercent(chartData).toFixed(2)}% Correct`)
    }
    else {
      for (const difficulty of ['low', 'mid', 'high']) {
        const evaluation = subjectData[difficulty]
        const chartData = [evaluation['correct'], evaluation['invalidChoices'].length, evaluation['incorrect']]
        const invalidAnswers = [...new Set(evaluation['invalidChoices'])].join(', ').slice(0, 200) || "None"
        addChart(`${doCapitalize(subjectName)} - ${doCapitalize(difficulty)}`, chartLabels, chartData, `Invalid Answers: ${invalidAnswers}`, `${getCorrectPercent(chartData).toFixed(2)}% Correct`)

      }
    }
  }
}

Chart.defaults.color = "#ffffff";

function addChart(chartTitle, chartLabels, chartData, incorrectAnswers, textDescription) {
  const graphingArea = document.getElementById('graphingArea')

  const graphBox = document.createElement('div')
  graphBox.classList.add('graphBox')  

  const graphCanvasContainer = document.createElement('div')
  graphCanvasContainer.classList.add('graphCanvasContainer')

  const graphCanvas = document.createElement('canvas')
  graphCanvas.id = `evalChart-${chartTitle}`

  const description = document.createElement('div')
  description.classList.add('graphDescription')
  description.innerHTML = `<p class="textDesc">${textDescription}</p><p class="incorrectAns">${incorrectAnswers}</p>`
  

  const ctx = graphCanvas.getContext('2d');

  const labels = chartLabels //['Red', 'Yellow', 'Blue'];
  const data = {
    labels: labels,
    datasets: [{
      label: 'Score',
      data: chartData,
      backgroundColor: ['hsl(136, 60%, 43%, 0.5)', 'hsl(45, 90%, 50%, 0.5)', 'hsl(5, 75%, 56%, 0.5)'],
      borderColor: ['hsl(136, 60%, 43%)', 'hsl(45, 90%, 50%)', 'hsl(5, 75%, 56%)'],
      //backgroundColor: ['lightgreen', 'RebeccaPurple', 'tomato']
      // backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)'],
      // borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
    }]
  };
  
  const config = {
    type: 'doughnut',
    data: data,
    scaleFontColor: "#FFFFFF",
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: chartTitle,
        }, 
      }
    }
  };
  // console.log(ctx)

  // //const centerX = chart.width / 2;
  // // const centerY = chart.height / 2;

  // ctx.font = "20px Sarabun"
  // ctx.fillStyle = "#ffffff"; // Set text color (black)
  // ctx.textAlign = 'center';
  // ctx.fillText("HELLO", 100, 100)
  
  new Chart(ctx, config);


  graphCanvasContainer.appendChild(graphCanvas)
  graphBox.appendChild(graphCanvasContainer)
  graphBox.appendChild(description)
  graphingArea.appendChild(graphBox)
}