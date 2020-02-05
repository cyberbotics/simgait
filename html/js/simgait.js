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
