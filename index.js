// Random Dog Breed Explorer
// Uses separate GET requests for image view and breed details view.

const dogImg = document.getElementById("dogImg");
const badge = document.getElementById("badge");
const breedName = document.getElementById("breedName");
const temperament = document.getElementById("temperament");
const lifeSpan = document.getElementById("lifeSpan");
const breedGroup = document.getElementById("breedGroup");
const btn = document.getElementById("btn");
const statusEl = document.getElementById("status");

const imageViewBtn = document.getElementById("imageViewBtn");
const detailsViewBtn = document.getElementById("detailsViewBtn");

// Optional API key. Leave empty to use public rate limits.
const API_KEY =
  "live_89VjHdwVHCfYaGQmyZyRxHGaTNq8n7Z3d9oCtwj03sn4CWrnMZdmauzkzekWYtmw";

let currentBreedId = null;
let currentBreedName = "Unknown breed";
let currentBreedData = null;

function resetBreedInfo() {
  badge.hidden = true;
  breedName.textContent = "Unknown breed";
  temperament.textContent = "-";
  lifeSpan.textContent = "-";
  breedGroup.textContent = "-";
}

async function apiGet(url) {
  const res = await fetch(url, {
    headers: API_KEY ? { "x-api-key": API_KEY } : {},
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

  return res.json();
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

async function loadImageView() {
  statusEl.textContent = "";
  btn.disabled = true;
  imageViewBtn.disabled = true;
  detailsViewBtn.disabled = true;

  try {
    let item = null;

    // GET request #1: image endpoint
    const directData = await apiGet(
      "https://api.thedogapi.com/v1/images/search?limit=1&has_breeds=true",
    );
    item = directData[0] || null;

    // Fallback: if breed metadata is missing, pick a random breed
    if (!item || !Array.isArray(item.breeds) || item.breeds.length === 0) {
      const breeds = await apiGet("https://api.thedogapi.com/v1/breeds");

      if (!Array.isArray(breeds) || breeds.length === 0) {
        throw new Error("No breeds available from API.");
      }

      const randomBreed = breeds[Math.floor(Math.random() * breeds.length)];

      const byBreedData = await apiGet(
        `https://api.thedogapi.com/v1/images/search?limit=1&breed_ids=${randomBreed.id}`,
      );

      item = byBreedData[0] || { url: "", breeds: [randomBreed] };

      if (!Array.isArray(item.breeds) || item.breeds.length === 0) {
        item.breeds = [randomBreed];
      }
    }

    if (!item || !item.url) {
      throw new Error("No dog image returned by API.");
    }

    const breed = item.breeds && item.breeds[0] ? item.breeds[0] : null;

    if (!breed) {
      throw new Error("Breed info not available for this image.");
    }

    currentBreedId = breed.id ?? null;
    currentBreedName = breed.name || "Unknown breed";
    currentBreedData = breed;

    dogImg.src = item.url;
    dogImg.alt = `${currentBreedName} image`;

    badge.hidden = false;
    badge.textContent = "Breed";

    // Image view only shows basic info
    breedName.textContent = currentBreedName;
    temperament.textContent = "-";
    lifeSpan.textContent = "-";
    breedGroup.textContent = "-";

    statusEl.textContent = "Dog image loaded.";
  } catch (err) {
    resetBreedInfo();
    currentBreedId = null;
    currentBreedName = "Unknown breed";
    currentBreedData = null;
    statusEl.textContent = "Could not load dog image. Please try again.";
    console.error(err);
  } finally {
    btn.disabled = false;
    imageViewBtn.disabled = false;
    detailsViewBtn.disabled = false;
  }
}

async function loadDetailsView() {
  statusEl.textContent = "";
  btn.disabled = true;
  imageViewBtn.disabled = true;
  detailsViewBtn.disabled = true;

  try {
    if (!currentBreedId && !currentBreedName) {
      await loadImageView();
    }

    // GET request #2: breeds endpoint
    const breeds = await apiGet("https://api.thedogapi.com/v1/breeds");

    if (!Array.isArray(breeds) || breeds.length === 0) {
      throw new Error("No breeds available from API.");
    }

    let breedDetails = null;

    // First try matching by id
    if (currentBreedId !== null) {
      breedDetails = breeds.find(
        (breed) => String(breed.id) === String(currentBreedId),
      );
    }

    // If id match fails, try matching by name
    if (!breedDetails && currentBreedName) {
      breedDetails = breeds.find(
        (breed) =>
          normalizeText(breed.name) === normalizeText(currentBreedName),
      );
    }

    // Final fallback: use breed info from image response
    if (!breedDetails && currentBreedData) {
      breedDetails = currentBreedData;
    }

    if (!breedDetails) {
      throw new Error("Breed details not found.");
    }

    badge.hidden = false;
    badge.textContent = "Breed";

    breedName.textContent =
      breedDetails.name || currentBreedName || "Unknown breed";
    temperament.textContent = breedDetails.temperament || "-";
    lifeSpan.textContent = breedDetails.life_span || "-";
    breedGroup.textContent = breedDetails.breed_group || "-";

    statusEl.textContent = "Breed details loaded.";
  } catch (err) {
    temperament.textContent = currentBreedData?.temperament || "-";
    lifeSpan.textContent = currentBreedData?.life_span || "-";
    breedGroup.textContent = currentBreedData?.breed_group || "-";
    statusEl.textContent =
      "Could not load full breed details. Showing available info.";
    console.error(err);
  } finally {
    btn.disabled = false;
    imageViewBtn.disabled = false;
    detailsViewBtn.disabled = false;
  }
}

imageViewBtn.addEventListener("click", loadImageView);
detailsViewBtn.addEventListener("click", loadDetailsView);
btn.addEventListener("click", loadImageView);

// Load image view first
loadImageView();
