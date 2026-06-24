let content = null;

const statusEl = document.getElementById("admin-status");

function showStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.hidden = false;
  statusEl.classList.toggle("error", isError);
  setTimeout(() => {
    statusEl.hidden = true;
  }, 3500);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadPhoto(file) {
  const base64 = await fileToBase64(file);
  const response = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: base64 }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "Falha ao enviar a foto");
  }
  const { url } = await response.json();
  return url;
}

async function saveContent() {
  const response = await fetch("/api/content", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(content),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "Falha ao salvar");
  }
}

// ---------- Tabs ----------

document.getElementById("admin-tabs").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-tab]");
  if (!button) return;

  document.querySelectorAll(".admin-tabs button").forEach((b) => b.classList.remove("active"));
  document.querySelectorAll(".admin-panel").forEach((p) => p.classList.remove("active"));

  button.classList.add("active");
  document.getElementById(`panel-${button.dataset.tab}`).classList.add("active");
});

// ---------- Logout ----------

document.getElementById("logout-button").addEventListener("click", async () => {
  await fetch("/api/logout", { method: "POST" });
  window.location.href = "login.html";
});

// ---------- Quartos ----------

const roomsList = document.getElementById("rooms-list");
const roomTemplate = document.getElementById("room-card-template");

function renderRooms() {
  roomsList.innerHTML = "";
  content.rooms.forEach((room, index) => {
    const node = roomTemplate.content.firstElementChild.cloneNode(true);

    const preview = node.querySelector(".room-photo-preview");
    preview.src = room.photo || "";
    preview.alt = room.name || "Quarto";

    node.querySelector(".room-name").value = room.name || "";
    node.querySelector(".room-price").value = room.price || "";
    node.querySelector(".room-amenities").value = (room.amenities || []).join("\n");

    node.querySelector(".room-photo-input").addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      try {
        const url = await uploadPhoto(file);
        room.photo = url;
        preview.src = url;
        showStatus("Foto enviada. Não esqueça de clicar em Salvar.");
      } catch (error) {
        showStatus(error.message, true);
      }
    });

    node.querySelector(".save-room").addEventListener("click", async () => {
      room.name = node.querySelector(".room-name").value.trim();
      room.price = Number(node.querySelector(".room-price").value) || 0;
      room.amenities = node
        .querySelector(".room-amenities")
        .value.split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      try {
        await saveContent();
        showStatus("Quarto salvo!");
      } catch (error) {
        showStatus(error.message, true);
      }
    });

    node.querySelector(".remove-room").addEventListener("click", async () => {
      if (!confirm("Remover este quarto?")) return;
      content.rooms.splice(index, 1);
      try {
        await saveContent();
        renderRooms();
        showStatus("Quarto removido.");
      } catch (error) {
        showStatus(error.message, true);
      }
    });

    roomsList.appendChild(node);
  });
}

document.getElementById("add-room").addEventListener("click", async () => {
  content.rooms.push({ name: "Novo quarto", price: 0, amenities: [], photo: "" });
  try {
    await saveContent();
    renderRooms();
    showStatus("Quarto adicionado.");
  } catch (error) {
    showStatus(error.message, true);
  }
});

// ---------- Sobre ----------

const aboutParagraphsEl = document.getElementById("about-paragraphs");
const aboutHighlightsEl = document.getElementById("about-highlights");
const aboutGalleryEl = document.getElementById("about-gallery");

function renderAboutGallery() {
  aboutGalleryEl.innerHTML = "";
  content.about.gallery.forEach((url, index) => {
    const figure = document.createElement("figure");
    figure.className = "admin-photo-item";
    figure.innerHTML = `<img src="${url}" alt="" /><button type="button">×</button>`;
    figure.querySelector("button").addEventListener("click", async () => {
      content.about.gallery.splice(index, 1);
      try {
        await saveContent();
        renderAboutGallery();
        showStatus("Foto removida.");
      } catch (error) {
        showStatus(error.message, true);
      }
    });
    aboutGalleryEl.appendChild(figure);
  });
}

document.getElementById("save-sobre").addEventListener("click", async () => {
  content.about.paragraphs = aboutParagraphsEl.value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  content.about.highlights = aboutHighlightsEl.value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  try {
    await saveContent();
    showStatus("Página Sobre salva!");
  } catch (error) {
    showStatus(error.message, true);
  }
});

document.getElementById("about-photo-input").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const url = await uploadPhoto(file);
    content.about.gallery.push(url);
    await saveContent();
    renderAboutGallery();
    showStatus("Foto adicionada.");
  } catch (error) {
    showStatus(error.message, true);
  }
  event.target.value = "";
});

// ---------- Fotos (galeria geral) ----------

const galleryGridEl = document.getElementById("gallery-grid");

function renderGallery() {
  galleryGridEl.innerHTML = "";
  content.gallery.forEach((url, index) => {
    const figure = document.createElement("figure");
    figure.className = "admin-photo-item";
    figure.innerHTML = `<img src="${url}" alt="" /><button type="button">×</button>`;
    figure.querySelector("button").addEventListener("click", async () => {
      if (!confirm("Remover esta foto da galeria?")) return;
      content.gallery.splice(index, 1);
      try {
        await saveContent();
        renderGallery();
        showStatus("Foto removida.");
      } catch (error) {
        showStatus(error.message, true);
      }
    });
    galleryGridEl.appendChild(figure);
  });
}

document.getElementById("gallery-photo-input").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const url = await uploadPhoto(file);
    content.gallery.push(url);
    await saveContent();
    renderGallery();
    showStatus("Foto adicionada.");
  } catch (error) {
    showStatus(error.message, true);
  }
  event.target.value = "";
});

// ---------- Vídeo ----------

document.getElementById("save-video").addEventListener("click", async () => {
  content.video_url = document.getElementById("video-url").value.trim() || null;
  try {
    await saveContent();
    showStatus("Vídeo salvo!");
  } catch (error) {
    showStatus(error.message, true);
  }
});

// ---------- Boot ----------

async function init() {
  const meResponse = await fetch("/api/me");
  if (!meResponse.ok) {
    window.location.href = "login.html";
    return;
  }

  const contentResponse = await fetch("/api/content");
  if (!contentResponse.ok) {
    showStatus("Não foi possível carregar o conteúdo do site.", true);
    return;
  }
  content = await contentResponse.json();

  renderRooms();
  aboutParagraphsEl.value = content.about.paragraphs.join("\n");
  aboutHighlightsEl.value = (content.about.highlights || []).join("\n");
  renderAboutGallery();
  renderGallery();
  document.getElementById("video-url").value = content.video_url || "";
}

init();
