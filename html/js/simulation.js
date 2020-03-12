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
    function display_timer(message, time_count_reset = false) {
      if (time_count_reset)
        display_timer.time_count = 0
      let plural = display_timer.time_count > 1 ? 's' : '';
      status.innerHTML = message + ' <span class="is-size-7">(' + display_timer.time_count + ' second' + plural + ')<span>';
      display_timer.time_count++;
    }
    function run_timer(message) {
      display_timer(message, true);
      return window.setInterval(display_timer, 1000, message, false);
    }
    function download(url, tag) {
      let timer = run_timer('Fetching ' + url);
      fetch('/ajax/simulation/download.php', { method: 'post', body: JSON.stringify({url: url, tag: tag})})
       .then(function(response) {
          return response.json();
        })
       .then(function(data) {
          window.clearInterval(timer);
          if (data.error)
            status.innerHTML = 'Error: ' + data.error;
          else
            compile(url);
        });
    }
    function compile(url) {
      let timer = run_timer('Sending WebSocket...');
      let socket = new WebSocket("wss://localhost/3000/client");
      socket.onmessage = function(event) {
        console.log("WebSocket received: " + event.data);
      }
      socket.onopen = function(event) {
        socket.send("Hello World\n");
      }
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
    else
      download(url, tag);
    return template.content;
  }
}
