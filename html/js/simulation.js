export default class Simulation {
  content() {
    function findGetParameter(parameterName) {
      let result = null, tmp = [];
      let items = window.location.search.substr(1).split('&');
      for(let index = 0; index < items.length; index++) {
        tmp = items[index].split('=');
        if (tmp[0] === parameterName)
          result = decodeURIComponent(tmp[1]);
      }
      return result;
    }
    const url = findGetParameter('url');
    const template = document.createElement('template');
    template.innerHTML =
`<section class="hero" style="background: linear-gradient(0deg, rgba(15,43,87,1) 0%, rgba(50,115,220,1) 90%);">
  <div class="hero-body">
    <div class="container">
      <h1 class="title has-text-white">Simulation</h1>
      <h2 id="status" class="subtitle has-text-white">Fetching ${url}</h2>
    </div>
  </div>
</section>`;
    let status = template.content.firstElementChild.querySelector('#status');
    if (url == null)
      status.innerHTML = 'Missing GET parameter: url<div class="is-size-6">Example: ' + window.location.href +
                         '?url=https://github.com/user/repo/tree/tag/simulation</div>';
    else if (!url.startsWith('https://github.com/'))
      status.innerHTML = 'Wrong url: ' + url;
    else {
      status.innerHTML = 'Fetching ' + url;
      let i = 1;
      window.setInterval(function() {
        status.innerHTML = "Done " + i;
        i++;
      }, 1000);
    }
    return template.content;
  }
}
