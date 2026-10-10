/* ============================================================
   Avatar — утилиты для инициалов с авто-цветом
   Работает автоматически для:
     - .ui-avatar--initials[data-name]  → генерирует инициалы и цвет
     - .ui-avatar__img с data-fallback  → прячет битую картинку

   Авто-цвет НЕ перезаписывает --ui-avatar-bg, если он задан
   в inline-стиле пользователем.
   ============================================================ */

   (function () {
    "use strict";
  
    // Палитра — 8 приятных цветов
    const PALETTE = [
      "#2563eb", // blue
      "#16a34a", // green
      "#dc2626", // red
      "#f59e0b", // amber
      "#8b5cf6", // violet
      "#ec4899", // pink
      "#0ea5e9", // sky
      "#14b8a6", // teal
    ];
  
    // Простой хеш строки → число
    function hashString(str) {
      let h = 0;
      for (let i = 0; i < str.length; i++) {
        h = (h << 5) - h + str.charCodeAt(i);
        h |= 0;
      }
      return Math.abs(h);
    }
  
    // Инициалы: "Иван Петров" → "ИП"
    function getInitials(name) {
      if (!name) return "?";
      const parts = name.trim().split(/\s+/).slice(0, 2);
      return parts.map((p) => p.charAt(0).toUpperCase()).join("");
    }
  
    function processInitials(el) {
      const name = el.getAttribute("data-name") || el.textContent || "";
      const initials = getInitials(name);
  
      // Ставим текст, если внутри ничего нет
      if (!el.querySelector(".ui-avatar__initials") && !el.querySelector(".ui-avatar__img")) {
        if (el.textContent.trim() === "" || el.textContent.trim() === name) {
          el.innerHTML = `<span class="ui-avatar__initials">${initials}</span>`;
        }
      }
  
      // Авто-цвет — только если пользователь не задал --ui-avatar-bg
      const hasCustomBg = el.style.getPropertyValue("--ui-avatar-bg");
      if (!hasCustomBg && name) {
        const color = PALETTE[hashString(name) % PALETTE.length];
        el.style.setProperty("--ui-avatar-bg", color);
      }
    }
  
    function processFallback(img) {
      img.addEventListener("error", () => {
        const parent = img.closest(".ui-avatar");
        if (!parent) return;
  
        // Скрываем битую картинку
        img.style.display = "none";
  
        // Если есть data-name — показываем инициалы
        const name = parent.getAttribute("data-name") || "";
        if (!parent.querySelector(".ui-avatar__initials")) {
          const span = document.createElement("span");
          span.className = "ui-avatar__initials";
          span.textContent = getInitials(name);
          parent.appendChild(span);
        }
  
        // Автоцвет, если не задан
        const hasCustomBg = parent.style.getPropertyValue("--ui-avatar-bg");
        if (!hasCustomBg && name) {
          parent.style.setProperty("--ui-avatar-bg", PALETTE[hashString(name) % PALETTE.length]);
        }
      }, { once: true });
    }
  
    function initAll() {
      document.querySelectorAll(".ui-avatar--initials[data-name]").forEach(processInitials);
      document.querySelectorAll(".ui-avatar__img[data-fallback]").forEach(processFallback);
    }
  
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initAll);
    } else {
      initAll();
    }
  })();