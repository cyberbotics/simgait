import ModalDialog from './modal_dialog.js';
import User from './user.js';

export default class Project extends User {
  constructor(title, footer, routes) {
    super(title, footer, routes);
  }
  dynamicPage(url, pushHistory) {
    const username = url.pathname.substring(1);
    console.log('username: ' + username);
    let that = this;
    fetch('/ajax/project/user.php', {method: 'post', body: JSON.stringify({email: this.email,
                                                                           password: this.password,
                                                                           username: username})})
      .then(function(response) {
         return response.json();
       })
      .then(function(data) {
         if (data.error)  // no such user
           that.notFound();
         else {
           that.userPage(data);
           that.postLoad();
         }
         if (pushHistory)
           window.history.pushState(null, name, url.pathname + url.search + url.hash);
       })
      .catch((error) => console.log('ERROR: ' + error));
  }
  userPage(data) {
    console.log("user page");
    let that = this;
    function addProject(project) {
      let line = {};
      const checked = project.public == "1" ? ' checked' : '';
      const separator = project.folder == '' ? '' : '/';
      const url = project.repository + '/tree/' + project.branch + project.tag + separator + project.folder;
      line.innerHTML =
`<tr id="project-${project.id}">
  <td>
    <button class="button is-small is-outlined is-link" title="run this project">
      <span class="icon"><i class="fas fa-play fa-lg"></i></span>
    </button>
  </td>
  <td><a href="${url}" target="_blank">${project.title}</a></td>
  <td><a href="${project.repository}" target="_blank">${project.repository}</a></td>
  <td><a href="${url}" target="_blank">${project.folder}</a></td>
  <td>${project.tag}${project.branch}</td>
  <td style="text-align:center"><input type="checkbox"${checked}></td>
  <td><button class="button is-small is-outlined is-danger" title="delete this project" id="delete-${project.id}"><span class="icon"><i class="fas fa-times fa-lg"></i></span></button></td>
</tr>`;
      return line.innerHTML;
    }
    function deleteProject(event) {
      let button = event.target;
      while (button.tagName != 'BUTTON')
        button = button.parentNode;
      const project_id = button.id.substring(7);
      console.log("deleting project " + project_id);
      let dialog = new ModalDialog('Really delete project?',
                                   '<p>Note: this will not delete any data from your GitHub repository.</p>',
                                   'Cancel', 'Delete Project', 'is-danger');
      dialog.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault();
        dialog.querySelector('button[type="submit"]').classList.add('is-loading');
        fetch('/ajax/project/delete.php', { method: 'post', body: JSON.stringify({email: that.email,
                                                                                  password: that.password,
                                                                                  project: project_id})})
         .then(function(response) {
            return response.json();
           })
         .then(function(data) {
            dialog.close();
            if (data.error)
              new ModalDialog('Error', data.error);
            else {
              const row = that.content.querySelector('#project-' + project_id);
              row.parentNode.removeChild(row);
              project_count--;
              if (project_count == 0)
                that.content.querySelector("#no-project").style.display = 'flex';
            }
          })
         .catch((error) => console.log('ERROR: ' + error));
      });
    }
    let button = {}
    let head_end = {};
    if (data.self === false) {
      button.innerHTML = ``;
      head_end.innerHTML = ``;
    } else {
      button.innerHTML = `<button class="button is-link" id="add-a-new-project">Add a new project</button>`;
      head_end.innerHTML = `<td>Public</td><td></td>`;
    }
    let content = {};
    let projects = {};
    let project_count = 0;
    projects.innerHTML = `<tr id="no-project"><td>(no project)</td></tr>`;
    if (data.projects && data.projects.length > 0) {
      project_count = data.projects.length;
      data.projects.forEach(function(project, index) {
        projects.innerHTML += addProject(project);
      });
    }
    content.innerHTML =
`<section class="section">
  <div class="container">
    <h1 class="title">Projects</h1>
    <table id="project-table" class="table">
      <thead>
        <tr>
          <tr><td></td><td>Title</td><td>Repository</td><td>Folder</td><td>Tag / Branch</td>${head_end.innerHTML}
        </tr>
      </thead>
      <tbody>
        ${projects.innerHTML}
      </tbody>
    </table>
    ${button.innerHTML}
  </div>
</section>`;
    that.setup('userpage', [], content.innerHTML);
    if (data.projects && data.projects.length > 0)
      that.content.querySelector("#no-project").style.display = 'none';
    if (data.self !== false) {
      that.content.querySelector("#add-a-new-project").addEventListener('click', function(event) {
        console.log("Add a new project");
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
  <label class="label">Folder</label>
  <div class="control has-icons-left">
    <input id="folder" class="input" placeholder="my_simualtions/my_wonderful_simulation" maxlen="2048">
    <span class="icon is-small is-left">
      <i class="fas fa-folder"></i>
    </span>
  </div>
  <div class="help">Folder in which your project is located.</div>
</div>
<div class="field">
  <label class="label">Tag / Branch</label>
  <div class="control has-icons-left">
    <input id="tag-or-branch-name" class="input" required placeholder="tag or branch name" maxlen="40" value="master">
    <span class="icon is-small is-left">
      <i class="fas fa-code-branch"></i>
    </span>
  </div>
  <div class="control">
    <label class="radio">
      <input type="radio" name="tag-or-branch" value="tag" required> Tag
    </label>
    <label class="radio">
      <input type="radio" name="tag-or-branch" value="branch" required checked> Branch
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
          const tag_or_branch = modal.querySelector('input[name="tag-or-branch"]').checked;
          const name = modal.querySelector('#tag-or-branch-name').value;
          const tag = tag_or_branch ? name : '';
          const branch = tag_or_branch ? '' : name;
          console.log("branch = " + branch);
          console.log("tag = " + tag);
          fetch('/ajax/project/create.php', { method: 'post', body: JSON.stringify({email: that.email,
                                                                                    password: that.password,
                                                                                    repository: repository,
                                                                                    folder: folder,
                                                                                    tag: tag,
                                                                                    branch: branch})})
           .then(function(response) {
              return response.json();
             })
           .then(function(data) {
              if (data.error)
                console.log(data.error);
              else {
                modal.close();
                if (project_count == 0)
                  that.content.querySelector("#no-project").style.display = 'none';
                let project = {};
                project.id = data.id;
                project.title = data.title;
                project.repository = repository;
                project.folder = folder;
                project.tag = tag;
                project.branch = branch;
                let template = document.createElement('template');
                template.innerHTML = addProject(project);
                project_count++;
                that.content.querySelector('#project-table').appendChild(template.content.firstChild);
                that.content.querySelector('#delete-' + project.id).addEventListener('click', deleteProject);
              }
            })
           .catch((error) => console.log('ERROR: ' + error));
        });
      });
      if (data.projects && data.projects.length > 0)
        data.projects.forEach(function(project, index) {
          that.content.querySelector('#delete-' + project.id).addEventListener('click', deleteProject);
        });
    }
  }
}
