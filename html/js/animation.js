import Project from './project.js';

export default class Animation extends Project {
  static run(title, footer, routes) {
    let animation = new Animation(title, footer, routes);
    animation.load();
  }
  constructor(title, footer, routes) {
    super(title, footer, routes);
    const setup = "";
    const cleanup = "";
    routes.push({url: '/animation', setup: setup, cleanup: cleanup});
  }
}
