// ============================================================
// Secure Exam — script.js
// Handles: Auth (login/signup), Exam logic, Timer,
//          Anti-cheat, Submission, Results
// ============================================================

'use strict';

// ============================================================
// 1. DETERMINE CURRENT PAGE
// ============================================================
const IS_DASHBOARD = document.body.classList.contains('dashboard-page');
const IS_AUTH      = document.body.classList.contains('auth-page');

// ============================================================
// 2. QUESTION BANK (30 questions, 10 picked randomly each time)
// ============================================================
const QUESTION_BANK = [
    {
        question: "Which data structure uses LIFO (Last In First Out) order?",
        options: ["Queue", "Stack", "Linked List", "Tree"],
        answer: 1
    },
    {
        question: "What does HTML stand for?",
        options: ["HyperText Markup Language", "High Transfer Markup Language", "HyperText Machine Language", "None of the above"],
        answer: 0
    },
    {
        question: "Which programming language is known as the 'backbone of the web'?",
        options: ["Python", "Java", "JavaScript", "C++"],
        answer: 2
    },
    {
        question: "What is the time complexity of binary search?",
        options: ["O(n)", "O(n²)", "O(log n)", "O(1)"],
        answer: 2
    },
    {
        question: "Which tag is used to link an external CSS file in HTML?",
        options: ["<style>", "<script>", "<link>", "<css>"],
        answer: 2
    },
    {
        question: "What does CSS stand for?",
        options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style System", "Colorful Style Sheets"],
        answer: 1
    },
    {
        question: "Which keyword declares a constant in JavaScript?",
        options: ["var", "let", "const", "static"],
        answer: 2
    },
    {
        question: "What is the primary key in a database?",
        options: ["A key that links two tables", "A key used for encryption", "A unique identifier for each record", "A foreign key"],
        answer: 2
    },
    {
        question: "Which HTTP method is used to send data to a server?",
        options: ["GET", "POST", "DELETE", "HEAD"],
        answer: 1
    },
    {
        question: "What does SQL stand for?",
        options: ["Structured Query Language", "Sequential Query List", "System Query Logic", "Structured Queue Layer"],
        answer: 0
    },
    {
        question: "Which of the following is NOT a JavaScript data type?",
        options: ["String", "Boolean", "Character", "Undefined"],
        answer: 2
    },
    {
        question: "What does 'npm' stand for in Node.js?",
        options: ["Node Package Module", "Node Package Manager", "New Package Module", "None of the above"],
        answer: 1
    },
    {
        question: "Which sorting algorithm has the best average-case time complexity?",
        options: ["Bubble Sort", "Selection Sort", "Quick Sort", "Insertion Sort"],
        answer: 2
    },
    {
        question: "What does API stand for?",
        options: ["Application Programming Interface", "Automated Program Interaction", "Application Process Integration", "Advanced Programming Index"],
        answer: 0
    },
    {
        question: "Which symbol is used for single-line comments in JavaScript?",
        options: ["/* */", "#", "//", "--"],
        answer: 2
    },
    {
        question: "What is the default port for HTTP?",
        options: ["443", "21", "22", "80"],
        answer: 3
    },
    {
        question: "Which operator checks both value AND type in JavaScript?",
        options: ["==", "===", "!=", "="],
        answer: 1
    },
    {
        question: "What does DOM stand for in web development?",
        options: ["Document Object Model", "Data Object Manager", "Dynamic Object Module", "Document Order Map"],
        answer: 0
    },
    {
        question: "Which MySQL command retrieves data from a table?",
        options: ["INSERT", "UPDATE", "SELECT", "DELETE"],
        answer: 2
    },
    {
        question: "What is bcrypt used for?",
        options: ["Encrypting files", "Hashing passwords", "Compressing data", "Encoding images"],
        answer: 1
    },
    {
        question: "Which CSS property makes an element invisible but still occupies space?",
        options: ["display: none", "visibility: hidden", "opacity: 0", "Both B and C"],
        answer: 1
    },
    {
        question: "Which of the following is a NoSQL database?",
        options: ["MySQL", "PostgreSQL", "MongoDB", "SQLite"],
        answer: 2
    },
    {
        question: "What does JSON stand for?",
        options: ["JavaScript Object Notation", "Java Serialized Object Network", "JavaScript Online Notation", "None of the above"],
        answer: 0
    },
    {
        question: "Which HTML attribute is used to link a JavaScript file?",
        options: ["href", "rel", "src", "link"],
        answer: 2
    },
    {
        question: "What is the result of typeof null in JavaScript?",
        options: ["null", "undefined", "object", "boolean"],
        answer: 2
    },
    {
        question: "Which CSS unit is relative to the viewport width?",
        options: ["px", "em", "rem", "vw"],
        answer: 3
    },
    {
        question: "What is a foreign key in a database?",
        options: ["A key from another country", "A key that references the primary key of another table", "An encrypted key", "A unique identifier"],
        answer: 1
    },
    {
        question: "Which method adds an element to the END of an array in JavaScript?",
        options: ["push()", "pop()", "shift()", "unshift()"],
        answer: 0
    },
    {
        question: "What does the Visibility API use to detect tab changes?",
        options: ["window.focus", "document.visibilityState", "navigator.online", "screen.active"],
        answer: 1
    },
    {
        question: "Which Express.js method handles GET requests?",
        options: ["app.post()", "app.get()", "app.use()", "app.send()"],
        answer: 1
    }
];

