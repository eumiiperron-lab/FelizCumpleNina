const envelopeScreen = document.getElementById('envelopeScreen');
const letterScreen = document.getElementById('letterScreen');
const openButton = document.getElementById('openLetter');
const closeButton = document.getElementById('closeLetter');
const backToTopButton = document.getElementById('backToTop');
const endingTopButton = document.getElementById('endingTop');
const endingCloseButton = document.getElementById('endingClose');
const heartsRoot = document.getElementById('floatingHearts');
const toast = document.getElementById('toast');

// Música de fondo
const backgroundMusic = new Audio('assets/loveisever.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.35;

const heartPositions = [
  [7,4,28],[15,17,35],[24,1,27],[31,28,30],[42,9,25],[51,1,26],
  [62,10,30],[71,5,28],[81,18,34],[91,9,29],[3,53,30],[18,65,31],
  [27,42,25],[38,61,29],[58,60,33],[72,48,27],[88,64,32],[94,36,25],
  [7,84,28],[27,88,25],[47,78,30],[67,87,28],[85,82,30]
];

heartPositions.forEach(([x,y,size], i) => {
  const heart = document.createElement('button');
  heart.className = 'heart';
  heart.type = 'button';
  heart.textContent = '♥';
  heart.style.left = `${x}%`;
  heart.style.top = `${y}%`;
  heart.style.fontSize = `${size}px`;
  heart.style.animationDelay = `${(i % 7) * -0.6}s`;
  heart.setAttribute('aria-label', 'Corazón interactivo');
  heart.addEventListener('click', () => {
    const messages = [
      'Eres mi lugar favorito. ♡',
      'Gracias por existir, Nina.',
      'Te elegiría una y mil veces.',
      'Mi vida es más bonita contigo.',
      'Un besito para ti. ♡',
      'Quiero muchos recuerdos más contigo.'
    ];
    showToast(messages[i % messages.length]);
    heart.animate([{transform:'scale(1)'},{transform:'scale(1.8) rotate(-15deg)'},{transform:'scale(1)'}], {duration:450});
  });
  heartsRoot.appendChild(heart);
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove('show'), 2300);
}

function openLetter() {
  if (envelopeScreen.classList.contains('opening')) return;

  // Iniciar música al hacer clic en el moño
  backgroundMusic.play().catch(error => {
    console.log('No se pudo reproducir la música:', error);
  });

  envelopeScreen.classList.add('opening');
  openButton.disabled = true;

  setTimeout(() => {
    envelopeScreen.hidden = true;
    letterScreen.hidden = false;
    document.body.style.background = '#f4e8e8';
    window.scrollTo({top: 0, behavior: 'instant'});
    openButton.disabled = false;
  }, 720);
}
function closeLetter() {
  letterScreen.hidden = true;
  envelopeScreen.hidden = false;
  envelopeScreen.classList.remove('opening');
  window.scrollTo({top:0, behavior:'instant'});
}
function goTop() {
  window.scrollTo({top:0, behavior:'smooth'});
}

openButton.addEventListener('click', openLetter);
closeButton.addEventListener('click', closeLetter);
endingCloseButton.addEventListener('click', closeLetter);
backToTopButton.addEventListener('click', goTop);
endingTopButton.addEventListener('click', goTop);

// Let the decorative collage balloons react when clicked, too.
document.querySelectorAll('.balloon').forEach((balloon, i) => {
  balloon.tabIndex = 0;
  balloon.setAttribute('role','button');
  balloon.setAttribute('aria-label','Globo de collage');
  const react = () => {
    balloon.animate([{transform:'scale(1)'},{transform:'scale(1.09) rotate(4deg)'},{transform:'scale(1)'}], {duration:400});
    showToast(['Un recuerdo bonito, hecho para ti.','Cada pedacito guarda algo especial.','Feliz cumpleaños, mi amor.'][i]);
  };
  balloon.addEventListener('click', react);
  balloon.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){e.preventDefault();react();} });
});

// Editable sticky notes keep their content while the page stays open.
document.querySelectorAll('.sticky-note').forEach(note => {
  note.addEventListener('focus', () => {
    if (!note.dataset.edited) showToast('Puedes editar esta notita directamente ♡');
  });
  note.addEventListener('input', () => { note.dataset.edited = 'true'; });
});
