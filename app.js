// Gaurikas Dairy - Personal Daily Journal
const STORAGE_KEY = 'gaurikas_dairy_entries';

// Initial Sample Entries to show the diary design
const defaultEntries = [
  {
    id: 'entry-demo-1',
    date: '2026-10-07',
    title: 'A quiet evening with tea & journaling',
    content: 'Today was unexpectedly peaceful. Spent some time reading near the window and organizing my notes. Sometimes having quiet moments without any rush is the best medicine for the soul. Looking forward to tomorrow!',
    mood: 'Peaceful',
    createdAt: Date.now() - 86400000
  },
  {
    id: 'entry-demo-2',
    date: '2026-10-05',
    title: 'College lectures and laughing with friends',
    content: 'Submitted my assignments on time today! Sat with friends after classes and we could not stop laughing over silly old memories. Grateful for simple days like these that feel light and joyful.',
    mood: 'Happy',
    createdAt: Date.now() - (86400000 * 3)
  }
];

// App State
let entries = [];

// DOM Elements
const navToday = document.getElementById('nav-today');
const navPrevious = document.getElementById('nav-previous');
const viewToday = document.getElementById('view-today');
const viewPrevious = document.getElementById('view-previous');
const entryCount = document.getElementById('entry-count');

// Form Elements
const diaryForm = document.getElementById('diary-form');
const entryDate = document.getElementById('entry-date');
const entryTitle = document.getElementById('entry-title');
const entryContent = document.getElementById('entry-content');
const selectedMoodInput = document.getElementById('selected-mood');
const moodButtons = document.querySelectorAll('.mood-pill');
const wordCount = document.getElementById('word-count');
const btnClear = document.getElementById('btn-clear');

// Previous Entries Elements
const previousEntriesList = document.getElementById('previous-entries-list');
const emptyEntries = document.getElementById('empty-entries');
const searchInput = document.getElementById('search-input');
const btnAddTodayDirect = document.getElementById('btn-add-today-direct');
const btnEmptyGotoToday = document.getElementById('btn-empty-goto-today');

// Modal Elements
const entryModal = document.getElementById('entry-modal');
const modalTitle = document.getElementById('modal-title');
const modalContent = document.getElementById('modal-content');
const modalDate = document.getElementById('modal-date');
const modalMood = document.getElementById('modal-mood');
const modalReadingTime = document.getElementById('modal-reading-time');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnModalDone = document.getElementById('btn-modal-done');

// Toast Elements
const toast = document.getElementById('toast');
const toastText = document.getElementById('toast-text');

// Initialize Application
function init() {
  loadEntries();
  setDefaultDate();
  setupEventListeners();
  updateBadgeCount();
}

// Set Today's Date into the date input
function setDefaultDate() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  entryDate.value = `${yyyy}-${mm}-${dd}`;
}

// Load entries from localStorage
function loadEntries() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      entries = JSON.parse(stored);
    } catch (e) {
      entries = [...defaultEntries];
    }
  } else {
    entries = [...defaultEntries];
    saveToStorage();
  }
}

// Save entries to localStorage
function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// Mood Emoji Helper
function getMoodEmoji(mood) {
  switch (mood) {
    case 'Happy': return '😊';
    case 'Peaceful': return '🌸';
    case 'Grateful': return '✨';
    case 'Productive': return '🌿';
    case 'Thoughtful': return '💭';
    default: return '📝';
  }
}

// Format Date for Display (e.g. Wednesday, October 8, 2026)
function formatDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  return dateStr;
}

// Switch between Page 1 and Page 2
function switchView(target) {
  if (target === 'today') {
    viewToday.classList.remove('hidden');
    viewPrevious.classList.add('hidden');

    navToday.className = 'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition bg-pink-500 text-white shadow-sm';
    navPrevious.className = 'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition text-gray-600 hover:text-pink-600 hover:bg-white';
  } else {
    viewToday.classList.add('hidden');
    viewPrevious.classList.remove('hidden');

    navPrevious.className = 'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition bg-pink-500 text-white shadow-sm';
    navToday.className = 'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition text-gray-600 hover:text-pink-600 hover:bg-white';

    renderPreviousEntries();
  }
}

