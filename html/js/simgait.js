import ModalDialog from './modal_dialog.js';
import Router from './router.js';

document.addEventListener('DOMContentLoaded', function() {
  Router.init('SimGait', footer(), [
    {url: '/', setup: homePage},
    {url: '/settings', setup: settingsPage}
  ]);
});

function footer() {
  let template = document.createElement('template');
  template.innerHTML =
`<footer class="footer" style="background: linear-gradient(0deg, rgba(15,43,87,1) 0%, rgba(50,115,220,1) 100%);">
  <div class="content has-text-centered">
    <p><strong><a class="has-text-white" href="/">SimGait</a></strong></p>
    <p class="has-text-white">Simulation of human locomotion &ndash; a neuromechanical and machine learning approach.</p>
  </div>
</footer>`;
  return template.content.firstChild;
}

function homePage() {
  const template = document.createElement('template');
  template.innerHTML = `
<section class="hero" style="background: linear-gradient(0deg, rgba(15,43,87,1) 0%, rgba(50,115,220,1) 90%);">
  <div class="hero-body">
    <div class="container">
      <h1 class="title has-text-white">SimGait</h1>
      <h2 class="subtitle has-text-white">Simulation of human locomotion &ndash; a neuromechanical and machine learning approach</h2>
    </div>
  </div>
</section>
<a class="anchor" id="overview"></a>
<section class="section">
  <div class="container">
    <h1 class="title">Overview</h1>
    <article class="media">
      <figure class="media-left">
        <p class="image is-1by2" style="width:200px"><img src="images/nms-simulator.png"></p>
     </figure>
     <div class="media-content">
       <div class="content">
         <p>
           The <strong>SimGait</strong> project is a four year project funded by the
           <a href="http://www.snf.ch" target="_blank">SNSF</a>, the Swiss national science foundation
           (<a href="http://p3.snf.ch/project-177179" target="_blank">collaborative Sinergia project #177179</a>).
           This project is a collaboration between
           <a href="https://www.unige.ch/medecine/kinesiology/people/stephanea/" target="_blank">Dr Stéphane Armand</a> of the
           <a href="https://www.unige.ch/medecine/kinesiology/" target="_blank">Willy Taillard Kinesiology Lab</a> at the
           <a href="https://www.hug-ge.ch" target="_blank">University Hospital of Geneva (HUG)</a>,
           <a href="https://www.unige.ch" target="_blank">University of Geneva</a>,
           <a href="https://www.epfl.ch/labs/biorob/people/ijspeert/" target="_blank">Prof. Auke-Jan Ijspeert</a> of the
           <a href="https://www.epfl.ch/labs/biorob/" target="_blank">Biorob laboratory</a> at the
           <a href="https://epfl.ch" target="_blank">EPFL</a> in Lausanne
           and <a href="http://dmml.ch/alexandros-kalousis/" target="_blank">Prof. Alexandros Kalousis</a> of the
           <a href="http://dmml.ch" target="_blank">Data Mining and Machine Learning Group</a> at the
           <a href="https://www.hesge.ch" target="_blank">University of Applied Sciences, Western Switzerland</a>, in Geneva.
         </p>
         <p>
           The aim of this project is to create a musculoskeletal model of the human with neural control to be able to model
           healthy and impaired gait, for example due to cerebral palsy.
           The model consist of a dynamics model that models the motion of the legs and trunk, and is operated by muscle forces.
           Machine learning methods will be used to predict a patient’s gait from their clinical data using a data-driven model.
           The height and weight can be scaled to individual persons.
           The neural control consists of three levels:
         </p>
         <ol>
           <li>Reflexes, which are spinal sensorimotor loops to the muscles that do not go through the brain.</li>
           <li>Central pattern generator in the spinal cord, which interacts with reflexes and creates time dependent signals
           to the leg muscles that generate a walking motion.</li>
           <li>Descending signals from the brain, for example to modulate the speed, or step frequency of the gait.</li>
         </ol>
         <p>
           This model will be used to model gaits of persons with cerebral palsy.
           The goal is to increase our understanding of cerebral palsy by finding which parts of the neural control and muscles
           are impaired.
           A second goal is to investigate whether the model can be used to predict the effect of a surgery, such that surgeons
           can improve the success rate of surgeries.
         </p>
       </div>
      </div>
    </article>
  </div>
</section>
<a class="anchor" id="simulations"></a>
<section class="section">
  <div class="container">
    <h1 class="title">Simulations</h1>
    <div class="columns">
      <div class="column">
        <figure class="video is-1by2">
          <video playsinline autoplay muted loop>
            <source src="videos/healthy_walk.webm" />
          </video>
          <figcaption>Simulation of a healthy gait.</figcaption>
        </figure>
      </div>
      <div class="column">
        <figure class="video is-1by2">
          <video playsinline autoplay muted loop>
            <source src="videos/weakness_walk.webm" />
          </video>
          <figcaption>Simulation of an impaired gait (weakness of soleus bilateral).</figcaption>
        </figure>
      </div>
    </div>
  </div>
</section>
<a class="anchor" id="partners">
<section class="section">
  <div class="container">
    <h2 class="title">Partners</h2>
    <div class="brand-logo-container">
      <a href="http://www.snf.ch" target="_blank"><img class="brand-logo" src="images/snsf.png" /></a>
      <a href="https://www.unige.ch/medecine/kinesiology/" target="_blank"><img class="brand-logo"
        src="images/unige-hug-kinesiology.png" /></a>
      <a href="https://www.epfl.ch/labs/biorob/" target="_blank"><img class="brand-logo" src="images/epfl-biorob.png" /></a>
      <a href="http://dmml.ch" target="_blank"><img class="brand-logo" src="images/hesge-dmml.png" /></a>
    </div>
  </div>
</section>`;
  Router.setup('home', ['Overview', 'Simulations', 'Partners'], template.innerHTML);
}

