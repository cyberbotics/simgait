import Project from './project.js';
import WebotsView from 'https://cyberbotics.com/wwi/R2023a/WebotsView.js';

export default class Animation extends Project {
  static run(title, footer, routes) {
    let animation = new Animation(title, footer, routes);
    animation.load();
  }
  constructor(title, footer, routes) {
    super(title, footer, routes);
    routes.push({url: '/animation', setup: setup, cleanup: cleanup});
    let that = this;

    const view = new WebotsView();
    document.getElementsByClassName('webots-view-container')[0].appendChild(view);
    view.showCustomWindow = true;
    let basicTimeStep;
    let myCharts;
    let labels;
    let flyoutMenus;
    const anglesMaps = new Map();

    view.onready = () => fillCustomWindow();
    view.loadAnimation('storage/gait/model.x3d', 'storage/gait/animation.json', false, undefined, 'storage/gait/gait.jpg');

    function fillCustomWindow() {
      myCharts = [];
      labels = [];
      new Promise((resolve, reject) => {
        let xmlhttp = new XMLHttpRequest();
        xmlhttp.open('GET', 'storage/gait/angles.json', true);
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
    }

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
          <div class=menu-div number=0>
          </div>
          <div style='width:100%;height:calc(100% - 20px);'>
            <canvas id='chart0'></canvas>
          </div>
        </div>
        <div class=chart-container style='left: 4px;top:calc(50% + 23px);'>
          <div class=menu-div number=1>
          </div>
          <div style='width:100%;height:calc(100% - 20px);'>
            <canvas id='chart1'>
          </div>
        </div>
        <div class=chart-container style='left:50%;top:47px;'>
          <div class=menu-div number=2>
          </div>
          <div style='width:100%;height:calc(100% - 20px);'>
            <canvas id='chart2'>
          </div>
        </div>
        <div class=chart-container style='top:calc(50% + 23px);left:50%;'>
          <div class=menu-div number=3>
          </div>
          <div style='width:100%;height:calc(100% - 20px);'>
            <canvas id='chart3'>
          </div>
        </div>
        `);

        flyoutMenus = document.getElementsByClassName('menu-div');
        for (let i = 0; i < flyoutMenus.length; i++)
          flyoutMenus[i].innerHTML = flyoutMenuHTML;

        const anglesNames = document.getElementsByClassName('angles-name');
        for (let i = 0; i < anglesNames.length; i++) {
          anglesNames[i].onclick = () => {
            let name = anglesNames[i].innerText;
            anglesNames[i].parentNode.parentNode.parentNode.parentNode.parentNode.childNodes[0].innerText = name;
            const number = anglesNames[i].parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.getAttribute('number');
            myCharts[number].config.data.datasets[0].data = anglesMaps.get(name);
            myCharts[number].update();
          };
        }

        let customWindow = document.getElementById('custom-window');
        if (customWindow)
          customWindow.style.minWidth = '310px';

        const names = json.names;
        names.forEach(name => {
          anglesMaps.set(name, []);
        });

        const frames = json.frames;
        for (let i = 0; i < frames.length; i++) {
          labels.push(frames[i].time);
          for (let key in frames[i].angles) {
            const value = anglesMaps.get(key);
            value.push(radiansToDegrees(frames[i].angles[key]));
            anglesMaps.set(key, value);
          }
        }

        myCharts.push(createGraph('pelvis_tilt'));
        myCharts[0].options.animation = false;
        flyoutMenus[0].childNodes[1].childNodes[0].innerText = 'pelvis_tilt';
        myCharts.push(createGraph('hip_flexion_l'));
        myCharts[1].options.animation = false;
        flyoutMenus[1].childNodes[1].childNodes[0].innerText = 'hip_flexion_l';
        myCharts.push(createGraph('knee_angle_l'));
        myCharts[2].options.animation = false;
        flyoutMenus[2].childNodes[1].childNodes[0].innerText = 'knee_angle_l';
        myCharts.push(createGraph('ankle_angle_l'));
        myCharts[3].options.animation = false;
        flyoutMenus[3].childNodes[1].childNodes[0].innerText = 'ankle_angle_l';
      } else
        setTimeout(() => createGraphs(json), 500);
    }

    function radiansToDegrees(radians) {
      return radians * (180 / Math.PI);
    }

    let index = -1;
    function createGraph(name) {
      const data = {
        labels: labels,
        datasets: [{
          data: anglesMaps.get(name)
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
              title: {
                display: true,
                text: 'Time [s]',
                padding: 0,
                color: 'rgb(220, 220, 220)'
              },
              ticks: {
                color: 'rgb(220, 220, 220)'
              },
              grid: {
                color: 'rgb(80, 80, 80)'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Angle [degree]',
                padding: 0,
                color: 'rgb(220, 220, 220)'
              },
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
      index++;
      return new Chart(document.getElementById('chart' + index), config);
    }

    const flyoutMenuHTML = `
    <div class="menu"><span>Pelvis</span><span class="arrow-down">&#8964;</span>
        <ul>
            <li><span>Ankle</span><span class="right-arrow" style="top:-10px;">&#8250</span>
              <ul>
                <li><span class="angles-name">ankle_angle_r</span></li>
                <li><span class="angles-name">ankle_angle_l</span></li>
              </ul>
            </li>
            <li><span>Knee</span><span class="right-arrow" style="top:98px;">&#8250</span>
            <ul style="top:108px;">
                <li><span class="angles-name">knee_angle_r</span></li>
                <li><span class="angles-name">knee_angle_l</span></li>
              </ul>
            </li>
            <li><span>Hip</span><span class="right-arrow" style="top:62px;">&#8250</span>
            <ul style="top:72px;">
                <li><span class="angles-name">hip_flexion_r</span></li>
                <li><span class="angles-name">hip_flexion_l</span></li>
              </ul>
            </li>
            <li><span>Pelvis</span><span class="right-arrow" style="top:134px;">&#8250</span>
            <ul style="top:144px;">
                <li><span class="angles-name">pelvis_tilt</span></li>
              </ul>
            </li>
            <li class="flyout-separator"></li>
            <li><span>GRF</span><span class="right-arrow" style="top:116px;">&#8250</span>
            <ul style="top:126px;">
                <li><span class="angles-name">leg0_l.grf_x</span></li>
                <li><span class="angles-name">leg1_r.grf_x</span></li>
                <li><span class="angles-name">leg0_l.grf_y</span></li>
                <li><span class="angles-name">leg1_r.grf_y</span></li>
                <li><span class="angles-name">leg0_l.grf_z</span></li>
                <li><span class="angles-name">leg1_r.grf_z</span></li>
              </ul>
            </li>
            <li class="flyout-separator"></li>
            <li><span>Soleus</span><span class="right-arrow" style="top:152px;">&#8250</span>
            <ul style="top:162px;">
                <li><span class="angles-name">soleus_r.mtu_length</span></li>
                <li><span class="angles-name">soleus_l.mtu_length</span></li>
                <li><span class="angles-name">soleus_r.activation</span></li>
                <li><span class="angles-name">soleus_l.activation</span></li>
              </ul>
            </li>
            <li><span>Gastrocnemius</span><span class="right-arrow" style="top:8px;">&#8250</span>
              <ul style="top:18px;">
                <li><span class="angles-name">gastroc_r.mtu_length</span></li>
                <li><span class="angles-name">gastroc_l.mtu_length</span></li>
                <li><span class="angles-name">gastroc_r.activation</span></li>
                <li><span class="angles-name">gastroc_l.activation</span></li>
              </ul>
            </li>
            <li><span>Tibialis anterior</span><span class="right-arrow" style="top:170px;">&#8250</span>
            <ul style="top:180px;">
                <li><span class="angles-name">tib_ant_r.mtu_length</span></li>
                <li><span class="angles-name">tib_ant_l.mtu_length</span></li>
                <li><span class="angles-name">tib_ant_r.activation</span></li>
                <li><span class="angles-name">tib_ant_l.activation</span></li>
              </ul>
            </li>
            <li><span>Hamstrings</span><span class="right-arrow" style="top:44px;">&#8250</span>
              <ul style="top:54px;">
                <li><span class="angles-name">hamstrings_r.mtu_length</span></li>
                <li><span class="angles-name">hamstrings_l.mtu_length</span></li>
                <li><span class="angles-name">hamstrings_r.activation</span></li>
                <li><span class="angles-name">hamstrings_l.activation</span></li>
              </ul>
            </li>
            <li><span>Vasti</span><span class="right-arrow" style="top:188px;">&#8250</span>
            <ul style="top:198px;">
                  <li><span class="angles-name">vasti_r.mtu_length</span></li>
                  <li><span class="angles-name">vasti_l.mtu_length</span></li>
                  <li><span class="angles-name">vasti_r.activation</span></li>
                  <li><span class="angles-name">vasti_l.activation</span></li>
              </ul>
            </li>
            <li><span>Gluteal</span><span class="right-arrow" style="top:26px;">&#8250</span>
              <ul style="top:36px;">
                <li><span class="angles-name">glut_max_r.mtu_length</span></li>
                <li><span class="angles-name">glut_max_l.mtu_length</span></li>
                <li><span class="angles-name">glut_max_r.activation</span></li>
                <li><span class="angles-name">glut_max_l.activation</span></li>
              </ul>
            </li>
            <li><span>Iliopsoas</span><span class="right-arrow" style="top:80px;">&#8250</span>
            <ul style="top:90px;">
                <li><span class="angles-name">iliopsoas_r.mtu_length</span></li>
                <li><span class="angles-name">iliopsoas_l.mtu_length</span></li>
                <li><span class="angles-name">iliopsoas_r.activation</span></li>
                <li><span class="angles-name">iliopsoas_l.activation</span></li>
              </ul>
            </li>
        </ul>
    </div>
    `;

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
        view.onready = () => {
          fillCustomWindow();
          button.classList.toggle('is-loading');
          button.disabled = false;
        };

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
