(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const currency = amount => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const products = {
    whey: { name: 'Whey Isolate', size: '2 kg', category: 'Protein', image: 'assets/whey.jpg', price: 5499, description: 'Explore a protein option for your everyday training routine. This sample product demonstrates the catalogue experience; final brand, ingredients, nutrition information and verification details will be added to the real catalogue.' },
    creatine: { name: 'Creatine Monohydrate', size: '250 g', category: 'Performance', image: 'assets/creatine.jpg', price: 999, description: 'An essential in the performance nutrition catalogue concept. Product formulation, manufacturer details, ingredients and directions will be confirmed before real orders are available.' },
    preworkout: { name: 'Pre-Workout', size: '300 g', category: 'Performance', image: 'assets/preworkout.jpg', price: 1899, description: 'Explore the pre-workout category. This is an illustrative product, with no confirmed formulation. Ingredients, caffeine content, suitability information and directions will accompany a final listing.' }
  };
  const disciplines = {
    strength: { number: '01', tag: 'Build your foundation', title: 'Earn your strong.', description: 'From learning the barbell to chasing your next best lift. Make room for focused work, good technique and steady progress.', image: 'assets/deadlift-hero.jpg', alt: 'AI concept of an athlete deadlifting in an industrial gym', position: '69% center', goal: 'Strength' },
    bodyweight: { number: '02', tag: 'Own your movement', title: 'Strength, on your terms.', description: 'Explore control, coordination and relative strength. A bodyweight discipline built around the simple challenge of moving yourself well.', image: 'assets/calisthenics.jpg', alt: 'AI concept of an athlete holding a gymnastic ring support', position: 'center', goal: 'Bodyweight' },
    combat: { number: '03', tag: 'Find your focus', title: 'Bring your whole self.', description: 'Footwork, timing and the discipline of showing up. Explore a space for combat training, where attention matters as much as effort.', image: 'assets/combat.jpg', alt: 'AI concept of a combat training area with mats and heavy bags', position: 'center', goal: 'Combat' },
    conditioning: { number: '04', tag: 'Build your engine', title: 'Ready for the next round.', description: 'Build a broader base of fitness through purposeful movement. Make space for sessions that challenge your work capacity and reward consistency.', image: 'assets/conditioning.jpg', alt: 'AI concept of an athlete pushing a weighted training sled', position: '65% center', goal: 'Conditioning' }
  };
  const plans = {
    1: { name: 'The first step', price: 1200, months: 1, description: 'A month to find your rhythm and make your first move.' },
    3: { name: 'Find your rhythm', price: 2500, months: 3, description: 'Three months to turn showing up into a regular part of your week.' },
    6: { name: 'Build the habit', price: 4500, months: 6, description: 'Six months to give your training space to develop.' },
    12: { name: 'The long game', price: 8000, months: 12, description: 'A full year to make consistency part of who you are.' }
  };
  let activeDiscipline = 'strength';
  let selectedPlan = 12;
  let activeProduct = 'whey';
  let quantity = 1;
  let bag = {};
  let toastTimer;
  let dialogOpener;

  const menu = $('#mobile-menu');
  const menuButton = $('.menu-toggle');
  function setMenu(open) {
    menu.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    document.body.classList.toggle('modal-open', open);
    $('#header').classList.toggle('is-sticky', open || window.scrollY > 200);
    if (open) $('a', menu).focus();
  }
  menuButton.addEventListener('click', () => setMenu(menu.hidden));
  $$('a', menu).forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (menu.hidden) return;
    if (event.key === 'Escape') { setMenu(false); menuButton.focus(); }
    if (event.key === 'Tab') {
      const focusable = [menuButton, ...$$('a, button', menu)];
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  window.matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches && !menu.hidden) setMenu(false); });

  let scrollQueued = false;
  function syncScroll() {
    $('#header').classList.toggle('is-sticky', window.scrollY > 200 || !menu.hidden);
    const heroImage = $('.hero-image');
    if (heroImage && !reducedMotion.matches && window.scrollY < window.innerHeight * 1.1) {
      heroImage.style.translate = `0 ${Math.min(window.scrollY * .12, 100)}px`;
    } else if (heroImage && reducedMotion.matches) heroImage.style.translate = '';
    scrollQueued = false;
  }
  window.addEventListener('scroll', () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(syncScroll); } }, { passive: true });
  syncScroll();
  reducedMotion.addEventListener('change', syncScroll);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: .08 });
    $$('.reveal').forEach(element => observer.observe(element));
  } else $$('.reveal').forEach(element => element.classList.add('is-visible'));

  function notify(message) {
    clearTimeout(toastTimer);
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('visible');
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 3400);
  }
  function openDialog(dialog) {
    if (!menu.hidden) setMenu(false);
    const open = $('dialog[open]');
    if (!open) dialogOpener = document.activeElement;
    if (open && open !== dialog) open.close();
    if (!dialog.open) dialog.showModal();
    document.body.classList.add('modal-open');
  }
  $$('dialog').forEach(dialog => {
    $$('[data-close]', dialog).forEach(button => button.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      if (!$('dialog[open]')) {
        document.body.classList.remove('modal-open');
        if (dialogOpener?.isConnected) dialogOpener.focus();
      }
    });
  });

  function chooseDiscipline(key, focus = false) {
    activeDiscipline = key;
    const value = disciplines[key];
    $$('[data-discipline]').forEach(button => {
      const active = button.dataset.discipline === key;
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
      if (active && focus) button.focus();
    });
    $('#discipline-number').textContent = value.number;
    $('#discipline-tag').textContent = value.tag;
    $('#discipline-title').textContent = value.title;
    $('#discipline-description').textContent = value.description;
    $('#discipline-panel').setAttribute('aria-labelledby', `tab-${key}`);
    const photo = $('#training-image');
    photo.src = value.image;
    photo.alt = value.alt;
    photo.style.objectPosition = value.position;
  }
  $$('[data-discipline]').forEach((button, index, buttons) => {
    button.addEventListener('click', () => chooseDiscipline(button.dataset.discipline));
    button.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % buttons.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + buttons.length) % buttons.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = buttons.length - 1;
      if (next !== undefined) { event.preventDefault(); chooseDiscipline(buttons[next].dataset.discipline, true); }
    });
  });

  $$('[data-plan]').forEach(button => button.addEventListener('click', () => {
    selectedPlan = Number(button.dataset.plan);
    const plan = plans[selectedPlan];
    $$('[data-plan]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    $('#plan-name').textContent = plan.name;
    $('#plan-price').textContent = currency(plan.price);
    $('#plan-period').textContent = `/ ${plan.months} ${plan.months === 1 ? 'month' : 'months'}`;
    $('#plan-monthly').textContent = plan.months === 1 ? 'A simple way to get started' : `Equivalent to ${currency(Math.round(plan.price / plan.months))} / month`;
    const savings = 1200 * plan.months - plan.price;
    $('#plan-saving').textContent = savings ? `Save ${currency(savings)} vs monthly` : 'Start here';
    $('#plan-description').textContent = plan.description;
  }));

  function openTrial(plan = null) {
    $('#trial-form').reset();
    $('#trial-form').hidden = false;
    $('#trial-success').hidden = true;
    $('.trial-intro>p').textContent = plan ? `Explore the ${plan.months}-month sample membership — ${currency(plan.price)}.` : 'One session. A new starting point.';
    const chosen = $(`input[name="goal"][value="${disciplines[activeDiscipline].goal}"]`);
    if (chosen) chosen.checked = true;
    const now = new Date();
    const min = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    $('input[name="date"]').min = min;
    openDialog($('#trial-dialog'));
    $('input[name="name"]').focus();
  }
  $$('[data-trial]').forEach(button => button.addEventListener('click', () => openTrial()));
  $('#explore-plan')?.addEventListener('click', () => openTrial(plans[selectedPlan]));
  $('#trial-form').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    const nameInput = $('input[name="name"]', form);
    if (!nameInput.value.trim()) { nameInput.setCustomValidity('Please enter your name.'); nameInput.reportValidity(); return; }
    nameInput.setCustomValidity('');
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const date = new Date(`${data.get('date')}T12:00:00`);
    const dateLabel = new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
    $('#success-title').textContent = `Your starting point, ${String(data.get('name')).trim()}.`;
    $('#success-copy').textContent = `You’ve chosen ${String(data.get('goal')).toLowerCase()} for ${dateLabel}. This is where a confirmed session summary would appear in the live booking experience.`;
    form.hidden = true;
    $('#trial-success').hidden = false;
    $('#success-title').tabIndex = -1;
    $('#success-title').focus();
  });
  $('input[name="name"]').addEventListener('input', event => event.target.setCustomValidity(''));

  $$('[data-filter]').forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    $$('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    let count = 0;
    $$('.product').forEach(product => {
      product.hidden = filter !== 'all' && filter !== product.dataset.category;
      if (!product.hidden) count++;
    });
    $('#product-count').textContent = `${String(count).padStart(2, '0')} ${count === 1 ? 'essential' : 'essentials'}`;
  }));
  function syncQuantity() {
    $('#quantity-value').textContent = String(quantity);
    $('#quantity-minus').disabled = quantity <= 1;
    $('#quantity-plus').disabled = quantity >= 10;
  }
  $$('[data-product]').forEach(button => button.addEventListener('click', () => {
    activeProduct = button.dataset.product;
    const product = products[activeProduct];
    quantity = 1;
    $('#product-title').textContent = product.name;
    $('#detail-category').textContent = `${product.category} / Sample catalogue`;
    $('#detail-size').textContent = product.size;
    $('#detail-description').textContent = product.description;
    $('#detail-price').textContent = currency(product.price);
    $('#detail-image').src = product.image;
    $('#detail-image').alt = `Concept packaging for ${product.name}`;
    syncQuantity();
    openDialog($('#product-dialog'));
  }));
  $('#quantity-minus').addEventListener('click', () => { quantity = Math.max(1, quantity - 1); syncQuantity(); });
  $('#quantity-plus').addEventListener('click', () => { quantity = Math.min(10, quantity + 1); syncQuantity(); });

  function updateBag() {
    const count = Object.values(bag).reduce((sum, value) => sum + value, 0);
    $$('.bag-count').forEach(item => item.textContent = String(count));
    $$('[data-open-bag]').forEach(button => button.setAttribute('aria-label', `Open demo bag, ${count} ${count === 1 ? 'item' : 'items'}`));
    $('#bag-total-count').textContent = String(count);
    const container = $('#bag-items');
    container.replaceChildren();
    if (!count) {
      const empty = document.createElement('div');
      empty.className = 'bag-empty';
      empty.innerHTML = '<h3>Room for your essentials.</h3><p>Explore the sample catalogue and add something to see how the bag works.</p><button class="button blue wide">Explore the fuel <span aria-hidden="true">↗</span></button>';
      $('button', empty).addEventListener('click', () => { $('#bag-dialog').close(); if ($('#fuel')) $('#fuel').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth' }); else window.location.href = 'fuel.html'; });
      container.append(empty);
    }
    let subtotal = 0;
    Object.entries(bag).forEach(([id, count]) => {
      const product = products[id];
      subtotal += count * product.price;
      const row = document.createElement('article');
      row.className = 'bag-item';
      row.innerHTML = `<img src="${product.image}" alt="Concept packaging for ${product.name}"><div><h3>${product.name}</h3><p>${product.size} · ${currency(product.price)} each</p><p>${currency(count * product.price)}</p><div class="bag-item-bottom"><div class="bag-item-controls"><button aria-label="Decrease ${product.name} quantity">−</button><span aria-live="polite">${count}</span><button aria-label="Increase ${product.name} quantity">+</button></div><button class="bag-remove" aria-label="Remove ${product.name} from bag">Remove</button></div></div>`;
      const controls = $$('.bag-item-controls>button', row);
      controls[0].addEventListener('click', () => adjustBag(id, -1, 0));
      controls[1].disabled = count >= 10;
      controls[1].addEventListener('click', () => adjustBag(id, 1, 1));
      $('.bag-remove', row).addEventListener('click', () => adjustBag(id, -count, 0));
      container.append(row);
    });
    $('#bag-summary').hidden = count === 0;
    $('#bag-subtotal').textContent = currency(subtotal);
  }
  function adjustBag(id, delta, focusIndex) {
    bag[id] = Math.max(0, Math.min(10, (bag[id] || 0) + delta));
    if (!bag[id]) delete bag[id];
    const ids = Object.keys(bag);
    updateBag();
    if (ids.includes(id)) {
      const index = ids.indexOf(id);
      const button = $$('.bag-item')[index]?.querySelectorAll('.bag-item-controls>button')[focusIndex];
      if (button && !button.disabled) button.focus();
      else $$('.bag-item')[index]?.querySelector('.bag-remove')?.focus();
    } else ($('.bag-item-controls>button') || $('.bag-empty button') || $('#bag-dialog [data-close]')).focus();
  }
  $('#add-to-bag').addEventListener('click', () => {
    const current = bag[activeProduct] || 0;
    if (current >= 10) { notify('The demo bag has a limit of 10 of each item.'); return; }
    bag[activeProduct] = Math.min(10, current + quantity);
    updateBag();
    $('#product-dialog').close();
    notify(`${products[activeProduct].name} added to your demo bag.`);
  });
  $$('[data-open-bag]').forEach(button => button.addEventListener('click', () => { updateBag(); openDialog($('#bag-dialog')); }));
  function showInformation(title, message) {
    $('#information-title').textContent = title;
    $('#information-copy').textContent = message;
    openDialog($('#information-dialog'));
  }
  $('#demo-checkout').addEventListener('click', () => {
    const subtotal = Object.entries(bag).reduce((sum, [id, count]) => sum + products[id].price * count, 0);
    showInformation('YOUR FUEL. YOUR NEXT STEP.', `Your sample bag totals ${currency(subtotal)}. In the live store, the next step would confirm product details, delivery and payment. This preview stops here: no order has been placed and no payment details are collected. Your demo bag remains available while this tab is open.`);
  });
  $('#about-preview').addEventListener('click', () => showInformation('A LOOK AT WHAT’S NEXT.', 'This is a design concept for GYMBRO’s gym and supplement experience. All images are AI-generated samples, and membership and product prices are illustrative. Real contact details, products, services and business information require confirmation before launch. Trial form entries are not sent or saved, and the demo bag resets when this page is reloaded.'));
  $('#year').textContent = String(new Date().getFullYear());
  updateBag();
})();
