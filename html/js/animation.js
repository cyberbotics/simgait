/* global webots */
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
        button.classList.toggle('is-loading');
        setTimeout(function() {
          button.classList.toggle('is-loading');
        }, 2000);
      });
      number.addEventListener('change', function(event) {
        if (event.target.value == '14') {  // Millard
          muscle.querySelectorAll('input')[0].checked = true;
          muscle.querySelectorAll('input')[1].checked = false;
          muscle.querySelectorAll('input')[1].disabled = true;
          controller.querySelector('option[value="Geyer2010"]').disabled = false;
          controller.querySelector('option[value="Ong2019"]').disabled = true;
          if (controller.value == 'Ong2019')
            controller.value = 'Geyer2010';
        } else { // '18'
          muscle.querySelectorAll('input')[1].disabled = false;  // Thelen
          controller.querySelector('option[value="Geyer2010"]').disabled = true;
          controller.querySelector('option[value="Ong2019"]').disabled = false;
          if (controller.value == 'Geyer2010')
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
