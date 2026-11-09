// Saves a panel's body as a PNG, including the legend rows under the chart.
export async function downloadChart(container: HTMLElement, name: string) {
  const html2canvas = (await import("html2canvas")).default;
  const canvas = await html2canvas(container, { backgroundColor: "#ffffff", scale: 2 });
  const link = document.createElement("a");
  link.download = `${name.replace(/[^\w]+/g, "-").toLowerCase()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
