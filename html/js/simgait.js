'uses strict';

class Modal {
  constructor(selector) {
    this._element = document.querySelector(selector);
  }
  set element(e) {
    this._element = e;
  }
  get element() {
    return this._element;
  }
  show() {
    Modal.current = this;
    document.querySelector('html').classList.add('is-clipped');
    this._element.classList.add('is-active');
    this.element.querySelectorAll('p.help').forEach((p) => p.innerHTML = '&nbsp;');
    document.addEventListener('keydown', Modal.escape);
    let submit = this._element.querySelector('button[type="submit"]');
    if (submit)
      submit.classList.remove('is-loading');
    this._element.querySelector('button.delete').addEventListener('click', Modal.close);
    this._element.querySelector('button.cancel').addEventListener('click', Modal.close);
    this._element.querySelector('.modal-background').addEventListener('click', Modal.close);
  }
  static close(event) {
    event.preventDefault();
    Modal.current.hide();
  }
  static escape(event) {
    if (event.keyCode == 27)
      Modal.close(event);
  }
  hide() {
    this.element.classList.remove('is-active');
    document.querySelector('html').classList.remove('is-clipped');
    document.removeEventListener('keydown', Modal.escape);
    let parent = this.element.parentElement;
    const clone = this.element.cloneNode(true);  // remove all event listeners
    parent.removeChild(this.element);
    parent.appendChild(clone);
    Modal.current = null;
  }
}
Modal.current = null;

class AlertModal extends Modal {
  constructor(title, text) {
    super('#alert-modal');
    this.element.querySelector('#alert-modal-title').innerHTML = title;
    this.element.querySelector('#alert-modal-text').innerHTML = text;
    this.show();
  }
}

document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('a#sign-up').addEventListener('click', function(event) {
    event.preventDefault();
    let modal = new Modal('#sign-up-modal');
    modal.show();
    modal.element.querySelector('#sign-up-email').focus();
    let help = modal.element.querySelector('#sign-up-category-help');
    modal.element.querySelectorAll('input[name="category"]').forEach((input) => {
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
    modal.element.querySelector('form').addEventListener('submit', function(event) {
      event.preventDefault();
      const email = modal.element.querySelector('#sign-up-email').value;
      let category;
      modal.element.querySelectorAll('input[name="category"]').forEach((input) => {
        if (input.checked)
          category = input.value;
      });
      modal.element.querySelector('button[type="submit"]').classList.add('is-loading');
      fetch('/ajax/sign-up.php', { method: 'post', body: JSON.stringify({email: email, category: category})})
        .then(function(response) {
           return response.json();
         })
        .then(function(data) {
           modal.hide();
           if (data.error)
             new AlertModal("Error", data.error);
           else
             new AlertModal("Thank you!",
                            "Your registration will be processed manually.<br />" +
                            "The administrator will contact you about it very soon.");
         })
        .catch((error) => console.log('ERROR: ' + error));
    });
  });
  document.querySelector('a#log-in').addEventListener('click', function(event) {
    event.preventDefault();
    let modal = new Modal('#log-in-modal');
    modal.show();
    modal.element.querySelector('#log-in-email').focus();
    modal.element.querySelector('#log-in-forgot').addEventListener('click', function(event) {
      modal.hide();
      let forgot = new Modal('#forgot-modal');
      forgot.show();
      forgot.element.querySelector('#forgot-email').value = modal.element.querySelector('#log-in-email').value;
      forgot.element.querySelector('#forgot-email').focus();
      forgot.element.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault();
        forgot.element.querySelector('button[type="submit"]').classList.add('is-loading');
        const email = forgot.element.querySelector('#forgot-email').value;
        fetch('/ajax/forgot.php', { method: 'post', body: JSON.stringify({email: email})})
         .then(function(response) {
            return response.json();
           })
         .then(function(data) {
            forgot.hide();
            if (data.error)
              new AlertModal("Error", data.error);
            else
              new AlertModal("Thank you!",
                             "An e-mail with a password reset link was just sent to you.<br />" +
                             "Check your inbox now.");
          })
         .catch((error) => console.log('ERROR: ' + error));
      });
    });
    modal.element.querySelector('form').addEventListener('submit', function(event) {
      event.preventDefault();
      let email = modal.element.querySelector('#log-in-email').value;
      let password = modal.element.querySelector('#log-in-password').value;
      let data = "e-mail: " + email + " - password: " + password;
      console.log(data);
      modal.element.querySelector('#log-in-help').innerHTML = "Your e-mail or password is wrong, please try again.";
    });
  });
});
