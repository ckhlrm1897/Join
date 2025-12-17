/**
 * Selects constant and variables that are used for workflow.
 * @type {NodeListOf<HTMLImageElement>}
 */
const navLogin = document.getElementById('nav-login');
const navBar = document.querySelector('.nav_items');
const helpDiv = document.querySelector('.help_content');
const navBarBottomDiv = document.querySelector('.nav_privacy_legal')
const btnLogOut = document.getElementById('btn-log-out');
const fadeOutRef = document.querySelectorAll('.fade_out');
const userInitials = document.getElementById('header-user-short-latters');
const userNameRef = document.getElementById('user-name');
const FIREBASE_URL = "https://join-19b54-default-rtdb.europe-west1.firebasedatabase.app/";
let isUserLogin;
let userDataFromLocalStorage = getUserLogState();

/**
 * Event listener for the DOM to be loaded to start the inital functions
 */
document.addEventListener('DOMContentLoaded', () => {
  getUserLogState();
  renderNavbar();
  getUserInitials()
})

/**
 * Retrieves users from the database.
 * @async
 * @function
 * @returns {Promise<object>} A promise that resolves to the users data from the database.
 */
async function getUsersFromDatabase() {
  let users = await loadFromDatabase("users");
  return users;
}

/**
 * Retrieves contacts from the database.
 * @async
 * @function
 * @returns {Promise<object>} A promise that resolves to the contacts data from the database.
 */
async function getContactsFromDatabase() {
  let contacts = await loadFromDatabase("contacts");
  return contacts;
}

/**
 * Retrieves contacts from the database.
 * @async
 * @function
 * @returns {Promise<object>} A promise that resolves to the contacts data from the database.
 */
async function getTasksFromDatabase() {
  let tasks = await loadFromDatabase("tasks");
  return tasks;
}

/**
 * Loads data from the specified path in the Firebase Realtime Database.
 * @async
 * @function
 * @param {string} path - The path to the data in the database.
 * @returns {Promise<object>} A promise that resolves to the data from the database.
 */
async function loadFromDatabase(path) {
  try {
    let response = await fetch(FIREBASE_URL + path + ".json");
    let responseToJson = await response.json();
    
    return responseToJson
  } catch (error) {
    throw new Error("Failed to fetch firebase url", error)
  }
}

/**
 * Posts new data to the specified path in the Firebase Realtime Database.
 * @async
 * @function postToDatabase
 * @param {string} path – Firebase-Pfad (z. B. "contacts")
 * @param {object} data – Das zu speichernde Objekt
 * @returns {Promise<{name: string}>} – Das JSON mit dem generierten Key
 */
async function postToDatabase(path, data) {
  const res = await fetch(`${FIREBASE_URL}${path}.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`POST ${path} failed (${res.status})`);
  return await res.json();  // <-- hier kommt { name: "-Mx123ABC" }
}

/**
 * Legt einen neuen Kontakt an und gibt das gesamte Ergebnis zurück.
 * @async
 * @function createContact
 * @param {object} contact
 * @returns {Promise<{name: string}>}
 */
async function createContact(contact) {
  return await postToDatabase("contacts", contact);
}

/**
 * Updates data at the specified path in the Firebase Realtime Database.
 * @async
 * @function
 * @param {string} path - The path where the data should be updated.
 * @param {object} data - The data to be updated.
 * @returns {Promise<object>} A promise that resolves to the response data from the database.
 */
async function updateOnDatabase(path, data) {
  let response = await fetch(FIREBASE_URL + path + ".json", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return (responseToJson = await response.json());
}

/**
 * Deletes data from the specified path in the Firebase Realtime Database.
 * @async
 * @function
 * @param {string} path - The path to the data to be deleted.
 * @returns {Promise<object>} A promise that resolves to the response data from the database.
 */
async function deleteFromDatabase(path) {
  let response = await fetch(FIREBASE_URL + path + ".json", {
    method: "DELETE",
  });
  return (responseToJson = await response.json());
}

/**
 * Toggles the visibility of the logout overlay by adding or removing the 'd_none' class.
 */
function toggleLogoutOverlay() {
  document
    .getElementById("overlay-small-logout-win")
    .classList.toggle("d_none");
}

/**
 * Event listener for the logout button.
 * Sets the isUserLogin variable to false and redirects the user to the index page.
 * 
 * @type {HTMLButtonElement|null}
 */
if (btnLogOut) {
  btnLogOut.addEventListener('click', () => {
    setUserIsLoggedOut()
    window.location = "/index.html";
  });
}

/**
 * Stops the propagation of the given event.
 * 
 * @param {Event} event - The event whose propagation should be stopped.
 */
function stopPropagation(event) {
  event.stopPropagation();
}

/**
 * Set the userloginstate in localstorage
 */
function setUserIsLoggedIn(email, password, name) {
  if (email && password) {
    localStorage.setItem("isJoinUserLogin", JSON.stringify({
      loginstate: true,
      userName: email,
      userPassword: password,
      userFullName: name
    }));
  } else {
    localStorage.setItem("isJoinUserLogin", JSON.stringify({
      loginstate: true,
      userName: "Guestuser@test.com",
      userPassword: "password",
      userFullName: "Guest User",
    }));
  }
}

/**
 * Set the userloginstate in localstorage
 */
function setUserIsLoggedOut() {
  localStorage.setItem("isJoinUserLogin", JSON.stringify({
    loginstate: false,
    userName: null,
    userPassword: null,
    userFullName: null,
  }));
}

/**
 * Get the userloginstate from localstorage
 * false by default
 * 
 */
function getUserLogState() {
  let data = JSON.parse(localStorage.getItem("isJoinUserLogin"))
  if (data) {
    switch (data.loginstate) {
      case true:
        isUserLogin = true;
        break;

      case false:
        isUserLogin = false;
        break;

      default:
        isUserLogin = false;
        break;
    }
  } else {
    isUserLogin = false;
  } return data
}

/**
 * Renders the navigation bar based on the user's login status.
 * If the user is logged in, hides the login navigation and shows the main navigation bar.
 * If the user is not logged in, does the opposite.
 */
function renderNavbar() {
  if (isUserLogin && navLogin && navBar) {
    helpDiv.classList.remove('v_hidden')
    navLogin.classList.add('d_none');
    navBarBottomDiv.classList.add('d_none');
    navBar.classList.remove('d_none');
  } else if (!isUserLogin && navLogin && navBar) {
    helpDiv.classList.add('v_hidden')
    navLogin.classList.remove('d_none');
    navBarBottomDiv.classList.remove('d_none')
    navBar.classList.add('d_none');
  }
}

/**
 * Reloads the current page.
 */
function locationReload() {
  location.reload();
}

/**
 * Function to set capital letters for usercontrol
 */
function getUserInitials() {
  if (!userDataFromLocalStorage || !userDataFromLocalStorage.userFullName) {
    return
  }
  if(userNameRef){
    userNameRef.innerText = userDataFromLocalStorage.userFullName
  }
  let userName = userDataFromLocalStorage.userFullName.trim().split(' ');
  let firstInitial = userName[0][0].toUpperCase();
  let lastInitial = userName[userName.length - 1][0].toUpperCase();
  if (userInitials) {
    userInitials.innerText = firstInitial + lastInitial;
  }
}

async function getUsers() {
   return await getUsersFromDatabase();
}

async function isCreatorUser(data) {
  let creator = data.creator;
  const users = await getUsers();
  const userValues = Object.values(users);
  for (let i = 0; i < userValues.length; i++) {
    if (userValues[i].name === creator) return true;
  }
  return false;
}