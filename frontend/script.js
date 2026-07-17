const eventList = document.getElementById("event-list");
const eventTemplate = document.getElementById("event-template");
const addEventForm = document.getElementById("add-event-form");
const addEventDialog = document.getElementById("add-event-dialog");

/**
 * Sorts events in cronological order. The reversing is handled by the insertion function.
 */
function sortEvents(events) {
  events.sort(
    (a, b) => new Date(a.isoTime).getTime() - new Date(b.isoTime).getTime(),
  );
}

function addEventToList(event) {
  // Create DOM node from template
  const element = document.importNode(eventTemplate.content, true);

  element.querySelector(".event-title").textContent = event.title;

  const date = new Date(event.isoTime);
  element.querySelector(".event-timestamp").textContent =
    date.getDate() +
    "." +
    date.getMonth() +
    "." +
    date.getFullYear() +
    "\n" +
    date.getHours().toString().padStart(2, "0") +
    ":" +
    date.getMinutes().toString().padStart(2, "0");

  element.querySelector(".event-body").textContent = event.body;
  if (event.lat && event.lon) {
    element.querySelector(".event-coordinates > .latitude").textContent =
      Math.abs(event.lat) + "°" + (event.lat > 0 ? "N" : "S");
    element.querySelector(".event-coordinates > .longitude").textContent =
      Math.abs(event.lon) + "°" + (event.lon > 0 ? "E" : "W");
  }

  // Prepend instead of append to uphold reverse chronological order
  eventList.prepend(element);
}

fetch("./sample-data/data.json")
  .then((res) => res.json())
  .then((events) => {
    sortEvents(events);
    events.forEach(addEventToList);
    eventList.querySelector(".loading").remove();
  })
  .catch((err) => {
    const errorNode = document.createElement("span");
    errorNode.classList.add("error-message");
    errorNode.textContent = "Error while fetching data: " + err;
    console.error("Failed to fetch data", err);
    eventList.querySelector(".loading").remove();
    eventList.appendChild(errorNode);
  });

addEventForm.onsubmit = (e) => {
  e.preventDefault();

  const data = new FormData(addEventForm);
  const object = {
    title: data.get("title"),
    body: data.get("body"),
    isoTime: new Date().toISOString(),
  };

  const lat = data.get("latitude");
  const lon = data.get("longitude");
  if (lat && lon) {
    object.lat = parseFloat(lat);
    object.lon = parseFloat(lon);
  }

  addEventToList(object);
  addEventForm.reset();
  addEventDialog.close();
};
