import WebotsView from '../../../webots/resources/web/wwi/WebotsView.js';
import {getNodeAttribute} from '../../../webots/resources/web/wwi/Parser.js';

const container = document.getElementsByClassName('webots-view-container')[0];
const webotsView = new WebotsView();

container.appendChild(webotsView);

const p1 = fetch('storage/18_Thelen_Ong2019/model.x3d')
  .then(result => result.text())
  .then(text => {
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'text/xml');
    const root = xml.getElementsByTagName('Scene')[0];
    for (const child of root.childNodes) {
      if (child.tagName === 'Transform' && getNodeAttribute(child, 'name') === 'skeleton') {
        child.setAttribute('translation', '0 1 0');
        return child;
      }
    }
  });
const p2 = fetch('storage/18_Millard_Ong2019/model.x3d')
  .then(result => result.text())
  .then(text => {
    const parser = new DOMParser();
    return parser.parseFromString(text, 'text/xml');
  });
Promise.all([p1, p2]).then(() => {
  p2.then(p2 => {
    const root = p2.getElementsByTagName('Scene')[0];
    let maxId = findMaxId(root, -1);
    p1.then(skeleton => {
      skeleton.id = 'n' + (parseInt(skeleton.id.substr(1)) + maxId);
      increaseId(skeleton, maxId);
      root.appendChild(skeleton);
      webotsView.loadAnimation(new XMLSerializer().serializeToString(p2), 'storage/18_Millard_Ong2019/animation.json', 
        undefined, undefined, undefined, true);
    });
  });
});

function findMaxId(node, id) {
  if (node.childNodes) {
    for (const child of node.childNodes) {
      if (child.id) {
        const newId = parseInt(child.id.substr(1));
        if (id < newId)
          id = newId;
      }
      id = findMaxId(child, id);
    }
  }
  return id;
}

function increaseId(node, offset) {
  if (node.childNodes) {
    for (const child of node.childNodes) {
      if (child.id)
        child.id = 'n' + (parseInt(child.id.substr(1)) + offset);

      increaseId(child, offset);
    }
  }
}
