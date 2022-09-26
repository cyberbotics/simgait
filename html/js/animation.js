import Project from './project.js';

export default class Animation extends Project {
  static run(title, footer, routes) {
    let animation = new Animation(title, footer, routes);
    animation.load();
  }
  constructor(title, footer, routes) {
    super(title, footer, routes);
    routes.push({url: '/animation', setup: setup, cleanup: cleanup});
    let that = this;
    function setup() {
      const template = document.createElement('template');
      template.innerHTML = `<section class="section">
      <div class="container">
        <div class="field is-horizontal">
          <div class="field-label">
            <label class="label">Gait type:</label>
          </div>
          <div class="field-body">
            <div class="field is-horizontal">
              <div class="control">
                <div class="select">
                  <select id="gait">
                    <option>Healthy</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="field is-horizontal">
          <div class="field-label">
            <label class="label">Number of muscles:</label>
          </div>
          <div class="field-body">
            <div class="field is-horizontal">
              <div class="control" id="number">
                <label class="radio"><input type="radio" name="number" value="14" checked> 14 </label>
                <label class="radio"><input type="radio" name="number" value="18"> 18 </label>
              </div>
            </div>
          </div>
        </div>

        <div class="field is-horizontal">
          <div class="field-label">
            <label class="label">Muscle type:</label>
          </div>
          <div class="field-body">
            <div class="field is-horizontal">
              <div class="control" id="muscle">
                <label class="radio"><input type="radio" name="muscle" value="Millard" checked> Millard </label>
                <label class="radio"><input type="radio" name="muscle" value="Thelen" disabled> Thelen </label>
              </div>
            </div>
          </div>
        </div>

        <div class="field is-horizontal">
          <div class="field-label">
            <label class="label">Controller:</label>
          </div>
          <div class="field-body">
            <div class="field is-horizontal">
              <div class="control">
                <div class="select">
                  <select id="controller">
                    <option value="Geyer2010">Geyer 2010</option>
                    <option value="Ong2019">Ong 2019</option>
                    <option value="SpinalController">Spinal Controller</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="field is-horizontal">
          <div class="field-label">
            <label class="label">Cost function measure:</label>
          </div>
          <div class="field-body">
            <div class="field is-horizontal">
              <div class="control">
                <div class="select">
                  <select id="cost">
                    <option>0</option>
                    <option>5</option>
                    <option>8</option>
                    <option>11</option>
                    <option>15</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="field is-horizontal">
          <div class="field-label">
          </div>
          <div class="field-body">
            <div class="field">
              <div class="control">
                <button id="run" class="button is-link">Update Animation</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>`;
      that.setup('animation', [], template.content);

      // add the logic for the animation selection, e.g., some options will set
      // some constraints on some others.

      let button = document.querySelector('#run');
      let number = document.querySelector('#number');
      let muscle = document.querySelector('#muscle');
      let controller = document.querySelector('#controller');

      button.addEventListener('click', function(event) {
        const folder = document.querySelector('#gait').value + '_' +
                       number.querySelector('input[name="number"]:checked').value + '_' +
                       muscle.querySelector('input[name="muscle"]:checked').value + '_' +
                       controller.value + '_' +
                       document.querySelector('#cost').value;
        console.log('Folder: ' + folder);
        let view = document.querySelector('webots-view');
        view.showCustomWindow = true;
        let basicTimeStep;
        const myCharts = [];
        const labels = [];
        const dataPoints = [[], [], [], [], [], [], []];
        view.onready = () => {
          button.classList.toggle('is-loading');
          button.disabled = false;
          new Promise((resolve, reject) => {
            let xmlhttp = new XMLHttpRequest();
            xmlhttp.open('GET', 'angles.json', true);
            xmlhttp.overrideMimeType('application/json');
            xmlhttp.onload = () => {
              if (xmlhttp.status === 200 || xmlhttp.status === 0)
                resolve(JSON.parse(xmlhttp.responseText));
              else
                reject(xmlhttp.statusText);
            };
            xmlhttp.send();
          }).then(json => {
            basicTimeStep = json.basicTimeStep;
            createGraphs(json);
            view.setAnimationStepCallback((time) => {
              if (time % 2 === 0)
                updateCharts(time / basicTimeStep);
            });
          });
        };

        function updateCharts(newTime) {
          for (let i = 0; i < 4; i++) {
            myCharts[i].setActiveElements([{datasetIndex: 0, index: newTime}]);
            myCharts[i].update();
          }
        }

        function createGraphs(json) {
          if (typeof view.toolbar !== 'undefined') {
            view.setCustomWindowTitle('Interactive Charts');
            view.setCustomWindowTooltip('Interactive Charts');
            view.setCustomWindowContent(`
            <div class=chart-container style='left:4px; top:47px'>
              <div class=menu-div>
                <select id=select0 style=width:150px;"></select>
              </div>
              <div style='width:100%;height:calc(100% - 20px);'>
                <canvas id='chart0'></canvas>
              </div>
            </div>
            <div class=chart-container style='left: 4px;top:calc(50% + 23px);'>
              <div class=menu-div>
                <select id=select1 style=width:150px;"></select>
              </div>
              <div style='width:100%;height:calc(100% - 20px);'>
                <canvas id='chart1'>
              </div>
            </div>
            <div class=chart-container style='left:50%;top:47px;'>
              <div class=menu-div>
                <select id=select2 style=width:150px;"></select>
              </div>
              <div style='width:100%;height:calc(100% - 20px);'>
                <canvas id='chart2'>
              </div>
            </div>
            <div class=chart-container style='top:calc(50% + 23px);left:50%;'>
              <div class=menu-div>
                <select id=select3 style=width:150px;"></select>
              </div>
              <div style='width:100%;height:calc(100% - 20px);'>
                <canvas id='chart3'>
              </div>
            </div>
            `);

            document.getElementById('select0').onchange = (event) => {
              myCharts[0].config.data.datasets[0].data = dataPoints[event.srcElement.value];
              myCharts[0].update();
            };

            document.getElementById('select1').onchange = (event) => {
              myCharts[1].config.data.datasets[0].data = dataPoints[event.srcElement.value];
              myCharts[1].update();
            };

            document.getElementById('select2').onchange = (event) => {
              myCharts[2].config.data.datasets[0].data = dataPoints[event.srcElement.value];
              myCharts[2].update();
            };

            document.getElementById('select3').onchange = (event) => {
              myCharts[3].config.data.datasets[0].data = dataPoints[event.srcElement.value];
              myCharts[3].update();
            };

            let customWindow = document.getElementById('custom-window');
            if (customWindow)
              customWindow.style.minWidth = '300px';

            const names = json.names;
            for (let i = 0; i < names.length; i++) {
              for (let j = 0; j < 4; j++) {
                const option = document.createElement('option');
                option.textContent = names[i];
                option.value = i;
                const select = document.getElementById('select' + j);
                select.appendChild(option);
                if (i === j)
                  select.value = j;
              }
            }

            const frames = json.frames;
            for (let i = 0; i < frames.length; i++) {
              labels.push(frames[i].time);
              dataPoints[0].push(frames[i].angles[0]);
              dataPoints[1].push(frames[i].angles[1]);
              dataPoints[2].push(frames[i].angles[2]);
              dataPoints[3].push(frames[i].angles[3]);
              dataPoints[4].push(frames[i].angles[4]);
              dataPoints[5].push(frames[i].angles[5]);
              dataPoints[6].push(frames[i].angles[6]);
            }

            for (let i = 0; i < 4; i++) {
              myCharts.push(createGraph(i));
              myCharts[i].options.animation = false;
            }
          } else
            setTimeout(() => createGraphs(json), 500);
        }

        function createGraph(index) {
          const data = {
            labels: labels,
            datasets: [{
              data: dataPoints[index]
            }]
          };

          const config = {
            type: 'line',
            data: data,
            options: {
              aspectRatio: 1,
              maintainAspectRatio: false,
              elements: {
                point: {
                  radius: 0,
                  hoverRadius: 2,
                  backgroundColor: 'rgb(255, 180, 0)',
                  borderColor: 'rgb(255, 180, 0)'

                },
                line: {
                  borderWidth: 1,
                  backgroundColor: 'rgb(0, 122, 204)',
                  borderColor: 'rgb(0, 122, 204)'
                }
              },
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                x: {
                  ticks: {
                    color: 'rgb(220, 220, 220)'
                  },
                  grid: {
                    color: 'rgb(80, 80, 80)'
                  }
                },
                y: {
                  ticks: {
                    color: 'rgb(220, 220, 220)'
                  },
                  grid: {
                    color: 'rgb(80, 80, 80)'
                  }
                }
              }
            }
          };
          return new Chart(document.getElementById('chart' + index), config);
        }

        view.loadAnimation('storage/gait/model.x3d', 'storage/gait/animation.json', true, false, 'storage/gait/gait.jpg');
        button.classList.toggle('is-loading');
        button.disabled = true;
      });
      number.addEventListener('change', function(event) {
        if (event.target.value === '14') { // Millard
          muscle.querySelectorAll('input')[0].checked = true;
          muscle.querySelectorAll('input')[1].checked = false;
          muscle.querySelectorAll('input')[1].disabled = true;
          controller.querySelector('option[value="Geyer2010"]').disabled = false;
          controller.querySelector('option[value="Ong2019"]').disabled = true;
          if (controller.value === 'Ong2019')
            controller.value = 'Geyer2010';
        } else { // '18'
          muscle.querySelectorAll('input')[1].disabled = false; // Thelen
          controller.querySelector('option[value="Geyer2010"]').disabled = true;
          controller.querySelector('option[value="Ong2019"]').disabled = false;
          if (controller.value === 'Geyer2010')
            controller.value = 'Ong2019';
        }
      });

      let container = document.querySelector('.webots-view-container');
      document.querySelector('.section').appendChild(container);
      container.style.removeProperty('display');
      document.querySelector('webots-view').resize();
    }
    function cleanup() {
      let container = document.querySelector('.webots-view-container');
      container.style.display = 'none';
      document.querySelector('body').appendChild(container);
    }
  }
}
