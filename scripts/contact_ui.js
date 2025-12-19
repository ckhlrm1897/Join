/**
 * @module contacts-ui
 * UI and validation logic for the contacts module.
 */
import {
  listEl,
  detailBox,
  getInitials,
  stringToColor,
  renderContacts,
  createContact,
  fillContactFormFields,
  updateContactInitialsPreview,
  getContactFormValues,
  showContactDetails,
  showToast
} from "./contacts.js";

const backBtnMobile = document.getElementById('btn-contacts-back');
const mobileDetailContactView = document.getElementById('contacts-overview');
const contactEditMobileBtn = document.querySelector('.contact_edit_mobile_btn');
const addContactMobileBtn = document.querySelector('.add_contact_btn');
const mobileEditContactsNav = document.querySelector('.edit_contacts_mobile_nav');
const editContactMobileBtn = document.querySelector('#edit-contacts-mobile-view');
const deleteContactMobileBtn = document.querySelector('#delete-contacts-mobile-view');
let lastSelectedItem = null;

/**
 * Validates a contact form input, shows/hides errors.
 * @param {string} inputId
 */
window.validateInput = function (inputId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(`error-${inputId}`);
  const nameField = document.getElementById("contact-namefield");
  const emailField = document.getElementById("contact-emailfield");
  const phoneField = document.getElementById("contact-phonefield");
  if (!input || !error) return;
  const value = input.value.trim();
  let valid = true;
  if (inputId.includes("name")) valid = validateName(value, nameField, error);
  if (inputId.includes("email")) valid = validateEmail(value, emailField, error);
  if (inputId.includes("phone")) valid = validatePhone(value, phoneField, error);
  if (valid) hideInputError(error);
};

/**
 * Validates name input.
 */
function validateName(value, input, error) {
  const namePattern = /^[A-Za-zÄÖÜäöüß]{2,}(?: [A-Za-zÄÖÜäöüß]{2,})+$/;
  if (!namePattern.test(value)) {
    showContactInputError(input, "Please enter full name");
    error.textContent = "Please enter full name";
    error.classList.remove("d_none");
    return false;
  }
  return true;
}

/**
 * Validates email input.
 */
function validateEmail(value, input, error) {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailPattern.test(value)) {
    showContactInputError(input, "Please enter e-mail");
    error.textContent = "Please enter e-mail";
    error.classList.remove("d_none");
    return false;
  }
  return true;
}

/**
 * Validates phone input.
 */
function validatePhone(value, input, error) {
  const phonePattern = /^\+?[0-9]{4,15}$/;
  if (!phonePattern.test(value)) {
    showContactInputError(input, "Please enter a phone number");
    error.textContent = "Please enter a phone number";
    error.classList.remove("d_none");
    return false;
  }
  return true;
}

/**
 * Hides the input error.
 * @param {HTMLElement} error
 */
function hideInputError(error) {
  error.textContent = "";
  error.classList.add("d_none");
}

/**
 * Opens the "Add Contact" overlay and processes the form.
 */
window.openAddContactOverlay = async function () {
  await loadFormIntoOverlay("./templates/new_contact.html");
  slideInOverlay();
  document.getElementById("addnew-contact-form").onsubmit = async e => {
    e.preventDefault();
    const contact = getContactFormValues();
    contact.phone = normalizePhone(contact.phone);
    try {
      const res = await createContact(contact);
      handleContactCreated(res, contact);
    } catch {
      showToast("Error creating contact");
    }
  };
};

/**
 * Handles logic after new contact created.
 * @param {object} res - Response from database.
 * @param {object} contact - The new contact object.
 */
function handleContactCreated(res, contact) {
  const newId = res.name;
  closeOverlay();
  renderContacts();
  showToast("Contact successfully created");
  contact.id = newId;
  const newItem = document.querySelector(`.contact-list-item[id="${newId}"]`);
  if (newItem) showContactDetails(contact, newItem);
}

/**
 * Validates and submits a new contact.
 */
window.submitNewContact = async function () {
  if (validateNewContactForm()) {
    const contact = getContactFormValues();
    contact.phone = normalizePhone(contact.phone);
    try {
      const res = await createContact(contact);
      handleContactCreated(res, contact);
    } catch {
      showToast("Error creating contact");
    }
  } else {
    showToast("Please fix the errors in the form");
  }
};

/**
 * Validates the new contact form and shows errors.
 * @returns {boolean}
 */
function validateNewContactForm() {
  let isValid = true;
  const nameField = document.getElementById("contact-namefield");
  const emailField = document.getElementById("contact-emailfield");
  const phoneField = document.getElementById("contact-phonefield");
  clearContactInputErrors();
  if (!/^(?=.{3,})([A-Za-zÄÖÜäöüß]+(?:\s+[A-Za-zÄÖÜäöüß]+)+)$/.test(nameField.value.trim())) {
    showContactInputError(nameField, "Please enter full name");
    isValid = false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value.trim())) {
    showContactInputError(emailField, "Please enter e-mail");
    isValid = false;
  }
  if (!/^\+?[0-9]{4,15}$/.test(phoneField.value.trim())) {
    showContactInputError(phoneField, "Please enter a phone number");
    isValid = false;
  }
  return isValid;
}

/**
 * Shows an error for an invalid input field.
 * @param {HTMLInputElement} inputElement
 * @param {string} message
 */
function showContactInputError(inputElement, message) {
  inputElement.classList.add("input_error_border");
  const errorContainer = inputElement.parentElement.querySelector(".input_error");
  if (errorContainer) {
    errorContainer.textContent = message;
  }
}

