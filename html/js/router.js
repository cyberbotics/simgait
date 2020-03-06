import ModalDialog from './modal_dialog.js';

export default class Router {
  constructor(title, footer, routes) {
    this.title = title;
    this.content = document.createElement('div');
    this.routes = routes;
    const body = document.querySelector('body');
    body.classList.add('has-navbar-fixed-top');
    this.resetNavbar();
    body.append(this.content);
    body.append(footer);
    let that = this;
    // Catch clicks on the root-level element.
    body.addEventListener('click', function(event) {
      let element = event.target;
      if (element.tagName != 'A' && element.parentElement.tagName == 'A')
        element = element.parentElement;
      if (element.tagName == 'A' && element.href && event.button == 0) {  // left click on an <a href=...>
        if (element.origin == document.location.origin &&
            (element.pathname != document.location.pathname || document.location.hash == element.hash || element.hash == '')) {
          // same-origin navigation: a link within the site (we are skipping linking to the same page with possibly hashtags)
          event.preventDefault();  // prevent the browser from doing the navigation
          that.load(element.pathname + element.hash);
          if (element.hash == '')
            window.scrollTo(0, 0);
        }
      }
    });
    window.onpopstate = function(event) {
      that.load(document.location.pathname + document.location.hash, false);
      event.preventDefault();
    }
  }
  resetNavbar() {
    let navbar = document.querySelector('.navbar');
    if (navbar)
      document.body.removeChild(navbar);
    let template = document.createElement('template');
    template.innerHTML =
`<nav class="navbar is-link is-fixed-top" role="navigation" aria-label="main navigation">
  <div class="navbar-brand">
    <a class="navbar-item" href="/">
      <img src="images/logo-28.png" /> &nbsp; ${this.title}
    </a>
    <a role="button" class="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="router-navbar">
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </a>
  </div>
  <div id="router-navbar" class="navbar-menu">
    <div class="navbar-start">
    </div>
    <div class="navbar-end">
    </div>
  </div>
</nav>`;
    document.body.prepend(template.content.firstChild)

    // navbar-burger
    const navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
    if (navbarBurgers.length > 0) {
      navbarBurgers.forEach( el => {
        el.addEventListener('click', () => {
          el.classList.toggle('is-active');
          document.getElementById(el.dataset.target).classList.toggle('is-active');
        });
      });
    }
  }
  load(page = null, pushHistory = true) {
    let that = this;
    let promise = new Promise((resolve, reject) => {
      if (page == null)
        page = window.location.pathname + window.location.search + window.location.hash;
      that.resetNavbar();
      const url = new URL(window.location.origin + page);
      if (url.pathname == '/404.php') {
        that.notFound();
        resolve();
      } else {
        let found = false;
        for(let i = 0; i < that.routes.length; i++) {
          const route = that.routes[i];
          if (url.pathname == route.url) {
            if (route.setup(that)) {
              if (route.fullpage) {
                document.querySelector('body footer').style.display = 'none';
                document.querySelector('body nav').style.display = 'none';
                document.querySelector('body').classList.remove('has-navbar-fixed-top');
              } else {
                document.querySelector('body footer').style.display = 'flex';
                document.querySelector('body nav').style.display = 'flex';
                document.querySelector('body').classList.add('has-navbar-fixed-top');
              }
              if (pushHistory)
                window.history.pushState(null, name, url.pathname + url.search + url.hash);
              resolve();
              found = true;
              break;
            }
          }
        }
        if (!found) {
          that.dynamicPage(url, pushHistory).then(() => {
            resolve();
          });
        }
      }
    });
    return promise;
  }
  dynamicPage(url, pushHistory) {
    let that = this;
    let promise = new Promise((resolve, reject) => {
      that.notFound();
      if (pushHistory)
        window.history.pushState(null, name, url.pathname + url.search + url.hash);
      resolve();
    });
    return promise;
  }
  notFound() {
    if (window.location.pathname != '/404.php')
      window.location.replace('/404.php?pathname=' + window.location.pathname);
    else {
      const pathname = (window.location.search.startsWith('?pathname=') ? window.location.search.substring(10) : '/404');
      const url = window.location.origin + pathname;
      window.history.pushState(null, '404 Not Found', url);
      const hostname = document.location.hostname;
      let content = {};
      content.innerHTML =
`<section class="hero is-danger">
<div class="hero-body">
<div class="container">
<h1 class="title"><i class="fas fa-exclamation-triangle"></i> Page not found (404 error)</h1>
<p>The requested page: <a href="${url}">${url}</a> was not found.</p>
<p>Please report any bug to <a class="has-text-white" href="mailto:webmaster@${hostname}">webmaster@${hostname}</a></p>
</div>
</div>
</section>`;
      this.setup('page not found', [], content.innerHTML);
    }
    return true;
  }
  setup(title, anchors, content) {
    document.head.querySelector('#title').innerHTML = this.title + ' - ' + title;
    let menu = '';
    for(let i = 0; i < anchors.length; i++)
      menu += `<a class="navbar-item" href="#${anchors[i].toLowerCase()}">${anchors[i]}</a>`;
    document.body.querySelector('.navbar-start').innerHTML = menu;
    this.content.innerHTML = content;
  }
}
