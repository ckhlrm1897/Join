/**
 * @module contacts
 * Firebase Realtime Database contact utilities.
 */

// DOM references for use in this module and for export
export const listEl = document.getElementById("contacts-list");
export const detailBox = document.getElementById("contact-detail");

const FIREBASE_URL = "https://join-19b54-default-rtdb.europe-west1.firebasedatabase.app/";
const DB_CONTACTS = "contacts";
const DB_USERS = "users";
let contacts = [];
let users = [];
let lastSelectedItem = null;
let taskProfil;
let sortedContacts;


/**
 * Returns initials from full name or '??' if not valid.
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name) {
  if (!name || typeof name !== "string") return "??";
  return name
    .trim()
    .split(/\s+/)
    .map(p => p[0]?.toUpperCase() || "")
    .join("")
    .substring(0, 2);
}

/**
 * Generates a HSL color string from a string input.
 * @param {string} str
 * @returns {string}
 */
export function stringToColor(str) {
  let hash = 0;
  for (const c of str) hash = (hash << 5) - hash + c.charCodeAt(0);
  return `hsl(${hash % 360}, 70%, 50%)`;
}

/**
 * Fetch all contacts from Firebase.
 * @returns {Promise<Array>} contacts
 */
export async function fetchContacts() {
  const data = await loadFromDatabase(DB_CONTACTS);
  return Object.entries(data || {}).map(([id, entry]) => ({ id, ...entry }));
}

/**
 * Fetch all contacts from Firebase.
 * @returns {Promise<Array>} contacts
 */
export async function fetchUsers() {
  const data = await loadFromDatabase(DB_USERS);
  return Object.entries(data || {}).map(([id, entry]) => ({ id, ...entry }));
}

/**
 * Create a new contact in Firebase.
 * @param {{name:string,email:string,phone:string}} contact
 * @returns {Promise<{name:string}>}
 */
export async function createContact(contact) {
  return await postToDatabase(DB_CONTACTS, contact);
}

/**
 * Update a contact by id.
 * @param {string} id
 * @param {object} data
 */
export async function updateContact(id, data) {
  await updateOnDatabase(`${DB_CONTACTS}/${id}`, data);
}

/**
 * Delete a contact by id.
 * @param {string} id
 */
export async function deleteContact(id) {
  await deleteFromDatabase(`${DB_CONTACTS}/${id}`);
  showToast("Contact successfully deleted");
}

/**
 * Load JSON data from database.
 * @param {string} path
 * @returns {Promise<object>}
 */
async function loadFromDatabase(path) {
  const res = await fetch(`${FIREBASE_URL}${path}.json`);
  return await res.json();
}

/**
 * Post data to database.
 * @param {string} path
 * @param {object} data
 * @returns {Promise<object>}
 */
