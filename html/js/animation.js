import Project from './project.js';
import WebotsView from 'https://cyberbotics.com/wwi/R2023b/WebotsView.js';

export default class Animation extends Project {
  static run(title, footer, routes) {
    let animation = new Animation(title, footer, routes);
    animation.load();
  }
  constructor(title, footer, routes) {
    super(title, footer, routes);
    routes.push({url: '/animation', setup: setup, cleanup: cleanup});
    let that = this;
    let index = -1;

    const view = new WebotsView();
    const container = document.getElementsByClassName('webots-view-container')[0];
    container.appendChild(view);
    const line = document.createElement('div');
    line.classList.add('section');
    line.innerHTML = `<a href="https://github.com/cyberbotics/simgait/wiki" target="_blank">How do I create a movie from this animation?</a>`;
    container.appendChild(line);
    view.showCustomWindow = true;
    let basicTimeStep;
    let myCharts;
    let labels;
    let flyoutMenus;
    let numberOfDisplayedGraph = 4;
    const anglesMaps = new Map();

    view.onready = () => fillCustomWindow('storage/14_Millard_Geyer2010');
    view.loadAnimation('storage/14_Millard_Geyer2010/model.x3d', 'storage/14_Millard_Geyer2010/animation.json', false, undefined, 'storage/14_Millard_Geyer2010/gait.jpg');

    function fillCustomWindow(prefix) {
      myCharts = [];
      labels = [];
      new Promise((resolve, reject) => {
        let xmlhttp = new XMLHttpRequest();
        xmlhttp.open('GET', prefix + '/angles.json', true);
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
          if (time % 20 === 0)
            updateCharts(time / basicTimeStep);
        });
      });
    }

    function updateCharts(newTime) {
      if (document.getElementById('custom-window').style.visibility === 'visible') {
        for (let i = 0; i < numberOfDisplayedGraph; i++) {
          myCharts[i].setActiveElements([{datasetIndex: 0, index: newTime}]);
          myCharts[i].update();
        }
      }
    }

    function createGraphs(json) {
      if (typeof view.toolbar !== 'undefined') {
        view.setCustomWindowTitle('Interactive Charts');
        view.setCustomWindowTooltip('Interactive Charts');
        view.setCustomWindowContent(`
        <div class=graph-container>
          <div id=chartContainer0 class=chart-container>
            <div class=menu-div number=0>
            </div>
            <div style='width:100%;height:calc(100% - 20px);'>
              <canvas id='chart0'></canvas>
            </div>
          </div>
          <div id=chartContainer1 class=chart-container>
            <div class=menu-div number=1>
            </div>
            <div style='width:100%;height:calc(100% - 20px);'>
              <canvas id='chart1'>
            </div>
          </div>
          <div id=chartContainer2 class=chart-container>
            <div class=menu-div number=2>
            </div>
            <div style='width:100%;height:calc(100% - 20px);'>
              <canvas id='chart2'>
            </div>
          </div>
          <div id=chartContainer3 class=chart-container>
            <div class=menu-div number=3>
            </div>
            <div style='width:100%;height:calc(100% - 20px);'>
              <canvas id='chart3'>
            </div>
          </div>
          <div id=chartContainer4 class=chart-container>
            <div class=menu-div number=4>
            </div>
            <div style='width:100%;height:calc(100% - 20px);'>
              <canvas id='chart4'></canvas>
            </div>
          </div>
          <div id=chartContainer5 class=chart-container>
            <div class=menu-div number=5>
            </div>
            <div style='width:100%;height:calc(100% - 20px);'>
              <canvas id='chart5'>
            </div>
          </div>
          <div id=chartContainer6 class=chart-container>
            <div class=menu-div number=6>
            </div>
            <div style='width:100%;height:calc(100% - 20px);'>
              <canvas id='chart6'>
            </div>
          </div>
          <div id=chartContainer7 class=chart-container>
            <div class=menu-div number=7>
            </div>
            <div style='width:100%;height:calc(100% - 20px);'>
              <canvas id='chart7'>
            </div>
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
          customWindow.style.minWidth = '420px';

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
        myCharts.push(createGraph('soleus_l.mtu_length'));
        myCharts[4].options.animation = false;
        flyoutMenus[4].childNodes[1].childNodes[0].innerText = 'soleus_l.mtu_length';
        myCharts.push(createGraph('vasti_l.mtu_length'));
        myCharts[5].options.animation = false;
        flyoutMenus[5].childNodes[1].childNodes[0].innerText = 'vasti_l.mtu_length';
        myCharts.push(createGraph('glut_max_l.mtu_length'));
        myCharts[6].options.animation = false;
        flyoutMenus[6].childNodes[1].childNodes[0].innerText = 'glut_max_l.mtu_length';
        myCharts.push(createGraph('hamstrings_l.mtu_length'));
        myCharts[7].options.animation = false;
        flyoutMenus[7].childNodes[1].childNodes[0].innerText = 'hamstrings_l.mtu_length';

        fourGraph();

        const container = document.getElementsByClassName('graph-container')[0];

        onresize(container, function() {
          if (container.offsetHeight > 700)
            eightGraph();
          else
            fourGraph();
        });
      } else
        setTimeout(() => createGraphs(json), 500);
    }

    function onresize(domElem, callback) {
      const resizeObserver = new ResizeObserver(() => callback());
      resizeObserver.observe(domElem);
    };

    function radiansToDegrees(radians) {
      return radians * (180 / Math.PI);
    }

    function fourGraph() {
      const div0 = document.getElementById('chartContainer0');
      if (div0) {
        div0.style.top = '0px';
        div0.style.height = '50%';
      }
      const div1 = document.getElementById('chartContainer1');
      if (div1) {
        div1.style.top = '50%';
        div1.style.height = '50%';
      }
      const div2 = document.getElementById('chartContainer2');
      if (div2) {
        div2.style.left = '50%';
        div2.style.top = '0px';
        div2.style.height = '50%';
      }
      const div3 = document.getElementById('chartContainer3');
      if (div3) {
        div3.style.left = '50%';
        div3.style.top = '50%';
        div3.style.height = '50%';
      }

      const div4 = document.getElementById('chartContainer4');
      if (div4)
        div4.style.display = 'none';
      const div5 = document.getElementById('chartContainer5');
      if (div5)
        div5.style.display = 'none';
      const div6 = document.getElementById('chartContainer6');
      if (div6)
        div6.style.display = 'none';
      const div7 = document.getElementById('chartContainer7');
      if (div7)
        div7.style.display = 'none';

      numberOfDisplayedGraph = 4;
    }

    function eightGraph() {
      const div0 = document.getElementById('chartContainer0');
      if (div0) {
        div0.style.top = '0px';
        div0.style.height = '25%';
      }

      const div1 = document.getElementById('chartContainer1');
      if (div1) {
        div1.style.top = '25%';
        div1.style.height = '25%';
      }

      const div2 = document.getElementById('chartContainer2');
      if (div2) {
        div2.style.top = '50%';
        div2.style.left = '0px';
        div2.style.height = '25%';
      }

      const div3 = document.getElementById('chartContainer3');
      if (div3) {
        div3.style.top = '75%';
        div3.style.left = '0px';
        div3.style.height = '25%';
      }

      const div4 = document.getElementById('chartContainer4');
      if (div4) {
        div4.style.display = 'block';
        div4.style.top = '0px';
        div4.style.left = '50%';
        div4.style.height = '25%';
      }

      const div5 = document.getElementById('chartContainer5');
      if (div5) {
        div5.style.display = 'block';
        div5.style.top = '25%';
        div5.style.left = '50%';
        div5.style.height = '25%';
      }

      const div6 = document.getElementById('chartContainer6');
      if (div6) {
        div6.style.display = 'block';
        div6.style.top = '50%';
        div6.style.left = '50%';
        div6.style.height = '25%';
      }

      const div7 = document.getElementById('chartContainer7');
      if (div7) {
        div7.style.display = 'block';
        div7.style.top = '75%';
        div7.style.left = '50%';
        div7.style.height = '25%';
      }

      numberOfDisplayedGraph = 8;
    }

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
            <li><span>Knee</span><span class="right-arrow" style="top:8px;">&#8250</span>
            <ul style="top:18px;">
                <li><span class="angles-name">knee_angle_r</span></li>
                <li><span class="angles-name">knee_angle_l</span></li>
              </ul>
            </li>
            <li><span>Hip</span><span class="right-arrow" style="top:26px;">&#8250</span>
            <ul style="top:36px;">
                <li><span class="angles-name">hip_flexion_r</span></li>
                <li><span class="angles-name">hip_flexion_l</span></li>
              </ul>
            </li>
            <li><span>Pelvis</span><span class="right-arrow" style="top:44px;">&#8250</span>
            <ul style="top:54px;">
                <li><span class="angles-name">pelvis_tilt</span></li>
              </ul>
            </li>
            <li class="flyout-spacing"></li>
            <li class="flyout-separator"></li>
            <li class="flyout-spacing"></li>
            <li><span>GRF</span><span class="right-arrow" style="top:71px;">&#8250</span>
            <ul style="top:81px;">
                <li><span class="angles-name">leg0_l.grf_x</span></li>
                <li><span class="angles-name">leg1_r.grf_x</span></li>
                <li><span class="angles-name">leg0_l.grf_y</span></li>
                <li><span class="angles-name">leg1_r.grf_y</span></li>
                <li><span class="angles-name">leg0_l.grf_z</span></li>
                <li><span class="angles-name">leg1_r.grf_z</span></li>
              </ul>
            </li>
            <li class="flyout-spacing"></li>
            <li class="flyout-separator"></li>
            <li class="flyout-spacing"></li>
            <li><span>Soleus</span><span class="right-arrow" style="top:98px;">&#8250</span>
            <ul style="top:108px;">
                <li><span class="angles-name">soleus_r.mtu_length</span></li>
                <li><span class="angles-name">soleus_l.mtu_length</span></li>
                <li><span class="angles-name">soleus_r.activation</span></li>
                <li><span class="angles-name">soleus_l.activation</span></li>
              </ul>
            </li>
            <li><span>Gastrocnemius</span><span class="right-arrow" style="top:116px;">&#8250</span>
              <ul style="top:126px;">
                <li><span class="angles-name">gastroc_r.mtu_length</span></li>
                <li><span class="angles-name">gastroc_l.mtu_length</span></li>
                <li><span class="angles-name">gastroc_r.activation</span></li>
                <li><span class="angles-name">gastroc_l.activation</span></li>
              </ul>
            </li>
            <li><span>Tibialis anterior</span><span class="right-arrow" style="top:134px;">&#8250</span>
            <ul style="top:144px;">
                <li><span class="angles-name">tib_ant_r.mtu_length</span></li>
                <li><span class="angles-name">tib_ant_l.mtu_length</span></li>
                <li><span class="angles-name">tib_ant_r.activation</span></li>
                <li><span class="angles-name">tib_ant_l.activation</span></li>
              </ul>
            </li>
            <li><span>Hamstrings</span><span class="right-arrow" style="top:152px;">&#8250</span>
              <ul style="top:162px;">
                <li><span class="angles-name">hamstrings_r.mtu_length</span></li>
                <li><span class="angles-name">hamstrings_l.mtu_length</span></li>
                <li><span class="angles-name">hamstrings_r.activation</span></li>
                <li><span class="angles-name">hamstrings_l.activation</span></li>
              </ul>
            </li>
            <li><span>Vasti</span><span class="right-arrow" style="top:170px;">&#8250</span>
            <ul style="top:180px;">
                  <li><span class="angles-name">vasti_r.mtu_length</span></li>
                  <li><span class="angles-name">vasti_l.mtu_length</span></li>
                  <li><span class="angles-name">vasti_r.activation</span></li>
                  <li><span class="angles-name">vasti_l.activation</span></li>
              </ul>
            </li>
            <li><span>Gluteal</span><span class="right-arrow" style="top:188px;">&#8250</span>
              <ul style="top:198px;">
                <li><span class="angles-name">glut_max_r.mtu_length</span></li>
                <li><span class="angles-name">glut_max_l.mtu_length</span></li>
                <li><span class="angles-name">glut_max_r.activation</span></li>
                <li><span class="angles-name">glut_max_l.activation</span></li>
              </ul>
            </li>
            <li><span>Iliopsoas</span><span class="right-arrow" style="top:206px;">&#8250</span>
            <ul style="top:216px;">
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
              <div>Healthy</div>
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
        const folder = 'storage/' + number.querySelector('input[name="number"]:checked').value + '_' +
                       muscle.querySelector('input[name="muscle"]:checked').value + '_' +
                       controller.value;
        console.log('Folder: ' + folder);
        index = -1;
        view.onready = () => {
          fillCustomWindow(folder);
          button.classList.toggle('is-loading');
          button.disabled = false;
        };

        view.loadAnimation(folder + '/model.x3d', folder + '/animation.json', true, false, folder + '/gait.jpg');
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
