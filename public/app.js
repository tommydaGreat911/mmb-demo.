async function loadShops() {
  try {
    const res = await fetch('/data/shops.json');
    const shops = await res.json();
    renderShops(shops);
  } catch (err) {
    document.getElementById('shops').innerHTML = '<p style="color:#c00">Failed to load shops.</p>';
    console.error(err);
  }
}

function renderShops(shops) {
  const container = document.getElementById('shops');
  container.innerHTML = '';
  shops.forEach(s => {
    const card = document.createElement('article');
    card.className = 'shop-card';

    const img = document.createElement('img');
    img.src = s.images && s.images[0] ? s.images[0] : '/images/placeholder1.jpg';
    img.alt = s.name;
    card.appendChild(img);

    const h = document.createElement('h3');
    h.textContent = s.name;
    card.appendChild(h);

    const p = document.createElement('p');
    p.textContent = s.desc || '';
    card.appendChild(p);

    const services = document.createElement('div');
    services.className = 'service-list';
    (s.services || []).forEach(serv => {
      const span = document.createElement('span');
      span.className = 'service';
      span.textContent = `${serv.name} • ${serv.duration} • $${serv.price}`;
      services.appendChild(span);
    });
    card.appendChild(services);

    container.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadShops();
});
