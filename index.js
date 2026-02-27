// Random Dog Breed Explorer
// Uses The Dog API and guarantees breed info via fallback requests.

const dogImg = document.getElementById("dogImg");
const badge = document.getElementById("badge");
const breedName = document.getElementById("breedName");
const temperament = document.getElementById("temperament");
const lifeSpan = document.getElementById("lifeSpan");
const breedGroup = document.getElementById("breedGroup");
const btn = document.getElementById("btn");
const statusEl = document.getElementById("status");

// Optional API key. Leave empty to use public rate limits.
const API_KEY =
  "live_89VjHdwVHCfYaGQmyZyRxHGaTNq8n7Z3d9oCtwj03sn4CWrnMZdmauzkzekWYtmw";

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

async function fetchRandomDog() {
  statusEl.textContent = "";
  btn.disabled = true;

  try {
    let item = null;

    // First try: direct image with breed metadata.
    const directData = await apiGet(
      "https://api.thedogapi.com/v1/images/search?limit=1&has_breeds=true"
    );
    item = directData[0] || null;

    // Fallback: pick a random breed and request an image for that breed.
    if (!item || !Array.isArray(item.breeds) || item.breeds.length === 0) {
      const breeds = await apiGet("https://api.thedogapi.com/v1/breeds");
      if (!Array.isArray(breeds) || breeds.length === 0) {
        throw new Error("No breeds available from API.");
      }

      const randomBreed = breeds[Math.floor(Math.random() * breeds.length)];
      const byBreedData = await apiGet(
        `https://api.thedogapi.com/v1/images/search?limit=1&breed_ids=${randomBreed.id}`
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

    dogImg.src = item.url;
    dogImg.alt = `${breed.name || "Dog"} image`;

    badge.hidden = false;
    badge.textContent = "Breed";

    breedName.textContent = breed.name || "Unknown breed";
    temperament.textContent = breed.temperament || "-";

    lifeSpan.textContent = breed.life_span || "-";
    breedGroup.textContent = breed.breed_group || "-";
  } catch (err) {
    resetBreedInfo();
    statusEl.textContent = "Could not load breed details. Please try again.";
    console.error(err);
  } finally {
    btn.disabled = false;
  }
}

btn.addEventListener("click", fetchRandomDog);
fetchRandomDog();
