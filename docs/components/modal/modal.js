/* ============================================================
   Modal
   Инициализация: автоматическая по data-ui-modal-open
   Открытие:     клик на [data-ui-modal-open="id"]
   Закрытие:     клик на [data-ui-modal-close]
                 клик по overlay
                 клавиша Esc
   Static:       атрибут data-ui-modal-static на .ui-modal
                 отключает закрытие по overlay и Esc
   ============================================================ */

   (function () {
    "use strict";
  
    const OPEN_ATTR = "data-ui-modal-open";
    const CLOSE_ATTR = "data-ui-modal-close";
    const STATIC_ATTR = "data-ui-modal-static";
    const OPEN_CLASS = "ui-modal--open";
    const BODY_CLASS = "ui-modal-open";
    const ANIM_MS = 200;
  
    let lastFocused = null;
    let openCount = 0;
  
    // ---------- Утилиты ----------
  
    function getFocusable(container) {
      const selector = [
        "a[href]",
        "button:not([disabled])",
        "input:not([disabled]):not([type='hidden'])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        "[tabindex]:not([tabindex='-1'])",
      ].join(",");
      return Array.from(container.querySelectorAll(selector)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
    }
  
    function lockScroll() {
      openCount++;
      if (openCount === 1) document.body.classList.add(BODY_CLASS);
    }
  
    function unlockScroll() {
      openCount = Math.max(0, openCount - 1);
      if (openCount === 0) document.body.classList.remove(BODY_CLASS);
    }
  
    // ---------- Открытие / Закрытие ----------
  
    function openModal(modal) {
      if (!modal || !modal.hasAttribute("hidden")) return;
  
      lastFocused = document.activeElement;
  
      modal.removeAttribute("hidden");
      // Форсируем reflow, чтобы transition сработал
      void modal.offsetWidth;
      modal.classList.add(OPEN_CLASS);
  
      lockScroll();
  
      // Автофокус на первый интерактивный элемент
      const content = modal.querySelector(".ui-modal__content");
      const focusables = getFocusable(content);
      if (focusables.length) {
        focusables[0].focus();
      } else {
        content.setAttribute("tabindex", "-1");
        content.focus();
      }
  
      modal.dispatchEvent(new CustomEvent("ui-modal:open", { bubbles: true }));
    }
  
    function closeModal(modal) {
      if (!modal || modal.hasAttribute("hidden")) return;
  
      modal.classList.remove(OPEN_CLASS);
  
      const finish = () => {
        modal.setAttribute("hidden", "");
        modal.removeEventListener("transitionend", onEnd);
        clearTimeout(timer);
      };
  
      const onEnd = (e) => {
        if (e.target === modal.querySelector(".ui-modal__content")) finish();
      };
  
      modal.addEventListener("transitionend", onEnd);
      const timer = setTimeout(finish, ANIM_MS + 50);
  
      unlockScroll();
  
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
        lastFocused = null;
      }
  
      modal.dispatchEvent(new CustomEvent("ui-modal:close", { bubbles: true }));
    }
  
    // ---------- Глобальные обработчики ----------
  
    document.addEventListener("click", (e) => {
      // Открытие
      const opener = e.target.closest(`[${OPEN_ATTR}]`);
      if (opener) {
        e.preventDefault();
        const id = opener.getAttribute(OPEN_ATTR);
        const modal = document.getElementById(id);
        if (modal) openModal(modal);
        return;
      }
  
      // Закрытие по элементу с data-ui-modal-close
      const closer = e.target.closest(`[${CLOSE_ATTR}]`);
      if (closer) {
        const modal = closer.closest(".ui-modal");
        if (modal) {
          // Если клик был по overlay, и модалка static — игнорируем
          if (
            closer.classList.contains("ui-modal__overlay") &&
            modal.hasAttribute(STATIC_ATTR)
          ) {
            return;
          }
          e.preventDefault();
          closeModal(modal);
        }
      }
    });
  
    // Esc
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
  
      // Находим верхнюю открытую модалку
      const openModals = document.querySelectorAll(`.ui-modal.${OPEN_CLASS}`);
      if (!openModals.length) return;
  
      const top = openModals[openModals.length - 1];
      if (top.hasAttribute(STATIC_ATTR)) return;
  
      e.preventDefault();
      closeModal(top);
    });
  
    // Focus trap
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Tab") return;
  
      const openModals = document.querySelectorAll(`.ui-modal.${OPEN_CLASS}`);
      if (!openModals.length) return;
  
      const top = openModals[openModals.length - 1];
      const content = top.querySelector(".ui-modal__content");
      const focusables = getFocusable(content);
  
      if (!focusables.length) {
        e.preventDefault();
        return;
      }
  
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
  
      if (e.shiftKey && (active === first || !content.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    });
  
    // Публичный API (опционально)
    window.UIModal = {
      open(id) {
        const m = typeof id === "string" ? document.getElementById(id) : id;
        if (m) openModal(m);
      },
      close(id) {
        const m = typeof id === "string" ? document.getElementById(id) : id;
        if (m) closeModal(m);
      },
    };
  })();