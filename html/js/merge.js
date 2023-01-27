import WebotsView from '../../../webots2/resources/web/wwi/WebotsView.js';
import {getNodeAttribute} from '../../../webots2/resources/web/wwi/Parser.js';

const container = document.getElementsByClassName('webots-view-container')[0];
const webotsView = new WebotsView();

container.appendChild(webotsView);

const j1 = fetch('storage/18_Thelen_Ong2019/animation.json')
  .then(result => result.json());

const j2 = fetch('storage/18_Millard_Ong2019/animation.json')
  .then(result => result.json());

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

// TODO make possible to merge 2 in 1 if 2 is smaller
Promise.all([p1, p2, j1, j2]).then(() => {
  p2.then(p2 => {
    const root = p2.getElementsByTagName('Scene')[0];
    const maxId = findMaxId(root, -1);
    p1.then(skeleton => {
      // Combine x3d
      skeleton.id = 'n' + (parseInt(skeleton.id.substr(1)) + maxId);
      increaseId(skeleton, maxId);
      root.appendChild(skeleton);

      // Combine json
      j1.then(json1 => {
        j2.then(json2 => {
          const array1 = json1.frames;
          const array2 = json2.frames;
          // We assume that all animation have the same timestep.
          const length = array1.length > array2.length ? array1.length : array2.length;

          // Merge ids
          let ids1 = json1.ids.split(';');
          ids1 = ';' + ids1.map(id => parseInt(id) + maxId).join(';');
          json2.ids += ids1;

          // Merge frames
          for (let i = 0; i < length; i++) {
            const updates1 = array1[i].updates;
            const updates2 = array2[i].updates;

            for (const update of updates1) {
              update.id += maxId;
              updates2.push(update);
            }
          }
          webotsView.loadAnimation(new XMLSerializer().serializeToString(p2), json2,
            undefined, undefined, undefined, true);
        });
      });
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