async function postToDatabase(path, data) {
  const res = await fetch(`${FIREBASE_URL}${path}.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
}

/**
 * Put (overwrite) data in database.
 * @param {string} path
 * @param {object} data
 * @returns {Promise<object>}
 */
async function updateOnDatabase(path, data) {
  const res = await fetch(`${FIREBASE_URL}${path}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
}

/**
 * Delete data from database.
 * @param {string} path
 * @returns {Promise<object>}
 */
async function deleteFromDatabase(path) {
  const res = await fetch(`${FIREBASE_URL}${path}.json`, { method: "DELETE" });
  return await res.json();
}

/**
 * Display a toast message.
 * @param {string} message
 */
export function showToast(message) {
  const container = document.getElementById("toast-container");
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = message;
  container.appendChild(t);
  setTimeout(() => container.removeChild(t), 3000);
}

/**
 * Renders all contacts into the DOM.
 */
export async function renderContacts() {
  contacts = await fetchContacts();
  users = await fetchUsers();
  listEl.innerHTML = "";
  const grouped = groupContacts();
  renderContactSections(grouped, listEl);
}

/**
 * Groups contacts by initial letter.
 * @returns {object}
 */
function groupContacts() {
  sortedContacts = [...(contacts ?? []), ...(users ?? [])].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const groupedContacts = {};
  for (const contact of sortedContacts) {
    const firstLetter = contact.name[0].toUpperCase();
    if (!groupedContacts[firstLetter]) {
      groupedContacts[firstLetter] = [];
    }
    groupedContacts[firstLetter].push(contact);
  }
  return groupedContacts;
}

/**
 * Renders contact sections in the DOM.
 * @param {object} grouped
 * @param {HTMLElement} parent
 */
function renderContactSections(grouped, parent) {
  for (const L in grouped) {
    const section = document.createElement("div");
    section.className = "contact_section";
    section.innerHTML = `<div class="contact_initial">${L}</div>`;
    grouped[L].forEach(c => {
      section.appendChild(createContactListItem(c));
    });
    parent.appendChild(section);
  }
  highlightTaskProfilUser();
}

/**
 * Creates a contact list item element.
 * @param {object} c
 * @returns {HTMLElement}
 */
function createContactListItem(c) {
  const item = document.createElement("div");
  item.className = "contact-list-item";
  item.id = c.id;
  item.innerHTML = `
    <div class="contact_left">
      <div class="contact_circle">${getInitials(c.name)}</div>
      <div class="contact_details">
        <div class="contact_name">${c.name}</div>
        <div class="contact_email">${c.email}</div>
      </div>
    </div>`;
  item.querySelector(".contact_circle").style.backgroundColor = stringToColor(c.name);
  item.addEventListener("click", () => showContactDetails(c, item));
  return item;
}

/**
 * Shows details for a contact.
 * @param {object} contact
 * @param {HTMLElement} itemEl
 */
export async function showContactDetails(contact, itemEl) {
  highlightContactItem(itemEl);
  fillContactDetailPanel(contact);
  // The following helpers are exported from UI file and should be wired there:
  if (window.checkAndRenderMobileView) window.checkAndRenderMobileView();
  if (window.setupEditDeleteButtons) window.setupEditDeleteButtons(contact);
  if (window.setupEditDeleteButtonsMobile) window.setupEditDeleteButtonsMobile(contact);
}

/**
 * Highlights the selected contact item in the UI.
 * @param {HTMLElement} itemEl
 */
function highlightContactItem(itemEl) {
  if (lastSelectedItem) lastSelectedItem.classList.remove("contact_list_item_active");
  itemEl.classList.add("contact_list_item_active");
  lastSelectedItem = itemEl;
}

/**
 * Fills the contact detail panel.
 * @param {object} contact
 */
function fillContactDetailPanel(contact) {
  detailBox.classList.remove("d_none");
  document.getElementById("detail-initials").textContent = getInitials(contact.name);
  document.getElementById("detail-initials").style.backgroundColor = stringToColor(contact.name);
  document.getElementById("detail-name").textContent = contact.name;
  const emailEl = document.getElementById("detail-email");
  emailEl.textContent = contact.email;
  emailEl.href = `mailto:${contact.email}`;
  document.getElementById("detail-phone").textContent = contact.phone;
}

/**
 * Fills the form fields with contact data.
 * @param {object} contact
 */
export function fillContactFormFields(contact) {
  ["name", "email", "phone"].forEach(f =>
    document.getElementById(`contact-${f}field`).value = contact[f]
  );
}

/**
 * Updates the initials preview in the edit overlay.
 * @param {string} name
 */
export function updateContactInitialsPreview(name) {
  const ic = document.getElementById("edit-contact-initials");
  ic.textContent = getInitials(name);
  ic.style.backgroundColor = stringToColor(name);
}

/**
 * Gets contact values from form fields.
 * @returns {object}
 */
export function getContactFormValues() {
  return {
    name: document.getElementById("contact-namefield").value.trim(),
    email: document.getElementById("contact-emailfield").value.trim(),
    phone: document.getElementById("contact-phonefield").value.trim()
  };
}

function checkLocalStorage() {
  let current_profil = JSON.parse(localStorage.getItem("current_profil"))
  if (current_profil) {
    taskProfil = current_profil.taskCreator
    return true
  }
  
}

function highlightTaskProfilUser() {
  if (checkLocalStorage()) {
    let thisUser = sortedContacts.find(user => user.name === taskProfil)
    fillContactDetailPanel(thisUser);
    // The following helpers are exported from UI file and should be wired there:
    if (window.checkAndRenderMobileView) window.checkAndRenderMobileView();
    if (window.setupEditDeleteButtons) window.setupEditDeleteButtons(thisUser);
    if (window.setupEditDeleteButtonsMobile) window.setupEditDeleteButtonsMobile(thisUser);
    let userId = document.getElementById(`${thisUser.id}`)
    highlightContactItem(userId);
  }

}