function settingsPage() {
  // we need to be logged in to view this page
  if (!Router.password || !Router.email)
    return homePage();
  const template = document.createElement('template');
  template.innerHTML = `
<section class="section">
    <div class="container">
      <h1 class="title"><i class="fas fa-cog"></i> Settings</h1>
      <h2 class="subtitle">Manage your account</h2>
  </div>
</section>
<section class="section">
  <div class="container panel">
    <p class="panel-heading">Change password</p>
    <div class="panel-block">
      We will send you a e-mail with a link to reset your password.
    </div>
    <div class="panel-block">
      <button class="button is-link" id="change-password">Change password</button>
    </div>
  </div>
  <div class="container panel">
    <p class="panel-heading">Delete Account</p>
    <div class="panel-block">
      <i class="fas fa-exclamation-triangle"></i> &nbsp; Once you delete your account, there is no going back. Please be certain.
    </div>
    <div class="panel-block">
      <button class="button is-danger" id="delete-account">Delete my account</button>
    </div>
  </div>
</section>`;
  Router.setup('settings', [], template.innerHTML);
  document.querySelector('#change-password').addEventListener('click', function(event) {
    event.target.classList.add('is-loading');
    Router.forgotPassword(Router.email, function() { event.target.classList.remove('is-loading'); });
  });
  document.querySelector('#delete-account').addEventListener('click', function(event) {
    let dialog = new ModalDialog('Really delete account?', '<p>All your data will be deleted from our database.</p>' +
                                 '<p>There is no way to recover deleted data.</p>', 'Cancel', 'Delete Account', 'is-danger');
    dialog.querySelector('form').addEventListener('submit', function(event) {
      event.preventDefault();
      dialog.querySelector('button[type="submit"]').classList.add('is-loading');
      fetch('/ajax/delete.php', { method: 'post', body: JSON.stringify({email: Router.email, password: Router.password})})
       .then(function(response) {
          return response.json();
         })
       .then(function(data) {
          dialog.close();
          if (data.error)
            new ModalDialog('Error', data.error);
          else {
            new ModalDialog('Account deleted',
                            '<p>Your account was successfully deleted.</p><p>All you data was erased.</p>');
            Router.password = null;
            Router.email = null;
            Router.load('/');
          }
        })
       .catch((error) => console.log('ERROR: ' + error));
    });
  });
}
