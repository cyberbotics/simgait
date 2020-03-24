/* global webots */

export default class Simulation {
  content() {
    function findGetParameter(parameterName) {
      let result = null;
      let tmp = [];
      let items = window.location.search.substr(1).split('&');
      for (let index = 0; index < items.length; index++) {
        tmp = items[index].split('=');
        if (tmp[0] === parameterName)
          result = decodeURIComponent(tmp[1]);
      }
      return result;
    }
    function displayTimer(message, timeCountReset = false) {
      if (timeCountReset)
        displayTimer.timeCount = 0;
      let plural = displayTimer.timeCount > 1 ? 's' : '';
      status.innerHTML = message + ' <span class="is-size-7">(' + displayTimer.timeCount + ' second' + plural + ')<span>';
      displayTimer.timeCount++;
    }
    function runTimer(message) {
      displayTimer(message, true);
      return window.setInterval(displayTimer, 1000, message, false);
    }
    function download(url, tag) {
      let timer = runTimer('Fetching ' + url);
      fetch('/ajax/simulation/download.php', { method: 'post', body: JSON.stringify({url: url, tag: tag})})
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          window.clearInterval(timer);
          if (data.error)
            status.innerHTML = 'Error: ' + data.error;
          else
            compile(url, tag);
        });
    }
    function compile(url, tag) {
      let timer = runTimer('Sending WebSocket...');
      let socket = new WebSocket('wss://localhost/2000/client');
      socket.onmessage = function(event) {
        console.log('WebSocket received: ' + event.data);
      };
      socket.onopen = function(event) {
        let message = {};
        message.start = {};
        message.start.url = url;
        message.start.tag = tag;
        console.log(JSON.stringify(message));
        socket.send(JSON.stringify(message));
      };
    }
    const url = findGetParameter('url');
    let tag = findGetParameter('tag');
    if (tag == null)
      tag = '0';
    const template = document.createElement('template');
    template.innerHTML = `<div id="webots-view" style="height:100vh;"></div>`;
    if (url == null) {
      console.log('Missing GET parameter: url<div class="is-size-6">Example: ' + window.location.href +
                  '?url=https://github.com/user/repo/tree/tag/simulation');
    } else if (!url.startsWith('https://github.com/'))
      console.log('Wrong url: ' + url);
    return template.content;
  }
  run() {
    let webotsView = document.body.querySelector('#webots-view');
    let view = new webots.View(webotsView, 0);
    // view.open('wss://localhost/1999/open?url=' + url + '&tag=' + tag);
    // console.log('opening wss://localhost/1999/open?url=' + url + '&tag=' + tag);
    console.log('opening ws://localhost:2001');
    view.open('ws://localhost:2001');
  }
}
