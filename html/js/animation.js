/* global webots */
import Project from './project.js';

export default class Animation extends Project {
  static run(title, footer, routes) {
    Animation.current = new Animation(title, footer, routes);
    return Animation.current;
  }
  constructor(title, footer, routes) {
    super(title, footer, routes);
    routes.push({url: '/animation', setup: animationPage});
    let that = this;
    function animationPage() {
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
                  <select>
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
              <div class="control" id="type">
                <label class="radio"><input type="radio" name="type" value="Millard" checked> Millard </label>
                <label class="radio"><input type="radio" name="type" value="Thelen" disabled> Thelen </label>
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
                    <option value="spinal_controller">Spinal Controller</option>
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
                  <select>
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
                <button id="run" class="button is-link">View Animation</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>`;
      that.setup('animation', [], template.content);
    }
  }
}
Animation.current = null;
