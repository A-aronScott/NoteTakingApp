const API_BASE = "/api";

let authToken = localStorage.getItem("notes_auth_token");
let currentUser = JSON.parse(
    localStorage.getItem("notes_user") || "null"
);

let notes = [];
let selectedNoteId = null;
let currentView = "all";
let searchTerm = "";


// DOM Elements

const authScreen = document.getElementById("auth-screen");
const notesScreen = document.getElementById("notes-screen");

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

const loginError = document.getElementById("login-error");
const registerError = document.getElementById("register-error");

const showRegisterButton =
    document.getElementById("show-register");

const showLoginButton =
    document.getElementById("show-login");

const logoutButton =
    document.getElementById("logout-button");

const newNoteButton =
    document.getElementById("new-note-button");

const notesList =
    document.getElementById("notes-list");

const searchInput =
    document.getElementById("search-input");

const userName =
    document.getElementById("user-name");

const userEmail =
    document.getElementById("user-email");

const viewTitle =
    document.getElementById("view-title");

const noteCount =
    document.getElementById("note-count");

const emptyEditor =
    document.getElementById("empty-editor");

const noteEditor =
    document.getElementById("note-editor");

const noteTitle =
    document.getElementById("note-title");

const noteContent =
    document.getElementById("note-content");

const saveButton =
    document.getElementById("save-button");

const saveStatus =
    document.getElementById("save-status");

const pinButton =
    document.getElementById("pin-button");

const archiveButton =
    document.getElementById("archive-button");

const deleteButton =
    document.getElementById("delete-button");

const navButtons =
    document.querySelectorAll(".nav-button");


// API Helper


async function apiRequest(endpoint, options = {}) {
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(
        `${API_BASE}${endpoint}`,
        {
            ...options,
            headers
        }
    );

    let result;

    try {
        result = await response.json();
    } catch {
        result = {
            success: false,
            message: "The server returned an invalid response."
        };
    }

    if (!response.ok) {
        const error = new Error(
            result.message || "Something went wrong."
        );

        error.status = response.status;
        error.data = result;

        throw error;
    }

    return result;
}


// Authentication


function showLogin() {
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");

    loginError.textContent = "";
    registerError.textContent = "";
}

function showRegister() {
    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");

    loginError.textContent = "";
    registerError.textContent = "";
}

function showAuthenticatedScreen() {
    authScreen.classList.add("hidden");
    notesScreen.classList.remove("hidden");

    if (currentUser) {
        userName.textContent = currentUser.name;
        userEmail.textContent = currentUser.email;
    }
}

function showAuthScreen() {
    notesScreen.classList.add("hidden");
    authScreen.classList.remove("hidden");

    showLogin();
}

function saveAuthentication(data) {
    authToken = data.token;
    currentUser = data.user;

    localStorage.setItem(
        "notes_auth_token",
        authToken
    );

    localStorage.setItem(
        "notes_user",
        JSON.stringify(currentUser)
    );
}

function clearAuthentication() {
    authToken = null;
    currentUser = null;

    localStorage.removeItem("notes_auth_token");
    localStorage.removeItem("notes_user");
}


// Register


registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    registerError.textContent = "";

    const name =
        document.getElementById("register-name").value.trim();

    const email =
        document.getElementById("register-email").value.trim();

    const password =
        document.getElementById("register-password").value;

    try {
        await apiRequest("/auth/register", {
            method: "POST",
            body: JSON.stringify({
                name,
                email,
                password
            })
        });

        registerForm.reset();

        showLogin();

        loginError.textContent =
            "Account created successfully. Please sign in.";

    } catch (error) {
        registerError.textContent =
            getErrorMessage(error);
    }
});


// Login


loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    loginError.textContent = "";

    const email =
        document.getElementById("login-email").value.trim();

    const password =
        document.getElementById("login-password").value;

    try {
        const result = await apiRequest("/auth/login", {
            method: "POST",
            body: JSON.stringify({
                email,
                password
            })
        });

        saveAuthentication(result.data);

        loginForm.reset();

        showAuthenticatedScreen();

        await loadNotes();

    } catch (error) {
        loginError.textContent =
            getErrorMessage(error);
    }
});


// Logout

logoutButton.addEventListener("click", () => {
    clearAuthentication();

    notes = [];
    selectedNoteId = null;

    clearEditor();

    showAuthScreen();
});


// Load Notes