// ============================================================
// 3. EXAM STATE
// ============================================================
let questions      = [];      // 10 randomly selected questions
let currentQ       = 0;       // current question index
let userAnswers    = [];       // stores user's selected answers
let timerInterval  = null;    // reference to countdown interval
let timeLeft       = 600;     // 10 minutes in seconds
let examStarted    = false;   // has the exam started?
let examSubmitted  = false;   // has exam been submitted?
let userName       = '';      // logged-in user's name

// ============================================================
// 4. INITIALISE BASED ON PAGE
// ============================================================
if (IS_DASHBOARD) {
    initDashboard();
}

// ============================================================
// 5. AUTH PAGE FUNCTIONS (index.html)
// ============================================================

/** Switch between Login and Signup tabs */
function switchTab(tab) {
    document.getElementById('login-panel').classList.toggle('hidden', tab !== 'login');
    document.getElementById('signup-panel').classList.toggle('hidden', tab !== 'signup');
    document.getElementById('tab-login').classList.toggle('active', tab === 'login');
    document.getElementById('tab-signup').classList.toggle('active', tab === 'signup');
    // Clear alerts when switching
    document.getElementById('login-alert').innerHTML = '';
    document.getElementById('signup-alert').innerHTML = '';
}

/** Display an alert message inside the form */
function showAlert(containerId, message, type) {
    document.getElementById(containerId).innerHTML =
        `<div class="alert alert-${type}">${message}</div>`;
}

/** Handle Login form submission */
async function handleLogin() {
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn      = document.getElementById('login-btn');

    // Client-side validation
    if (!email || !password) {
        return showAlert('login-alert', 'Please fill in all fields.', 'error');
    }
    if (!isValidEmail(email)) {
        return showAlert('login-alert', 'Please enter a valid email address.', 'error');
    }

    // Disable button while loading
    btn.disabled = true;
    btn.innerHTML = '<span>Logging in...</span>';

    try {
        const res  = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (data.success) {
            showAlert('login-alert', '✅ Login successful! Redirecting...', 'success');
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
        } else {
            showAlert('login-alert', '❌ ' + data.message, 'error');
            btn.disabled = false;
            btn.innerHTML = '<span>Login to Exam Portal</span><span>→</span>';
        }
    } catch (err) {
        showAlert('login-alert', '❌ Server error. Make sure the server is running.', 'error');
        btn.disabled = false;
        btn.innerHTML = '<span>Login to Exam Portal</span><span>→</span>';
    }
}

