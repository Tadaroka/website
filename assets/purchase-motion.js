'use strict';
(() => {
  const assetBase = new URL('.', document.currentScript.src);
  document.querySelectorAll('[data-purchase-motion]').forEach(root => {
const products = {
  pens: { name: 'بستهٔ خودکار آبی', label: 'خودکار آبی', pack: '۱۲ خودکار در هر بسته', units: 12, unit: 'خودکار', price: 185000, image: 'pens.svg' },
  cleaning: { name: 'بستهٔ مایع دستشویی', label: 'مایع دستشویی', pack: '۴ بطری در هر بسته', units: 4, unit: 'بطری', price: 240000, image: 'cleaning.svg' },
  cups: { name: 'بستهٔ لیوان', label: 'لیوان', pack: '۵۰ لیوان در هر بسته', units: 50, unit: 'لیوان', price: 75000, image: 'disposable.svg' },
};
const format = new Intl.NumberFormat('fa-IR');
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const section = root;
const q = selector => root.querySelector(selector);
const film = q('.motion-film');
const totalOutput = q('#total');
const productChoices = [...root.querySelectorAll('[data-product]')];
productChoices.forEach(button => { button.disabled = false; });
const progress = q('#film-progress');
const decrease = q('#decrease');
const increase = q('#increase');
const shipping = 60000;
const duration = 4800;
let selected = 'pens';
let quantity = 3;
let displayedTotal = 615000;
let priceFrame = null;
let filmFrame = null;
let elapsed = 0;
let lastTime = null;
let playing = false;
let editTimer = null;
let hasStarted = false;
let visibilityObserver = null;

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
  q('#product-name').textContent = product.name;
  q('#product-pack').textContent = product.pack;
  q('#unit-price').textContent = format.format(product.price);
  q('#quantity').textContent = format.format(quantity);
  q('#total-units').textContent = format.format(units);
  q('#unit-name').textContent = product.unit;
  q('#units-breakdown').textContent = `${format.format(quantity)} بسته × ${format.format(product.units)} ${product.unit} در هر بسته`;
  q('#subtotal').textContent = format.format(subtotal);
  q('#shipping').textContent = format.format(shipping);
  animateTotal(total);
  decrease.disabled = quantity <= 1;
  increase.disabled = quantity >= 20;
  film.querySelectorAll('.film-art').forEach(image => { image.src = new URL(product.image, assetBase).href; });
  film.querySelector('.film-product-name').textContent = product.label;
  film.querySelector('.film-pack').textContent = product.pack;
  film.querySelectorAll('.film-quantity').forEach(label => { label.textContent = `${format.format(quantity)} بسته`; });
  film.querySelector('.film-units').textContent = `${format.format(units)} ${product.unit}`;
  film.querySelector('.film-subtotal').textContent = format.format(subtotal);
  film.querySelector('.film-shipping').textContent = format.format(shipping);
  film.querySelectorAll('.film-total').forEach(output => { output.textContent = format.format(total); });
  film.querySelector('.tile-back').hidden = quantity < 3;
  film.querySelector('.tile-middle').hidden = quantity < 2;
  const announcement = `${format.format(quantity)} بسته ${product.label}، شامل ${format.format(units)} ${product.unit}؛ مبلغ نهایی نمونه ${format.format(total)} تومان، شامل ارسال.`;
  film.setAttribute('aria-label', `موشن‌گرافی خرید: ${announcement}`);
  q('#calculation-announcement').textContent = announcement;
  productChoices.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.product === selected)));
  restartAnimation(q('.total-block'), 'is-updating');
}
function showScene(number) {
  film.dataset.scene = String(number);
  section.dataset.step = String(number);
  root.querySelectorAll('[data-cue]').forEach(label => {
    label.classList.toggle('is-current', Number(label.dataset.cue) === number);
  });
}
function stopFilm() {
  if (hasStarted) section.dataset.motionState = 'finished';
  cancelAnimationFrame(filmFrame);
  clearTimeout(editTimer);
  playing = false;
  lastTime = null;
}
function tickFilm(now) {
  if (!playing) return;
  if (lastTime !== null) elapsed = Math.min(duration, elapsed + now - lastTime);
  lastTime = now;
  progress.style.width = `${elapsed / duration * 100}%`;
  const next = elapsed < 1300 ? 1 : elapsed < 2550 ? 2 : elapsed < 3800 ? 3 : 4;
  if (Number(film.dataset.scene) !== next) showScene(next);
  if (elapsed >= duration) stopFilm();
  else filmFrame = requestAnimationFrame(tickFilm);
}
function startFilm() {
  section.dataset.motionState = 'playing';
  if (motion.matches) {
    section.dataset.motionState = 'finished';
    showScene(4);
    progress.style.width = '100%';
    return;
  }
  elapsed = 0;
  playing = true;
  lastTime = null;
  showScene(1);
  filmFrame = requestAnimationFrame(tickFilm);
}
function reactToEdit() {
  hasStarted = true;
  visibilityObserver?.disconnect();
  stopFilm();
  render();
  if (motion.matches) {
    section.dataset.motionState = 'finished';
    showScene(4);
    progress.style.width = '100%';
    return;
  }
  showScene(2);
  progress.style.width = '35%';
  editTimer = setTimeout(() => {
    showScene(3);
    progress.style.width = '70%';
    editTimer = setTimeout(() => {
      showScene(4);
      progress.style.width = '100%';
    }, 1050);
  }, 1050);
}
decrease.addEventListener('click', () => { if (quantity > 1) { quantity--; reactToEdit(); } });
increase.addEventListener('click', () => { if (quantity < 20) { quantity++; reactToEdit(); } });
productChoices.forEach((button, index) => {
  button.addEventListener('click', () => {
    if (selected === button.dataset.product) return;
    selected = button.dataset.product;
    reactToEdit();
  });
  button.addEventListener('keydown', event => {
    const directions = { ArrowLeft: 1, ArrowRight: -1 };
    if (!(event.key in directions) && !['Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? productChoices.length - 1 : (index + directions[event.key] + productChoices.length) % productChoices.length;
    productChoices[next].focus({ preventScroll: true });
    productChoices[next].click();
  });
});
motion.addEventListener('change', () => { hasStarted = true; visibilityObserver?.disconnect(); stopFilm(); render(); showScene(4); progress.style.width = '100%'; });
document.addEventListener('visibilitychange', () => {
  if (document.hidden && hasStarted) { stopFilm(); showScene(4); progress.style.width = '100%'; }
});
function begin() {
  if (hasStarted) return;
  hasStarted = true;
  visibilityObserver?.disconnect();
  startFilm();
}
render();
showScene(1);
if (!motion.matches && section.dataset.start === 'visible' && 'IntersectionObserver' in window) {
  section.dataset.motionState = 'waiting';
  visibilityObserver = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= .35)) begin();
  }, { threshold: .35 });
  visibilityObserver.observe(film);
} else begin();

  });
})();
