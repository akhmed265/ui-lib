/* ============================================================
   Документация UI Lib — общий сайдбар и header
   Один источник правды: список компонентов и логика
   ============================================================ */

   (function () {
    "use strict";
  
    // ---------- Список компонентов ----------
    // Добавляешь новую строку — она появляется во всех страницах.
    const COMPONENTS = [
      { href: "button.html",   title: "Кнопки" },
      { href: "checkbox.html", title: "Чекбоксы" },
      { href: "radio.html",    title: "Radio" },
      { href: "input.html",    title: "Поля ввода" },
      { href: "select.html",   title: "Select" },
      { href: "modal.html",    title: "Modal" },
      { href: "tooltip.html",  title: "Tooltip" },
      { href: "toast.html",    title: "Toast" },
      { href: "card.html",     title: "Card" },
      { href: "tabs.html",     title: "Tabs" },
      { href: "accordion.html", title: "Accordion" },
    ];
  
    // ---------- Определяем контекст страницы ----------
    const path = location.pathname;
    const file = path.split("/").pop() || "index.html";
    const isRoot = file === "index.html" && !path.includes("/components/");
    const inComponents = path.includes("/components/");
  
    // Куда ведут относительные ссылки
    const prefix = inComponents ? "" : "components/";
    const homeHref = inComponents ? "../index.html" : "index.html";
  
    // ---------- Сайдбар ----------
    const aside = document.querySelector("[data-docs-sidebar]");
    if (aside) {
      const links = COMPONENTS.map((c) => {
        const active = c.href === file ? " docs-sidebar__link--active" : "";
        return `<a href="${prefix}${c.href}" class="docs-sidebar__link${active}">${c.title}</a>`;
      }).join("");
  
      aside.innerHTML = `
        <a href="${homeHref}" class="docs-sidebar__logo">UI Lib</a>
        <div class="docs-sidebar__section">
          <div class="docs-sidebar__title">Компоненты</div>
          ${links}
        </div>
      `;
    }
  
    // ---------- Кнопка переключения темы ----------
    // Ищем любой контейнер [data-docs-actions] и вставляем туда кнопку
    const actions = document.querySelector("[data-docs-actions]");
    if (actions) {
      actions.innerHTML = `
        <button class="ui-btn ui-btn--secondary" id="themeToggle">Тема</button>
      `;
    }
  
    // ---------- Логика темы ----------
    const STORAGE_KEY = "ui-docs-theme";
    const html = document.documentElement;
  
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) html.setAttribute("data-theme", saved);
  
    const toggle = document.getElementById("themeToggle");
    if (toggle) {
      toggle.addEventListener("click", () => {
        const current = html.getAttribute("data-theme") || "light";
        const next = current === "dark" ? "light" : "dark";
        html.setAttribute("data-theme", next);
        localStorage.setItem(STORAGE_KEY, next);
      });
    }

      // ---------- Indeterminate для чекбоксов ----------
  document.querySelectorAll("[data-indeterminate]").forEach((el) => {
    el.indeterminate = true;
  });
  })();