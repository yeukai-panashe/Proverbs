// --- Globals and Initial Setup ---
let bibleData = null; // This will store the loaded Bible JSON
const appState = {
    currentBook: null,
    currentChapter: null,
};

// SVG icons for the theme toggle - NOW WITH TWO SUNS
const sunIconSolid = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>`;
const sunIconOutline = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>`;

// --- Main function runs when the page loads ---
window.onload = function() {
    // Get all the elements we will need to work with
    const proverbView = document.getElementById('proverb-view');
    const bibleView = document.getElementById('bible-view');
    const bibleLink = document.getElementById('bible-link');

    // --- Fetch Bible Data and Initialize App ---
    fetch('proverbs.json')
        .then(response => response.json())
        .then(data => {
            bibleData = data; // Store data globally
            displayDailyProverb();
            setupEventListeners();
        })
        .catch(error => {
            console.error('Error loading the Bible data:', error);
            document.getElementById('proverb-text').innerText = 'Could not load data.';
        });

    // --- Event Listeners Setup ---
    function setupEventListeners() {
        const themeToggleButton = document.getElementById('theme-toggle');
        const backButton = document.getElementById('back-button');

        // Theme Toggle Logic - Set the initial icon
        themeToggleButton.innerHTML = sunIconSolid; // Default is dark, so show icon to switch TO light
        themeToggleButton.addEventListener('click', toggleTheme);
        
        // Navigation Logic
        bibleLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (bibleLink.textContent === 'Bible') {
                showBibleView();
            } else {
                showProverbView();
            }
        });

        backButton.addEventListener('click', handleBackNavigation);
    }

    // --- View Switching Logic ---
    function showBibleView() {
        proverbView.classList.add('hidden');
        bibleView.classList.remove('hidden');
        bibleLink.textContent = 'Home'; // Change link text
        renderBooks();
    }

    function showProverbView() {
        bibleView.classList.add('hidden');
        proverbView.classList.remove('hidden');
        bibleLink.textContent = 'Bible';
    }

    // --- Daily Proverb Logic ---
    function displayDailyProverb() {
        const proverbsBook = bibleData.books.find(book => book.name === 'Proverbs');
        const allProverbs = [];
        proverbsBook.chapters.forEach(ch => {
            ch.verses.forEach(v => {
                allProverbs.push({ text: v.text, book: 'Proverbs', chapter: ch.chapter, verse: v.verse });
            });
        });

        const today = new Date();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        const dailyProverb = allProverbs[(dayOfYear - 1) % allProverbs.length];

        document.getElementById('proverb-text').innerText = `"${dailyProverb.text}"`;
        const refElement = document.getElementById('proverb-reference');
        
        const refLink = document.createElement('a');
        refLink.href = '#';
        refLink.textContent = `${dailyProverb.book} ${dailyProverb.chapter}:${dailyProverb.verse}`;
        refLink.dataset.book = dailyProverb.book;
        refLink.dataset.chapter = dailyProverb.chapter;
        refLink.dataset.verse = dailyProverb.verse;
        refLink.addEventListener('click', handleReferenceClick);

        refElement.innerHTML = ''; // Clear previous content
        refElement.appendChild(refLink);
    }

    function handleReferenceClick(e) {
        e.preventDefault();
        const { book, chapter, verse } = e.currentTarget.dataset;
        showBibleView();
        appState.currentBook = bibleData.books.find(b => b.name === book);
        appState.currentChapter = appState.currentBook.chapters.find(c => c.chapter == chapter);
        renderVerses(appState.currentChapter, verse);
    }

    // --- Bible Browser Rendering Functions ---
    const bibleContent = document.getElementById('bible-content');
    const bibleHeader = document.getElementById('bible-header');
    const backButton = document.getElementById('back-button');

    function renderBooks() {
        bibleHeader.textContent = 'The Bible';
        bibleContent.innerHTML = `<ul class="book-list">${bibleData.books.map(book => `<li data-book="${book.name}">${book.name}</li>`).join('')}</ul>`;
        backButton.classList.add('hidden');
        
        document.querySelectorAll('.book-list li').forEach(item => {
            item.addEventListener('click', e => {
                const bookName = e.currentTarget.dataset.book;
                appState.currentBook = bibleData.books.find(b => b.name === bookName);
                renderChapters(appState.currentBook);
            });
        });
    }

    function renderChapters(book) {
        bibleHeader.textContent = book.name;
        bibleContent.innerHTML = `<ul class="chapter-grid">${book.chapters.map(chap => `<li data-chapter="${chap.chapter}">${chap.chapter}</li>`).join('')}</ul>`;
        backButton.classList.remove('hidden');

        document.querySelectorAll('.chapter-grid li').forEach(item => {
            item.addEventListener('click', e => {
                const chapterNum = e.currentTarget.dataset.chapter;
                appState.currentChapter = book.chapters.find(c => c.chapter == chapterNum);
                renderVerses(appState.currentChapter);
            });
        });
    }

    function renderVerses(chapter, highlightVerse = null) {
        bibleHeader.textContent = `${appState.currentBook.name} ${chapter.chapter}`;
        bibleContent.innerHTML = chapter.verses.map(v => 
            `<div class="verse-container" id="v${v.verse}">
                <sup>${v.verse}</sup> <p>${v.text}</p>
            </div>`
        ).join('');
        backButton.classList.remove('hidden');

        if (highlightVerse) {
            const verseElement = document.getElementById(`v${highlightVerse}`);
            if (verseElement) {
                verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                verseElement.classList.add('verse-highlight');
            }
        }
    }
    
    // --- Back Button Navigation ---
    function handleBackNavigation() {
        if (appState.currentChapter) {
            appState.currentChapter = null;
            renderChapters(appState.currentBook);
        } else if (appState.currentBook) {
            appState.currentBook = null;
            renderBooks();
        }
    }

    // --- Theme Toggle Function ---
    function toggleTheme() {
        const body = document.body;
        const themeToggleButton = document.getElementById('theme-toggle');
        if (body.classList.contains('dark-mode')) {
            body.classList.replace('dark-mode', 'light-mode');
            themeToggleButton.innerHTML = sunIconOutline; // Switched to light, show icon for dark
        } else {
            body.classList.replace('light-mode', 'dark-mode');
            themeToggleButton.innerHTML = sunIconSolid; // Switched to dark, show icon for light
        }
    }
};