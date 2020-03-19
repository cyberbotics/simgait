export default class ModalDialog extends HTMLElement {
  constructor(title, text, close='Ok', action='', actionType = 'is-success') {
    super();
    this.classList.add('modal');
    let actionButton, closeClass;
    if (action) {
      actionButton = `<button class="button ${actionType}" type="submit">${action}</button> `;
      closeClass = '';
    } else {
      closeClass = ` is-success`;
      actionButton = '';
    }
    this.innerHTML =
`<div class="modal-background"></div>
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
      ${actionButton}
      <button class="button cancel${closeClass}" type="button">${close}</button>
      <div class="help is-danger"></div>
    </footer>
  </div>
</form>`;
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
    document.querySelector('html').classList.remove('is-clipped');
    document.removeEventListener('keydown', ModalDialog.closeEvent);
    ModalDialog.current = null;
    this.remove();
  }
  error(message) {
    this.querySelector('.modal-card-foot div').innerHTML = message;
    let submit = this.querySelector('button[type="submit"]');
    if (submit)
      submit.classList.remove('is-loading');
  }
}
ModalDialog.current = null;

document.addEventListener('DOMContentLoaded', function() {
  window.customElements.define('modal-dialog', ModalDialog); // define web component
});
