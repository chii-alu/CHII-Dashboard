// Saves the whole dashboard page as one PNG, from the top of the page to the bottom.

// html2canvas does not lay out CSS grid or flex `gap` the way the browser does, so the copy it
// draws is rewritten first: grids become fixed-width flex rows and gaps become margins.
function flattenLayout(doc: Document) {
  const view = doc.defaultView ?? window;
  doc.querySelectorAll<HTMLElement>("*").forEach(el => {
    const cs = view.getComputedStyle(el);
    const colGap = parseFloat(cs.columnGap) || 0;
    const rowGap = parseFloat(cs.rowGap) || 0;
    if (cs.display === "grid") {
      const cols = cs.gridTemplateColumns.split(" ").map(parseFloat).filter(n => !isNaN(n));
      if (cols.length === 0) return;
      el.style.display = "flex";
      el.style.flexWrap = "wrap";
      el.style.gap = "0";
      el.style.alignItems = "flex-start";
      Array.from(el.children).forEach((child, i) => {
        const c = child as HTMLElement;
        const col = i % cols.length;
        const w = cols[col];
        c.style.boxSizing = "border-box";
        c.style.flex = `0 0 ${w}px`;
        c.style.width = `${w}px`;
        c.style.maxWidth = `${w}px`;
        c.style.marginLeft = col === 0 ? "0" : `${colGap}px`;
        c.style.marginTop = i >= cols.length ? `${rowGap}px` : "0";
      });
    } else if (cs.display.includes("flex") && (colGap || rowGap)) {
      el.style.gap = "0";
      Array.from(el.children).forEach(child => {
        const c = child as HTMLElement;
        c.style.marginRight = `${colGap}px`;
        c.style.marginBottom = `${rowGap}px`;
      });
    }
  });
}

export async function downloadDashboard(name: string) {
  const html2canvas = (await import("html2canvas")).default;
  const height = document.documentElement.scrollHeight;
  // Keep the image under the browser's canvas size limit on very long pages.
  const scale = Math.min(1.5, 15000 / height);
  const canvas = await html2canvas(document.body, {
    backgroundColor: getComputedStyle(document.body).backgroundColor || "#ffffff",
    scale,
    width: document.documentElement.scrollWidth,
    height,
    windowWidth: document.documentElement.scrollWidth,
    windowHeight: height,
    scrollX: 0,
    scrollY: 0,
    // The navigation bar is left out of the image.
    ignoreElements: (el) => el.hasAttribute("data-export-ignore"),
    onclone: (doc) => flattenLayout(doc),
  });
  const link = document.createElement("a");
  link.download = `${name.replace(/[^\w]+/g, "-").toLowerCase()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