async function loadNotes() {
    try {
        const result = await apiRequest("/notes");

        notes = result.data || [];

        renderNotes();

    } catch (error) {
        if (error.status === 401) {
            clearAuthentication();

            notes = [];
            selectedNoteId = null;

            showAuthScreen();

            loginError.textContent =
                "Your session has expired. Please sign in again.";

            return;
        }

        showEditorError(
            getErrorMessage(error)
        );
    }
}


// Note Filtering


function getVisibleNotes() {
    let visibleNotes = [...notes];

    if (currentView === "pinned") {
        visibleNotes = visibleNotes.filter(
            (note) => note.isPinned
        );
    }

    if (currentView === "archived") {
        visibleNotes = visibleNotes.filter(
            (note) => note.isArchived
        );
    }

    if (searchTerm) {
        const search = searchTerm.toLowerCase();

        visibleNotes = visibleNotes.filter((note) => {
            const title =
                (note.title || "").toLowerCase();

            const content =
                (note.content || "").toLowerCase();

            const tags =
                Array.isArray(note.tags)
                    ? note.tags.join(" ").toLowerCase()
                    : "";

            return (
                title.includes(search) ||
                content.includes(search) ||
                tags.includes(search)
            );
        });
    }

    return visibleNotes;
}


// Render Notes


function renderNotes() {
    const visibleNotes = getVisibleNotes();

    notesList.innerHTML = "";

    updateViewHeader(visibleNotes.length);

    if (visibleNotes.length === 0) {
    const emptyMessage =
        document.createElement("div");

    emptyMessage.className = "empty-notes";

    emptyMessage.innerHTML = `
        <p>No notes found.</p>
    `;

    notesList.appendChild(emptyMessage);

    if (selectedNoteId) {
        clearEditor();
    }

    return;
}

    visibleNotes.forEach((note) => {
        const noteElement =
            createNoteListItem(note);

        notesList.appendChild(noteElement);
    });

    if (
        selectedNoteId &&
        !visibleNotes.some(
            (note) => note._id === selectedNoteId
        )
    ) {
        clearEditor();
    }
}

function createNoteListItem(note) {
    const item =
        document.createElement("button");

    item.type = "button";

    item.className = "note-list-item";

    if (note._id === selectedNoteId) {
        item.classList.add("active");
    }

    const title =
        document.createElement("strong");

    title.className = "note-list-title";

    title.textContent =
        note.title || "Untitled Note";

    const preview =
        document.createElement("span");

    preview.className = "note-list-preview";

    preview.textContent =
        getPreviewText(note.content);

    item.appendChild(title);
    item.appendChild(preview);

    item.addEventListener("click", () => {
        selectNote(note._id);
    });

    return item;
}

function getPreviewText(content) {
    if (!content) {
        return "No content";
    }

    const cleanContent =
        content.replace(/\s+/g, " ").trim();

    if (cleanContent.length <= 80) {
        return cleanContent;
    }

    return `${cleanContent.substring(0, 80)}...`;
}

function updateViewHeader(count) {
    const titles = {
        all: "All Notes",
        pinned: "Pinned",
        archived: "Archived"
    };

    viewTitle.textContent =
        titles[currentView];

    noteCount.textContent =
        `${count} ${count === 1 ? "note" : "notes"}`;
}


// Select Note


function selectNote(noteId) {
    const note =
        notes.find((item) => item._id === noteId);

    if (!note) {
        return;
    }

    selectedNoteId = noteId;

    emptyEditor.classList.add("hidden");
    noteEditor.classList.remove("hidden");

    noteTitle.value =
        note.title || "";

    noteContent.value =
        note.content || "";

    updateEditorButtons(note);

    saveStatus.textContent = "Saved";

    renderNotes();
}

function updateEditorButtons(note) {
    pinButton.textContent =
        note.isPinned ? "Unpin" : "Pin";

    pinButton.title =
        note.isPinned ? "Unpin note" : "Pin note";

    archiveButton.textContent =
        note.isArchived ? "Unarchive" : "Archive";

    archiveButton.title =
        note.isArchived
            ? "Unarchive note"
            : "Archive note";
}


// Create New Note


newNoteButton.addEventListener("click", async () => {
    try {
        const result = await apiRequest("/notes", {
            method: "POST",
            body: JSON.stringify({
                title: "New Note",
                content: "",
                tags: [],
                isPinned: false,
                isArchived: false
            })
        });

        const newNote = result.data;

        notes.unshift(newNote);

        selectedNoteId = newNote._id;

        currentView = "all";

        updateActiveNav();

        renderNotes();

        selectNote(newNote._id);

        noteTitle.focus();

    } catch (error) {
        showEditorError(
            getErrorMessage(error)
        );
    }
});


