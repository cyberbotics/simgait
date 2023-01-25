import Project from './project.js';
import ModalDialog from './modal_dialog.js';

export default class Animation extends Project {
  static run(title, footer, routes) {
    let animation = new Animation(title, footer, routes);
    animation.load();
  }

  constructor(title, footer, routes) {
    super(title, footer, routes);
    routes.push({url: '/animation', setup: project => this.setupAnimation(project)});

    this.search = '';
    this.searchDelay = false;
    this.sort = 'default';
    this.page = 1;
    this.pageLimit = 8;
  }

  setupAnimation(project) {
    this.page = new URL(document.location.href).searchParams.get('p')
      ? parseInt(new URL(document.location.href).searchParams.get('p')) : 1;
    this.search = new URL(document.location.href).searchParams.get('search')
      ? (new URL(document.location.href).searchParams.get('search')).toString() : this.search;
    this.sort = new URL(document.location.href).searchParams.get('sort')
      ? (new URL(document.location.href).searchParams.get('sort')).toString() : this.sort;

    this.mainContainer(project);
    this.initSort(project);
    this.initSearch(project);
    this.updateSearchIcon();

    project.content.querySelector('#add-a-new-animation').addEventListener('click', () => this.addAnimation(project));

    this.listAnimations(project);

    if (project.email && project.email.endsWith('@cyberbotics.com'))
      project.content.querySelector('section[data-content="proto"] > div > table > thead > tr')
        ?.appendChild(document.createElement('th'));
  }

  addAnimation(project) {
    const content = {};
    content.innerHTML = `<div class="field">
      <label class="label">Webots animation</label>
      <div class="control has-icons-left">
        <input id="animation-file" name="animation-file" class="input" type="file" required accept=".json">
        <span class="icon is-small is-left">
          <i class="fas fa-upload"></i>
        </span>
      </div>
      <div class="help">Upload the Webots animation file: <em>animation.json</em></div>
    </div>`;
    content.innerHTML += `<div class="field">
        <label class="label">Webots scene</label>
        <div class="control has-icons-left">
          <input id="scene-file" name="scene-file" class="input" type="file" required accept=".x3d">
          <span class="icon is-small is-left">
            <i class="fas fa-upload"></i>
          </span>
        </div>
        <div class="help">Upload the Webots X3D scene file: <em>scene.x3d</em></div>
      </div>
      <div class="field">
        <label class="label">Texture files</label>
        <div class="control has-icons-left">
          <input id="texture-files" name="textures[]" class="input" type="file" multiple accept=".jpg, .jpeg, .png, .hrd">
          <span class="icon is-small is-left">
            <i class="fas fa-upload"></i>
          </span>
        </div>
        <div class="help">Upload all the texture files: <em>*.png</em>, <em>*.jpg</em> and/or <em>*.hdr</em></div>
      </div>
      <div class="field">
        <label class="label">Mesh files</label>
        <div class="control has-icons-left">
          <input id="texture-files" name="meshes[]" class="input" type="file" multiple accept=".stl, .obj, .mtl, .dae">
          <span class="icon is-small is-left">
            <i class="fas fa-upload"></i>
          </span>
        </div>
        <div class="help">Upload all the meshes files: <em>*.obj</em>, <em>*.mtl</em>,
          <em>*.dae</em> and/or <em>*.stl</em></div>
      </div>`;
    let cancelled = false;
    const title = 'Add an animation';
    const modal = ModalDialog.run(title, content.innerHTML, 'Cancel', 'Add');
    const input = modal.querySelector(`#animation-file`);
    input.focus();
    modal.querySelector('button.cancel').addEventListener('click', function() { cancelled = true; });
    modal.querySelector('form').addEventListener('submit', event => {
      event.preventDefault();
      modal.querySelector('button[type="submit"]').classList.add('is-loading');
      const body = new FormData(modal.querySelector('form'));
      body.append('user', project.id);
      body.append('password', project.password);
      fetch('/ajax/animation/create.php', { method: 'post', body: body })
        .then(response => response.json())
        .then(data => {
          if (data.error)
            modal.error(data.error);
          else if (!cancelled) {
            const id = data.id;
            const total = data.total;
            fetch('/ajax/animation/create.php', { method: 'post', body: JSON.stringify({ uploading: 0, uploadId: id }) })
              .then(response => response.json())
              .then(data => {
                if (data.status !== 'uploaded')
                  modal.error(data.error);
                else
                  modal.close();

                const p = (total === 0) ? 1 : Math.ceil(total / this.pageLimit);
                project.load(`/animation${(p > 1) ? ('?p=' + p) : ''}`);
              });
          }
        });
    });
  }

