'uses strict';

document.addEventListener('DOMContentLoaded', function() {
  // define web component
  window.customElements.define('modal-dialog', ModalDialog);

  // sign up dialog
  document.querySelector('a#sign-up').addEventListener('click', function(event) {
    event.preventDefault();
    let content = `
    <div class="field">
      <label class="label">E-mail</label>
      <div class="control has-icons-left">
        <input id="sign-up-email" class="input" type="email" required placeholder="Enter your e-mail address">
        <span class="icon is-small is-left">
          <i class="fas fa-envelope"></i>
        </span>
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
    </div>
    `
    let modal = new ModalDialog('Sign up', content, 'Cancel', 'Sign up');
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
    modal.querySelector('form').addEventListener('submit', function(event) {
      event.preventDefault();
      const email = modal.querySelector('#sign-up-email').value;
      let category;
      modal.querySelectorAll('input[name="category"]').forEach((input) => {
        if (input.checked)
          category = input.value;
      });
      modal.querySelector('button[type="submit"]').classList.add('is-loading');
      fetch('/ajax/sign-up.php', { method: 'post', body: JSON.stringify({email: email, category: category})})
        .then(function(response) {
           return response.json();
         })
        .then(function(data) {
           modal.close();
           if (data.error)
             new ModalDialog("Error", data.error);
           else
             new ModalDialog("Thank you!",
                         "Your registration will be processed manually.<br />" +
                         "The administrator will contact you about it very soon.");
         })
        .catch((error) => console.log('ERROR: ' + error));
    });
  });

  // log in dialog (including password reminder)
  document.querySelector('a#log-in').addEventListener('click', function(event) {
    event.preventDefault();
    let content = `
    <div class="field">
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
    <p id="log-in-help" class="help"></p>
    `;
    let modal = new ModalDialog('Log in', content, 'Cancel', 'Log in');
    modal.querySelector('#log-in-email').focus();
    modal.querySelector('#log-in-forgot').addEventListener('click', function(event) {
      modal.close();
      content = `
      <div class="field">
        <label class="label">E-mail</label>
        <div class="control has-icons-left">
          <input id="forgot-email" class="input" type="email" required placeholder="Enter your e-mail address"
           value="${modal.querySelector('#log-in-email').value}">
          <span class="icon is-small is-left">
            <i class="fas fa-envelope"></i>
          </span>
        </div>
      </div>
      `;
      let forgot = new ModalDialog('Forgot your password?', content, 'Cancel', 'Reset Password');
      forgot.querySelector('#forgot-email').focus();
      forgot.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault();
        forgot.querySelector('button[type="submit"]').classList.add('is-loading');
        const email = forgot.querySelector('#forgot-email').value;
        fetch('/ajax/forgot.php', { method: 'post', body: JSON.stringify({email: email})})
         .then(function(response) {
            return response.json();
           })
         .then(function(data) {
            forgot.close();
            if (data.error)
              new ModalDialog("Error", data.error);
            else
              new ModalDialog("Thank you!",
                          "An e-mail with a password reset link was just sent to you.<br />Check your inbox now.");
          })
         .catch((error) => console.log('ERROR: ' + error));
      });
    });
    modal.querySelector('form').addEventListener('submit', function(event) {
      event.preventDefault();
      let email = modal.querySelector('#log-in-email').value;
      let password = modal.querySelector('#log-in-password').value;
      let data = "e-mail: " + email + " - password: " + password;
      console.log(data);
      modal.querySelector('#log-in-help').innerHTML = "Your e-mail or password is wrong, please try again.";
    });
  });

  function findGetParameter(parameterName) {
    let result = null, tmp = [];
    let items = location.search.substr(1).split("&");
    for(let index = 0; index < items.length; index++) {
      tmp = items[index].split("=");
      if (tmp[0] === parameterName)
        result = decodeURIComponent(tmp[1]);
    }
    return result;
  }

  // account creation: entering the password
  const token = findGetParameter('token');
  if (token) {
    const email = findGetParameter('email');
    if (email) {
      let content = `
      <div class="field">
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
      </div>
      `;
      choose = new ModalDialog('Choose a password', content, 'Cancel', 'Ok');
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
          for(i = 0; i < length; i++)
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
        fetch('/ajax/password.php', { method: 'post', body: JSON.stringify({token: token, email: email, password: password})})
          .then(function(response) {
            return response.json();
          })
          .then(function(data) {
            console.log(data);
            choose.close();
          })
          .catch((error) => console.log('ERROR: ' + error));
      });
    }
  }
  document.querySelector('#log-out').style.display='none';
  let email = localStorage.getItem('email');
  let password = localStorage.getItem('password');
  let category = '';
  if (email && password) {
    fetch('/ajax/authenticate.php', { method: 'post', body: JSON.stringify({email: email, password: password})})
      .then(function(response) {
         return response.json();
       })
      .then(function(data) {
         if (data.error)
           new ModalDialog("Error", data.error);
         else {
           document.querySelector('#log-out').style.display='block';
           document.querySelector('#log-in').style.display='none';
           document.querySelector('#sign-up').style.display='none';
           category = data.category;
         }
       })
      .catch((error) => console.log('ERROR: ' + error));
  }
});

class ModalDialog extends HTMLElement {
  constructor(title, text, close='Ok', action='') {
    super();
    this.classList.add('modal');
    let actionButton, closeClass;
    if (action) {
      actionButton = `<button class="button is-success" type="submit">${action}</button> `;
      closeClass = '';
    } else {
      closeClass = ` is-success`;
      actionButton = '';
    }
    this.innerHTML = `
      <div class="modal-background"></div>
      <form>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">${title}</p>
            <button type="button" class="delete" aria-label="close"></button>
          </header>
          <section class="modal-card-body">
           <p>${text}</p>
          </section>
          <footer class="modal-card-foot">
            ${actionButton}<button class="button cancel${closeClass}" type="button">${close}</button>
          </footer>
        </div>
      </form>
    `;
    document.querySelector('body').appendChild(this);
  }
  connectedCallback() {
    document.querySelector('html').classList.add('is-clipped');
    this.classList.add('is-active');
    ModalDialog.current = this;
    this.querySelectorAll('p.help').forEach((p) => p.innerHTML = '&nbsp;');
    document.addEventListener('keydown', ModalDialog.closeEvent);
    let submit = this.querySelector('button[type="submit"]');
    if (submit)
      submit.classList.remove('is-loading');
    this.querySelector('button.delete').addEventListener('click', ModalDialog.closeEvent);
    this.querySelector('button.cancel').addEventListener('click', ModalDialog.closeEvent);
    this.querySelector('.modal-background').addEventListener('click', ModalDialog.closeEvent);
  }
  static closeEvent(event) {
    if (event.type == 'click' || (event.type == 'keydown' && event.keyCode == 27)) {
      event.preventDefault();
      ModalDialog.current.close();
    }
  }
  close() {
    document.removeEventListener('keydown', ModalDialog._close);
    ModalDialog.current = null;
    this.remove();
  }
}
ModalDialog.current = null;
