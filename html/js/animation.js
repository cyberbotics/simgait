import Project from './project.js';

export default class Animation extends Project {
  static run(title, footer, routes) {
    let animation = new Animation(title, footer, routes);
    animation.load();
  }

  constructor(title, footer, routes) {
    super(title, footer, routes);
    const cleanup = "";
    routes.push({url: '/animation', setup: setup, cleanup: cleanup});

    this.search = '';
    this.sort = 'default';
    this.page = 1;

    function setup(project) {
      const pageLimit = 10;
      let page = new URL(document.location.href).searchParams.get('p')
        ? parseInt(new URL(document.location.href).searchParams.get('p')) : 1;
      let search = new URL(document.location.href).searchParams.get('search')
        ? (new URL(document.location.href).searchParams.get('search')).toString() : this.search;
      let sort = new URL(document.location.href).searchParams.get('sort')
        ? (new URL(document.location.href).searchParams.get('sort')).toString() : this.sort;

      console.log(project)
      mainContainer(project);
    }

    function mainContainer(project) {
      const template = document.createElement('template');
      template.innerHTML =
        `<div id="tab-content">
          <section class="section is-active" data-content="animation">
            <div class="table-container">
              <div class="search-bar" style="max-width: 280px; padding-bottom: 20px;">
                <div class="control has-icons-right">
                  <input class="input is-small" id="animation-search-input" type="text" placeholder="Search for animations...">
                  <span class="icon is-small is-right is-clickable" id="animation-search-click">
                    <i class="fas fa-search" id="animation-search-icon"></i>
                  </span>
                </div>
              </div>
              <table class="table is-striped is-hoverable">
                <thead>
                  <tr>
                    <th class="is-clickable column-title" id="animation-sort-viewed" title="Number of views"
                      style="text-align:center; width: 65px;">
                      <i class="fas fa-chart-column"></i>
                      <i class="sort-icon fa-solid fa-sort-down" style="display: none;"></i>
                    </th>
                    <th class="is-clickable column-title" id="animation-sort-title" title="Title of the animation"
                      style="min-width: 120px;">
                      Title<i class="sort-icon fa-solid fa-sort-down" style="display: none;"></i>
                    </th>
                    <th class="is-clickable column-title" id="animation-sort-version" title="Webots release of the animation"
                      style="width: 85px;">
                      Version<i class="sort-icon fa-solid fa-sort-down" style="display: none;"></i>
                    </th>
                    <th class="is-clickable column-title" id="animation-sort-duration" title="Duration of the animation"
                      style="text-align: right; width: 75px;">
                      Duration<i class="sort-icon fa-solid fa-sort-down" style="display: none;"></i>
                    </th>
                    <th class="is-clickable column-title" id="animation-sort-size" title="Total size of the animation files"
                      style="text-align: right; width: 75px;">
                      Size<i class="sort-icon fa-solid fa-sort-down" style="display: none;"></i>
                    </th>
                    <th class="is-clickable column-title" id="animation-sort-uploaded" title="Upload date and time"
                      style="text-align: right; width: 115px;">
                      Uploaded<i class="sort-icon fa-solid fa-sort-down" style="display: none;"></i>
                    </th>
                  </tr>
                </thead>
                <tbody>
                </tbody>
              </table>
              <div class="empty-search" id="animation-empty-search" style="display: none;">
                <i class="fas fa-xl fa-search" style="color: lightgrey; padding-right: 10px; position: relative; top: 12px;">
                </i>
                <p id="animation-empty-search-text"></p>
              </div>
            </div>
            <nav class="pagination is-small is-rounded" role="navigation" aria-label="pagination">
            </nav>
            <div class="buttons">
              <button class="button" id="add-a-new-animation">Add a new animation</button>
            </div>
          </section>
        </div>`;
      const title = (document.location.pathname.length > 1) ? document.location.pathname.substring(1) : 'home';
      project.setup(title, template.content);
    }
  }
}