  mainContainer(project) {
    let display;
    if (!project.email)
      display = 'none';
    else
      display = 'block';
    const template = document.createElement('template');
    template.innerHTML =
      `<div id="main-container"><div id="tab-content">
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
          <div class="buttons" style="display:${display}">
            <button class="button" id="add-a-new-animation">Add a new animation</button>
          </div>
        </section>
      </div></div>`;
    super.setup('animation', [], template.content);
  }

  initSort(project) {
    if (this.sort && this.sort !== 'default') {
      const columnTitle = document.getElementById('animation-sort-' + this.sort.split('-')[0]);
      const sortIcon = columnTitle.querySelector('.sort-icon');
      columnTitle.querySelector('.sort-icon').style.display = 'inline';
      if (this.sort.split('-')[1] === 'asc' && sortIcon.classList.contains('fa-sort-down')) {
        sortIcon.classList.toggle('fa-sort-down');
        sortIcon.classList.toggle('fa-sort-up');
      }
    }
    document.querySelectorAll('.column-title').forEach((title) => {
      title.addEventListener('click', () => {
        const sortIcon = title.querySelector('.sort-icon');
        const type = title.id.split('-')[0];
        const previousSort = this.sort.split('-')[0];
        let sort = title.id.split('-')[2];

        if (previousSort === sort) {
          sortIcon?.classList.toggle('fa-sort-down');
          sortIcon?.classList.toggle('fa-sort-up');
          sort += sortIcon?.classList.contains('fa-sort-down') ? '-desc' : '-asc';
        } else if (previousSort !== 'default') {
          document.getElementById(type + '-sort-' + previousSort).querySelector('.sort-icon').style.display = 'none';
          if (sortIcon?.classList.contains('fa-sort-up')) {
            sortIcon.classList.toggle('fa-sort-down');
            sortIcon.classList.toggle('fa-sort-up');
          }
          sort += '-desc';
        } else
          sort += '-desc';
        const icon = title.querySelector('.sort-icon');
        if (icon)
          icon.style.display = 'inline';
        this.sort = sort;
        this.searchAndSortTable(project);
      });
    });
  }

  searchAndSortTable(project, isSearch) {
    const url = new URL(document.location.origin + document.location.pathname);
    if (this.page !== 1 && !isSearch)
      url.searchParams.append('p', this.page);
    else
      this.page = 1;
    if (this.sort && this.sort !== 'default')
      url.searchParams.append('sort', this.sort);
    if (this.search && this.search !== '')
      url.searchParams.append('search', this.search);
    window.history.replaceState(null, '', (url.pathname + url.search).toString());

    this.listAnimations(project);
  }

  listAnimations(project) {
    const offset = (this.page - 1) * this.pageLimit;
    fetch('/ajax/animation/list.php', {
      method: 'post',
      body: JSON.stringify({ offset: offset, limit: this.pageLimit, sortBy: this.sort, search: this.search })
    })
      .then(response => response.json())
      .then(data => {
        if (data.error)
          ModalDialog.run(`Animation listing error`, data.error);
        else {
          if (data.total === 0 && this.search) {
            const message = 'Your search - <strong>' + this.search + '</strong> - did not match any animations.';
            document.getElementById('animation-empty-search-text').innerHTML = message;
            document.getElementById('animation-empty-search').style.display = 'flex';
          } else
            document.getElementById('animation-empty-search').style.display = 'none';
          let line = ``;
          for (let i = 0; i < data.animations.length; i++)
            line += '<tr>' + this.animationRow(data.animations[i], project) + '</tr>';
          const table = project.content.querySelector(`section[data-content="animation"] > div > table`);
          table.style.marginBottom = (50 * (this.pageLimit - data.animations.length)) + 'px';
          const tbody = table.querySelector(`tbody`);
          tbody.innerHTML = line;
          for (let i = 0; i < data.animations.length; i++) {
            const node = tbody.querySelector(`#animation-${data.animations[i].id}`);
            if (node) {
              let p = (data.animations.length === 1) ? this.page - 1 : this.page;
              if (p === 0)
                p = 1;
              node.addEventListener('click', event => this.deleteAnimation(event, project, p));
            }
          }
          const total = (data.total === 0) ? 1 : Math.ceil(data.total / this.pageLimit);
          this.updatePagination(total);
        }
      });
  }

