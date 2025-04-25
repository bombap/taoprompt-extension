export function generateId(length: number = 4): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < length; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }

 export function getFullSelector(el: Element | null): string | undefined {
  if (!el) return;

  const parts: string[] = [];

  while (el && el.nodeType === Node.ELEMENT_NODE && el !== document.body) {
    let selector = el.nodeName.toLowerCase();

    if (el.id) {
      selector += `#${el.id}`;
      parts.unshift(selector);
      break; // ID là duy nhất trong DOM, không cần tiếp tục
    } else {
      let nth = 1;
      let sibling = el.previousElementSibling;

      while (sibling) {
        if (sibling.nodeName.toLowerCase() === selector) nth++;
        sibling = sibling.previousElementSibling;
      }

      selector += `:nth-of-type(${nth})`;
    }

    parts.unshift(selector);
    el = el.parentElement!;
  }

  return parts.join(" > ");
}