/* ============================================================
   UI Lib — точка входа для JS-компонентов
   Пока все компоненты — самодостаточные IIFE,
   которые вешаются на document. Здесь мы их просто импортируем.
   ============================================================ */

   export const version = "0.1.0";

   // Компоненты с JS
   import "../docs/components/modal/modal.js";
   import "../docs/components/tooltip/tooltip.js";
   import "../docs/components/toast/toast.js";
   import "../docs/components/tabs/tabs.js";
   import "../docs/components/accordion/accordion.js";