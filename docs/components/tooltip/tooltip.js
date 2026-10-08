/* ============================================================
   Tooltip
   Инициализация: любой элемент с [data-ui-tooltip]
   Атрибуты:
     data-ui-tooltip            — текст подсказки (обязательно)
     data-ui-tooltip-placement  — top | bottom | left | right (default: top)
     data-ui-tooltip-delay      — задержка показа в мс (default: 200)
   ============================================================ */

   (function () {
    "use strict";
  
    const HIDE_DELAY = 80;   // мс — чтобы не мигало при переходе
    const OFFSET = 8;        // отступ от триггера
    const ARROW = 5;         // насколько стрелка выступает
  
    let tooltipEl = null;
    let arrowEl = null;
    let currentTrigger = null;
    let showTimer = null;
    let hideTimer = null;
    let uid = 0;
  
    // ---------- Создание элемента ----------
  
    function ensureElement() {
      if (tooltipEl) return;
      tooltipEl = document.createElement("div");
      tooltipEl.className = "ui-tooltip";
      tooltipEl.setAttribute("role", "tooltip");
      tooltipEl.setAttribute("hidden", "");
  
      arrowEl = document.createElement("span");
      arrowEl.className = "ui-tooltip__arrow";
      arrowEl.setAttribute("aria-hidden", "true");
  
      tooltipEl.appendChild(arrowEl);
      document.body.appendChild(tooltipEl);
    }
  
    // ---------- Позиционирование ----------
  
    function position(trigger, placement) {
      const rect = trigger.getBoundingClientRect();
      const tipRect = tooltipEl.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
  
      let top = 0;
      let left = 0;
  
      switch (placement) {
        case "top":
          top = rect.top - tipRect.height - OFFSET;
          left = rect.left + rect.width / 2 - tipRect.width / 2;
          break;
        case "bottom":
          top = rect.bottom + OFFSET;
          left = rect.left + rect.width / 2 - tipRect.width / 2;
          break;
        case "left":
          top = rect.top + rect.height / 2 - tipRect.height / 2;
          left = rect.left - tipRect.width - OFFSET;
          break;
        case "right":
          top = rect.top + rect.height / 2 - tipRect.height / 2;
          left = rect.right + OFFSET;
          break;
      }
  
      // Прижимаем к краям экрана, чтобы не улетало
      left = Math.max(8, Math.min(left, vw - tipRect.width - 8));
      top = Math.max(8, Math.min(top, vh - tipRect.height - 8));
  
      tooltipEl.style.top = `${top}px`;
      tooltipEl.style.left = `${left}px`;
  
      // Позиция стрелки: сдвигаем её по центру триггера
      if (placement === "top" || placement === "bottom") {
        const triggerCenterX = rect.left + rect.width / 2;
        arrowEl.style.left = `${triggerCenterX - left - 4}px`;
        arrowEl.style.top = "";
        arrowEl.style.marginLeft = "";
        arrowEl.style.marginTop = "";
      } else {
        const triggerCenterY = rect.top + rect.height / 2;
        arrowEl.style.top = `${triggerCenterY - top - 4}px`;
        arrowEl.style.left = "";
        arrowEl.style.marginTop = "";
        arrowEl.style.marginLeft = "";
      }
    }
  
    // ---------- Авто-флип при выходе за край ----------
  
    function resolvePlacement(trigger, placement) {
      const rect = trigger.getBoundingClientRect();
      const tipRect = tooltipEl.getBoundingClientRect();
      const vh = window.innerHeight;
      const vw = window.innerWidth;
  
      if (placement === "top" && rect.top - tipRect.height - OFFSET < 8) return "bottom";
      if (placement === "bottom" && rect.bottom + tipRect.height + OFFSET > vh - 8) return "top";
      if (placement === "left" && rect.left - tipRect.width - OFFSET < 8) return "right";
      if (placement === "right" && rect.right + tipRect.width + OFFSET > vw - 8) return "left";
      return placement;
    }
  
    // ---------- Показ / Скрытие ----------
  
    function show(trigger) {
      ensureElement();
      clearTimeout(hideTimer);
      clearTimeout(showTimer);
  
      const text = trigger.getAttribute("data-ui-tooltip") || "";
      const delay = parseInt(trigger.getAttribute("data-ui-tooltip-delay") || "200", 10);
      const requested = trigger.getAttribute("data-ui-tooltip-placement") || "top";
  
      const run = () => {
        tooltipEl.textContent = text;
        tooltipEl.appendChild(arrowEl);
  
        // Временно показываем, чтобы измерить
        tooltipEl.removeAttribute("hidden");
        tooltipEl.style.visibility = "hidden";
        tooltipEl.style.top = "-9999px";
        tooltipEl.style.left = "-9999px";
  
        const placement = resolvePlacement(trigger, requested);
        tooltipEl.setAttribute("data-placement", placement);
  
        position(trigger, placement);
  
        tooltipEl.style.visibility = "";
        void tooltipEl.offsetWidth;
        tooltipEl.classList.add("ui-tooltip--open");
  
        // aria-describedby
        if (!tooltipEl.id) tooltipEl.id = `ui-tooltip-${++uid}`;
        trigger.setAttribute("aria-describedby", tooltipEl.id);
  
        currentTrigger = trigger;
      };
  
      if (delay > 0) {
        showTimer = setTimeout(run, delay);
      } else {
        run();
      }
    }
  
    function hide(immediate) {
      if (!currentTrigger && !tooltipEl) return;
      clearTimeout(showTimer);
  
      const doHide = () => {
        if (!tooltipEl) return;
        tooltipEl.classList.remove("ui-tooltip--open");
        if (currentTrigger) currentTrigger.removeAttribute("aria-describedby");
        currentTrigger = null;
  
        setTimeout(() => {
          if (!currentTrigger && tooltipEl) {
            tooltipEl.setAttribute("hidden", "");
          }
        }, 150);
      };
  
      if (immediate) {
        doHide();
      } else {
        hideTimer = setTimeout(doHide, HIDE_DELAY);
      }
    }
  
    // ---------- Обработчики ----------
  
    function getTrigger(target) {
      return target.closest("[data-ui-tooltip]");
    }
  
    document.addEventListener("mouseover", (e) => {
      const trigger = getTrigger(e.target);
      if (!trigger) return;
      if (trigger === currentTrigger) return;
      show(trigger);
    });
  
    document.addEventListener("mouseout", (e) => {
      const trigger = getTrigger(e.target);
      if (!trigger) return;
      // Уходим с триггера наружу?
      if (e.relatedTarget && trigger.contains(e.relatedTarget)) return;
      hide();
    });
  
    document.addEventListener("focusin", (e) => {
      const trigger = getTrigger(e.target);
      if (!trigger) return;
      show(trigger);
    });
  
    document.addEventListener("focusout", (e) => {
      const trigger = getTrigger(e.target);
      if (!trigger) return;
      hide();
    });
  
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && currentTrigger) {
        hide(true);
      }
    });
  
    document.addEventListener("click", (e) => {
      const trigger = getTrigger(e.target);
      if (trigger && currentTrigger === trigger) {
        hide(true);
      }
    });
  
    // При скролле — перепозиционируем (или скрываем, если ушёл)
    window.addEventListener("scroll", () => {
      if (currentTrigger && tooltipEl && !tooltipEl.hasAttribute("hidden")) {
        const placement = tooltipEl.getAttribute("data-placement") || "top";
        position(currentTrigger, placement);
      }
    }, true);
  })();