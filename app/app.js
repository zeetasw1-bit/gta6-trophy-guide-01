// Leonida Legends — GTA 6 trophy tracker.
// Renders the checklist from data/trophies.json (a local file, the only fetch),
// saves earned trophies in localStorage, and handles filters, spoiler mode,
// progress counts, export/import and deep links (?filter=, ?spoiler=on,
// ?open=<id>, ?roadmap=1). No network request is made to any other host.

const STORAGE_KEY = 'leonida-legends-progress-v1';

const listEl = document.getElementById('list');
const emptyEl = document.getElementById('empty');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const kindEl = document.getElementById('kind');
const spoilerEl = document.getElementById('spoiler');
const earnedOnlyEl = document.getElementById('earned-only');
const progressTextEl = document.getElementById('progress-text');
const progressPctEl = document.getElementById('progress-pct');
const progressFillEl = document.getElementById('progress-fill');
const stickyFillEl = document.getElementById('sticky-fill');
const stickyTextEl = document.getElementById('sticky-text');
const progressCountsEl = document.getElementById('progress-counts');
const filterNoteEl = document.getElementById('filter-note');

const params = new URLSearchParams(location.search);
let earned = new Set(readStoredProgress());
let trophies = [];

function readStoredProgress() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(raw) ? raw.filter((id) => Number.isInteger(id)) : [];
  } catch {
    return [];
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function kindLabel(kind) {
  return { story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', online: 'Online' }[kind] ?? kind;
}

function trophyIsMasked(t) {
  return spoilerEl.checked && t.kind === 'story' && !earned.has(t.id);
}

function trophyMatches(t) {
  const q = searchEl.value.trim().toLowerCase();
  if (q) {
    const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (kindEl.value !== 'all' && t.kind !== kindEl.value) return false;
  if (earnedOnlyEl.checked && !earned.has(t.id)) return false;
  return true;
}

function buildCard(t) {
  const card = document.createElement('article');
  card.className = `trophy grade-${t.grade} kind-${t.kind}`;
  card.id = `trophy-${t.id}`;
  card.dataset.trophyId = String(t.id);
  if (earned.has(t.id)) card.classList.add('earned');

  const masked = trophyIsMasked(t);

  const head = document.createElement('div');
  head.className = 'trophy-head';

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', `Mark ${t.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id);
    else earned.delete(t.id);
    saveProgress();
    render();
  });
  head.append(box);

  const title = document.createElement('h3');
  title.className = 'trophy-name';
  title.textContent = masked ? 'Hidden story trophy' : t.name;
  head.append(title);

  const badge = document.createElement('span');
  badge.className = `grade-badge grade-${t.grade}`;
  badge.textContent = gradeLabel(t.grade);
  head.append(badge);
  card.append(head);

  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = masked
    ? 'Spoiler mode is on — earn this story trophy to reveal its name and description.'
    : t.description;
  card.append(desc);

  const tags = document.createElement('p');
  tags.className = 'trophy-tags';
  const kindTag = document.createElement('span');
  kindTag.className = 'tag kind-tag';
  kindTag.textContent = kindLabel(t.kind);
  tags.append(kindTag);
  const stageTag = document.createElement('span');
  stageTag.className = 'tag stage-tag';
  stageTag.textContent = `Roadmap stage ${t.roadmap}`;
  tags.append(stageTag);
  if (t.hidden) {
    const hiddenTag = document.createElement('span');
    hiddenTag.className = 'tag hidden-tag';
    hiddenTag.textContent = 'Hidden on PlayStation';
    tags.append(hiddenTag);
  }
  if (t.missable) {
    const missTag = document.createElement('span');
    missTag.className = 'tag missable-tag';
    missTag.textContent = '⚠ Possibly missable — read the guide first';
    tags.append(missTag);
  }
  card.append(tags);

  const guide = document.createElement('div');
  guide.className = 'trophy-guide';
  const guideText = document.createElement('p');
  guideText.textContent = masked
    ? 'Guide hidden while spoiler mode is on — earn this story trophy to reveal its guide.'
    : t.guide;
  guide.append(guideText);
  if (Array.isArray(t.sources) && t.sources.length > 0) {
    const sourceLine = document.createElement('p');
    sourceLine.className = 'trophy-sources';
    sourceLine.append(document.createTextNode('Sources: '));
    t.sources.forEach((s, i) => {
      if (i > 0) sourceLine.append(document.createTextNode(' · '));
      const a = document.createElement('a');
      a.href = s.url;
      a.textContent = s.label;
      a.target = '_blank';
      a.rel = 'noopener';
      sourceLine.append(a);
    });
    guide.append(sourceLine);
  }
  card.append(guide);
  return card;
}

function updateProgress() {
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.id)).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  progressTextEl.textContent = `${done} of ${total} earned`;
  progressPctEl.textContent = `${pct}%`;
  progressFillEl.style.width = `${pct}%`;
  stickyTextEl.textContent = `${done} of ${total} earned · ${pct}%`;
  stickyFillEl.style.width = `${pct}%`;
  const byGrade = {};
  for (const t of trophies) {
    byGrade[t.grade] = byGrade[t.grade] || { done: 0, total: 0 };
    byGrade[t.grade].total += 1;
    if (earned.has(t.id)) byGrade[t.grade].done += 1;
  }
  const order = ['platinum', 'gold', 'silver', 'bronze'];
  progressCountsEl.textContent = order
    .filter((g) => byGrade[g])
    .map((g) => `${gradeLabel(g)} ${byGrade[g].done}/${byGrade[g].total}`)
    .join(' · ');
  for (let stage = 1; stage <= 5; stage += 1) {
    const el = document.querySelector(`[data-stage-count="${stage}"]`);
    if (!el) continue;
    const inStage = trophies.filter((t) => t.roadmap === stage);
    const doneStage = inStage.filter((t) => earned.has(t.id)).length;
    el.textContent = `${doneStage} of ${inStage.length} trophies in this stage earned`;
  }
}