/**
 * Removes all error highlights from contact form fields.
 */
function clearContactInputErrors() {
  document.querySelectorAll(".input_error_border").forEach(el => {
    el.classList.remove("input_error_border");
  });
  document.querySelectorAll(".input_error").forEach(el => {
    el.textContent = "";
  });
}

/**
 * Normalizes a phone number string.
 * @param {string} rawRaw
 * @returns {string}
 */
function normalizePhone(rawRaw) {
  let s = rawRaw.replace(/[^\d+]/g, "");
  if (s.startsWith("00")) s = "+" + s.slice(2);
  if (s.startsWith("+")) return s;
  if (s.startsWith("0")) s = s.slice(1);
  return "+49" + s;
}

/**
 * Hides the contact detail panel.
 */
export function hideContactDetailsArea() {
  detailBox.classList.add("d_none");
  if (lastSelectedItem) {
    lastSelectedItem.classList.remove("contact_list_item_active");
    lastSelectedItem = null;
  }
}

/**
 * Event listener for the mobile back button.
 * Hides the mobile detail contact view and toggles button visibility.
 * @event click
 */
if (backBtnMobile) {
  backBtnMobile.addEventListener('click', () => {
    mobileDetailContactView.style.display = "none";
    contactEditMobileBtn.classList.add('d_none');
    addContactMobileBtn.classList.remove('d_none');
  });
}

/**
 * Checks and renders the mobile contact view if screen is mobile size.
 * @function checkAndRenderMobileView
 */
window.checkAndRenderMobileView = function () {
  if (window.matchMedia("(max-width: 768px)").matches) {
    mobileDetailContactView.style.display = "flex";
    contactEditMobileBtn.classList.remove('d_none');
    addContactMobileBtn.classList.add('d_none');
  }
};

/**
 * Event listener for the mobile contact edit button.
 * Shows the mobile edit navigation menu.
 * @event click
 */
if (contactEditMobileBtn) {
  contactEditMobileBtn.addEventListener('click', () => {
    mobileEditContactsNav.classList.remove('d_none');
  });
}

/**
 * Event listener for document click to hide mobile edit nav if clicking outside.
 * @event click
 */
document.addEventListener('click', event => {
  const isClickInsideNav = mobileEditContactsNav.contains(event.target);
  const isClickOnEditButton = contactEditMobileBtn.contains(event.target);
  if (!isClickInsideNav && !isClickOnEditButton) {
    mobileEditContactsNav.classList.add('d_none');
  }
});

/**
 * Sets up edit and delete buttons for mobile view for a contact.
 * @param {object} contact
 */
window.setupEditDeleteButtonsMobile = function (contact) {
  if (editContactMobileBtn) {
    editContactMobileBtn.addEventListener('click', () => {
      window.openEditContactOverlay(contact);
    });
  }
  if (deleteContactMobileBtn) {
    deleteContactMobileBtn.addEventListener('click', () => {
      window.deleteContact(contact.id);
    });
  }
};

/**
 * Sets up edit and delete buttons for a contact.
 * @param {object} c
 */
window.setupEditDeleteButtons = function (c) {
  bindEditButton(c);
  bindOverlayDelete(c);
  bindDetailDelete(c);
};

/**
 * Bind edit button to open edit overlay.
 * @param {object} c
 */
function bindEditButton(c) {
  const btn = document.getElementById("btn-edit-detail");
  if (!btn) return;
  btn.onclick = () => window.openEditContactOverlay(c);
}

/**
 * Bind delete button inside overlay.
 * @param {object} c
 */
function bindOverlayDelete(c) {
  const btn = document.querySelector(".delete_btn");
  if (!btn) return;
  btn.onclick = async () => {
    await window.deleteContact(c.id);
    closeOverlay();
    hideContactDetailsArea();
    await renderContacts();
  };
}

/**
 * Bind delete button in detail pane.
 * @param {object} c
 */
function bindDetailDelete(c) {
  const btn = document.getElementById("btn-delete-detail");
  if (!btn) return;
  btn.onclick = async () => {
    await window.deleteContact(c.id);
    document.getElementById("contact-detail").classList.add("d_none");
    await renderContacts();
  };
}
 
/**
 * Opens the edit overlay for a contact.
 * @param {object} contact
 */
window.openEditContactOverlay = async function (contact) {
  await loadFormIntoOverlay("./templates/edit_Contacts.html");
  slideInOverlay();
  await new Promise(r => setTimeout(r, 0));
  fillContactFormFields(contact);
  updateContactInitialsPreview(contact.name);
  setupEditContactForm(contact);
  bindOverlayDelete(contact);
};

/**
 * Sets up the edit contact form logic.
 * @param {object} contact
 */
function setupEditContactForm(contact) {
  const form = document.getElementById("edit-contact-form");
  form.onsubmit = async e => {
    e.preventDefault();
    clearContactInputErrors();
    if (!validateNewContactForm()) {
      showToast("Please fix the errors in the form");
      return;
    }
    const updated = getContactFormValues();
    await window.updateContact(contact.id, updated);
    closeOverlay();
    await renderContacts();
    const newDetail = { id: contact.id, ...updated };
    const updatedItem = document.querySelector(`.contact-list-item[id="${contact.id}"]`);
    if (updatedItem) {
      await showContactDetails(newDetail, updatedItem);
    }
  };
}

/**
 * Event listener for DOMContentLoaded to render contacts on page load.
 * @event DOMContentLoaded
 */
window.addEventListener("DOMContentLoaded", renderContacts);