/** Handle Signup form submission */
async function handleSignup() {
    const name     = document.getElementById('signup-name').value.trim();
    const email    = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const btn      = document.getElementById('signup-btn');

    // Client-side validation
    if (!name || !email || !password) {
        return showAlert('signup-alert', 'Please fill in all fields.', 'error');
    }
    if (name.length < 2) {
        return showAlert('signup-alert', 'Name must be at least 2 characters.', 'error');
    }
    if (!isValidEmail(email)) {
        return showAlert('signup-alert', 'Please enter a valid email address.', 'error');
    }
    if (password.length < 6) {
        return showAlert('signup-alert', 'Password must be at least 6 characters.', 'error');
    }

    btn.disabled = true;
    btn.innerHTML = '<span>Creating account...</span>';

    try {
        const res  = await fetch('/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();

        if (data.success) {
            showAlert('signup-alert', '✅ ' + data.message, 'success');
            // Switch to login tab after 1.5s
            setTimeout(() => {
                switchTab('login');
                document.getElementById('login-email').value = email;
            }, 1500);
        } else {
            showAlert('signup-alert', '❌ ' + data.message, 'error');
        }
    } catch (err) {
        showAlert('signup-alert', '❌ Server error. Make sure the server is running.', 'error');
    }

    btn.disabled = false;
    btn.innerHTML = '<span>Create Account</span><span>→</span>';
}

/** Simple email validation */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ============================================================
// 6. DASHBOARD INIT
// ============================================================
async function initDashboard() {
    try {
        // Check if user is logged in via session
        const res  = await fetch('/session');
        const data = await res.json();

        if (!data.loggedIn) {
            // Not logged in — redirect to login page
            window.location.href = 'index.html';
            return;
        }

        // User is logged in — store their name
        userName = data.user.name;
        document.getElementById('user-name').textContent = userName;

        // Hide loading screen, show header, show warning modal
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('exam-header').classList.remove('hidden');
        document.getElementById('warning-modal').classList.remove('hidden');

    } catch (err) {
        // Server not reachable
        document.getElementById('loading-screen').innerHTML =
            '<p style="color:var(--danger)">❌ Could not connect to server.<br>Please start server.js</p>';
    }
}

// ============================================================
// 7. EXAM START
// ============================================================
function startExam() {
    // Close warning modal
    document.getElementById('warning-modal').classList.add('hidden');

    // Pick 10 random questions from the bank (shuffled)
    questions    = shuffleArray([...QUESTION_BANK]).slice(0, 10);
    userAnswers  = new Array(10).fill(null);
    currentQ     = 0;
    examStarted  = true;
    examSubmitted = false;

    // Show exam section
    document.getElementById('exam-section').classList.remove('hidden');

    // Render first question
    renderQuestion(0);

    // Start countdown timer
    startTimer();

    // Start anti-cheat monitoring
    startAntiCheat();
}

// ============================================================
// 8. QUESTION RENDERING
// ============================================================
function renderQuestion(index) {
    const q = questions[index];
    if (!q) return;

    // Update question number
    document.getElementById('q-number').textContent =
        `QUESTION ${index + 1} / ${questions.length}`;
    document.getElementById('q-text').textContent = q.question;

    // Option keys (A, B, C, D)
    const keys = ['A', 'B', 'C', 'D'];

    // Build options HTML
    let html = '';
    q.options.forEach((opt, i) => {
        const isSelected = userAnswers[index] === i;
        html += `
        <label class="option-label ${isSelected ? 'selected' : ''}" id="opt-${i}">
            <input
                type="radio"
                name="question-${index}"
                value="${i}"
                ${isSelected ? 'checked' : ''}
                onchange="selectAnswer(${i})"
            />
            <span class="option-key">${keys[i]}</span>
            <span>${opt}</span>
        </label>`;
    });

    document.getElementById('q-options').innerHTML = html;

    // Update progress
    updateProgress();
}

/** Store user's selected answer */
function selectAnswer(optionIndex) {
    userAnswers[currentQ] = optionIndex;
    // Re-render to highlight selected option
    renderQuestion(currentQ);
}

/** Move to next or previous question */
function changeQuestion(direction) {
    const newIndex = currentQ + direction;
    if (newIndex < 0 || newIndex >= questions.length) return;
    currentQ = newIndex;
    renderQuestion(currentQ);
}

/** Update progress bar and labels */
function updateProgress() {
    const answered = userAnswers.filter(a => a !== null).length;
    const total    = questions.length;
    const percent  = Math.round((answered / total) * 100);

    document.getElementById('progress-label').textContent =
        `Question ${currentQ + 1} of ${total}`;
    document.getElementById('progress-percent').textContent =
        `${percent}% answered`;
    document.getElementById('progress-fill').style.width = percent + '%';
    document.getElementById('answered-count').textContent =
        `${answered} / ${total} answered`;

    // Show/hide Prev button
    document.getElementById('btn-prev').style.visibility =
        currentQ === 0 ? 'hidden' : 'visible';
    // Show/hide Next button
    document.getElementById('btn-next').style.visibility =
        currentQ === total - 1 ? 'hidden' : 'visible';
}

// ============================================================
// 9. TIMER
// ============================================================
function startTimer() {
    timeLeft = 600; // 10 minutes
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            submitExam(true, 'time-up');
        }
    }, 1000);
}

