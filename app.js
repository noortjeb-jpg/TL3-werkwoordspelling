const state = { screen: "home" };

function renderHome() {
  return `
    <h1>TL3 Werkwoordspelling</h1>
    <p>Kies een onderdeel.</p>
    <div style="display:flex; gap:12px; flex-wrap:wrap;">
      <button data-go="pv">Persoonsvorm</button>
      <button data-go="tt">Tegenwoordige tijd</button>
      <button data-go="vt">Verleden tijd</button>
      <button data-go="vd">Voltooid deelwoord</button>
      <button data-go="gbw">Gebiedende wijs</button>
    </div>
  `;
}

function renderModule(id) {
  return `
    <button data-go="home">Terug</button>
    <h2>Module: ${id.toUpperCase()}</h2>
    <p>Deze module vullen we zo meteen met jouw inhoud.</p>
  `;
}

function render() {
  const app = document.getElementById("app");
  if (!app) return;

  if (state.screen === "home") app.innerHTML = renderHome();
  else app.innerHTML = renderModule(state.screen);

  app.querySelectorAll("[data-go]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.screen = btn.getAttribute("data-go");
      render();
    });
  });
}

render();
;
