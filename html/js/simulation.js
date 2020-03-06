export default class Simulation {
  content() {
    const template = document.createElement('template');
    template.innerHTML =
`<section class="hero" style="background: linear-gradient(0deg, rgba(15,43,87,1) 0%, rgba(50,115,220,1) 90%);">
  <div class="hero-body">
    <div class="container">
      <h1 class="title has-text-white">Simulation</h1>
      <h2 id="status" class="subtitle has-text-white">Hello</h2>
    </div>
  </div>
</section>`;
    template.content.firstElementChild.querySelector('#status').innerHTML = 'Loading...';
    //fetch('/ajax/simulation/setup.php').then();
    return template.content;
  }
}
