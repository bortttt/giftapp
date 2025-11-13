const storageKey = "gift-garden-profiles";
const profileList = document.getElementById("profile-list");
const selectedProfileName = document.getElementById("selected-profile-name");
const profileDetails = document.getElementById("profile-details");
const eventList = document.getElementById("event-list");
const giftResults = document.getElementById("gift-results");
const notificationList = document.getElementById("notification-list");

const profileDialog = document.getElementById("profile-dialog");
const profileForm = document.getElementById("profile-form");
const profileFormTitle = document.getElementById("profile-form-title");
const profileNameInput = document.getElementById("profile-name");
const profileRelationshipInput = document.getElementById("profile-relationship");
const profileLikesInput = document.getElementById("profile-likes");
const profileDislikesInput = document.getElementById("profile-dislikes");
const profileHobbiesInput = document.getElementById("profile-hobbies");

const addProfileBtn = document.getElementById("add-profile-btn");
const editProfileBtn = document.getElementById("edit-profile-btn");
const deleteProfileBtn = document.getElementById("delete-profile-btn");

const eventDialog = document.getElementById("event-dialog");
const eventForm = document.getElementById("event-form");
const eventFormTitle = document.getElementById("event-form-title");
const eventNameInput = document.getElementById("event-name");
const eventDateInput = document.getElementById("event-date");
const eventReminderInput = document.getElementById("event-reminder");
const eventNotesInput = document.getElementById("event-notes");
const addEventBtn = document.getElementById("add-event-btn");
const giftSuggestionsBtn = document.getElementById("gift-suggestions-btn");

const eventsSection = document.getElementById("events-section");
const giftSection = document.getElementById("gift-section");
const notificationSection = document.getElementById("notification-section");

const calendarEl = document.getElementById("calendar");
const calendarMonth = document.getElementById("calendar-month");
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");

const giftCardTemplate = document.getElementById("gift-card-template");

let profiles = loadProfiles();
let selectedProfileId = null;
let editingProfileId = null;
let editingEventId = null;

const today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();

function loadProfiles() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    console.warn("Unable to parse stored profiles", error);
  }
  return [];
}

function persistProfiles() {
  localStorage.setItem(storageKey, JSON.stringify(profiles));
}

function generateId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function parseList(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function stringifyList(items) {
  return items.length ? items.join(", ") : "None listed";
}

function renderProfiles() {
  profileList.innerHTML = "";
  if (!profiles.length) {
    profileDetails.classList.add("empty-state");
    profileDetails.innerHTML = "<p>Add a profile to start tracking celebrations and gifts.</p>";
    selectedProfileName.textContent = "Select someone to begin";
    eventsSection.classList.add("hidden");
    giftSection.classList.add("hidden");
    notificationSection.classList.add("hidden");
    editProfileBtn.disabled = true;
    deleteProfileBtn.disabled = true;
    addEventBtn?.setAttribute("disabled", "true");
    giftSuggestionsBtn?.setAttribute("disabled", "true");
    selectedProfileId = null;
  }

  profiles.forEach((profile) => {
    const item = document.createElement("li");
    item.dataset.id = profile.id;
    if (profile.id === selectedProfileId) {
      item.classList.add("active");
    }

    const nameSpan = document.createElement("span");
    nameSpan.className = "profile-name";
    nameSpan.textContent = profile.name;

    const relationshipSpan = document.createElement("span");
    relationshipSpan.className = "profile-relationship";
    relationshipSpan.textContent = profile.relationship || "";

    item.append(nameSpan, relationshipSpan);
    item.addEventListener("click", () => selectProfile(profile.id));
    profileList.appendChild(item);
  });

  renderCalendar();
}

function selectProfile(id) {
  selectedProfileId = id;
  const profile = profiles.find((p) => p.id === id);
  if (!profile) return;

  selectedProfileName.textContent = profile.name;
  editProfileBtn.disabled = false;
  deleteProfileBtn.disabled = false;
  addEventBtn?.removeAttribute("disabled");
  giftSuggestionsBtn?.removeAttribute("disabled");

  profileDetails.classList.remove("empty-state");
  profileDetails.innerHTML = `
    <p><strong>Relationship:</strong> ${profile.relationship || "-"}</p>
    <p><strong>Likes:</strong> ${stringifyList(profile.likes)}</p>
    <p><strong>Dislikes:</strong> ${stringifyList(profile.dislikes)}</p>
    <p><strong>Hobbies:</strong> ${stringifyList(profile.hobbies)}</p>
  `;

  eventsSection.classList.remove("hidden");
  giftSection.classList.remove("hidden");
  notificationSection.classList.remove("hidden");

  renderProfiles();
  renderEvents(profile);
  renderNotifications(profile);
}

function renderEvents(profile) {
  eventList.innerHTML = "";
  if (!profile.events?.length) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "No special days yet. Add one to keep track.";
    eventList.appendChild(empty);
    return;
  }

  const sortedEvents = [...profile.events].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    const keyA = `${String(dateA.getMonth()).padStart(2, "0")}-${String(dateA.getDate()).padStart(2, "0")}`;
    const keyB = `${String(dateB.getMonth()).padStart(2, "0")}-${String(dateB.getDate()).padStart(2, "0")}`;
    return keyA.localeCompare(keyB);
  });

  sortedEvents.forEach((event) => {
    const card = document.createElement("li");
    card.className = "event-card";

    const header = document.createElement("header");
    const title = document.createElement("h4");
    title.className = "event-name";
    title.textContent = event.name;

    const date = document.createElement("span");
    date.className = "event-meta";
    date.textContent = formatEventDate(event.date);

    header.append(title, date);

    const reminder = document.createElement("p");
    reminder.className = "event-meta";
    reminder.textContent = `Reminder: ${describeReminder(event.reminderDays)}`;

    card.append(header, reminder);

    if (event.notes) {
      const notes = document.createElement("p");
      notes.className = "event-notes";
      notes.textContent = event.notes;
      card.appendChild(notes);
    }

    const actions = document.createElement("div");
    actions.className = "event-actions";

    const editButton = document.createElement("button");
    editButton.className = "secondary";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => openEventDialog(profile.id, event.id));

    const deleteButton = document.createElement("button");
    deleteButton.className = "secondary";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteEvent(profile.id, event.id));

    actions.append(editButton, deleteButton);
    card.appendChild(actions);
    eventList.appendChild(card);
  });
}

