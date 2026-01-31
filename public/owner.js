async function loadBookings() {
  try {
    const res = await fetch('/data/bookings.json');
    const bookings = await res.json();
    renderBookings(bookings);
  } catch (err) {
    document.getElementById('bookings').innerHTML = '<p style="color:#c00">Failed to load bookings.</p>';
    console.error(err);
  }
}

function renderBookings(bookings) {
  const container = document.getElementById('bookings');
  container.innerHTML = '';
  if (!bookings || bookings.length === 0) {
    container.innerHTML = '<p>No bookings yet.</p>';
    return;
  }

  bookings.forEach(b => {
    const el = document.createElement('div');
    el.className = 'booking';

    const left = document.createElement('div');
    left.style.display = 'flex';
    left.style.flexDirection = 'column';
    left.style.gap = '6px';

    const title = document.createElement('strong');
    title.textContent = b.shopName || b.shopId || 'Unknown shop';
    left.appendChild(title);

    const info = document.createElement('small');
    info.textContent = `${b.serviceName || b.serviceId || ''} — ${b.time || ''}`;
    left.appendChild(info);

    const right = document.createElement('div');
    right.style.display = 'flex';
    right.style.alignItems = 'center';
    right.style.gap = '8px';

    const status = document.createElement('small');
    status.textContent = b.confirmed ? 'Confirmed' : 'Pending';
    status.style.color = b.confirmed ? '#0b7a3a' : '#b
