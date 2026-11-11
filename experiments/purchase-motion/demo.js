'use strict';
const products = {
  pens: { name: 'بستهٔ خودکار آبی', label: 'خودکار آبی', pack: '۱۲ خودکار در هر بسته', units: 12, unit: 'خودکار', price: 185000, image: 'pens.svg' },
  cleaning: { name: 'بستهٔ مایع دستشویی', label: 'مایع دستشویی', pack: '۴ بطری در هر بسته', units: 4, unit: 'بطری', price: 240000, image: 'cleaning.svg' },
  cups: { name: 'بستهٔ لیوان', label: 'لیوان', pack: '۵۰ لیوان در هر بسته', units: 50, unit: 'لیوان', price: 75000, image: 'disposable.svg' },
};
const format = new Intl.NumberFormat('fa-IR');
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const section = document.querySelector('.purchase-demo');
const film = document.querySelector('.motion-film');
const totalOutput = document.getElementById('total');
const picker = document.getElementById('product-picker');
const productTrigger = document.getElementById('product-trigger');
const productMenu = document.getElementById('product-menu');
const productOptions = [...productMenu.querySelectorAll('[data-product]')];
const progress = document.getElementById('film-progress');
const decrease = document.getElementById('decrease');
const increase = document.getElementById('increase');
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
  film.querySelector('.film-shipping').textContent = format.format(shipping);
  film.querySelector('.film-total').textContent = format.format(total);
  film.querySelector('.tile-back').hidden = quantity < 3;
  film.querySelector('.tile-middle').hidden = quantity < 2;
  const announcement = `${format.format(quantity)} بسته ${product.label}، شامل ${format.format(units)} ${product.unit}؛ مبلغ نهایی نمونه ${format.format(total)} تومان، شامل ارسال.`;
  film.setAttribute('aria-label', `موشن‌گرافی خرید: ${announcement}`);
  document.getElementById('calculation-announcement').textContent = announcement;
  productOptions.forEach(option => option.setAttribute('aria-selected', String(option.dataset.product === selected)));
  restartAnimation(document.querySelector('.total-block'), 'is-updating');
}
function showScene(number) {
  film.dataset.scene = String(number);
  section.dataset.step = String(number);
  document.querySelectorAll('[data-cue]').forEach(label => {
    label.classList.toggle('is-current', Number(label.dataset.cue) === number);
  });
}
function stopFilm() {
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
  const next = elapsed < 1550 ? 1 : elapsed < 3150 ? 2 : 3;
  if (Number(film.dataset.scene) !== next) showScene(next);
  if (elapsed >= duration) stopFilm();
  else filmFrame = requestAnimationFrame(tickFilm);
}
function startFilm() {
  if (motion.matches) {
    showScene(3);
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
function focusOption(index) {
  productOptions.forEach((option, i) => { option.tabIndex = i === index ? 0 : -1; });
  productOptions[index].focus({ preventScroll: true });
  productOptions[index].scrollIntoView({ block: 'nearest' });
}
function positionPickerMenu() {
  const rect = productTrigger.getBoundingClientRect();
  const below = window.innerHeight - rect.bottom - 16;
  const above = rect.top - 16;
  const required = Math.min(productMenu.scrollHeight, 310);
  const useAbove = below < required && above > below;
  productMenu.dataset.placement = useAbove ? 'above' : 'below';
  productMenu.style.maxHeight = `${Math.min(310, Math.max(96, useAbove ? above : below))}px`;
}
function openPicker(index = productOptions.findIndex(option => option.dataset.product === selected)) {
  productMenu.hidden = false;
  productTrigger.setAttribute('aria-expanded', 'true');
  positionPickerMenu();
  focusOption(index);
}
function closePicker(returnFocus = false) {
  productMenu.hidden = true;
  productTrigger.setAttribute('aria-expanded', 'false');
  productOptions.forEach(option => { option.tabIndex = -1; });
  if (returnFocus) productTrigger.focus({ preventScroll: true });
}
productTrigger.addEventListener('click', () => {
  if (productMenu.hidden) openPicker();
  else closePicker();
});
productTrigger.addEventListener('keydown', event => {
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  if (event.key === 'Home') openPicker(0);
  else if (event.key === 'End') openPicker(productOptions.length - 1);
  else openPicker();
});
productOptions.forEach((option, index) => {
  option.addEventListener('click', () => {
    const next = option.dataset.product;
    closePicker(true);
    if (next === selected) return;
    selected = next;
    reactToEdit();
    restartAnimation(productTrigger, 'is-changing');
  });
  option.addEventListener('keydown', event => {
    const offsets = { ArrowDown: 1, ArrowUp: -1 };
    if (event.key in offsets) {
      event.preventDefault();
      focusOption((index + offsets[event.key] + productOptions.length) % productOptions.length);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      focusOption(event.key === 'Home' ? 0 : productOptions.length - 1);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closePicker(true);
    } else if (event.key === 'Tab') {
      requestAnimationFrame(() => closePicker());
    }
  });
});
document.addEventListener('pointerdown', event => {
  if (!picker.contains(event.target)) closePicker();
});
picker.addEventListener('focusout', event => {
  if (!picker.contains(event.relatedTarget)) closePicker();
});
window.addEventListener('resize', () => { if (!productMenu.hidden) positionPickerMenu(); });
motion.addEventListener('change', () => { stopFilm(); render(); showScene(3); progress.style.width = '100%'; });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { stopFilm(); showScene(3); progress.style.width = '100%'; }
});
render();
showScene(1);
startFilm();
