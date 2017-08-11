var examples = document.querySelectorAll('#d-content .d-c-code');

var i = 0;
// takes the sample code from each example and pastes it into the DOM
while(i<examples.length){
  var el = examples[i];
  el.insertAdjacentHTML('beforebegin','<output>' + el.innerHTML + '</output>');
  i++;
}

var nav      = document.querySelector('#d-nav');
var sections = document.querySelectorAll('#d-content > section > h3');

i = 0;

// generates a nav menu for the documentaiton
while(i<sections.length){
  var el = sections[i];
  var anchorId = el.innerHTML.replace(/[\W_]+/g, "-").toLowerCase();
  el.setAttribute('id', anchorId);
  if(!(el.innerText || '').match(/[\-|\+]/i)){
    nav.innerHTML += `<a class="c-nav__item c-nav__link c-nav__link--action" href="#${anchorId}">${el.innerText}</a>`;
  }
  i++;
}

if(window.location.hash.length) {
  window.location.assign(window.location.hash);
}

