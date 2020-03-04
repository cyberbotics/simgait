import ModalDialog from './modal_dialog.js';
import Router from './router.js';

export default class User extends Router {  // static class (e.g. only static methods)
  constructor(title, footer, routes) {
    super(title, footer, routes);
    this.routes.push({url: '/settings', setup: settingsPage});
    this.username = '!';
    let that = this;
    function findGetParameter(parameterName) {
      let result = null, tmp = [];
      let items = location.search.substr(1).split('&');
      for(let index = 0; index < items.length; index++) {
        tmp = items[index].split('=');
        if (tmp[0] === parameterName)
          result = decodeURIComponent(tmp[1]);
      }
      return result;
    }
    function resetPassword(id, token, email) {
      let content = {};
      content.innerHTML =
`<div class="field">
<label class="label">E-mail</label>
<div class="control has-icons-left">
  <input class="input" type="email" required readonly value="${email}">
  <span class="icon is-small is-left">
    <i class="fas fa-envelope"></i>
  </span>
</div>
</div>
<div class="field">
<label class="label">Password</label>
<div class="control has-icons-left">
  <input id="choose-password" class="input" type="password" required autocomplete=new-password>
  <span class="icon is-small is-left">
    <i class="fas fa-lock"></i>
  </span>
</div>
<div id="choose-password-help" class="help">
  8 characters minimum, including at least a lowercase letter, an uppercase letter, a number and a symbol.
</div>
</div>
<div class="field">
<label class="label">Password (confirm)</label>
<div class="control has-icons-left">
  <input id="choose-confirm-password" class="input" type="password" required>
  <span class="icon is-small is-left">
    <i class="fas fa-lock"></i>
  </span>
</div>
<div id="choose-confirm-help" class="help">&nbsp;</div>
</div>`;
      let choose = new ModalDialog('Choose a password', content.innerHTML, 'Cancel', 'Ok');
      choose.querySelector('#choose-password').focus();
      choose.querySelector('button[type="submit"]').disabled = true;
      choose.querySelector('#choose-password').value = '';
      choose.querySelector('#choose-password').addEventListener('change', checkPasswordMatch);
      choose.querySelector('#choose-password').addEventListener('input', checkPasswordMatch);
      choose.querySelector('#choose-confirm-password').addEventListener('change', checkPasswordMatch);
      choose.querySelector('#choose-confirm-password').addEventListener('input', checkPasswordMatchInput);
      let testPasswordMatch = false;
      let validPassword = false;
      function checkPasswordMatchInput(event) {
        const password = choose.querySelector('#choose-password').value;
        const confirm = choose.querySelector('#choose-confirm-password').value;
        if (confirm.length == 0) {
          choose.querySelector('#choose-confirm-help').innerHTML = '&nbsp;'
          testPasswordMatch = false;
          choose.querySelector('button[type="submit"]').disabled = true;
        }
        if (confirm.length == password.length || testPasswordMatch) {
          testPasswordMatch = true;
          checkPasswordMatch(event);
        }
      }
      function checkPasswordMatch(event) {
        const password = choose.querySelector('#choose-password').value;
        const confirm = choose.querySelector('#choose-confirm-password').value;
        if (event.type == 'input') {
          let length = password.length;
          let message = '';
          if (length < 8)
            message = '8 characters minimum';
          let number_count = 0;
          let uppercase_count = 0;
          let lowercase_count = 0;
          for(let i = 0; i < length; i++)
            if (password[i] >= '0' && password[i] <= '9')
              number_count++;
            else if (password[i] >= 'A' && password[i] <= 'Z')
              uppercase_count++;
            else if (password[i] >= 'a' && password[i] <= 'z')
              lowercase_count++;
          let symbol_count = length - number_count - uppercase_count - lowercase_count;
          if (lowercase_count == 0 || uppercase_count == 0 || number_count == 0 || symbol_count == 0)
            if (message == '')
              message = 'Missing ';
            else
              message += ', including at least ';
          if (lowercase_count == 0)
            message += 'a lowercase letter';
          if (uppercase_count == 0) {
            if (lowercase_count == 0)
              if (number_count > 0 && symbol_count > 0)
                message += ' and ';
              else
                message += ', '
            message += 'an uppercase letter';
          }
          if (number_count == 0) {
            if (lowercase_count == 0 || uppercase_count == 0) {
              if (symbol_count > 0)
                message += ' and ';
              else
                message += ', ';
            }
            message += 'a number';
          }
          if (symbol_count == 0) {
            if (lowercase_count == 0 || uppercase_count == 0 || number_count == 0)
              message += ' and ';
            message += 'a symbol';
          }
          const help = choose.querySelector('#choose-password-help');
          if (message == '') {
            validPassword = true;
            message = 'Valid password.';
            help.classList.remove('is-danger');
            help.classList.add('is-success');
          } else {
            help.classList.add('is-danger');
            help.classList.remove('is-success');
            validPassword = false;
            message += '.';
          }
          help.innerHTML = message;
        }
        if (!confirm)
          return;
        const help = choose.querySelector('#choose-confirm-help');
        const button = choose.querySelector('button[type="submit"]');
        if (password != confirm) {
          help.classList.add('is-danger');
          help.classList.remove('is-success');
          help.innerHTML = "Passwords mismatch: please re-enter carefully your password.";
          button.disabled = true;
        } else {
          help.classList.remove('is-danger');
          help.classList.add('is-success');
          help.innerHTML = "Confirmed password.";
          if (validPassword)
            button.disabled = false;
        }
      }
      choose.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault();
        choose.querySelector('button[type="submit"]').classList.add('is-loading');
        that.sha256Hash(choose.querySelector('#choose-password').value + that.title).then(function(hash) {
          fetch('/ajax/password.php', { method: 'post', body: JSON.stringify({id: id, token: token, password: hash})})
            .then(function(response) {
              return response.json();
            })
            .then(function(data) {
              choose.close();
              if (data.error)
                new ModalDialog('Account activation error', data.error);
              else {
                if (data.type == 'reset')
                  new ModalDialog('Password reset',
                                  '<p>Your password was successfully reset.</p>');
                else if (data.type == 'sign up')
                  if (data.enabled == 1)
                    new ModalDialog('Welcome to ' + that.title,
                                    '<p>Your new account is up-and-ready.</p>');
                  else
                    new ModalDialog('Welcome to ' + that.title,
                                  '<p>Your new account will be validated by our administrator in the next few hours.</p>' +
                                  '<p>You will receive an e-mail notification about it.</p>');
                that.email = email;
                that.password = hash;
                that.login();
              }
            })
            .catch((error) => console.log('ERROR: ' + error));
        });
      });
    }
    function settingsPage() {
      console.log("this = " + that.email);
      // we need to be logged in to view this page
      if (!that.password || !that.email)
        return false;
      const template = document.createElement('template');
      template.innerHTML = `
  <section class="section">
      <div class="container">
        <h1 class="title"><i class="fas fa-cog"></i> Settings</h1>
        <h2 class="subtitle">Manage your account</h2>
    </div>
  </section>
  <section class="section">
    <div class="container panel">
      <p class="panel-heading">Change password</p>
      <div class="panel-block">
        We will send you a e-mail with a link to reset your password.
      </div>
      <div class="panel-block">
        <button class="button is-link" id="change-password">Change password</button>
      </div>
    </div>
    <div class="container panel">
      <p class="panel-heading">Delete Account</p>
      <div class="panel-block">
        <i class="fas fa-exclamation-triangle"></i> &nbsp; Once you delete your account, there is no going back. Please be certain.
      </div>
      <div class="panel-block">
        <button class="button is-danger" id="delete-account">Delete my account</button>
      </div>
    </div>
  </section>`;
      that.setup('settings', [], template.innerHTML);
      document.querySelector('#change-password').addEventListener('click', function(event) {
        event.target.classList.add('is-loading');
        that.forgotPassword(that.email, function() { event.target.classList.remove('is-loading'); });
      });
      document.querySelector('#delete-account').addEventListener('click', function(event) {
        let dialog = new ModalDialog('Really delete account?', '<p>All your data will be deleted from our database.</p>' +
                                     '<p>There is no way to recover deleted data.</p>', 'Cancel', 'Delete Account', 'is-danger');
        dialog.querySelector('form').addEventListener('submit', function(event) {
          event.preventDefault();
          dialog.querySelector('button[type="submit"]').classList.add('is-loading');
          fetch('/ajax/delete.php', { method: 'post', body: JSON.stringify({email: that.email, password: that.password})})
           .then(function(response) {
              return response.json();
             })
           .then(function(data) {
              dialog.close();
              if (data.error)
                new ModalDialog('Error', data.error);
              else {
                new ModalDialog('Account deleted',
                                '<p>Your account was successfully deleted.</p><p>All you data was erased.</p>');
                that.password = null;
                that.email = null;
                that.load('/');
              }
            })
           .catch((error) => console.log('ERROR: ' + error));
        });
      });
      return true;
    }
    this.load();
    // account creation: entering the password
    const token = findGetParameter('token');
    if (token) {
      const id = findGetParameter('id');
      const email = findGetParameter('email');
      if (id && email)
        resetPassword(id, token, email);
    } /* else
      this.login(); */
  }
  load(page, pushHistory) {
    console.log("load");
    super.load(page, pushHistory);
  }
  postLoad() {
    console.log("postLoad ");
    if (this.email && this.password) {
      document.querySelector('#user-menu').style.display = 'flex';
      document.querySelector('#log-in').style.display = 'none';
      document.querySelector('#sign-up').style.display = 'none';
    } else {
      document.querySelector('#user-menu').style.display = 'none';
      document.querySelector('#log-in').style.display = 'flex';
      document.querySelector('#sign-up').style.display = 'flex';
    }
    if (this.username == '!')
      this.login();
  }
  setup(title, anchors, content) {
    console.log("setup");
    super.setup(title, anchors, content);
    let navbarEnd = document.body.querySelector('.navbar-end');
    navbarEnd.parentNode.replaceChild(this.menu(), navbarEnd);
  }
  menu() {
    let div = document.createElement('div');
    div.setAttribute('class', 'navbar-end');
    div.innerHTML =
`<div class="navbar-item">
  <div class="buttons">
    <a class="button is-success" id="sign-up">
      <strong>Sign up</strong>
    </a>
    <a class="button is-light" id="log-in">
      Log in
    </a>
  </div>
</div>
<div id="user-menu" class="navbar-item has-dropdown is-hoverable">
  <a class="navbar-link" id="username">${this.username}</a>
  <div class="navbar-dropdown is-boxed">
    <a class="navbar-item" href="/settings"><i class="fas fa-cog"> &nbsp; </i>Settings</a>
    <a class="navbar-item" href="/${this.username}" id="projects"><i class="fas fa-folder"> &nbsp; </i>Projects</a>
    <div class="navbar-divider"></div>
    <a class="navbar-item" id="log-out"><i class="fas fa-power-off"> &nbsp; </i>Log out</a>
  </div>
</div>`;
    let that = this;
    // log out
    div.querySelector('a#log-out').addEventListener('click', function(event) {
      that.password = null;
      that.load('/');
    });
    // sign up dialog
    div.querySelector('a#sign-up').addEventListener('click', function(event) {
      event.preventDefault();
      let content = {};
      content.innerHTML =
`<div class="field">
  <label class="label">E-mail</label>
  <div class="control has-icons-left">
    <input id="sign-up-email" class="input" type="email" required placeholder="Enter your e-mail address">
    <span class="icon is-small is-left">
      <i class="fas fa-envelope"></i>
    </span>
  </div>
  <div id="sign-up-email-help" class="help">We will send you an e-mail to verify this address.</div>
</div>
<div class="field">
  <label class="label">Username</label>
  <div class="control has-icons-left">
    <input id="sign-up-username" class="input" required placeholder="Choose a username" maxlen="39">
    <span class="icon is-small is-left">
      <i class="fas fa-user"></i>
    </span>
  </div>
  <div id="sign-up-username-help" class="help">
    Use only lowercase alphanumeric or hyphen. No consecutive hyphens. No hyphen at the beginning or at the end.
  </div>
</div>
<div class="field">
  <label class="label">Category</label>
  <div class="control">
    <label class="radio">
      <input type="radio" name="category" value="developer" required> Developer
    </label>
    <label class="radio">
      <input type="radio" name="category" value="clinician"> Clinician
    </label>
    <label class="radio">
      <input type="radio" name="category" value="educator"> Educator
    </label>
    <p id="sign-up-category-help" class="help"></p>
  </div>
</div>`;
      let modal = new ModalDialog('Sign up', content.innerHTML, 'Cancel', 'Sign up');
      modal.querySelector('#sign-up-email').focus();
      let help = modal.querySelector('#sign-up-category-help');
      modal.querySelectorAll('input[name="category"]').forEach((input) => {
        input.checked = false;
        input.addEventListener('change', function(event) {
          const item = event.target.value;
          switch(item) {
            case 'developer':
              help.innerHTML = 'Modify simulations: neuromechanical models, environments and locomotion controllers.';
              break;
            case 'clinician':
              help.innerHTML = 'Simulate walking gaits of real patients, observe the results of different therapies.';
              break;
            case 'educator':
              help.innerHTML = 'Simulate combinations of motor impairments for different pathologies.';
              break;
          }
        });
      });
      function cleanupUsername(username, typing = false) {
        // generate a good suggested username according to github username rules:
        // all lowercase alphanumeric characters and hyphens, but no consecutive hyphens, cannot begin or end with an hyphen,
        // and maximum length is 39 characters, regexp: /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i
        function isAlphaNumeric(code) {
          return ((code > 47 && code < 58) || // numeric (0-9)
                  (code > 64 && code < 91) || // upper alpha (A-Z)
                  (code > 96 && code < 123))  // lower alpha (a-z)
        }
        // step 1: convert to lowercase
        let username1 = username.toLowerCase();
        // step 2: replace non alphanumeric characters with hypens
        let username2 = '';
        for(let i = 0; i < username1.length; i++)
          if (isAlphaNumeric(username1.charCodeAt(i)))
            username2 += username1[i];
          else
            username2 += '-';
        // step 3: remove leading and trailing hyphens
        let begin = username2.length, end = username2.length;
        for(let i = 0; i < username2.length; i++)
          if (username2[i] != '-') {
            if (!typing)
              end = i;
            if (begin == username2.length)
              begin = i;
          }
        let username3 = username2.substring(begin, end + 1);
        // step 4: remove multiple consecutive hyphens
        let username4 = username3.replace(/-{2,}/g, '-');
        // step 5: cut after 39 characters
        return username4.substring(0, 39);
      }
      modal.querySelector('#sign-up-email').addEventListener('change', function(event) {
        event.target.setCustomValidity('');
        const email = event.target.value;
        const help = modal.querySelector('#sign-up-email-help');
        // check if e-mail address is valid
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!re.test(String(email).toLowerCase())) {
          help.innerHTML = 'This e-mail address is invalid.';
          help.classList.add('is-danger');
          help.classList.remove('is-success');
          return;
        }
        // check if this e-mail address is not already registered
        fetch('/ajax/uniqueness.php', { method: 'post', body: JSON.stringify({field: 'email', value: email})})
         .then(function(response) {
            return response.json();
           })
         .then(function(data) {
            if (data.error) {
              help.innerHTML = data.error;
              event.target.setCustomValidity(data.error);
              help.classList.add('is-danger');
              help.classList.remove('is-success');
            } else if (data.status == 'OK') {
              help.innerHTML = 'This e-mail address is available for registration.';
              help.classList.add('is-success');
              help.classList.remove('is-danger');
            }
          })
         .catch((error) => console.log('ERROR: ' + error));
      });
      modal.querySelector('#sign-up-username').addEventListener('focus', function(event) {
        let username = event.target;
        if (username.value != '')
          return;
        const email = modal.querySelector('#sign-up-email').value;
        username.value = cleanupUsername(email.split('@')[0]);
        username.dispatchEvent(new CustomEvent('change', {'target': username}));
      });
      modal.querySelector('#sign-up-username').addEventListener('keyup', function(event) {
        this.value = cleanupUsername(this.value, true);
      });
      modal.querySelector('#sign-up-username').addEventListener('change', function(event) {
        this.value = cleanupUsername(this.value);
        event.target.setCustomValidity('');
        let help = modal.querySelector('#sign-up-username-help');
        if (this.value == '') {
          help.innerHTML = 'Use only lowercase alphanumeric or hyphen. No consecutive hyphens. '
                         + 'No hyphen at the beginning or at the end.';
          help.classList.remove('is-danger');
          help.classList.remove('is-success');
          return;
        }
        // check if this username is not already registered
        fetch('/ajax/uniqueness.php', { method: 'post', body: JSON.stringify({field: 'username', value: this.value})})
         .then(function(response) {
            return response.json();
           })
         .then(function(data) {
            if (data.error) {
              help.innerHTML = data.error;
              event.target.setCustomValidity(data.error);
              help.classList.add('is-danger');
              help.classList.remove('is-success');
            } else if (data.status == 'OK') {
              help.innerHTML = 'This username is available for registration.';
              help.classList.add('is-success');
              help.classList.remove('is-danger');
            }
          })
         .catch((error) => console.log('ERROR: ' + error));
      });
      modal.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault();
        const email = modal.querySelector('#sign-up-email').value;
        const username = modal.querySelector('#sign-up-username').value;
        let category;
        modal.querySelectorAll('input[name="category"]').forEach((input) => {
          if (input.checked)
            category = input.value;
        });
        modal.querySelector('button[type="submit"]').classList.add('is-loading');
        fetch('/ajax/sign-up.php', { method: 'post',
                                     body: JSON.stringify({email: email, username: username, category: category})})
          .then(function(response) {
             return response.json();
           })
          .then(function(data) {
             modal.close();
             if (data.error)
               new ModalDialog('Error', data.error);
             else
               new ModalDialog('Thank you!',
                               'An e-mail was just sent to you to verify your address.<br />' +
                               'Click on the link in the e-mail to set a password and activate your ' + category + ' account.');
           })
          .catch((error) => console.log('ERROR: ' + error));
      });
    });

    // log in dialog (including password reminder)
    div.querySelector('a#log-in').addEventListener('click', function(event) {
      event.preventDefault();
      let content = {};
      content.innerHTML =
`<div class="field">
  <label class="label">E-mail</label>
  <div class="control has-icons-left">
    <input id="log-in-email" class="input" type="email" required placeholder="Enter your e-mail address">
    <span class="icon is-small is-left">
      <i class="fas fa-envelope"></i>
    </span>
  </div>
</div>
<div class="field">
  <label class="label">Password</label>
  <div class="control has-icons-left">
    <input id="log-in-password" class="input" type="password" required>
    <span class="icon is-small is-left">
      <i class="fas fa-lock"></i>
    </span>
  </div>
  <div class="has-text-right"><a id="log-in-forgot" class="help">Forgot your password?</a></div>
</div>
<p id="log-in-help" class="help"></p>`;
      let modal = new ModalDialog('Log in', content.innerHTML, 'Cancel', 'Log in');
      modal.querySelector('#log-in-email').focus();
      modal.querySelector('#log-in-forgot').addEventListener('click', function(event) {
        modal.close();
        let content = {};
        content.innerHTML =
`<div class="field">
  <label class="label">E-mail</label>
  <div class="control has-icons-left">
    <input id="forgot-email" class="input" type="email" required placeholder="Enter your e-mail address"
     value="${modal.querySelector('#log-in-email').value}">
    <span class="icon is-small is-left">
      <i class="fas fa-envelope"></i>
    </span>
  </div>
</div>`;
        let forgot = new ModalDialog('Forgot your password?', content.innerHTML, 'Cancel', 'Reset Password');
        forgot.querySelector('#forgot-email').focus();
        forgot.querySelector('form').addEventListener('submit', function(event) {
          event.preventDefault();
          forgot.querySelector('button[type="submit"]').classList.add('is-loading');
          that.forgotPassword(forgot.querySelector('#forgot-email').value, function() { forgot.close(); });
        });
      });
      modal.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault();
        let email = modal.querySelector('#log-in-email').value;
        let password = modal.querySelector('#log-in-password').value;
        that.email = email;
        that.sha256Hash(password + that.title).then(function(hash) {
          that.password = hash;
          that.login(function(error) {
            modal.querySelector('#log-in-help').innerHTML = error; // "Your e-mail or password is wrong, please try again.";
          }, function(success) {
            modal.close();
          });
        });
      });
    });
    return div;
  }
  login(error = null, success = null) {
    console.log('login e-mail: ' + this.email + " - password: " + this.password);
    if (this.email && this.password) {
      document.querySelector('#user-menu').style.display = 'none';
      document.querySelector('#log-in').style.display = 'none';
      document.querySelector('#sign-up').style.display = 'none';
      let that = this;
      fetch('/ajax/authenticate.php', { method: 'post', body: JSON.stringify({email: this.email, password: this.password})})
        .then(function(response) {
           return response.json();
         })
        .then(function(data) {
           if (data.error) {
             that.password = null;
             if (error)
               error(data.error);
             else
               new ModalDialog("Error", data.error);
             that.username = '!';
             that.load('/');
           } else {
             document.querySelector('#user-menu').style.display = 'flex';
             document.querySelector('#log-in').style.display = 'none';
             document.querySelector('#sign-up').style.display = 'none';
             document.querySelector('#projects').href = '/' + data.username;
             document.querySelector('#username').innerHTML = data.username;
             that.username = data.username;
             if (success)
               success();
           }
         })
        .catch((error) => console.log('ERROR: ' + error));
    }
  }
  async sha256Hash(text) {
    const data = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }
  forgotPassword(email, callback = null) {
    fetch('/ajax/forgot.php', { method: 'post', body: JSON.stringify({email: email})})
     .then(function(response) {
        return response.json();
       })
     .then(function(data) {
        if (callback)
          callback();
        if (data.error)
          new ModalDialog('Error', data.error);
        else
          new ModalDialog('Password reset',
                          'An e-mail with a password reset link was just sent to you.<br />Check your inbox now.');
      })
     .catch((error) => console.log('ERROR: ' + error));
  }
  get email() {
    return window.localStorage.getItem('email');
  }
  set email(value) {
    if (value === null)
      window.localStorage.removeItem('email');
    else
      window.localStorage.setItem('email', value);
  }
  get password() {
    return window.localStorage.getItem('password');
  }
  set password(value) {
    if (value === null)
      window.localStorage.removeItem('password');
    else
     window.localStorage.setItem('password', value);
  }
}
