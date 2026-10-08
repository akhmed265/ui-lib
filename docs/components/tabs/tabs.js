/* ============================================================
   Tabs
   Инициализация: автоматически для всех [data-ui-tabs]
   Разметка:
     <div class="ui-tabs" data-ui-tabs>
       <div class="ui-tabs__list" role="tablist">
         <button class="ui-tabs__tab" role="tab" aria-selected="true">...</button>
       </div>
       <div class="ui-tabs__panel" role="tabpanel">...</div>
     </div>
   Событие: ui-tabs:change (detail: { index, tab, panel })
   ============================================================ */

   (function () {
    "use strict";
  
    function initTabs(root) {
      const list = root.querySelector(".ui-tabs__list");
      if (!list) return;
  
      const tabs = Array.from(list.querySelectorAll(".ui-tabs__tab"));
      const panels = Array.from(root.querySelectorAll(".ui-tabs__panel"));
      if (!tabs.length || tabs.length !== panels.length) return;
  
      // Убедимся, что у всех есть id и связки
      tabs.forEach((tab, i) => {
        if (!tab.id) tab.id = `ui-tab-${Math.random().toString(36).slice(2, 8)}-${i}`;
        tab.setAttribute("role", "tab");
        const panel = panels[i];
        if (!panel.id) panel.id = `ui-tabpanel-${Math.random().toString(36).slice(2, 8)}-${i}`;
        panel.setAttribute("role", "tabpanel");
        panel.setAttribute("aria-labelledby", tab.id);
        panel.setAttribute("tabindex", "0");
        tab.setAttribute("aria-controls", panel.id);
      });
  
      // Определяем стартовый индекс
      let activeIndex = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
      if (activeIndex === -1) activeIndex = 0;
  
      function setActive(index, focusTab = false) {
        if (index < 0 || index >= tabs.length) return;
  
        tabs.forEach((tab, i) => {
          const selected = i === index;
          tab.setAttribute("aria-selected", selected ? "true" : "false");
          tab.setAttribute("tabindex", selected ? "0" : "-1");
          panels[i].hidden = !selected;
        });
  
        activeIndex = index;
  
        if (focusTab) tabs[index].focus();
  
        root.dispatchEvent(
          new CustomEvent("ui-tabs:change", {
            bubbles: true,
            detail: { index, tab: tabs[index], panel: panels[index] },
          })
        );
      }
  
      // Клик по табу
      tabs.forEach((tab, i) => {
        tab.addEventListener("click", () => {
          if (tab.disabled) return;
          setActive(i);
        });
      });
  
      // Клавиатура
      list.addEventListener("keydown", (e) => {
        const current = tabs.indexOf(document.activeElement);
        if (current === -1) return;
  
        let next = current;
        const isHorizontal = true; // пока только горизонтальные
  
        const prevKey = isHorizontal ? "ArrowLeft" : "ArrowUp";
        const nextKey = isHorizontal ? "ArrowRight" : "ArrowDown";
  
        if (e.key === prevKey) {
          next = current - 1;
          if (next < 0) next = tabs.length - 1;
        } else if (e.key === nextKey) {
          next = current + 1;
          if (next >= tabs.length) next = 0;
        } else if (e.key === "Home") {
          next = 0;
        } else if (e.key === "End") {
          next = tabs.length - 1;
        } else {
          return;
        }
  
        e.preventDefault();
        setActive(next, true);
      });
  
      // Стартовая установка (без фокуса, без события)
      tabs.forEach((tab, i) => {
        const selected = i === activeIndex;
        tab.setAttribute("aria-selected", selected ? "true" : "false");
        tab.setAttribute("tabindex", selected ? "0" : "-1");
        panels[i].hidden = !selected;
      });
  
      // Scrollable — fade по краям
      if (root.classList.contains("ui-tabs--scrollable")) {
        updateScrollState();
        list.addEventListener("scroll", updateScrollState, { passive: true });
        window.addEventListener("resize", updateScrollState);
      }
  
      function updateScrollState() {
        const max = list.scrollWidth - list.clientWidth;
        root.classList.toggle("is-scrollable-left", list.scrollLeft > 4);
        root.classList.toggle("is-scrollable-right", list.scrollLeft < max - 4);
        root.classList.toggle(
          "is-scrollable",
          max > 4 && (list.scrollLeft > 4 || list.scrollLeft < max - 4)
        );
      }
    }
  
    function initAll() {
      document.querySelectorAll("[data-ui-tabs]").forEach(initTabs);
    }
  
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initAll);
    } else {
      initAll();
    }
  })();