  updatePagination(max) {
    const hrefSort = this.sort && this.osrt !== 'default' ? '?sort=' + this.sort : '';
    const hrefSearch = this.search && this.search !== '' ? '?search=' + this.search : '';
    const nav = document.querySelector(`section[data-content="animation"] > nav`);
    const content = {};
    const previousDisabled = (this.page === 1) ? ' disabled' : ` href="${(this.page === 2)
      ? ('/animation') : ('/animation?p=' + (this.page - 1))}${hrefSort}${hrefSearch}"`;
    const nextDisabled = (this.page === max) ? ' disabled' : ` href="animation?p=${this.page + 1}${hrefSort}${hrefSearch}"`;
    const oneIsCurrent = (this.page === 1) ? ' is-current" aria-label="Page 1" aria-current="page"'
      : `" aria-label="Goto page 1" href="animation${hrefSort}${hrefSearch}"`;
    content.innerHTML =
      `<a class="pagination-previous"${previousDisabled}>Previous</a>
      <ul class="pagination-list"><li>
      <a class="pagination-link${oneIsCurrent}>1</a></li>`;
    for (let i = 2; i <= max; i++) {
      if (i === this.page - 2 || (i === this.page + 2 && i !== max)) {
        content.innerHTML += `<li><span class="pagination-ellipsis">&hellip;</span></li>`;
        continue;
      }
      if (i < this.page - 2 || (i > this.page + 2 && i !== max))
        continue;
      if (i === this.page)
        content.innerHTML += `<li><a class="pagination-link is-current" aria-label="Page ${i}"` +
          ` aria-current="page">${i}</a></li>`;
      else
        content.innerHTML += `<li><a class="pagination-link" aria-label="Goto page ${i}"
          href="animation?p=${i}${hrefSort}${hrefSearch}">${i}</a></li>`;
    }
    content.innerHTML += `</ul>` + `<a class="pagination-next"${nextDisabled}>Next page</a>`;
    nav.innerHTML = content.innerHTML;
  }

