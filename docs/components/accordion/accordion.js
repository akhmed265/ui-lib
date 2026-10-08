/* ============================================================
   Accordion
   Инициализация: автоматически для всех [data-ui-accordion]
   Режимы:
     по умолчанию — открыт максимум один раздел (single)
     --multiple   — можно открывать несколько
   Изначально открытые: класс .ui-accordion__item--open
   Событие: ui-accordion:change (detail: { index, open, item })
   ============================================================ */

   (function () {
    "use strict";
  
    function initAccordion(root) {
      const items = Array.from(root.querySelectorAll(".ui-accordion__item"));
      if (!items.length) return;
  
      const isMultiple = root.classList.contains("ui-accordion--multiple");
  
      items.forEach((item, index) => {
        const trigger = item.querySelector(".ui-accordion__trigger");
        const content = item.querySelector(".ui-accordion__content");
        if (!trigger || !content) return;
  
        // ARIA-связки
        if (!trigger.id) {
          trigger.id = `ui-accordion-trigger-${Math.random().toString(36).slice(2, 8)}-${index}`;
        }
        if (!content.id) {
          content.id = `ui-accordion-panel-${Math.random().toString(36).slice(2, 8)}-${index}`;
        }
        trigger.setAttribute("aria-controls", content.id);
        content.setAttribute("role", "region");
        content.setAttribute("aria-labelledby", trigger.id);
  
        // Стартовое состояние
        const initiallyOpen = item.classList.contains("ui-accordion__item--open");
        trigger.setAttribute("aria-expanded", initiallyOpen ? "true" : "false");
  
        // Клик
        trigger.addEventListener("click", () => {
          if (trigger.disabled) return;
          toggleItem(item, !item.classList.contains("ui-accordion__item--open"));
        });
  
        // Клавиатура
        trigger.addEventListener("keydown", (e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            const dir = e.key === "ArrowDown" ? 1 : -1;
            let next = index + dir;
            if (next < 0) next = items.length - 1;
            if (next >= items.length) next = 0;
            const nextTrigger = items[next].querySelector(".ui-accordion__trigger");
            if (nextTrigger && !nextTrigger.disabled) nextTrigger.focus();
          } else if (e.key === "Home") {
            e.preventDefault();
            const firstTrigger = items[0].querySelector(".ui-accordion__trigger");
            if (firstTrigger) firstTrigger.focus();
          } else if (e.key === "End") {
            e.preventDefault();
            const lastTrigger = items[items.length - 1].querySelector(".ui-accordion__trigger");
            if (lastTrigger) lastTrigger.focus();
          }
        });
      });
  
      function toggleItem(item, open) {
        const trigger = item.querySelector(".ui-accordion__trigger");
        if (!trigger) return;
  
        if (open) {
          // Single: закрываем остальные
          if (!isMultiple) {
            items.forEach((other) => {
              if (other !== item && other.classList.contains("ui-accordion__item--open")) {
                other.classList.remove("ui-accordion__item--open");
                const t = other.querySelector(".ui-accordion__trigger");
                if (t) t.setAttribute("aria-expanded", "false");
              }
            });
          }
          item.classList.add("ui-accordion__item--open");
          trigger.setAttribute("aria-expanded", "true");
        } else {
          item.classList.remove("ui-accordion__item--open");
          trigger.setAttribute("aria-expanded", "false");
        }
  
        const index = items.indexOf(item);
        root.dispatchEvent(
          new CustomEvent("ui-accordion:change", {
            bubbles: true,
            detail: { index, open, item },
          })
        );
      }
    }
  
    function initAll() {
      document.querySelectorAll("[data-ui-accordion]").forEach(initAccordion);
    }
  
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initAll);
    } else {
      initAll();
    }
  })();