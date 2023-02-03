import ModalDialog from './modal_dialog.js';
import User from './user.js';
import GraphWindow from './GraphWindow.js';

export default class Project extends User {
  dynamicPage(url, pushHistory) {
    let that = this;
    let promise = new Promise((resolve, reject) => {
      if (url.pathname.startsWith('/A')) {
        fetch('/ajax/animation/list.php', { method: 'post', body: JSON.stringify({ url: url }) })
          .then(response => response.json())
          .then(data => {
            let pushUrl;
            if (url.search !== data.uploadMessage)
              pushUrl = url.pathname + url.search + url.hash;
            else {
              if (!that.id) {
                let uploads = JSON.parse(window.localStorage.getItem('uploads'));
                if (uploads === null)
                  uploads = [];
                if (!uploads.includes(data.animation.id))
                  uploads.push(data.animation.id);
                window.localStorage.setItem('uploads', JSON.stringify(uploads));
              } else {
                fetch('/ajax/user/authenticate.php', {
                  method: 'post',
                  body: JSON.stringify({ email: that.email, password: that.password, uploads: [data.animation.id] })
                }).then(response => response.json())
                  .then(data => {
                    if (data.error) {
                      that.password = null;
                      that.email = '!';
                      that.load('/');
                      ModalDialog.run('Error', data.error);
                    } else
                      ModalDialog.run(`Upload associated`,
                        `Your upload has successfully been associated with your webots.cloud account`);
                  });
              }
              pushUrl = url.pathname + url.hash;
            }
            if (pushHistory)
              window.history.pushState(null, '', pushUrl);
            if (data.error) { // no such animation
              that.notFound();
              resolve();
            } else {
              that.runWebotsView(data.animation, 'simgait');
              resolve();
            }
          });
      } else if (url.pathname.startsWith('/compare')) {
        const name1 = url.searchParams.get('name1');
        const name2 = url.searchParams.get('name2');
        const url1 = url.searchParams.get('url1');
        const url2 = url.searchParams.get('url2');

        const j1 = fetch('storage' + url1 + '/animation.json')
          .then(result => result.json());

        const j2 = fetch('storage' + url2 + '/animation.json')
          .then(result => result.json());

        const s1 = fetch('storage' + url1 + '/scene.x3d')
          .then(result => result.text())
          .then(text => {
            const parser = new DOMParser();
            return parser.parseFromString(text, 'text/xml');
          });

        const s2 = fetch('storage' + url2 + '/scene.x3d')
          .then(result => result.text())
          .then(text => {
            const parser = new DOMParser();
            return parser.parseFromString(text, 'text/xml');
          });
        Promise.all([s1, s2, j1, j2]).then(() => {
          j1.then(json1 => {
            j2.then(json2 => {
              s1.then(scene1 => {
                s2.then(scene2 => {
                  this.addSphere(scene1, '1 0 0');
                  this.addSphere(scene2, '0 0 1');

                  const array1 = json1.frames;
                  const array2 = json2.frames;
                  // Check which animation is the longest
                  let length;
                  let receiverScene, sceneToBeMerged;
                  let receiverJson, jsonToBeMerged;
                  // We assume that all animation have the same timestep.
                  if (array1.length > array2.length) {
                    length = array2.length;
                    receiverScene = scene1;
                    sceneToBeMerged = scene2;
                    receiverJson = json1;
                    jsonToBeMerged = json2;
                  } else {
                    length = array1.length;
                    receiverScene = scene2;
                    sceneToBeMerged = scene1;
                    receiverJson = json2;
                    jsonToBeMerged = json1;
                  }

                  const skeleton = this.getSkeleton(sceneToBeMerged);
                  const root = receiverScene.getElementsByTagName('Scene')[0];
                  const maxId = this.findMaxId(root, -1);
                  // Combine x3d
                  skeleton.id = 'n' + (parseInt(skeleton.id.substr(1)) + maxId);
                  this.increaseId(skeleton, maxId);
                  root.appendChild(skeleton);

                  // Combine json
                  // Merge ids
                  let ids1 = jsonToBeMerged.ids.split(';');
                  ids1 = ';' + ids1.map(id => parseInt(id) + maxId).join(';');
                  receiverJson.ids += ids1;

                  // Merge frames
                  for (let i = 0; i < length; i++) {
                    const updates1 = jsonToBeMerged.frames[i].updates;
                    const updates2 = receiverJson.frames[i].updates;

                    for (const update of updates1) {
                      update.id += maxId;
                      updates2.push(update);
                    }
                  }

                  const data = {};
                  data.scene = receiverScene;
                  data.json = receiverJson;
                  this.runWebotsView(data, 'simgait', true, () => {
                    Project.webotsView._view.setLabel({
                      id: 444102,
                      font: '/usr/local/webots/resources/fonts/Arial.ttf',
                      text: name1,
                      color: '255,0,0,1',
                      size: 0.08,
                      x: 0.01,
                      y: 0.01
                    });
                    Project.webotsView._view.setLabel({
                      id: 444103,
                      font: '/usr/local/webots/resources/fonts/Arial.ttf',
                      text: name2,
                      color: '0,0,255,1',
                      size: 0.08,
                      x: 0.01,
                      y: 0.06
                    });
                  });
                });
              });
            });
          });
        });
      } else {
        const username = url.pathname.substring(1);
        const content = {
          method: 'post',
          body: JSON.stringify({
            email: that.email,
            password: that.password,
            username: username
          })
        };
        fetch('/ajax/project/user.php', content)
          .then(function(response) {
            return response.json();
          })
          .then(function(data) {
            if (pushHistory)
              window.history.pushState(null, name, url.pathname + url.search + url.hash);
            if (data.error) { // no such user
              that.notFound();
              resolve();
            } else {
              that.userPage(data);
              resolve();
            }
          });
      }
    });
    return promise;
  }
  findMaxId(node, id) {
    if (node.childNodes) {
      for (const child of node.childNodes) {
        if (child.id) {
          const newId = parseInt(child.id.substr(1));
          if (id < newId)
            id = newId;
        }
        id = this.findMaxId(child, id);
      }
    }
    return id;
  }

