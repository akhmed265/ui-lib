/* ============================================================
   Toast
   API:
     UIToast.show({ type, title, message, duration, position, closable })
     UIToast.close(id)
     UIToast.closeAll()
   Атрибуты:
     data-ui-toast            — клик показывает тост
     data-ui-toast-type       — info | success | warning | error
     data-ui-toast-title      — заголовок (опционально)
     data-ui-toast-message    — текст (если не задан — берётся из data-ui-toast)
     data-ui-toast-duration   — мс
     data-ui-toast-position   — top-right и т.д.
   ============================================================ */

   (function () {
    "use strict";
  
    const MAX_TOASTS = 5;
    const DEFAULT_DURATION = 4000;
    const DEFAULT_POSITION = "top-right";
    const ANIM_MS = 250;
  
    const containers = {}; // position → DOM-элемент
    const toasts = [];     // { id, el, position, timer, remaining, startedAt }
    let uid = 0;
  
    // ---------- Контейнер ----------
  
    function getContainer(position) {
      if (containers[position]) return containers[position];
  
      const el = document.createElement("div");
      el.className = `ui-toast-container ui-toast-container--${position}`;
      document.body.appendChild(el);
      containers[position] = el;
      return el;
    }
  
    // ---------- Лимит ----------
  
    function enforceLimit() {
      while (toasts.length > MAX_TOASTS) {
        close(toasts[0].id);
      }
    }
  
    // ---------- Показ ----------
  
    function show(opts) {
      const options = Object.assign(
        {
          type: "info",
          title: "",
          message: "",
          duration: DEFAULT_DURATION,
          position: DEFAULT_POSITION,
          closable: true,
        },
        opts || {}
      );
  
      const id = ++uid;
      const container = getContainer(options.position);
  
      const el = document.createElement("div");
      el.className = `ui-toast ui-toast--${options.type}`;
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
  
      // Иконка
      const icon = document.createElement("span");
      icon.className = "ui-toast__icon";
      icon.setAttribute("aria-hidden", "true");
  
      // Контент
      const content = document.createElement("div");
      content.className = "ui-toast__content";
  
      if (options.title) {
        const t = document.createElement("div");
        t.className = "ui-toast__title";
        t.textContent = options.title;
        content.appendChild(t);
      }
  
      const msg = document.createElement("div");
      msg.className = "ui-toast__message";
      msg.textContent = options.message;
      content.appendChild(msg);
  
      el.appendChild(icon);
      el.appendChild(content);
  
      // Кнопка закрытия
      if (options.closable) {
        const closeBtn = document.createElement("button");
        closeBtn.type = "button";
        closeBtn.className = "ui-toast__close";
        closeBtn.setAttribute("aria-label", "Закрыть");
        closeBtn.textContent = "×";
        closeBtn.addEventListener("click", () => close(id));
        el.appendChild(closeBtn);
      }
  
      container.appendChild(el);
      void el.offsetWidth;
      el.classList.add("ui-toast--open");
  
      const record = {
        id,
        el,
        position: options.position,
        timer: null,
        remaining: options.duration,
        startedAt: 0,
        paused: false,
      };
      toasts.push(record);
  
      // Hover — пауза
      el.addEventListener("mouseenter", () => pause(record));
      el.addEventListener("mouseleave", () => resume(record));
  
      // Старт таймера
      if (options.duration > 0) startTimer(record);
  
      enforceLimit();
      return id;
    }
  
    // ---------- Таймеры ----------
  
    function startTimer(record) {
      record.startedAt = Date.now();
      record.timer = setTimeout(() => close(record.id), record.remaining);
    }
  
    function pause(record) {
      if (record.paused || record.remaining <= 0) return;
      record.paused = true;
      clearTimeout(record.timer);
      const elapsed = Date.now() - record.startedAt;
      record.remaining = Math.max(0, record.remaining - elapsed);
    }
  
    function resume(record) {
      if (!record.paused || record.remaining <= 0) return;
      record.paused = false;
      startTimer(record);
    }
  
    // ---------- Закрытие ----------
  
    function close(id) {
      const idx = toasts.findIndex((t) => t.id === id);
      if (idx === -1) return;
      const record = toasts[idx];
      toasts.splice(idx, 1);
  
      clearTimeout(record.timer);
      record.el.classList.remove("ui-toast--open");
      record.el.classList.add("ui-toast--closing");
  
      setTimeout(() => {
        record.el.remove();
        // Удаляем пустой контейнер
        const container = containers[record.position];
        if (container && !container.children.length) {
          container.remove();
          delete containers[record.position];
        }
      }, ANIM_MS);
    }
  
    function closeAll() {
      [...toasts].forEach((t) => close(t.id));
    }
  
    // ---------- Декларативный вызов ----------
  
    document.addEventListener("click", (e) => {
      const trigger = e.target.closest("[data-ui-toast]");
      if (!trigger) return;
      e.preventDefault();
  
      const message =
        trigger.getAttribute("data-ui-toast-message") ||
        trigger.getAttribute("data-ui-toast") ||
        "";
  
      show({
        type: trigger.getAttribute("data-ui-toast-type") || "info",
        title: trigger.getAttribute("data-ui-toast-title") || "",
        message,
        duration: parseInt(
          trigger.getAttribute("data-ui-toast-duration") || DEFAULT_DURATION,
          10
        ),
        position:
          trigger.getAttribute("data-ui-toast-position") || DEFAULT_POSITION,
      });
    });
  
    // ---------- Публичный API ----------
  
    window.UIToast = {
      show,
      close,
      closeAll,
    };
  })();