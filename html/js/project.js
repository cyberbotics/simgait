import ModalDialog from './modal_dialog.js';
import User from './user.js';

export default class Project extends User {
  static run(title, footer, routes) {
    Project.current = new Project(title, footer, routes);
    return Project.current;
  }
  dynamicPage(url, pushHistory) {
    let that = this;
    let promise = new Promise((resolve, reject) => {
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
    });
    return promise;
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
    <button class="button is-small is-outlined is-link" id="run-${project.id}"title="run this project">
      <span class="icon"><i class="fas fa-play fa-lg"></i></span>
    </button>
    <input type="hidden" id="url-${project.id}" value="${project.url}">
  </td>
  <td><a href="${githubUrl(project.url)}" target="_blank">${project.title}</a></td>
  <td style="text-align:center">
    <input type="checkbox"${checked}>
    <input type="hidden" id="branch-${project.id}" value="${project.branch}">
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
      const projectId = button.id.substring(4);
      const url = document.querySelector('#url-' + projectId).value;
      that.load('/simulation?url=' + url);
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
          <th></th><th>Title</th>${headEnd.innerHTML}
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
                project.url = githubUrl(url);
                let template = document.createElement('template');
                template.innerHTML = addProject(project);
                that.content.querySelector('#project-table').appendChild(template.content.firstChild);
                that.content.querySelector('#delete-' + project.id).addEventListener('click', deleteProject);
                that.content.querySelector('#run-' + project.id).addEventListener('click', runProject);
                projectCount++;
                updateProjectCount();
              }
            });
        });
      });
      if (data.projects && data.projects.length > 0) {
        data.projects.forEach(function(project, index) {
          that.content.querySelector('#delete-' + project.id).addEventListener('click', deleteProject);
          that.content.querySelector('#run-' + project.id).addEventListener('click', runProject);
        });
      }
    }
  }
}
Project.current = null;