  increaseId(node, offset) {
    if (node.childNodes) {
      for (const child of node.childNodes) {
        if (child.id)
          child.id = 'n' + (parseInt(child.id.substr(1)) + offset);

        this.increaseId(child, offset);
      }
    }
  }

  getSkeleton(xml) {
    const root = xml.getElementsByTagName('Scene')[0];
    for (const child of root.childNodes) {
      if (child.tagName === 'Transform' && this.getNodeAttribute(child, 'name') === 'skeleton') {
        child.setAttribute('translation', '0 -1 0');
        return child;
      }
    }
  }
  addSphere(xml, color) {
    const root = xml.getElementsByTagName('Scene')[0];
    let id = this.findMaxId(root, -1);
    for (const child of root.childNodes) {
      if (child.tagName === 'Transform' && this.getNodeAttribute(child, 'name') === 'skeleton') {
        for (const child2 of child.childNodes) {
          if (child2.tagName === 'Transform' && this.getNodeAttribute(child2, 'name') === 'pelvis') {
            const transform = xml.createElement('Transform');
            transform.setAttribute('id', 'n' + (id + 1));
            transform.setAttribute('translation', '0 0.9 0');
            const shape = xml.createElement('Shape');
            shape.setAttribute('id', 'n' + (id + 2));
            transform.appendChild(shape);
            const sphere = xml.createElement('Sphere');
            sphere.setAttribute('id', 'n' + (id + 3));
            sphere.setAttribute('radius', '0.05');
            shape.appendChild(sphere);
            const pbr = xml.createElement('PBRAppearance');
            pbr.setAttribute('id', 'n' + (id + 4));
            pbr.setAttribute('baseColor', color);
            shape.appendChild(pbr);
            child2.appendChild(transform);
          }
        }
      }
    }
  }
  getNodeAttribute(node, attributeName, defaultValue) {
    console.assert(node && node.attributes);
    if (attributeName in node.attributes)
      return this.sanitizeHTML(node.attributes.getNamedItem(attributeName).value);
    return defaultValue;
  }
  sanitizeHTML(text) {
    const element = document.createElement('div');
    element.innerText = text;
    return element.innerHTML;
  }
  runWebotsView(data, version, raw, onready) {
    if (!version || version === undefined)
      version = data && data.version ? data.version : this.findGetParameter('version');

    const src = 'https://cyberbotics.com/wwi/' + version + '/WebotsView.js';

    let promise = new Promise((resolve, reject) => {
      let script = document.getElementById('webots-view-version');

      if (!script || (script && script.src !== src)) {
        if (script && script.src !== src) {
          script.remove();
          window.location.reload();
        }
        script = document.createElement('script');
        script.type = 'module';
        script.id = 'webots-view-version';
        script.src = src;
        script.onload = () => {
          this._loadContent(data, resolve, raw, onready);
        };
        script.onerror = () => {
          console.warn(
            'Could not find Webots version, reloading with R2022b instead. This could cause some unwanted behaviour.');
          script.remove();
          this.runWebotsView(data, 'R2022b'); // if release not found, default to R2022b
        };
        document.body.appendChild(script);
      } else
        this._loadContent(data, resolve, raw, onready);
    });

    promise.then(() => {
      if (document.querySelector('#user-menu')) {
        if (this.email && this.password) {
          document.querySelector('#user-menu').style.display = 'auto';
          document.querySelector('#log-in').style.display = 'none';
          document.querySelector('#sign-up').style.display = 'none';
        } else {
          document.querySelector('#user-menu').style.display = 'none';
          document.querySelector('#log-in').style.display = 'flex';
          document.querySelector('#sign-up').style.display = 'flex';
        }
        if (this.username === '!')
          this.login();
      }
    });
  }
  _loadContent(data, resolve, raw, onready) {
    if (raw) {
      this.setupWebotsView('animation');
      Project.webotsView.onready = () => onready();
      Project.webotsView.loadAnimation(new XMLSerializer().serializeToString(data.scene), data.json, false,
        undefined, undefined, true);
      resolve();
    } else if (data) {
      const reference = 'storage' + data.url.substring(data.url.lastIndexOf('/'));
      this.setupWebotsView(data.duration > 0 ? 'animation' : 'scene', data);
      Project.webotsView.showCustomWindow = true;
      Project.webotsView.onready = () => {
        Project.webotsView._view.removeLabels();
        const graphWindow = new GraphWindow(Project.webotsView);
        graphWindow.fillCustomWindow(reference);
      };
      Project.webotsView.loadAnimation(`${reference}/scene.x3d`, `${reference}/animation.json`, false,
        undefined, `${reference}/thumbnail.jpg`);

      resolve();
    }
  }
  setupWebotsView(page, data) {
    const view = (!Project.webotsView)
      ? '<webots-view id="webots-view" style="height:100%; width:100%; display:block;"></webots-view>' : '';
    let template = document.createElement('template');
    template.innerHTML = `<div id="main-container"><section class="section" style="padding:0;height:100%">
      <div class="container" id="webots-view-container">${view}</div>`;
    if (data) {
      const description = data.description.replace('\n', '<br>\n');
      template.innerHTML += `<div><h1 class="subtitle" style="margin:10px 0">${data.title}</h1>${description}</div>`;
    }
    template.innerHTML += '</section></div>';
    this.setup(page, [], template.content);
    if (!Project.webotsView)
      Project.webotsView = document.querySelector('webots-view');
    else
      document.querySelector('#webots-view-container').appendChild(Project.webotsView);
    document.querySelector('#main-container').classList.add('webotsView');
  }
  userPage(data) {
    let that = this;

    function githubUrl(webotsUrl) {
      console.log(webotsUrl);
      const a = webotsUrl.substr(9).split('/');
      let url = 'https://';
      a.forEach(function(v, i) {
        if (i === 3)
          url += 'blob/';
        else
          url += v + '/';
      });
      return url.slice(0, -1); // remove the final '/'
    }

    function addProject(project) {
      let line = {};
      const checked = project.public === '1' ? ' checked' : '';
      line.innerHTML =
        `<tr id="project-${project.id}">
  <td>
    <button class="button is-small is-outlined is-link" id="run-x3d---${project.id}" title="run this project (x3d mode)">
      <span class="icon"><i class="fas fa-play fa-lg"></i></span>
    </button>
    <input type="hidden" id="url-${project.id}" value="${project.url}">
  </td>
  <td>
    <button class="button is-small is-outlined is-link" id="run-mjpeg-${project.id}" title="run this project (mjpeg mode)">
      <span class="icon"><i class="fas fa-video fa-lg"></i></span>
    </button>
  </td>
  <td><a href="${githubUrl(project.url)}" target="_blank">${project.title}</a></td>
  <td style="text-align:center">
    <input type="checkbox"${checked} name="public-checkbox" id="public-${project.id}">
  </td>
  <td>
    <button class="button is-small is-outlined is-danger" title="delete this project" id="delete-${project.id}">
      <span class="icon"><i class="fas fa-times fa-lg"></i></span>
    </button>
  </td>
</tr>`;
      return line.innerHTML;
    }

    function updateProjectCount() {
      that.content.querySelector('#no-project').style.display = projectCount === 0 ? '' : 'none';
      that.content.querySelector('#header-line').style.display = projectCount === 0 ? 'none' : '';
    }

    function deleteProject(event) {
      let button = event.target;
      while (button.tagName !== 'BUTTON')
        button = button.parentNode;
      const projectId = button.id.substring(7);
      let dialog = ModalDialog.run(
        'Really delete project?',
        '<p>Note: this will not delete any data from your GitHub repository.</p>',
        'Cancel', 'Delete Project', 'is-danger');
      dialog.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault();
        dialog.querySelector('button[type="submit"]').classList.add('is-loading');
        const content = {
          method: 'post',
          body: JSON.stringify({
            email: that.email,
            password: that.password,
            project: projectId
          })
        };
        fetch('/ajax/project/delete.php', content)
          .then(function(response) {
            return response.json();
          })
          .then(function(data) {
            dialog.close();
            if (data.error)
              ModalDialog.run('Error', data.error);
            else {
              const row = that.content.querySelector('#project-' + projectId);
              row.parentNode.removeChild(row);
              projectCount--;
              updateProjectCount();
            }
          });
      });
    }

    function runProject(event) {
      let button = event.target;
      while (button.tagName !== 'BUTTON')
        button = button.parentNode;
      const projectId = button.id.substring(10);
      let url = '/simulation?url=' + document.querySelector('#url-' + projectId).value;
      if (button.id.startsWith('run-mjpeg-'))
        url += '&mode=mjpeg';
      that.load(url);
    }
    let button = {};
    let headEnd = {};
    if (data.self === false) {
      button.innerHTML = ``;
      headEnd.innerHTML = ``;
    } else {
      button.innerHTML = `<button class="button is-link" id="add-a-new-project">Add a new project</button>`;
      headEnd.innerHTML = `<th>Public</th><th></th>`;
    }
    let template = document.createElement('template');
    let projects = {};
    let projectCount = 0;
    projects.innerHTML = `<tr id="no-project"><td>(no project)</td></tr>`;
    if (data.projects && data.projects.length > 0) {
      projectCount = data.projects.length;
      data.projects.forEach(function(project, index) {
        projects.innerHTML += addProject(project);
      });
    }
    template.innerHTML =
      `<section class="section">
  <div class="container">
    <h1 class="title">Projects</h1>
    <table id="project-table" class="table">
      <thead>
        <tr id="header-line">
          <th><small>X3D</small></th><th><small>MJPEG</small></th><th>Title</th>${headEnd.innerHTML}
        </tr>
      </thead>
      <tbody>
        ${projects.innerHTML}
      </tbody>
    </table>
    ${button.innerHTML}
  </div>
</section>`;
    that.setup('userpage', [], template.content);
    updateProjectCount();
    let checkboxes = that.content.querySelectorAll('input[name="public-checkbox"]');
    checkboxes.forEach(function(checkbox) {
      checkbox.addEventListener('click', function(event) {
        const projectId = event.target.id.substring(7); // remove the "public-" prefix
        const checked = event.target.checked ? '1' : '0';
        const content = {
          method: 'post',
          body: JSON.stringify({
            email: that.email,
            password: that.password,
            project: projectId,
            public: checked
          })
        };
        fetch('/ajax/project/public.php', content)
          .then(function(response) {
            return response.json();
          })
          .then(function(data) {
            if (data.error)
              console.log('Error: ' + data.error);
          });
      });
    });
    if (data.self !== false) {
      that.content.querySelector('#add-a-new-project').addEventListener('click', function(event) {
        let content = {};
        content.innerHTML =
          `<div class="field">
  <label class="label">Webots world file</label>
  <div class="control has-icons-left">
    <input id="world-file" class="input" type="url" required placeholder="https://github.com/my_name/my_project/blob/tag_or_branch/worlds/file.wbt" value="https://github.com/">
    <span class="icon is-small is-left">
      <i class="fab fa-github"></i>
    </span>
  </div>
  <div class="help">Blob reference in a public GitHub repository, including tag or branch information, for example:<br>
    <a target="_blank" href="https://github.com/cyberbotics/webots/blob/R2020a/projects/languages/python/worlds/example.wbt">
      https://github.com/cyberbotics/webots/blob/R2020a/projects/languages/python/worlds/example.wbt
    </a>
  </div>
</div>
<div class="field">
  <label class="label">Tag or Branch?</label>
  <div class="control">
    <span class="icon is-small is-left"><i class="fas fa-code-branch"></i></span><span> &nbsp; </span>
    <label class="radio">
      <input type="radio" name="branch" required checked> Tag
    </label>
    <label class="radio">
      <input type="radio" name="branch" required> Branch
    </label>
  </div>
  <div class="help">Specify if the above blob corresponds to a git tag (recommended) or a git branch.</div>
</div>`;
        let modal = ModalDialog.run('Add a project', content.innerHTML, 'Cancel', 'Add');
        let input = modal.querySelector('#world-file');
        input.focus();
        input.selectionStart = input.selectionEnd = input.value.length;
        modal.querySelector('form').addEventListener('submit', function(event) {
          event.preventDefault();
          modal.querySelector('button[type="submit"]').classList.add('is-loading');
          const worldFile = modal.querySelector('#world-file').value.trim();
          if (!worldFile.startsWith('https://github.com/')) {
            modal.error('The world file should start with "https://github.com/".');
            return;
          }
          const branchOrTag = modal.querySelector('input[type="radio"]').checked ? 'tag' : 'branch';
          const n = worldFile.split('/', 5).join('/').length;
          const url = 'webots' + worldFile.substring(5, n + 1) + branchOrTag + worldFile.substring(n + 5); // skipping "/blob"
          const content = {
            method: 'post',
            body: JSON.stringify({
              email: that.email,
              password: that.password,
              url: url
            })
          };
          fetch('/ajax/project/create.php', content)
            .then(function(response) {
              return response.json();
            })
            .then(function(data) {
              if (data.error) {
                console.log(data.error);
                modal.error(data.error);
              } else {
                modal.close();
                let project = {};
                project.id = data.id;
                project.title = data.title;
                project.url = url;
                let template = document.createElement('template');
                template.innerHTML = addProject(project);
                that.content.querySelector('#project-table').appendChild(template.content.firstChild);
                that.content.querySelector('#delete-' + project.id).addEventListener('click', deleteProject);
                that.content.querySelector('#run-x3d---' + project.id).addEventListener('click', runProject);
                that.content.querySelector('#run-mjpeg-' + project.id).addEventListener('click', runProject);
                projectCount++;
                updateProjectCount();
              }
            });
        });
      });
      if (data.projects && data.projects.length > 0) {
        data.projects.forEach(function(project, index) {
          that.content.querySelector('#delete-' + project.id).addEventListener('click', deleteProject);
          that.content.querySelector('#run-x3d---' + project.id).addEventListener('click', runProject);
          that.content.querySelector('#run-mjpeg-' + project.id).addEventListener('click', runProject);
        });
      }
    }
  }
}