function render() {
  listEl.replaceChildren();
  const visible = trophies.filter(trophyMatches);
  for (const t of visible) listEl.append(buildCard(t));
  emptyEl.hidden = visible.length > 0;
  const active = [];
  if (searchEl.value.trim()) active.push(`search “${searchEl.value.trim()}”`);
  if (gradeEl.value !== 'all') active.push(`grade ${gradeEl.value}`);
  if (kindEl.value !== 'all') active.push(`kind ${kindEl.value}`);
  if (earnedOnlyEl.checked) active.push('earned only');
  if (spoilerEl.checked) active.push('spoiler mode on');
  filterNoteEl.textContent = visible.length === trophies.length
    ? 'Showing all 55 trophies.'
    : `Showing ${visible.length} of ${trophies.length} trophies (${active.join(', ') || 'filtered'}).`;
  updateProgress();
}

function applyDeepLinks() {
  const filter = params.get('filter');
  if (filter) {
    if (['story', 'missable', 'collectibles', 'activities', 'online'].includes(filter)) {
      kindEl.value = filter;
    } else if (['platinum', 'gold', 'silver', 'bronze'].includes(filter)) {
      gradeEl.value = filter;
    }
  }
  if (params.get('spoiler') === 'on') spoilerEl.checked = true;
  if (params.get('earned') === 'only') earnedOnlyEl.checked = true;
}

function openDeepLinkedTrophy() {
  const openId = Number(params.get('open'));
  if (!Number.isInteger(openId)) return;
  const card = document.getElementById(`trophy-${openId}`);
  if (!card) return;
  card.classList.add('highlight');
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

document.getElementById('export').addEventListener('click', () => {
  const payload = {
    app: 'leonida-legends-gta6-trophy-guide',
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
  };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(ids)) throw new Error('no earned list found');
    const valid = new Set(trophies.map((t) => t.id));
    earned = new Set(ids.filter((id) => Number.isInteger(id) && valid.has(id)));
    saveProgress();
    render();
  } catch {
    alert('That file does not look like exported trophy progress.');
  }
  e.target.value = '';
});

document.getElementById('reset').addEventListener('click', () => {
  if (confirm('Clear all earned trophies?')) {
    earned = new Set();
    saveProgress();
    render();
  }
});

for (const el of [searchEl, gradeEl, kindEl, spoilerEl, earnedOnlyEl]) {
  el.addEventListener(el.tagName === 'INPUT' && el.type !== 'checkbox' ? 'input' : 'change', render);
}

const doc = await (await fetch('data/trophies.json')).json();
trophies = doc.trophies;
applyDeepLinks();
render();
if (params.get('roadmap') === '1') {
  document.getElementById('roadmap').scrollIntoView({ behavior: 'smooth' });
} else {
  openDeepLinkedTrophy();
}
