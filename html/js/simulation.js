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
    const tag = findGetParameter('tag');
    if (tag == null)
      tag = '0';
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
      status.innerHTML = 'Fetching ' + url + '<div class="is-size-7">Running for 0 second</div>';
      let timer = 0;
      let interval = window.setInterval(function() {
        timer++;
        let plural = timer > 1 ? 's' : '';
        status.innerHTML = "Fetching " + url + '<div class="is-size-7">Running for ' + timer + ' second' + plural + '</div>';
      }, 1000);
      fetch('/ajax/simulation/download.php', { method: 'post', body: JSON.stringify({url: url, tag: tag})})
       .then(function(response) {
          return response.json();
         })
       .then(function(data) {
          if (data.error)
            status.innerHTML = 'Error: ' + data.error;
          else
            status.innerHTML = 'OK';
          window.clearInterval(interval);
        });
    }
    return template.content;
  }
}
