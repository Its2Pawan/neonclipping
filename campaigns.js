(function () {
  const filters = [
    ['all', 'All platforms'], ['india', 'India payout'], ['GTA', 'GTA'],
    ['Streams', 'Streams'], ['gaming', 'Gaming'],
  ];
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  function cardFor(platform) {
    const card = element('article', 'campaign-card');
    const mark = element('span', 'campaign-mark', platform.name[0]);
    mark.setAttribute('aria-hidden', 'true');
    const heading = element('header', 'campaign-card-title');
    heading.append(mark, element('h3', '', platform.name));
    const tags = element('div', 'campaign-tags');
    platform.good_for.forEach(tag => tags.append(element('span', '', tag)));

    const details = element('dl', 'campaign-details');
    const facts = [
      ['Pays', platform.pays], ['India payout', platform.india ? 'Available' : 'Unconfirmed'],
      ['Method', platform.payout], ['Minimum', platform.min_payout],
    ];
    for (const [label, value] of facts) {
      if (value) details.append(element('dt', '', label), element('dd', '', value));
    }
    const link = element('a', 'campaign-join', (platform.action || 'Join') + ' ↗');
    link.href = platform.referral_url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer sponsored';
    link.setAttribute('aria-label', link.textContent + ' · ' + platform.name + ' (opens in new tab)');
    const countClick = () => fetch('/campaigns/open', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: platform.id }), keepalive: true,
    }).catch(() => {});
    link.addEventListener('click', countClick);
    link.addEventListener('auxclick', event => { if (event.button === 1) countClick(); });
    const footer = element('footer', 'campaign-card-footer');
    footer.append(element('span', 'campaign-disclosure', 'Affiliate link'));
    footer.append(link);
    card.append(heading, tags, details);
    if (platform.note) card.append(element('small', 'campaign-note', platform.note));
    card.append(footer);
    return card;
  }

  const dialog = element('dialog', 'campaign-dialog');
  dialog.id = 'campaign-dialog';
  dialog.setAttribute('aria-labelledby', 'campaign-title');
  dialog.innerHTML = `<header class="campaign-header">
    <div><h2 id="campaign-title">Campaigns</h2>
      <p>Find a clipping brief and earn on eligible posts.</p>
      <p class="campaign-disclosure" hidden>NeonClipping may earn a commission through links marked Affiliate link.</p>
    </div>
    <button type="button" class="mini-btn" data-campaign-close autofocus>Close</button>
  </header>
  <ol class="campaign-steps">
    <li><span aria-hidden="true">◎</span>Pick a brief</li>
    <li><span aria-hidden="true">✂</span>Make and post your clip</li>
    <li><span aria-hidden="true">↗</span>Submit your post link</li>
  </ol>
  <div class="campaign-filters" role="group" aria-label="Campaign filters"></div>
  <div class="campaign-feedback" role="status"></div>
  <div class="campaign-grid"></div>`;
  document.body.append(dialog);

  const chips = dialog.querySelector('.campaign-filters');
  const feedback = dialog.querySelector('.campaign-feedback');
  const grid = dialog.querySelector('.campaign-grid');
  const disclosure = dialog.querySelector('.campaign-disclosure');
  let currentFilter = 'all';
  let platforms = [];
  let loadNumber = 0;

  function render() {
    for (const button of chips.children) {
      button.setAttribute('aria-pressed', button.dataset.filter === currentFilter);
    }
    const visible = platforms.filter(platform => {
      if (currentFilter === 'all') return true;
      if (currentFilter === 'india') return platform.india;
      if (currentFilter === 'gaming') return platform.good_for.some(tag => tag === 'GTA' || tag === 'Streams');
      return platform.good_for.includes(currentFilter);
    });
    feedback.textContent = visible.length ? '' : platforms.length ? 'No platforms match this filter.' :
      'Affiliate campaigns will appear here when their partner links are available.';
    grid.replaceChildren(...visible.map(cardFor));
  }

  for (const [key, label] of filters) {
    const button = element('button', 'campaign-filter', label);
    button.type = 'button';
    button.dataset.filter = key;
    button.addEventListener('click', () => {
      currentFilter = key;
      render();
    });
    chips.append(button);
  }

  async function open(filter = 'all') {
    const attempt = ++loadNumber;
    currentFilter = filter;
    chips.hidden = true;
    disclosure.hidden = true;
    grid.replaceChildren();
    feedback.textContent = 'Loading campaigns…';
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    try {
      const response = await fetch('/campaigns', { cache: 'no-store' });
      if (!response.ok) throw new Error('Campaigns unavailable');
      const data = await response.json();
      if (attempt !== loadNumber) return;
      platforms = data.platforms.filter(platform => platform.referral_url);
      disclosure.hidden = !platforms.length;
      chips.hidden = platforms.length < 2;
      if (chips.hidden) currentFilter = 'all';
      render();
    } catch {
      if (attempt !== loadNumber) return;
      feedback.textContent = 'Campaigns could not load. ';
      const retry = element('button', 'mini-btn', 'Retry');
      retry.type = 'button';
      retry.onclick = () => open(currentFilter);
      feedback.append(retry);
    }
  }

  dialog.querySelector('[data-campaign-close]').onclick = () => dialog.close();
  document.getElementById('side-campaigns').onclick = () => open();
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-campaign-clip]');
    if (!trigger) return;
    const game = trigger.dataset.campaignClip;
    open(/\bgta|grand theft auto/i.test(game) ? 'GTA' : game ? 'gaming' : 'all');
  });
})();
