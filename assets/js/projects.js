// ============================================
// 1. DATA: dito ka lang magdadagdag ng project
// type: "landing" | "websites" | "gamedev"
// ============================================
const projects = [
    {
        title: "a.Blog",
        type: "websites",
        desc: "A personal blog website where posts can be written, browsed, and saved, all in a single page.",
        img: "assets/imgs/poster/ACT02/ablog-poster.png",
        tech: ["HTML", "CSS", "Bootstrap", "JavaScript"],
        live: "ACT02/index.html",
        source: "https://github.com/patwickssss/_webdev/tree/main/ACT02",
    },
    {
        title: "a.Gallery",
        type: "landing",
        desc: "A static photo gallery website created to showcase original photography, artwork, and visual collections.",
        img: "assets/imgs/poster/ACT01/gallery-poster.png",
        tech: ["HTML", "Bootstrap"],
        live: "ACT02/index.html",
        source: "https://github.com/patwickssss/_webdev/tree/main/ACT01",
    },
    // {
    //   title: "Next Project",
    //   type: "landing",
    //   desc: "Description here.",
    //   img: "assets/imgs/next.png",
    //   tech: ["HTML", "CSS", "JavaScript"],
    //   live: "ACT03/index.html",
    //   source: "https://github.com/...",
    // },
];

// ============================================
// 2. RENDER CARDS
// ============================================
const frameColors = ["--coral", "--mint", "--sun"];
const techTag = (t) => `
  <span class="d-flex border border-2 rounded-3 px-2 align-items-center fw-medium"
        style="background: var(--paper); color: var(--ink); border-color: var(--muted); font-size: small;">${t}</span>`;

document.getElementById("projectList").innerHTML = projects
    .map(
        (p, i) => `
  <div class="col-md-6 col-lg-4 project" data-type="${p.type}">
    <div class="card project-card rounded-4 overflow-hidden box-shadow text-light border-2 border-dark"
         style="min-height: 250px;" data-bs-toggle="modal" data-bs-target="#projectModal" data-index="${i}">
      <div class="d-flex align-items-center gap-3 py-2 px-3 border-0 border-bottom border-2 border-dark"
           style="background: var(${frameColors[i % frameColors.length]});">
        <span class="dot" style="background: var(--sun);"></span>
        <span class="dot" style="background: var(--paper);"></span>
        <span class="dot" style="background: var(--mint);"></span>
        <span class="bg-light w-100 text-dark px-3 py-1 ms-2 rounded-5">${p.title.toLowerCase()}.com</span>
      </div>
      <div class="card" style="height: 230px; background: var(--muted);">
        ${p.img ? `<img src="${p.img}" alt="${p.title}">` : ""}
      </div>
      <div class="d-flex flex-column flex-grow-1 py-3 px-4" style="color: var(--ink);">
        <div class="h5 fw-bold">${p.title}</div>
        <p style="text-align: justify;">${p.desc}</p>
        <div class="d-flex flex-wrap gap-2 mb-3">${p.tech.map(techTag).join("")}</div>
      </div>
    </div>
  </div>`
    )
    .join("");

// ============================================
// 3. MODAL (isa lang, napupunan base sa project na na-click)
// ============================================
document.getElementById("projectModal").addEventListener("show.bs.modal", (e) => {
    const p = projects[e.relatedTarget.dataset.index];

    document.getElementById("projectModalTitle").textContent = p.title;
    document.getElementById("projectModalDesc").textContent = p.desc;
    document.getElementById("projectModalTech").innerHTML = p.tech.map(techTag).join("");

    const img = document.getElementById("projectModalImg");
    img.src = p.img;
    img.alt = p.title;
    img.classList.toggle("d-none", !p.img);

    const setLink = (id, url) => {
        const el = document.getElementById(id);
        el.href = url || "#";
        el.classList.toggle("d-none", !url);
    };
    setLink("projectModalLive", p.live);
    setLink("projectModalSource", p.source);
});

// ============================================
// 4. FILTER
// ============================================
const buttons = document.querySelectorAll(".filter-btn");
buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const f = btn.dataset.filter;
        document.querySelectorAll(".project").forEach((el) => {
            el.classList.toggle("d-none", f !== "all" && el.dataset.type !== f);
        });
    });
});