// Show Toast Notification
let toastTimeout;
function showToast(message) {
  toastText.textContent = message;
  toast.classList.remove('opacity-0', 'pointer-events-none', '-translate-y-4');
  toast.classList.add('opacity-100', 'translate-y-0');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.add('opacity-0', 'pointer-events-none', '-translate-y-4');
    toast.classList.remove('opacity-100', 'translate-y-0');
  }, 3000);
}

// Update Badge Count
function updateBadgeCount() {
  entryCount.textContent = entries.length;
}

// Update Word Count in Realtime
function updateWordCount() {
  const text = entryContent.value.trim();
  const count = text ? text.split(/\s+/).length : 0;
  wordCount.textContent = `${count} ${count === 1 ? 'word' : 'words'}`;
}

// Render Previous Entries List on Page 2
function renderPreviousEntries() {
  const query = searchInput.value.toLowerCase().trim();

  // Filter entries based on search (matches title, content, date, or mood)
  const filtered = entries.filter(item => {
    const titleMatch = (item.title || '').toLowerCase().includes(query);
    const contentMatch = (item.content || '').toLowerCase().includes(query);
    const dateMatch = (item.date || '').toLowerCase().includes(query);
    const moodMatch = (item.mood || '').toLowerCase().includes(query);
    return titleMatch || contentMatch || dateMatch || moodMatch;
  });

  // Sort by date newest first
  filtered.sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt - a.createdAt));

  previousEntriesList.innerHTML = '';

  if (filtered.length === 0) {
    emptyEntries.classList.remove('hidden');
    return;
  }

  emptyEntries.classList.add('hidden');

  filtered.forEach(entry => {
    const card = document.createElement('div');
    card.className = 'bg-white border border-pink-100 border-l-4 border-l-pink-400 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition space-y-3';

    const words = (entry.content || '').trim().split(/\s+/).length;
    const readMin = Math.max(1, Math.ceil(words / 150));
    const currentMood = entry.mood || 'Happy';

    card.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-pink-50">
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-pink-600 bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
            📅 ${formatDate(entry.date)}
          </span>
          <span class="text-xs font-semibold text-pink-700 bg-pink-100 px-2.5 py-0.5 rounded-full border border-pink-200 flex items-center gap-1">
            <span>${getMoodEmoji(currentMood)}</span>
            <span>${currentMood}</span>
          </span>
        </div>
        <span class="text-[11px] text-gray-400 font-medium">
          ${readMin} min read
        </span>
      </div>

      <div>
        <h3 class="text-base sm:text-lg font-bold text-gray-900 hover:text-pink-600 cursor-pointer transition entry-title-click">
          ${escapeHtml(entry.title)}
        </h3>
        <p class="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-3 leading-relaxed whitespace-pre-wrap">
          ${escapeHtml(entry.content)}
        </p>
      </div>

      <div class="flex items-center justify-between pt-2 text-xs">
        <button type="button" class="btn-read font-semibold text-pink-500 hover:text-pink-600 flex items-center gap-1 hover:underline">
          <span>Read Full Entry</span>
          <span>&rarr;</span>
        </button>
        <button type="button" class="btn-delete font-medium text-gray-400 hover:text-red-500 px-2.5 py-1 rounded-lg hover:bg-red-50 transition" title="Delete Entry">
          🗑️ Delete
        </button>
      </div>
    `;

    // Click to read in modal
    const readBtn = card.querySelector('.btn-read');
    const titleClick = card.querySelector('.entry-title-click');
    const deleteBtn = card.querySelector('.btn-delete');

    const openHandler = () => openModal(entry);
    readBtn.addEventListener('click', openHandler);
    titleClick.addEventListener('click', openHandler);

    // Delete Entry
    deleteBtn.addEventListener('click', () => {
      if (confirm(`Delete the entry "${entry.title}"?`)) {
        deleteEntry(entry.id);
      }
    });

    previousEntriesList.appendChild(card);
  });
}

// Delete Entry by ID
function deleteEntry(id) {
  entries = entries.filter(e => e.id !== id);
  saveToStorage();
  updateBadgeCount();
  renderPreviousEntries();
  showToast('Entry removed from diary');
}

// Open Entry in Modal
function openModal(entry) {
  modalTitle.textContent = entry.title;
  modalContent.textContent = entry.content;
  modalDate.textContent = formatDate(entry.date);
  const currentMood = entry.mood || 'Happy';
  modalMood.innerHTML = `${getMoodEmoji(currentMood)} ${currentMood}`;

  const words = (entry.content || '').trim().split(/\s+/).length;
  modalReadingTime.textContent = `${words} words • ${Math.max(1, Math.ceil(words / 150))} min read`;

  entryModal.classList.remove('hidden');
}

// Close Modal
function closeModal() {
  entryModal.classList.add('hidden');
}

// HTML escape helper
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Reset the Diary Form
function resetForm() {
  diaryForm.reset();
  setDefaultDate();
  selectedMoodInput.value = 'Happy';
  moodButtons.forEach(btn => {
    if (btn.getAttribute('data-mood') === 'Happy') {
      btn.className = 'mood-pill active-mood px-3 py-1.5 rounded-xl border border-pink-300 bg-pink-100 text-pink-700 text-xs font-semibold flex items-center gap-1.5 transition';
    } else {
      btn.className = 'mood-pill px-3 py-1.5 rounded-xl border border-pink-100 bg-white hover:bg-pink-50 text-gray-600 text-xs font-semibold flex items-center gap-1.5 transition';
    }
  });
  updateWordCount();
}

// Event Listeners
function setupEventListeners() {
  // Navigation Tabs
  navToday.addEventListener('click', () => switchView('today'));
  navPrevious.addEventListener('click', () => switchView('previous'));
  btnAddTodayDirect.addEventListener('click', () => switchView('today'));
  btnEmptyGotoToday.addEventListener('click', () => switchView('today'));

  // Mood selection
  moodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const mood = btn.getAttribute('data-mood');
      selectedMoodInput.value = mood;

      moodButtons.forEach(b => {
        b.className = 'mood-pill px-3 py-1.5 rounded-xl border border-pink-100 bg-white hover:bg-pink-50 text-gray-600 text-xs font-semibold flex items-center gap-1.5 transition';
      });
      btn.className = 'mood-pill active-mood px-3 py-1.5 rounded-xl border border-pink-300 bg-pink-100 text-pink-700 text-xs font-semibold flex items-center gap-1.5 transition';
    });
  });

  // Word counter
  entryContent.addEventListener('input', updateWordCount);

  // Clear button
  btnClear.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear your current writing?')) {
      resetForm();
    }
  });

  // Form Submit
  diaryForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const titleVal = entryTitle.value.trim();
    const contentVal = entryContent.value.trim();
    const dateVal = entryDate.value;
    const moodVal = selectedMoodInput.value || 'Happy';

    if (!titleVal || !contentVal) {
      alert('Please fill out both the title and your diary content.');
      return;
    }

    const newEntry = {
      id: 'entry-' + Date.now(),
      date: dateVal,
      title: titleVal,
      content: contentVal,
      mood: moodVal,
      createdAt: Date.now()
    };

    entries.unshift(newEntry);
    saveToStorage();
    updateBadgeCount();
    resetForm();

    showToast('Saved to Gaurikas Dairy! 🌸');

    // Smoothly transition to previous entries page so user sees their new entry
    setTimeout(() => {
      switchView('previous');
    }, 500);
  });

  // Search input
  searchInput.addEventListener('input', renderPreviousEntries);

  // Modal close handlers
  btnCloseModal.addEventListener('click', closeModal);
  btnModalDone.addEventListener('click', closeModal);
  entryModal.addEventListener('click', (e) => {
    if (e.target === entryModal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !entryModal.classList.contains('hidden')) {
      closeModal();
    }
  });
}

// Start on DOM ready
document.addEventListener('DOMContentLoaded', init);