  deleteAnimation(event, project, page) {
    const animation = parseInt(event.target.id.substring(10)); // skip 'animation-' or 'scene-'
    const dialog = ModalDialog.run(`Really delete animation?`, '<p>There is no way to recover deleted data.</p>', 'Cancel',
      `Delete Animation`, 'is-danger');
    dialog.querySelector('form').addEventListener('submit', function(event) {
      event.preventDefault();
      dialog.querySelector('button[type="submit"]').classList.add('is-loading');
      const content = {
        method: 'post',
        body: JSON.stringify({
          animation: animation,
          user: project.id,
          password: project.password
        })
      };
      fetch('ajax/animation/delete.php', content)
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          dialog.close();
          if (data.error)
            ModalDialog.run(`Animation deletion error`, data.error);
          else if (data.status === 1) {
            let uploads = JSON.parse(window.localStorage.getItem('uploads'));
            if (uploads !== null && uploads.includes(animation)) {
              uploads.splice(uploads.indexOf(animation), 1);
              if (uploads.length === 0)
                uploads = null;
            }
            window.localStorage.setItem('uploads', JSON.stringify(uploads));
            project.load(`/animation${(page > 1) ? ('?p=' + page) : ''}`);
          }
        });
    });
  }

  animationRow(data, project) {
    let size = data.size;
    let unit;
    if (size < 1024)
      unit = 'bytes';
    else if (size < 1024 * 1014) {
      size = size / 1024;
      unit = 'K';
    } else if (size < 1024 * 1024 * 1024) {
      size = size / (1024 * 1024);
      unit = 'M';
    } else {
      size = size / (1024 * 1024 * 1024);
      unit = 'G';
    }
    if (size < 100)
      size = Math.round(10 * size) / 10;
    else
      size = Math.round(size);
    size += ' <small>' + unit + '</small>';
    let millisecond = data.duration % 1000;
    const second = Math.trunc(data.duration / 1000) % 60;
    const minute = Math.trunc(data.duration / 60000) % 60;
    const hour = Math.trunc(data.duration / 3600000);
    if (millisecond < 10)
      millisecond = '00' + millisecond;
    else if (millisecond < 100)
      millisecond = '0' + millisecond;
    let duration = second + ':' + millisecond;
    if (data.duration >= 60000) {
      if (second < 10)
        duration = '0' + duration;
      duration = minute + ':' + duration;
      if (data.duration > 3600000) {
        if (minute < 10)
          duration = '0' + duration;
        duration = hour + duration;
      }
    }
    const admin = project.email ? project.email.endsWith('@cyberbotics.com') : false;
    const url = data.url.startsWith('https://webots.cloud') ? document.location.origin + data.url.substring(20) : data.url;
    const defaultThumbnailUrl = document.location.origin + '/images/thumbnail.jpg';
    const versionUrl = `https://github.com/cyberbotics/webots/releases/tag/${data.version}`;
    const style = (data.user === 0) ? ' style="color:grey"' : (parseInt(project.id) === data.user
      ? ' style="color:#007acc"' : (admin ? ' style="color:red"' : ''));
    const tooltip = (data.user === 0) ? `Delete this anonymous animation` : (parseInt(project.id) === data.user
      ? `Delete your animation` : (admin ? `Delete this animation as administrator` : ''));
    const deleteIcon = (data.user === 0 || parseInt(project.id) === data.user || admin)
      ? `<i${style} class="is-clickable far fa-trash-alt" id="animation-${data.id}" title="${tooltip}"></i>` : '';
    const uploaded = data.uploaded.replace(' ', `<br>${deleteIcon} `);function
    const title = data.title === '' ? '<i>anonymous</i>' : data.title;
    let row = `
<td class="has-text-centered">${data.viewed}</td>
<td>
  <a class="table-title has-text-dark" href="${url}">${title}</a>
  <div class="thumbnail">
    <div class="thumbnail-container">
      <img class="thumbnail-image" src="${defaultThumbnailUrl}" onerror="this.src='';"/>
      <p class="thumbnail-description">${data.description}<div class="thumbnail-description-fade"/></p>
    </div>
  </div>
</td>
<td><a class="has-text-dark" href="${versionUrl}" target="_blank" title="View Webots release">${data.version}</a></td>`;
    if (data.duration !== 0)
      row += `<td class="has-text-right">${duration}</td>`;
    row += `<td class="has-text-right">${size}</td><td class="has-text-right is-size-7">${uploaded}</td>`;
    return row;
  }

  initSearch(project) {
    document.getElementById('animation-search-input').value = this.search;
    document.getElementById('animation-search-input').addEventListener('keyup', () => {
      if (!this.searchDelay) {
        this.searchDelay = true;
        setTimeout(() => {
          this.search = document.getElementById('animation-search-input').value;
          this.page = 1;
          this.updateSearchIcon();
          this.searchAndSortTable(project);
          this.searchDelay = false;
        }, '300');
      }
    });
    document.getElementById('animation-search-click').addEventListener('click', () => {
      if (document.getElementById('animation-search-icon').classList.contains('fa-xmark')) {
        document.getElementById('animation-search-input').value = '';
        this.search = document.getElementById('animation-search-input').value;
        this.page = 1;
        this.updateSearchIcon();
        this.searchAndSortTable(project);
      }
    });
  }

  updateSearchIcon() {
    const searchIcon = document.getElementById('animation-search-icon');
    if (searchIcon.classList.contains('fa-search') && this.search.length > 0) {
      searchIcon.classList.remove('fa-search');
      searchIcon.classList.add('fa-xmark');
    } else if (searchIcon.classList.contains('fa-xmark') && this.search.length === 0) {
      searchIcon.classList.add('fa-search');
      searchIcon.classList.remove('fa-xmark');
    }
  }
}