function describeReminder(reminderDays) {
  const map = {
    0: "On the day",
    1: "1 day before",
    3: "3 days before",
    7: "1 week before",
    14: "2 weeks before",
    30: "1 month before",
  };
  return map[reminderDays] || `${reminderDays} day(s) before`;
}

function formatEventDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
  });
}

function openProfileDialog(mode) {
  editingProfileId = mode === "edit" ? selectedProfileId : null;
  profileFormTitle.textContent = mode === "edit" ? "Edit Profile" : "Add Profile";
  if (mode === "edit") {
    const profile = profiles.find((p) => p.id === selectedProfileId);
    if (!profile) return;
    profileNameInput.value = profile.name;
    profileRelationshipInput.value = profile.relationship || "";
    profileLikesInput.value = profile.likes.join(", ");
    profileDislikesInput.value = profile.dislikes.join(", ");
    profileHobbiesInput.value = profile.hobbies.join(", ");
  } else {
    profileForm.reset();
  }
  profileDialog.showModal();
}

function openEventDialog(profileId, eventId = null) {
  editingEventId = eventId;
  eventForm.dataset.profileId = profileId;
  if (eventId) {
    const profile = profiles.find((p) => p.id === profileId);
    const event = profile?.events?.find((e) => e.id === eventId);
    if (!event) return;
    eventFormTitle.textContent = "Edit Special Day";
    eventNameInput.value = event.name;
    eventDateInput.value = event.date;
    eventReminderInput.value = String(event.reminderDays);
    eventNotesInput.value = event.notes || "";
  } else {
    eventFormTitle.textContent = "Add Special Day";
    eventForm.reset();
    eventReminderInput.value = "7";
  }
  eventDialog.showModal();
}

function upsertProfile(event) {
  event.preventDefault();
  const name = profileNameInput.value.trim();
  if (!name) return;

  const payload = {
    name,
    relationship: profileRelationshipInput.value.trim(),
    likes: parseList(profileLikesInput.value),
    dislikes: parseList(profileDislikesInput.value),
    hobbies: parseList(profileHobbiesInput.value),
  };

  if (editingProfileId) {
    profiles = profiles.map((profile) =>
      profile.id === editingProfileId ? { ...profile, ...payload } : profile
    );
  } else {
    const newProfile = {
      id: generateId(),
      ...payload,
      events: [],
    };
    profiles.push(newProfile);
    selectedProfileId = newProfile.id;
  }

  persistProfiles();
  profileDialog.close();
  renderProfiles();
  if (selectedProfileId) {
    selectProfile(selectedProfileId);
  }
}

