import ModalDialog from './modal_dialog.js';
import User from './user.js';

export default class Project extends User {
  constructor(title, footer, routes) {
    super(title, footer, routes);
  }
  dynamicPage(url, pushHistory) {
    let that = this;
    let promise = new Promise((resolve, reject) => {
      const username = url.pathname.substring(1);
      fetch('/ajax/project/user.php', {method: 'post', body: JSON.stringify({email: that.email,
                                                                             password: that.password,
                                                                             username: username})})
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          if (pushHistory)
            window.history.pushState(null, name, url.pathname + url.search + url.hash);
          if (data.error) {  // no such user
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
    function addProject(project) {
      let line = {};
      const checked = project.public == "1" ? ' checked' : '';
      line.innerHTML =
`<tr id="project-${project.id}">
  <td>
    <button class="button is-small is-outlined is-link" id="run-${project.id}"title="run this project">
      <span class="icon"><i class="fas fa-play fa-lg"></i></span>
    </button>
  </td>
  <td><a href="${project.url}" target="_blank" id="url-${project.id}">${project.title}</a></td>
  <td style="text-align:center">
    <input type="checkbox"${checked}>
    <input type="hidden" id="tag-${project.id}" value="${project.tag}">
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
      that.content.querySelector("#no-project").style.display = projectCount == 0 ? '' : 'none';
      that.content.querySelector("#header-line").style.display = projectCount == 0 ? 'none' : '';
    }
    function deleteProject(event) {
      let button = event.target;
      while (button.tagName != 'BUTTON')
        button = button.parentNode;
      const projectId = button.id.substring(7);
      let dialog = new ModalDialog('Really delete project?',
                                   '<p>Note: this will not delete any data from your GitHub repository.</p>',
                                   'Cancel', 'Delete Project', 'is-danger');
      dialog.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault();
        dialog.querySelector('button[type="submit"]').classList.add('is-loading');
        fetch('/ajax/project/delete.php', { method: 'post', body: JSON.stringify({email: that.email,
                                                                                  password: that.password,
                                                                                  project: projectId})})
         .then(function(response) {
            return response.json();
           })
         .then(function(data) {
            dialog.close();
            if (data.error)
              new ModalDialog('Error', data.error);
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
      while (button.tagName != 'BUTTON')
        button = button.parentNode;
      const projectId = button.id.substring(4);
      const tag = document.querySelector('#tag-' + projectId).value;
      const githubUrl = document.querySelector('#url-' + projectId).href;
      let url = '/simulation?url=' + githubUrl + '&tag=' + tag;
      that.load(url);
    }
    let button = {}
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
      that.content.querySelector("#add-a-new-project").addEventListener('click', function(event) {
        let content = {};
        content.innerHTML =
`<div class="field">
  <label class="label">Git Repository</label>
  <div class="control has-icons-left">
    <input id="repository" class="input" type="url" required placeholder="https://github.com/my_name/my_project" value="https://github.com/">
    <span class="icon is-small is-left">
      <i class="fab fa-github"></i>
    </span>
  </div>
  <div class="help">This Git repository should be available over HTTPS without authentication.</div>
</div>
<div class="field">
  <label class="label">Project Folder</label>
  <div class="control has-icons-left">
    <input id="folder" class="input" placeholder="my_simualtions/my_wonderful_simulation" maxlen="2048">
    <span class="icon is-small is-left">
      <i class="fas fa-folder"></i>
    </span>
  </div>
  <div class="help">Webots project folder in your Git repository (leave empty if at root).</div>
</div>
<div class="field">
  <label class="label">Tag or Branch</label>
  <div class="control has-icons-left">
    <input id="tag-or-branch" class="input" required placeholder="tag or branch name" maxlen="40" value="master">
    <span class="icon is-small is-left">
      <i class="fas fa-code-branch"></i>
    </span>
  </div>
  <div class="control">
    <label class="radio">
      <input type="radio" name="tag" id="tag" required> Tag
    </label>
    <label class="radio">
      <input type="radio" name="tag" required checked> Branch
    </label>
  </div>
</div>`;
        let modal = new ModalDialog('Add project', content.innerHTML, 'Cancel', 'Add');
        let input = modal.querySelector('#repository');
        input.focus();
        input.selectionStart = input.selectionEnd = input.value.length;
        modal.querySelector('form').addEventListener('submit', function(event) {
          event.preventDefault();
          modal.querySelector('button[type="submit"]').classList.add('is-loading');
          const repository = modal.querySelector('#repository').value;
          const folder = modal.querySelector('#folder').value;
          const tagOrBranchName = modal.querySelector('#tag-or-branch').value;
          const tag = modal.querySelector('input[type="radio"]').checked ? 1 : 0;
          const separator = folder == '' ? '' : '/';
          const url = repository + '/tree/' + tagOrBranchName + separator + folder;
          fetch('/ajax/project/create.php', { method: 'post', body: JSON.stringify({email: that.email,
                                                                                    password: that.password,
                                                                                    url: url,
                                                                                    tag: tag})})
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
                project.tag = tag;
                project.url = url;
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
      if (data.projects && data.projects.length > 0)
        data.projects.forEach(function(project, index) {
          that.content.querySelector('#delete-' + project.id).addEventListener('click', deleteProject);
          that.content.querySelector('#run-' + project.id).addEventListener('click', runProject);
        });
    }
  }
}
