/* global webots */

export default class Simulation {
  content() {
    const template = document.createElement('template');
    template.innerHTML = `<div id="webots-view" style="height:100vh;"></div>`;
    return template.content;
  }
  run() {
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
    const url = findGetParameter('url');
    let branch = findGetParameter('branch');
    let webotsView = document.body.querySelector('#webots-view');
    if (branch == null)
      branch = '0';
    if (url == null) {
      webotsView.innerHTML = 'Missing GET parameter: url<div class="is-size-6">Example: ' + window.location.href +
        '?url=webots://github.com/user/repo/tag/R2020a-rev1/simulation/folder/worlds/my_world.wbt';
    } else if (!url.startsWith('webots://github.com/'))
      webotsView.innerHTML = 'Wrong url: ' + url;
    else {
      let view = new webots.View(webotsView, 0);
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const u = protocol + '//' + window.location.hostname + '/1999/session?url=' + url + '&branch=' + branch;
      console.log('opening ' + u + ' protocol = ' + window.location.protocol);
      view.open(u);
    }
  }
}
