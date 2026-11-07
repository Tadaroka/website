'use strict';
const products = {
  pens: { name: 'بسته خودکار آبی', label: 'خودکار آبی', pack: '۱۲ خودکار در هر بسته', units: 12, unit: 'خودکار', price: 185000, image: 'pens.svg' },
  cleaning: { name: 'بسته مایع دستشویی', label: 'مایع دستشویی', pack: '۴ بطری در هر بسته', units: 4, unit: 'بطری', price: 240000, image: 'cleaning.svg' },
  cups: { name: 'بسته لیوان', label: 'لیوان', pack: '۵۰ لیوان در هر بسته', units: 50, unit: 'لیوان', price: 75000, image: 'disposable.svg' },
};
const format = new Intl.NumberFormat('fa-IR');
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const section = document.querySelector('.purchase-demo');
const film = document.querySelector('.motion-film');
const totalOutput = document.getElementById('total');
const playButton = document.getElementById('play-demo');
const progress = document.getElementById('film-progress');
const decrease = document.getElementById('decrease');
const increase = document.getElementById('increase');
const shipping = 60000;
const duration = 7200;
let selected = 'pens';
let quantity = 3;
let displayedTotal = 615000;
let priceFrame = null;
let filmFrame = null;
let elapsed = 0;
let lastTime = null;
let playing = false;
let paused = false;
let editTimer = null;

function animateTotal(next) {
  cancelAnimationFrame(priceFrame);
  const startValue = displayedTotal;
  if (motion.matches || startValue === next) {
    displayedTotal = next;
    totalOutput.textContent = format.format(next);
    return;
  }
  const start = performance.now();
  function tick(now) {
    const portion = Math.min((now - start) / 550, 1);
    displayedTotal = Math.round(startValue + (next - startValue) * (1 - Math.pow(1 - portion, 3)));
    totalOutput.textContent = format.format(displayedTotal);
    if (portion < 1) priceFrame = requestAnimationFrame(tick);
  }
  priceFrame = requestAnimationFrame(tick);
}
function restartAnimation(element, className) {
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
}
function render() {
  const product = products[selected];
  const units = product.units * quantity;
  const subtotal = product.price * quantity;
  const total = subtotal + shipping;
  document.getElementById('product-name').textContent = product.name;
  document.getElementById('product-pack').textContent = product.pack;
  document.getElementById('receipt-image').src = selected === 'pens' ? 'assets/pens.svg' : `../../assets/${product.image}`;
  document.getElementById('unit-price').textContent = format.format(product.price);
  document.getElementById('quantity').textContent = format.format(quantity);
  document.getElementById('total-units').textContent = format.format(units);
  document.getElementById('unit-name').textContent = product.unit;
  document.getElementById('units-breakdown').textContent = `${format.format(quantity)} بسته × ${format.format(product.units)} ${product.unit} در هر بسته`;
  document.getElementById('subtotal').textContent = format.format(subtotal);
  document.getElementById('shipping').textContent = format.format(shipping);
  animateTotal(total);
  decrease.disabled = quantity <= 1;
  increase.disabled = quantity >= 20;
  film.querySelectorAll('.film-art').forEach(image => { image.src = selected === 'pens' ? 'assets/pens.svg' : `../../assets/${product.image}`; });
  film.querySelector('.film-product-name').textContent = product.label;
  film.querySelector('.film-pack').textContent = product.pack;
  film.querySelectorAll('.film-quantity').forEach(label => { label.textContent = `${format.format(quantity)} بسته`; });
  film.querySelector('.film-units').textContent = `${format.format(units)} ${product.unit}`;
  film.querySelector('.film-subtotal').textContent = format.format(subtotal);
  film.querySelector('.film-total').textContent = format.format(total);
  film.querySelector('.tile-back').hidden = quantity < 3;
  film.querySelector('.tile-middle').hidden = quantity < 2;
  const announcement = `${format.format(quantity)} بسته ${product.name}، شامل ${format.format(units)} ${product.unit}؛ مبلغ نهایی نمونه ${format.format(total)} تومان، شامل ارسال.`;
  film.setAttribute('aria-label', `موشن‌گرافی خرید: ${announcement}`);
  document.getElementById('calculation-announcement').textContent = announcement;
  restartAnimation(document.querySelector('.total-block'), 'is-updating');
}
function showScene(number) {
  film.dataset.scene = String(number);
  section.dataset.step = String(number);
  document.querySelectorAll('[data-cue]').forEach(label => {
    label.classList.toggle('is-current', Number(label.dataset.cue) === number);
  });
}
function setControl() {
  const label = playing ? 'توقف نمایش' : paused ? 'ادامه نمایش' : 'پخش دوباره';
  playButton.querySelector('span').textContent = label;
  playButton.setAttribute('aria-label', `${label} موشن‌گرافی`);
  document.getElementById('play-icon').innerHTML = playing ? '<path d="M9 5v14M15 5v14"/>' : '<path d="m8 5 11 7-11 7Z"/>';
}
function stopFilm() {
  cancelAnimationFrame(filmFrame);
  clearTimeout(editTimer);
  playing = false;
  paused = false;
  lastTime = null;
  film.classList.remove('is-paused');
  setControl();
}
function tickFilm(now) {
  if (!playing) return;
  if (lastTime !== null) elapsed = Math.min(duration, elapsed + now - lastTime);
  lastTime = now;
  progress.style.width = `${elapsed / duration * 100}%`;
  const next = elapsed < 2300 ? 1 : elapsed < 4900 ? 2 : 3;
  if (Number(film.dataset.scene) !== next) showScene(next);
  if (elapsed >= duration) stopFilm();
  else filmFrame = requestAnimationFrame(tickFilm);
}
function play() {
  clearTimeout(editTimer);
  if (motion.matches) {
    stopFilm();
    showScene(3);
    progress.style.width = '100%';
    return;
  }
  if (playing) {
    cancelAnimationFrame(filmFrame);
    playing = false;
    paused = true;
    lastTime = null;
    film.classList.add('is-paused');
    setControl();
    return;
  }
  if (!paused) {
    elapsed = 0;
    showScene(1);
    progress.style.width = '0%';
  }
  film.classList.remove('is-paused');
  playing = true;
  paused = false;
  lastTime = null;
  setControl();
  filmFrame = requestAnimationFrame(tickFilm);
}
function reactToEdit() {
  stopFilm();
  render();
  if (motion.matches) {
    showScene(3);
    progress.style.width = '100%';
    return;
  }
  showScene(2);
  progress.style.width = '66%';
  editTimer = setTimeout(() => {
    showScene(3);
    progress.style.width = '100%';
  }, 1800);
}
decrease.addEventListener('click', () => { if (quantity > 1) { quantity--; reactToEdit(); } });
increase.addEventListener('click', () => { if (quantity < 20) { quantity++; reactToEdit(); } });
document.getElementById('product-select').addEventListener('change', event => {
  selected = event.target.value;
  reactToEdit();
  restartAnimation(document.querySelector('.selected-product'), 'is-changing');
});
playButton.addEventListener('click', play);
motion.addEventListener('change', () => { stopFilm(); render(); showScene(3); progress.style.width = '100%'; });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { stopFilm(); showScene(3); progress.style.width = '100%'; }
});
render();
showScene(1);
play();
