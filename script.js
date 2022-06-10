"use strict";

const loadTravelsContainer = document.querySelector(".load-travels");
const form = document.querySelector(".form");
const containerTravels = document.querySelector(".travels");
const inputLocation = document.querySelector(".form__input--location");
const inputDate = document.querySelector(".form__input--date");
const imgUpload = document.querySelector("#img-upload");
const deleteBtn = document.querySelector(".delete-travels__btn");

class TravelMemory {
  date = new Date();
  id = (Date.now() + "").slice(-10);

  constructor(coords, location, date, img) {
    this.coords = coords;
    this.location = location;
    this.date = date;
    this.img = img;
  }
}

/////////////////////////////////////////////////////////////////////////
// Application Architecture
class App {
  // private class variables
  #map;
  #mapZoomLevel = 4;
  #mapEvent;
  #travelMemories = [];

  // public class variables
  travelMemory;
  newEntryAborted = false;
  imgData = "";

  constructor() {
    // Get current position
    this._getPosition();

    // Get data from local storage
    //loadTravelsBtn.addEventListener("click", this._getLocalStorage.bind(this));
    this._getLocalStorage();

    // Create new workout from form, then display it as list in sidebar and add marker on map
    form.addEventListener("submit", this._newTravelMemory.bind(this));

    // move map to marker of clicked workout in list
    containerTravels.addEventListener("click", this._moveToPopup.bind(this));

    // delete data button
    deleteBtn.addEventListener("click", this.reset);
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert("Could not get your position 😞.");
        }
      );
    }
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    //console.log(`https://www.google.pt/maps/@${latitude},${longitude}`);

    const coords = [latitude, longitude];

    this.#map = L.map("map").setView(coords, this.#mapZoomLevel);
    //console.log("#map", this.#map);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //console.log(this.#map);

    // Handling clicks on map
    this.#map.on("click", this._showForm.bind(this));

    // Load any existing workout markers
    // this.#travelMemories.forEach(mem => this._displayMarker(mem));
    this.#travelMemories.forEach(mem => this._displayMarker(mem));
  }

  _newTravelMemory(e) {
    e.preventDefault();

    const location = inputLocation.value;
    const date = inputDate.value;
    const { lat, lng } = this.#mapEvent.latlng;

    // validate form fields
    if (location === "" || date === "")
      return alert("You must fill out all fields.");
    if (!imgUpload.value.length) return alert("You must upload an image.");

    // create new Running object
    this.travelMemory = new TravelMemory([lat, lng], location, date, "");

    // process uploaded image
    this._processFileUpload(imgUpload);

    // using timer to make sure the image file is validated & saved before displaying data
    setTimeout(() => {
      //validate image size is <= 1MB
      if (!this.newEntryAborted) {
        // store object in workouts array
        this.#travelMemories.push(this.travelMemory);

        //console.log("#travelMemories arr:", this.#travelMemories);

        // Display marker
        this._displayMarker(this.travelMemory);

        // Add workout to list
        this._renderList(this.travelMemory);

        //Hide form + Clear input fields
        this._hideForm();

        // Set local storage to all workouts
        this._setLocalStorage();
      }
    }, 1000);
  }

  _showForm(mapE) {
    // hide load travels message if displayed
    loadTravelsContainer.classList.add("hidden");

    this.#mapEvent = mapE;
    form.classList.remove("hidden");
    inputLocation.focus();
  }

  _hideForm() {
    form.style.display = "none";
    form.classList.add("hidden");
    setTimeout(() => (form.style.display = "grid"), 1000);

    inputLocation.value = inputDate.value = imgUpload.value = "";

    deleteBtn.classList.remove("hidden");
  }

  _processFileUpload(imgFile) {
    let reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onerror = () => {
        reader.abort();
        reject(
          new DOMException("There was a problem processing the uploaded file.")
        );
      };

      reader.onload = this._logFile.bind(this);

      reader.readAsDataURL(imgUpload.files[0]);
    });
  }

  _logFile(e) {
    // check file size
    if (e.total > 1100000) {
      alert("Please choose a file no larger than 1MB.");
      this.newEntryAborted = true;
      return;
    }

    let str = e.target.result;
    this.travelMemory.img = str;
    this.newEntryAborted = false;
  }

  _renderList(travelMemory) {
    let html = `<li class="travel-memory" data-id="${travelMemory.id}">
          <div class="list-item">
            <div class="list-item__details">
              <p class="list-item__info"><span>🌎</span> ${travelMemory.location}</p>
              <p class="list-item__info"><span>📅</span> ${travelMemory.date}</p>
            </div>
            <img
              class="list-item__img"
              src="${travelMemory.img}"
              alt=""
            />
          </div>
        </li>`;

    form.insertAdjacentHTML("afterend", html);
  }

  _displayMarker(travelMemory) {
    L.marker(travelMemory.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          minHeight: 50,
          autoClose: false,
          closeOnClick: false,
        })
      )
      .setPopupContent(`<img class="popup-img" src="${travelMemory.img}" />`)
      .openPopup();
  }

  _moveToPopup(e) {
    const travelMemoryEl = e.target.closest(".travel-memory");

    if (!travelMemoryEl) return;

    const travelMemory = this.#travelMemories.find(
      mem => mem.id === travelMemoryEl.dataset.id
    );

    this.#map.setView(travelMemory.coords, this.#mapZoomLevel, {
      animate: true,
      pan: { duration: 1 },
    });
  }

  _setLocalStorage() {
    try {
      localStorage.setItem(
        "travel-memories",
        JSON.stringify(this.#travelMemories)
      );
    } catch (e) {
      alert(
        "Unfortunately, memory may be full. The latest entry won't be saved. 😞"
      );
    }
  }

  _getLocalStorage() {
    // Get data from local storage
    const data = JSON.parse(localStorage.getItem("travel-memories"));

    //if (!data) return;
    if (!data) {
      console.log("No data to load");
      let html = `
          <p class="load-travels__message">...<br>Looks like you haven't added any travel memories yet.<br><br>Click on the map to start.<br>...</p>`;
      loadTravelsContainer.insertAdjacentHTML("afterbegin", html);
      return;
    }

    // save data into array and display data in UI
    this.#travelMemories = data;

    this.#travelMemories.forEach(mem => this._renderList(mem));
    //this.#travelMemories.forEach(mem => this._displayMarker(mem));

    deleteBtn.classList.remove("hidden");
  }

  reset() {
    // verify user wants to delete data
    const confirmAction = confirm(
      "Are you sure you want to delete all data from local storage?"
    );
    if (!confirmAction) return;

    // delete all data from local storage and reload page
    localStorage.removeItem("travel-memories");
    location.reload();
  }
}

const app = new App();
