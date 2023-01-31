import WebotsView from '../../../webots2/resources/web/wwi/WebotsView.js';
import {getNodeAttribute} from '../../../webots2/resources/web/wwi/Parser.js';

const container = document.getElementsByClassName('webots-view-container')[0];
const webotsView = new WebotsView();

container.appendChild(webotsView);

const j1 = fetch('storage/18_Thelen_Ong2019/animation.json')
  .then(result => result.json());

const j2 = fetch('storage/18_Millard_Ong2019/animation.json')
  .then(result => result.json());

const s1 = fetch('storage/18_Thelen_Ong2019/model.x3d')
  .then(result => result.text())
  .then(text => {
    const parser = new DOMParser();
    return parser.parseFromString(text, 'text/xml');
  });

const s2 = fetch('storage/18_Millard_Ong2019/model.x3d')
  .then(result => result.text())
  .then(text => {
    const parser = new DOMParser();
    return parser.parseFromString(text, 'text/xml');
  });

Promise.all([s1, s2, j1, j2]).then(() => {
  j1.then(json1 => {
    j2.then(json2 => {
      s1.then(scene1 => {
        s2.then(scene2 => {
          const array1 = json1.frames;
          const array2 = json2.frames;
          // Check which animation is the longest
          let length;
          let receiverScene, sceneToBeMerged;
          let receiverJson, jsonToBeMerged;
          // We assume that all animation have the same timestep.
          if (array1.length > array2.length) {
            length = array2.length;
            receiverScene = scene1;
            sceneToBeMerged = scene2;
            receiverJson = json1;
            jsonToBeMerged = json2;
          } else {
            length = array1.length;
            receiverScene = scene2;
            sceneToBeMerged = scene1;
            receiverJson = json2;
            jsonToBeMerged = json1;
          }

          const skeleton = getSkeleton(sceneToBeMerged);
          const root = receiverScene.getElementsByTagName('Scene')[0];
          const maxId = findMaxId(root, -1);
          // Combine x3d
          skeleton.id = 'n' + (parseInt(skeleton.id.substr(1)) + maxId);
          increaseId(skeleton, maxId);
          root.appendChild(skeleton);

          // Combine json
          // Merge ids
          let ids1 = jsonToBeMerged.ids.split(';');
          ids1 = ';' + ids1.map(id => parseInt(id) + maxId).join(';');
          receiverJson.ids += ids1;

          // Merge frames
          for (let i = 0; i < length; i++) {
            const updates1 = jsonToBeMerged.frames[i].updates;
            const updates2 = receiverJson.frames[i].updates;

            for (const update of updates1) {
              update.id += maxId;
              updates2.push(update);
            }
          }
          webotsView.loadAnimation(new XMLSerializer().serializeToString(receiverScene), receiverJson,
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

function getSkeleton(xml) {
  const root = xml.getElementsByTagName('Scene')[0];
  for (const child of root.childNodes) {
    if (child.tagName === 'Transform' && getNodeAttribute(child, 'name') === 'skeleton') {
      child.setAttribute('translation', '0 1 0');
      return child;
    }
  }
}
