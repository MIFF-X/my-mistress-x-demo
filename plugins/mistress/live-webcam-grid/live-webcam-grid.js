export function createLiveWebcamGrid(subs = []) {
  const container = document.createElement("div");
  container.className = "live-webcam-grid-container";

  const header = document.createElement("h2");
  header.innerText = "Live Webcam Grid";
  header.style.textAlign = "center";
  header.style.marginBottom = "20px";
  container.appendChild(header);

  const grid = document.createElement("div");
  grid.className = "webcam-grid";
  container.appendChild(grid);

  subs.forEach((sub) => {
    const card = document.createElement("div");
    card.className = "webcam-card";

    // Placeholder for webcam feed
    const videoPlaceholder = document.createElement("div");
    videoPlaceholder.className = "video-placeholder";
    videoPlaceholder.innerText = "📷 " + sub.name;
    card.appendChild(videoPlaceholder);

    // Sub info and controls
    const info = document.createElement("div");
    info.className = "sub-info";
    info.innerHTML = `
      <p><strong>${sub.name}</strong></p>
      <p>Status: ${sub.status}</p>
      <button class="interact-btn">Interact</button>
    `;
    card.appendChild(info);

    // Interaction button event
    info.querySelector(".interact-btn").onclick = () => {
      alert(`Interacting with ${sub.name}`);
      // Here you can add more interaction logic
    };

    grid.appendChild(card);
  });

  return container;
}