function updateTimerDisplay() {
    const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const secs = String(timeLeft % 60).padStart(2, '0');
    const display = document.getElementById('timer-display');
    const box     = document.getElementById('timer-box');

    if (display) display.textContent = `${mins}:${secs}`;

    // Change colour as time runs out
    if (box) {
        box.className = 'timer-box';
        if (timeLeft <= 60)       box.classList.add('danger');
        else if (timeLeft <= 180) box.classList.add('warning');
    }
}

// ============================================================
// 10. ANTI-CHEAT: Tab Switch / Minimize Detection
// ============================================================
function startAntiCheat() {

    // ── Visibility API: detects tab switch & minimize ──────
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // ── Right-click disabled ───────────────────────────────
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });

    // ── Copy/Paste/Cut disabled ────────────────────────────
    document.addEventListener('copy',  (e) => e.preventDefault());
    document.addEventListener('paste', (e) => e.preventDefault());
    document.addEventListener('cut',   (e) => e.preventDefault());

    // ── Keyboard shortcuts disabled ────────────────────────
    document.addEventListener('keydown', (e) => {
        // Disable F12 (DevTools)
        if (e.key === 'F12') { e.preventDefault(); return false; }
        // Disable Ctrl+Shift+I / Ctrl+U / Ctrl+S / Ctrl+A
        if (e.ctrlKey && ['u', 'U', 's', 'S', 'a', 'A'].includes(e.key)) {
            e.preventDefault(); return false;
        }
        // Disable Ctrl+Shift+C / Ctrl+Shift+J (DevTools)
        if (e.ctrlKey && e.shiftKey && ['i', 'I', 'c', 'C', 'j', 'J'].includes(e.key)) {
            e.preventDefault(); return false;
        }
    });
}

/** Called when document visibility changes */
function handleVisibilityChange() {
    if (!examStarted || examSubmitted) return;

    if (document.visibilityState === 'hidden') {
        // User switched tab or minimized
        submitExam(true, 'tab-switch');
    }
}

// ============================================================
// 11. CONFIRM SUBMIT MODAL
// ============================================================
function confirmSubmit() {
    const answered = userAnswers.filter(a => a !== null).length;
    const unanswered = questions.length - answered;

    let msg = `You have answered <strong>${answered} of ${questions.length}</strong> questions.`;
    if (unanswered > 0) {
        msg += `<br><br>⚠️ <strong>${unanswered} question(s) unanswered</strong> will be marked wrong.`;
    }
    msg += `<br><br>Are you sure you want to submit?`;

    document.getElementById('confirm-msg').innerHTML = msg;
    document.getElementById('confirm-modal').classList.remove('hidden');
}

function closeConfirmModal() {
    document.getElementById('confirm-modal').classList.add('hidden');
}

