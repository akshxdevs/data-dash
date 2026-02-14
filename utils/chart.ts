export function linePath(data: number[], width: number, height: number, pad = 12) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = Math.max(max - min, 1);

  return data
    .map((value, index) => {
      const x = pad + (index * (width - pad * 2)) / Math.max(data.length - 1, 1);
      const y = height - pad - ((value - min) / range) * (height - pad * 2);
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
}

export function areaPath(data: number[], width: number, height: number, pad = 12) {
  const line = linePath(data, width, height, pad);
  const startX = pad;
  const endX = width - pad;
  const baseY = height - pad;
  return `${line} L${endX},${baseY} L${startX},${baseY} Z`;
}