// Save Note


saveButton.addEventListener("click", saveCurrentNote);

async function saveCurrentNote() {
    if (!selectedNoteId) {
        return;
    }

    const title = noteTitle.value.trim();
    const content = noteContent.value;

    if (!title) {
        saveStatus.textContent =
            "Title is required.";

        noteTitle.focus();

        return;
    }

    saveButton.disabled = true;

    saveStatus.textContent = "Saving...";

    try {
        const result = await apiRequest(
            `/notes/${selectedNoteId}`,
            {
                method: "PUT",
                body: JSON.stringify({
                    title,
                    content
                })
            }
        );

        const updatedNote = result.data;

        const index =
            notes.findIndex(
                (note) =>
                    note._id === selectedNoteId
            );

        if (index !== -1) {
            notes[index] = updatedNote;
        }

        saveStatus.textContent = "Saved";

        renderNotes();

    } catch (error) {
        saveStatus.textContent =
            getErrorMessage(error);
    } finally {
        saveButton.disabled = false;
    }
}


// Pin / Unpin


pinButton.addEventListener("click", async () => {
    const note = getSelectedNote();

    if (!note) {
        return;
    }

    try {
        const result = await apiRequest(
            `/notes/${note._id}`,
            {
                method: "PUT",
                body: JSON.stringify({
                    isPinned: !note.isPinned
                })
            }
        );

        updateNoteInState(result.data);

        selectNote(result.data._id);

    } catch (error) {
        showEditorError(
            getErrorMessage(error)
        );
    }
});


// Archive / Unarchive


archiveButton.addEventListener(
    "click",
    async () => {
        const note = getSelectedNote();

        if (!note) {
            return;
        }

        try {
            const result = await apiRequest(
                `/notes/${note._id}`,
                {
                    method: "PUT",
                    body: JSON.stringify({
                        isArchived: !note.isArchived
                    })
                }
            );

            updateNoteInState(result.data);

            selectNote(result.data._id);

        } catch (error) {
            showEditorError(
                getErrorMessage(error)
            );
        }
    }
);


// Delete Note


deleteButton.addEventListener(
    "click",
    async () => {
        const note = getSelectedNote();

        if (!note) {
            return;
        }

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this note?"
            );

        if (!confirmed) {
            return;
        }

        try {
            await apiRequest(
                `/notes/${note._id}`,
                {
                    method: "DELETE"
                }
            );

            notes =
                notes.filter(
                    (item) =>
                        item._id !== note._id
                );

            selectedNoteId = null;

            clearEditor();

            renderNotes();

        } catch (error) {
            showEditorError(
                getErrorMessage(error)
            );
        }
    }
);


// Search


searchInput.addEventListener(
    "input",
    (event) => {
        searchTerm =
            event.target.value.trim();

        renderNotes();
    }
);


// Navigation

navButtons.forEach((button) => {
    button.addEventListener(
        "click",
        () => {
            currentView =
                button.dataset.view;

            updateActiveNav();

            renderNotes();
        }
    );
});

function updateActiveNav() {
    navButtons.forEach((button) => {
        button.classList.toggle(
            "active",
            button.dataset.view === currentView
        );
    });
}


// Editor Helpers


function getSelectedNote() {
    return notes.find(
        (note) =>
            note._id === selectedNoteId
    );
}

function updateNoteInState(updatedNote) {
    const index =
        notes.findIndex(
            (note) =>
                note._id === updatedNote._id
        );

    if (index !== -1) {
        notes[index] = updatedNote;
    }
}

function clearEditor() {
    selectedNoteId = null;

    noteEditor.classList.add("hidden");
    emptyEditor.classList.remove("hidden");

    noteTitle.value = "";
    noteContent.value = "";

    saveStatus.textContent = "Saved";
}

function showEditorError(message) {
    saveStatus.textContent = message;
}


// Error Handling


function getErrorMessage(error) {
    if (
        error.data &&
        error.data.errors
    ) {
        const errors =
            Object.values(error.data.errors);

        if (errors.length > 0) {
            return errors.join(" ");
        }
    }

    return error.message ||
        "Something went wrong. Please try again.";
}


// Authentication State on Load


async function initializeApp() {
    if (!authToken) {
        showAuthScreen();
        return;
    }

    showAuthenticatedScreen();

    await loadNotes();
}

showRegisterButton.addEventListener(
    "click",
    showRegister
);

showLoginButton.addEventListener(
    "click",
    showLogin
);

initializeApp();