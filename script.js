window.addEventListener('load', checkEncodedData)

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

function checkEncodedData() {
  //decode base64 json from request argument data
  const urlParams = new URLSearchParams(window.location.search);
  const b64Data = urlParams.get('data')
  if (b64Data) {
    load_data(atob(b64Data))
  }
}

async function load_data(jsonData) {
  const data = JSON.parse(jsonData)
  for (const [subjectName, subjectData] of Object.entries(data)) {
    for (const difficulty of ['low', 'mid', 'high']) { 
      const evaluation = subjectData[difficulty]
      const chartLabels = ['Correct', 'Invalid', 'Incorrect']
      const chartData = [evaluation['correct'], evaluation['invalidChoices'].length, evaluation['incorrect']]
      add_chart(`${doCapitalize(subjectName)} - ${doCapitalize(difficulty)}`, chartLabels, chartData, `Invalid Answers: ${[...new Set(evaluation['invalidChoices'])].join(', ')}`)

    }
  }
}

Chart.defaults.color = "#ffffff";

function add_chart(chartTitle, chartLabels, chartData, textDescription) {
  const graphingArea = document.getElementById('graphingArea')

  const graphBox = document.createElement('div')
  graphBox.classList.add('graphBox')
  
  const description = document.createElement('p')
  description.classList.add('graphDescription')
  description.innerHTML = textDescription

  const graphCanvasContainer = document.createElement('div')
  graphCanvasContainer.classList.add('graphCanvasContainer')

  const graphCanvas = document.createElement('canvas')
  graphCanvas.id = `evalChart-${chartTitle}`

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
        }
      }
    }
  };
  
  new Chart(ctx, config);

  graphCanvasContainer.appendChild(graphCanvas)
  graphBox.appendChild(graphCanvasContainer)
  graphBox.appendChild(description)
  graphingArea.appendChild(graphBox)
}