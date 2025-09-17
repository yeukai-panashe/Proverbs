// --- Globals and Initial Setup ---
let bibleData = null;
const appState = {
    mode: 'books', // Can be 'books' or 'chapters'
    currentBookName: null,
};

// SVG icons
const sunIconSolid = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>`;
const sunIconOutline = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>`;

// --- Main function runs on page load ---
window.onload = function() {
    setupTheme();
    
    fetch('proverbs.json')
        .then(response => response.json())
        .then(data => {
            bibleData = data;
            renderBookList();
        })
        .catch(error => {
            console.error('Error loading the Bible data:', error);
            document.getElementById('content-header').innerText = 'Could not load data.';
        });
};

// --- Theme Management ---
function setupTheme() {
    const themeToggleButton = document.getElementById('theme-toggle');
    themeToggleButton.innerHTML = sunIconSolid; // Default dark, show light icon
    themeToggleButton.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    const body = document.body;
    const themeToggleButton = document.getElementById('theme-toggle');
    if (body.classList.contains('dark-mode')) {
        body.classList.replace('dark-mode', 'light-mode');
        themeToggleButton.innerHTML = sunIconOutline;
    } else {
        body.classList.replace('light-mode', 'dark-mode');
        themeToggleButton.innerHTML = sunIconSolid;
    }
}

// --- Navigation Rendering ---
const navList = document.getElementById('nav-list');
const navTitle = document.getElementById('nav-title');

function renderBookList() {
    appState.mode = 'books';
    navTitle.textContent = 'The Bible';
    navList.innerHTML = bibleData.books.map(book => `<li data-book="${book.name}">${book.name}</li>`).join('');
    
    // Add event listeners to the new list items
    document.querySelectorAll('#nav-list li').forEach(item => {
        item.addEventListener('click', handleNavClick);
    });
}

function renderChapterList(bookName) {
    appState.mode = 'chapters';
    appState.currentBookName = bookName;
    const book = bibleData.books.find(b => b.name === bookName);
    
    navTitle.innerHTML = `&larr; ${bookName}`;
    navTitle.style.cursor = 'pointer';
    navTitle.onclick = renderBookList; // Go back to book list on click
    
    navList.innerHTML = book.chapters.map(chap => `<li data-chapter="${chap.chapter}">${bookName} ${chap.chapter}</li>`).join('');
    
    document.querySelectorAll('#nav-list li').forEach(item => {
        item.addEventListener('click', handleNavClick);
    });

    // Automatically load the first chapter
    renderVerseContent(bookName, 1);
    highlightActiveChapter(1);
}

// --- Content Rendering ---
const contentHeader = document.getElementById('content-header');
const bibleText = document.getElementById('bible-text');

function renderVerseContent(bookName, chapterNum) {
    const book = bibleData.books.find(b => b.name === bookName);
    const chapter = book.chapters.find(c => c.chapter == chapterNum);
    
    contentHeader.textContent = `${bookName} ${chapterNum}`;
    bibleText.innerHTML = chapter.verses.map(v => `<p><sup>${v.verse}</sup>${v.text}</p>`).join('');
    bibleText.parentElement.scrollTop = 0; // Scroll to top
}

// --- Event Handlers ---
function handleNavClick(event) {
    if (appState.mode === 'books') {
        const bookName = event.target.dataset.book;
        renderChapterList(bookName);
    } else {
        const chapterNum = event.target.dataset.chapter;
        renderVerseContent(appState.currentBookName, chapterNum);
        highlightActiveChapter(chapterNum);
    }
}

function highlightActiveChapter(chapterNum) {
    // Remove active class from all items
    document.querySelectorAll('#nav-list li').forEach(item => item.classList.remove('active'));
    // Add active class to the clicked item
    const activeItem = document.querySelector(`#nav-list li[data-chapter='${chapterNum}']`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
}