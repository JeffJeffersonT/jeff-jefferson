// Click a smiley to drop it into the nearest message box.
const insert = (textarea: HTMLTextAreaElement, text: string) => {
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? start;
  const before = textarea.value.slice(0, start);
  const after = textarea.value.slice(end);
  const padLeft = before.length === 0 || before.endsWith(" ") || before.endsWith("\n") ? "" : " ";
  const next = before + padLeft + text + " " + after;
  textarea.value = next;
  const pos = (before + padLeft + text + " ").length;
  textarea.focus();
  textarea.setSelectionRange(pos, pos);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
};

document.querySelectorAll<HTMLElement>(".smileys").forEach(box => {
  const targetId = box.dataset.for;
  if (!targetId) return;
  const area = document.getElementById(targetId) as HTMLTextAreaElement | null;
  if (!area) return;
  box.querySelectorAll<HTMLButtonElement>("button[data-emoticon]").forEach(btn => {
    btn.addEventListener("click", ev => {
      ev.preventDefault();
      const face = btn.dataset.emoticon;
      if (face) insert(area, face);
    });
  });
});
export {};
