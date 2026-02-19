(() => {
  "use strict";

  const FAVORITES_STORAGE_KEY = "ai-week-2026-favorites";
  const DAY_META = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" }
  ];

  if (typeof events === "undefined" || !Array.isArray(events)) {
    console.error("events.js did not provide a valid `events` array.");
    return;
  }

  const state = {
    dayFilter: "all",
    viewMode: "cards",
    myPlanOnly: false,
    favorites: loadFavorites()
  };

  const elements = {
    scheduleRoot: document.getElementById("schedule-root"),
    dayRail: document.getElementById("day-rail"),
    cardsView: document.getElementById("cards-view"),
    tableView: document.getElementById("table-view"),
    myPlanToggle: document.getElementById("my-plan-toggle"),
    printButton: document.getElementById("print-plan-button"),
    viewButtons: Array.from(document.querySelectorAll("[data-view]")),
    status: document.getElementById("schedule-status")
  };

  if (!elements.dayRail || !elements.cardsView || !elements.tableView) {
    console.error("Required schedule containers are missing from index.html.");
    return;
  }

  init();

  function init() {
    bindControls();
    render();
  }

  function bindControls() {
    const dayButtons = elements.dayRail.querySelectorAll("[data-day]");

    dayButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const nextDay = button.dataset.day;
        if (!nextDay) {
          return;
        }

        state.dayFilter = nextDay;
        render();
        elements.scheduleRoot.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    elements.viewButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const nextView = button.dataset.view;
        if (!nextView || nextView === state.viewMode) {
          return;
        }

        state.viewMode = nextView;
        syncViewButtons();
        syncViewPanels();
      });
    });

    if (elements.myPlanToggle) {
      elements.myPlanToggle.addEventListener("click", () => {
        state.myPlanOnly = !state.myPlanOnly;
        render();
      });
    }

    if (elements.printButton) {
      elements.printButton.addEventListener("click", printMyPlan);
    }
  }

  function render() {
    const filteredEvents = getFilteredEvents();

    renderCards(filteredEvents);
    renderTable(filteredEvents);
    updateStatus(filteredEvents.length);

    syncDayButtons();
    syncViewButtons();
    syncViewPanels();
    syncMyPlanButton();
  }

  function getFilteredEvents() {
    let list = sortEvents(events.slice());

    if (state.dayFilter !== "all") {
      if (state.dayFilter === "on-demand") {
        list = list.filter(isOnDemandOrTbd);
      } else {
        list = list.filter((event) => normalizeDay(event.day) === state.dayFilter);
      }
    }

    if (state.myPlanOnly) {
      list = list.filter((event) => state.favorites.has(event.id));
    }

    return list;
  }

  function renderCards(filteredEvents) {
    elements.cardsView.innerHTML = "";

    const groups = buildCardGroups(filteredEvents);
    if (groups.length === 0) {
      elements.cardsView.appendChild(createEmptyState("No events match this filter yet."));
      return;
    }

    const fragment = document.createDocumentFragment();

    groups.forEach((group) => {
      const section = document.createElement("section");
      section.className = "day-group";

      const heading = document.createElement("h3");
      heading.textContent = group.label;
      section.appendChild(heading);

      const cardsGrid = document.createElement("div");
      cardsGrid.className = "cards-grid";

      group.items.forEach((event, index) => {
        const card = createEventCard(event);
        card.style.transitionDelay = `${Math.min(index * 45, 220)}ms`;
        cardsGrid.appendChild(card);
      });

      section.appendChild(cardsGrid);
      fragment.appendChild(section);
    });

    elements.cardsView.appendChild(fragment);

    requestAnimationFrame(() => {
      elements.cardsView.querySelectorAll(".event-card").forEach((card) => {
        card.classList.add("is-visible");
      });
    });
  }

  function createEventCard(event) {
    const isFavorite = state.favorites.has(event.id);

    const card = document.createElement("article");
    card.className = "event-card";
    card.dataset.eventId = event.id;

    if (isFavorite) {
      card.classList.add("is-favorite");
    }

    addHoverFocusStates(card);

    const header = document.createElement("div");
    header.className = "event-card__header";

    const summary = document.createElement("div");
    summary.className = "event-summary";

    const title = document.createElement("span");
    title.className = "event-title";
    title.textContent = event.title || "Untitled Event";

    const meta = document.createElement("p");
    meta.className = "event-meta";
    meta.textContent = formatCardMeta(event);

    summary.append(title, meta);

    const favoriteButton = document.createElement("button");
    favoriteButton.type = "button";
    favoriteButton.className = "favorite-btn";
    favoriteButton.textContent = "★";
    favoriteButton.setAttribute("aria-label", isFavorite ? "Remove from My Plan" : "Add to My Plan");
    favoriteButton.setAttribute("aria-pressed", isFavorite ? "true" : "false");

    if (isFavorite) {
      favoriteButton.classList.add("is-favorite");
    }

    favoriteButton.addEventListener("click", (eventObj) => {
      eventObj.stopPropagation();
      toggleFavorite(event.id);
    });

    header.append(summary, favoriteButton);

    const details = document.createElement("div");
    details.className = "event-details";

    const detailsInner = document.createElement("div");
    detailsInner.className = "event-details__inner";

    appendDetail(detailsInner, "Description", event.description);
    appendDetail(detailsInner, event.modOrTrainerLabel || "Moderator/Trainer", event.modOrTrainer);
    appendDetail(detailsInner, "Notes", event.notes);

    if (Array.isArray(event.tags) && event.tags.length > 0) {
      appendDetail(detailsInner, "Tags", event.tags.join(" | "));
    }

    const actionLinks = [];

    if (event.link) {
      const joinLink = document.createElement("a");
      joinLink.className = "join-btn";
      joinLink.href = event.link;
      joinLink.target = "_blank";
      joinLink.rel = "noopener noreferrer";
      joinLink.textContent = buildJoinLabel(event);
      actionLinks.push(joinLink);
    }

    if (event.flyerLink) {
      const flyerLink = document.createElement("a");
      flyerLink.className = "join-btn";
      flyerLink.href = event.flyerLink;
      flyerLink.target = "_blank";
      flyerLink.rel = "noopener noreferrer";
      flyerLink.textContent = event.flyerLabel || "View flyer";
      actionLinks.push(flyerLink);
    }

    if (actionLinks.length > 0) {
      const actions = document.createElement("div");
      actions.className = "event-actions";
      actionLinks.forEach((linkNode) => actions.appendChild(linkNode));
      detailsInner.appendChild(actions);
    }

    if (!detailsInner.childNodes.length) {
      appendDetail(detailsInner, "Details", "More details coming soon.");
    }

    details.appendChild(detailsInner);
    card.append(header, details);
    return card;
  }

  function renderTable(filteredEvents) {
    elements.tableView.innerHTML = "";

    if (filteredEvents.length === 0) {
      elements.tableView.appendChild(createEmptyState("No events match this filter yet."));
      return;
    }

    const wrap = document.createElement("div");
    wrap.className = "table-wrap";

    const table = document.createElement("table");
    table.className = "event-table";

    const caption = document.createElement("caption");
    caption.textContent = "AI Week 2026 Agenda";
    table.appendChild(caption);

    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");

    ["Plan", "Day", "Time", "Event", "Location", "Moderator/Trainer", "Notes", "Link"].forEach((title) => {
      const th = document.createElement("th");
      th.scope = "col";
      th.textContent = title;
      headRow.appendChild(th);
    });

    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    filteredEvents.forEach((event) => {
      const row = document.createElement("tr");
      const isFavorite = state.favorites.has(event.id);

      if (isFavorite) {
        row.classList.add("is-favorite");
      }

      const favoriteCell = document.createElement("td");
      const favoriteButton = document.createElement("button");
      favoriteButton.type = "button";
      favoriteButton.className = "favorite-btn";
      favoriteButton.textContent = "★";
      favoriteButton.setAttribute("aria-label", isFavorite ? "Remove from My Plan" : "Add to My Plan");
      favoriteButton.setAttribute("aria-pressed", isFavorite ? "true" : "false");

      if (isFavorite) {
        favoriteButton.classList.add("is-favorite");
      }

      favoriteButton.addEventListener("click", () => {
        toggleFavorite(event.id);
      });

      favoriteCell.appendChild(favoriteButton);

      const dayCell = document.createElement("td");
      dayCell.textContent = event.day || "TBD";

      const timeCell = document.createElement("td");
      timeCell.textContent = formatTimeRange(event);

      const titleCell = document.createElement("td");
      titleCell.textContent = event.title || "Untitled Event";

      const locationCell = document.createElement("td");
      locationCell.textContent = event.location || "TBD";

      const modCell = document.createElement("td");
      modCell.textContent = event.modOrTrainer || "-";

      const notesCell = document.createElement("td");
      notesCell.textContent = event.notes || "-";

      const linkCell = document.createElement("td");
      if (event.link) {
        const link = document.createElement("a");
        link.className = "event-link";
        link.href = event.link;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = buildJoinLabel(event);
        linkCell.appendChild(link);
      } else {
        linkCell.textContent = "-";
      }

      row.append(favoriteCell, dayCell, timeCell, titleCell, locationCell, modCell, notesCell, linkCell);
      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    wrap.appendChild(table);
    elements.tableView.appendChild(wrap);
  }

  function buildCardGroups(filteredEvents) {
    if (filteredEvents.length === 0) {
      return [];
    }

    if (state.dayFilter === "on-demand") {
      return [{ label: "On-demand / TBD", items: filteredEvents }];
    }

    if (state.dayFilter !== "all") {
      const activeDay = DAY_META.find((item) => item.value === state.dayFilter);
      return [{ label: activeDay ? activeDay.label : "Selected Day", items: filteredEvents }];
    }

    const groups = DAY_META.map((dayInfo) => {
      const dayEvents = filteredEvents.filter((event) => normalizeDay(event.day) === dayInfo.value);
      return {
        label: dayInfo.label,
        items: dayEvents
      };
    }).filter((group) => group.items.length > 0);

    const otherEvents = filteredEvents.filter((event) => {
      const dayValue = normalizeDay(event.day);
      return !DAY_META.some((dayInfo) => dayInfo.value === dayValue);
    });

    if (otherEvents.length) {
      groups.push({ label: "On-demand / TBD", items: otherEvents });
    }

    return groups;
  }

  function toggleFavorite(eventId) {
    if (!eventId) {
      return;
    }

    if (state.favorites.has(eventId)) {
      state.favorites.delete(eventId);
    } else {
      state.favorites.add(eventId);
    }

    persistFavorites();
    render();
  }

  function printMyPlan() {
    const hasFavorites = state.favorites.size > 0;
    const snapshot = {
      dayFilter: state.dayFilter,
      viewMode: state.viewMode,
      myPlanOnly: state.myPlanOnly
    };
    let restored = false;

    const restoreState = () => {
      if (restored || !hasFavorites) {
        return;
      }

      restored = true;
      document.body.classList.remove("print-my-plan");
      state.dayFilter = snapshot.dayFilter;
      state.viewMode = snapshot.viewMode;
      state.myPlanOnly = snapshot.myPlanOnly;
      render();
    };

    if (hasFavorites) {
      state.dayFilter = "all";
      state.viewMode = "cards";
      state.myPlanOnly = true;
      document.body.classList.add("print-my-plan");
      render();

      window.addEventListener("afterprint", restoreState, { once: true });
    }

    window.print();

    if (hasFavorites) {
      setTimeout(restoreState, 1200);
    }
  }

  function syncDayButtons() {
    elements.dayRail.querySelectorAll("[data-day]").forEach((button) => {
      const active = button.dataset.day === state.dayFilter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
    });
  }

  function syncViewButtons() {
    elements.viewButtons.forEach((button) => {
      const active = button.dataset.view === state.viewMode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function syncViewPanels() {
    const showingCards = state.viewMode === "cards";
    elements.cardsView.hidden = !showingCards;
    elements.tableView.hidden = showingCards;
  }

  function syncMyPlanButton() {
    if (!elements.myPlanToggle) {
      return;
    }

    elements.myPlanToggle.classList.toggle("is-active", state.myPlanOnly);
    elements.myPlanToggle.setAttribute("aria-pressed", state.myPlanOnly ? "true" : "false");

    const favoritesCount = state.favorites.size;
    elements.myPlanToggle.textContent = favoritesCount > 0 ? `My Plan (${favoritesCount})` : "My Plan";
  }

  function updateStatus(eventCount) {
    if (!elements.status) {
      return;
    }

    const scope = state.myPlanOnly ? " in My Plan" : "";
    elements.status.textContent = `${eventCount} event${eventCount === 1 ? "" : "s"}${scope}`;
  }

  function appendDetail(container, label, value) {
    if (!value) {
      return;
    }

    const text = String(value).trim();
    if (!text) {
      return;
    }

    const line = document.createElement("p");
    line.className = "detail-item";

    const strong = document.createElement("strong");
    strong.textContent = `${label}: `;

    const span = document.createElement("span");
    span.textContent = text;

    line.append(strong, span);
    container.appendChild(line);
  }

  function createEmptyState(message) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = message;
    return empty;
  }

  function addHoverFocusStates(card) {
    card.addEventListener("pointerenter", () => {
      card.classList.add("is-hovered");
    });

    card.addEventListener("pointerleave", () => {
      card.classList.remove("is-hovered");
    });

    card.addEventListener("focusin", () => {
      card.classList.add("is-focused");
    });

    card.addEventListener("focusout", () => {
      if (!card.contains(document.activeElement)) {
        card.classList.remove("is-focused");
      }
    });
  }

  function loadFavorites() {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (!stored) {
        return new Set();
      }

      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? new Set(parsed) : new Set();
    } catch (error) {
      console.warn("Could not load favorites from localStorage.", error);
      return new Set();
    }
  }

  function persistFavorites() {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(state.favorites)));
    } catch (error) {
      console.warn("Could not save favorites to localStorage.", error);
    }
  }

  function sortEvents(list) {
    return list.sort((a, b) => {
      const dateDiff = parseDateValue(a.date) - parseDateValue(b.date);
      if (dateDiff !== 0) {
        return dateDiff;
      }

      const timeDiff = parseTimeValue(a.startTime) - parseTimeValue(b.startTime);
      if (timeDiff !== 0) {
        return timeDiff;
      }

      return String(a.title || "").localeCompare(String(b.title || ""));
    });
  }

  function parseDateValue(dateText) {
    if (!dateText) {
      return Number.MAX_SAFE_INTEGER;
    }

    const parsed = Date.parse(dateText);
    return Number.isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed;
  }

  function parseTimeValue(timeText) {
    if (!timeText) {
      return Number.MAX_SAFE_INTEGER;
    }

    const normalized = String(timeText).trim().toLowerCase();
    if (!normalized || normalized.includes("tbd")) {
      return Number.MAX_SAFE_INTEGER;
    }

    const match = normalized.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
    if (!match) {
      return Number.MAX_SAFE_INTEGER;
    }

    let hour = Number(match[1]);
    const minutes = Number(match[2] || 0);
    const period = match[3];

    if (period === "pm" && hour !== 12) {
      hour += 12;
    }

    if (period === "am" && hour === 12) {
      hour = 0;
    }

    return hour * 60 + minutes;
  }

  function formatCardMeta(event) {
    const parts = [formatTimeRange(event), event.location || "Location TBD"];
    return parts.join(" | ");
  }

  function formatTimeRange(event) {
    const start = (event.startTime || "").trim();
    const end = (event.endTime || "").trim();

    if (!start && !end) {
      return "On-demand / TBD";
    }

    if (start && end) {
      return `${start} - ${end}`;
    }

    return start || end || "On-demand / TBD";
  }

  function normalizeDay(dayText) {
    return String(dayText || "").trim().toLowerCase();
  }

  function isOnDemandOrTbd(event) {
    const start = String(event.startTime || "").toLowerCase();
    const modality = String(event.modality || "").toLowerCase();
    const day = String(event.day || "").toLowerCase();

    return (
      !event.startTime ||
      start.includes("tbd") ||
      modality.includes("pre-recorded") ||
      modality.includes("asynchronous") ||
      day.includes("on-demand") ||
      day.includes("tbd")
    );
  }

  function buildJoinLabel(event) {
    if (event.linkLabel && String(event.linkLabel).trim()) {
      return String(event.linkLabel).trim();
    }

    const context = `${event.location || ""} ${event.link || ""} ${event.modality || ""}`.toLowerCase();

    if (context.includes("zoom")) {
      return "Join Zoom";
    }

    if (context.includes("teams")) {
      return "Join Teams";
    }

    return "Open Link";
  }

})();