function deleteSelectedProfile() {
  if (!selectedProfileId) return;
  const confirmed = confirm("Delete this profile and all associated celebrations?");
  if (!confirmed) return;
  profiles = profiles.filter((profile) => profile.id !== selectedProfileId);
  persistProfiles();
  selectedProfileId = profiles[0]?.id || null;
  renderProfiles();
  if (selectedProfileId) {
    selectProfile(selectedProfileId);
  }
}

function upsertEvent(event) {
  event.preventDefault();
  const profileId = eventForm.dataset.profileId;
  const profileIndex = profiles.findIndex((p) => p.id === profileId);
  if (profileIndex === -1) return;

  const payload = {
    name: eventNameInput.value.trim(),
    date: eventDateInput.value,
    reminderDays: parseInt(eventReminderInput.value, 10),
    notes: eventNotesInput.value.trim(),
  };

  if (!payload.name || !payload.date) {
    return;
  }

  const profile = profiles[profileIndex];
  if (editingEventId) {
    profile.events = profile.events.map((ev) =>
      ev.id === editingEventId ? { ...ev, ...payload } : ev
    );
  } else {
    const newEvent = {
      id: generateId(),
      ...payload,
    };
    profile.events = profile.events ? [...profile.events, newEvent] : [newEvent];
  }

  profiles[profileIndex] = profile;
  persistProfiles();
  eventDialog.close();
  selectProfile(profileId);
}

function deleteEvent(profileId, eventId) {
  const profileIndex = profiles.findIndex((p) => p.id === profileId);
  if (profileIndex === -1) return;
  const confirmed = confirm("Remove this celebration?");
  if (!confirmed) return;
  profiles[profileIndex].events = profiles[profileIndex].events.filter((e) => e.id !== eventId);
  persistProfiles();
  selectProfile(profileId);
}

function getAllEvents() {
  return profiles.flatMap((profile) =>
    (profile.events || []).map((event) => ({ ...event, owner: profile.name }))
  );
}

function renderCalendar() {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  calendarMonth.textContent = `${monthNames[currentMonth]} ${currentYear}`;
  calendarEl.innerHTML = "";

  const headers = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  headers.forEach((day) => {
    const cell = document.createElement("div");
    cell.className = "calendar-header";
    cell.textContent = day;
    calendarEl.appendChild(cell);
  });

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const startingDay = firstDayOfMonth.getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  for (let i = 0; i < startingDay; i++) {
    const placeholder = document.createElement("div");
    placeholder.className = "calendar-day";
    placeholder.classList.add("empty");
    calendarEl.appendChild(placeholder);
  }

  const eventsByDay = buildEventsByDay(currentMonth);

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    cell.className = "calendar-day";

    const number = document.createElement("span");
    number.className = "date-number";
    number.textContent = day;
    cell.appendChild(number);

    const key = day;
    const events = eventsByDay[key] || [];
    if (events.length) {
      cell.classList.add("event-day");
      events.slice(0, 2).forEach((event) => {
        const badge = document.createElement("span");
        badge.className = "event-badge";
        badge.textContent = event.name;
        cell.appendChild(badge);
      });
      if (events.length > 2) {
        const more = document.createElement("span");
        more.className = "event-badge";
        more.textContent = `+${events.length - 2}`;
        cell.appendChild(more);
      }
    }

    calendarEl.appendChild(cell);
  }
}

function buildEventsByDay(month) {
  const events = getAllEvents();
  const map = {};

  events.forEach((event) => {
    if (!event.date) return;
    const original = new Date(event.date);
    if (original.getMonth() !== month) return;

    const day = original.getDate();
    if (!map[day]) {
      map[day] = [];
    }
    map[day].push({ name: `${event.name} (${event.owner})` });
  });

  return map;
}

function renderNotifications(profile) {
  notificationList.innerHTML = "";
  const notifications = computeUpcomingReminders(profile);
  if (!notifications.length) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "No reminders for the next month.";
    notificationList.appendChild(empty);
    return;
  }

  notifications.forEach((item) => {
    const li = document.createElement("li");
    const title = document.createElement("span");
    title.className = "notification-title";
    title.textContent = `${item.eventName} in ${item.daysUntil} day${item.daysUntil === 1 ? "" : "s"}`;

    const detail = document.createElement("span");
    detail.className = "notification-detail";
    detail.textContent = `Reminder preference: ${describeReminder(item.reminderDays)} • ${item.dateLabel}`;

    li.append(title, detail);
    notificationList.appendChild(li);
  });
}