// ============================================================
// 12. EXAM SUBMISSION
// ============================================================
async function submitExam(auto = false, reason = '') {
    if (examSubmitted) return; // prevent double-submit
    examSubmitted = true;
    examStarted   = false;

    // Stop the timer
    if (timerInterval) clearInterval(timerInterval);

    // Remove anti-cheat listeners
    document.removeEventListener('visibilitychange', handleVisibilityChange);

    // Close any open modals
    document.getElementById('confirm-modal').classList.add('hidden');

    // Show violation modal if auto-submitted
    if (auto && reason === 'tab-switch') {
        document.getElementById('violation-modal').classList.remove('hidden');
        return; // wait for user to click "View Result"
    }

    // Calculate score
    await finaliseSubmission(auto, reason);
}

/** Called after violation modal is acknowledged OR on normal submit */
async function finaliseSubmission(auto = false, reason = '') {
    // Calculate score
    let score = 0;
    questions.forEach((q, i) => {
        if (userAnswers[i] === q.answer) score++;
    });

    const total      = questions.length;
    const percentage = ((score / total) * 100).toFixed(2);

    // Send result to server
    try {
        await fetch('/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ score, total })
        });
    } catch (err) {
        // If server fails, still show result to user
        console.error('Could not save result:', err);
    }

    // Show result screen
    showResult(score, total, percentage, auto, reason);
}

/** Called when user clicks "View Result" in violation modal */
async function closeViolationModal() {
    document.getElementById('violation-modal').classList.add('hidden');
    await finaliseSubmission(true, 'tab-switch');
}

// ============================================================
// 13. RESULT SCREEN
// ============================================================
function showResult(score, total, percentage, auto, reason) {
    // Hide exam section
    document.getElementById('exam-section').classList.add('hidden');

    // Show result section
    const resultSection = document.getElementById('result-section');
    resultSection.classList.remove('hidden');

    // Fill in values
    document.getElementById('res-score').textContent   = score;
    document.getElementById('res-total').textContent   = total;
    document.getElementById('res-percent').textContent = percentage + '%';

    const passed = parseFloat(percentage) >= 50;
    const badge  = document.getElementById('result-badge');
    const title  = document.getElementById('result-title');
    const sub    = document.getElementById('result-subtitle');

    if (auto && reason === 'tab-switch') {
        badge.textContent = '🚨';
        badge.className   = 'result-badge fail';
        title.textContent = 'Exam Auto-Submitted';
        sub.textContent   = 'Your exam was submitted due to a rule violation.';
    } else if (auto && reason === 'time-up') {
        badge.textContent = '⏰';
        badge.className   = 'result-badge ' + (passed ? 'pass' : 'fail');
        title.textContent = 'Time\'s Up!';
        sub.textContent   = 'Your exam was auto-submitted when the timer ran out.';
    } else if (passed) {
        badge.textContent = '🏆';
        badge.className   = 'result-badge pass';
        title.textContent = 'Congratulations!';
        sub.textContent   = `Great job, ${userName}! You passed the exam.`;
    } else {
        badge.textContent = '📚';
        badge.className   = 'result-badge fail';
        title.textContent = 'Better Luck Next Time';
        sub.textContent   = `Keep practicing, ${userName}. You can do it!`;
    }

    // Color the percentage
    const pEl = document.getElementById('res-percent');
    if (parseFloat(percentage) >= 70)      pEl.style.color = 'var(--success)';
    else if (parseFloat(percentage) >= 50) pEl.style.color = 'var(--warning)';
    else                                   pEl.style.color = 'var(--danger)';
}

// ============================================================
// 14. UTILITY: Shuffle Array (Fisher-Yates)
// ============================================================
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// ============================================================
// 15. ALLOW ENTER KEY FOR LOGIN/SIGNUP FORMS
// ============================================================
if (IS_AUTH) {
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        const loginPanel  = document.getElementById('login-panel');
        const signupPanel = document.getElementById('signup-panel');
        if (loginPanel  && !loginPanel.classList.contains('hidden'))  handleLogin();
        if (signupPanel && !signupPanel.classList.contains('hidden')) handleSignup();
    });
}