function computeUpcomingReminders(profile) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const maxWindow = 45; // roughly 1.5 months

  return (profile.events || [])
    .map((event) => {
      const nextOccurrence = getNextOccurrence(event.date);
      const diffMs = nextOccurrence - today;
      const daysUntil = Math.round(diffMs / (1000 * 60 * 60 * 24));
      const triggerWindow = event.reminderDays ?? 0;
      return {
        event,
        daysUntil,
        reminderDays: triggerWindow,
        withinWindow: daysUntil >= 0 && daysUntil <= maxWindow,
        dateLabel: nextOccurrence.toLocaleDateString(undefined, {
          month: "long",
          day: "numeric",
        }),
      };
    })
    .filter((item) =>
      item.withinWindow &&
      item.daysUntil >= 0 &&
      item.daysUntil <= Math.max(item.reminderDays, 0)
    )
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .map((item) => ({
      eventName: item.event.name,
      daysUntil: item.daysUntil,
      reminderDays: item.reminderDays,
      dateLabel: item.dateLabel,
    }));
}

function getNextOccurrence(dateString) {
  const base = new Date(dateString);
  const month = base.getMonth();
  const day = base.getDate();

  const now = new Date();
  let candidate = new Date(now.getFullYear(), month, day);

  if (candidate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    candidate = new Date(now.getFullYear() + 1, month, day);
  }

  return candidate;
}

async function fetchGiftSuggestions() {
  if (!selectedProfileId) return;
  const profile = profiles.find((p) => p.id === selectedProfileId);
  if (!profile) return;

  giftResults.textContent = "Searching for thoughtful presents...";

  const keywords = [...profile.likes, ...profile.hobbies].slice(0, 3);
  const fallbackTerms = [profile.relationship, profile.name].filter(Boolean);
  const query = encodeURIComponent((keywords.length ? keywords : fallbackTerms).join(" ") || "gift ideas");

  try {
    const response = await fetch(`https://dummyjson.com/products/search?q=${query}`);
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    const data = await response.json();
    const products = data.products?.slice(0, 6) || [];
    if (!products.length) {
      giftResults.textContent = "No suggestions found. Try adding more likes or hobbies.";
      return;
    }

    giftResults.innerHTML = "";
    products.forEach((product) => {
      const card = giftCardTemplate.content.firstElementChild.cloneNode(true);
      card.querySelector(".gift-title").textContent = product.title;
      card.querySelector(".gift-description").textContent = product.description || "A highly rated pick for special occasions.";
      card.querySelector(".gift-price").textContent = product.price ? `$${product.price}` : "";
      const productUrl = `https://www.google.com/search?q=${encodeURIComponent(`${product.title} gift`)}`;
      card.querySelector(".gift-link").href = productUrl;
      giftResults.appendChild(card);
    });
  } catch (error) {
    console.error(error);
    giftResults.textContent = "We could not reach the gift catalog. Please check your connection and try again.";
  }
}

addProfileBtn.addEventListener("click", () => openProfileDialog("add"));
editProfileBtn.addEventListener("click", () => openProfileDialog("edit"));
deleteProfileBtn.addEventListener("click", deleteSelectedProfile);
addEventBtn?.addEventListener("click", () => {
  if (!selectedProfileId) return;
  openEventDialog(selectedProfileId);
});
giftSuggestionsBtn?.addEventListener("click", fetchGiftSuggestions);

profileForm.addEventListener("submit", upsertProfile);
eventForm.addEventListener("submit", upsertEvent);

profileDialog.addEventListener("close", () => {
  profileForm.reset();
  editingProfileId = null;
});

eventDialog.addEventListener("close", () => {
  eventForm.reset();
  editingEventId = null;
});

prevMonthBtn.addEventListener("click", () => {
  currentMonth -= 1;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear -= 1;
  }
  renderCalendar();
});

nextMonthBtn.addEventListener("click", () => {
  currentMonth += 1;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear += 1;
  }
  renderCalendar();
});

renderProfiles();
if (profiles[0]) {
  selectProfile(profiles[0].id);
}
