export function generateStudioDoodleSvg(
  prompt: string,
  _view = "front",
): string {
  const _isTurnaround =
    prompt.toLowerCase().includes("turnaround") ||
    prompt.toLowerCase().includes("sheet") ||
    prompt.toLowerCase().includes("character");

  const isAction =
    prompt.toLowerCase().includes("run") ||
    prompt.toLowerCase().includes("jump") ||
    prompt.toLowerCase().includes("walk");

  const isMoney =
    prompt.toLowerCase().includes("dollar") ||
    prompt.toLowerCase().includes("money") ||
    prompt.toLowerCase().includes("cash");

  // Character poses
  let armLeft = "M 460 480 L 400 550";
  let armRight = "M 560 480 L 620 550";
  let legLeft = "M 480 620 L 470 760";
  let legRight = "M 540 620 L 550 760";
  let extraItem = "";

  if (isAction) {
    armLeft = "M 460 480 L 380 430";
    armRight = "M 560 480 L 640 540";
    legLeft = "M 480 620 L 420 740";
    legRight = "M 540 620 L 600 720";
  }

  if (isMoney) {
    extraItem = `
      <rect x="610" y="490" width="80" height="46" rx="6" fill="#10b981" stroke="#000" stroke-width="4"/>
      <text x="650" y="520" font-family="monospace" font-weight="900" font-size="28" fill="#fff" text-anchor="middle">$</text>
    `;
    armRight = "M 560 480 L 610 515";
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    <defs>
      <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#1e2235" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#0b0c12" stop-opacity="1"/>
      </radialGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#000" flood-opacity="0.5"/>
      </filter>
    </defs>

    <!-- Background -->
    <rect width="1024" height="1024" fill="url(#bgGlow)"/>

    <!-- Subtle Grid / Storyboard Floor -->
    <ellipse cx="512" cy="800" rx="280" ry="40" fill="#000" opacity="0.4"/>

    <!-- Character Group with Shadow -->
    <g filter="url(#shadow)" stroke-linecap="round" stroke-linejoin="round">
      <!-- Legs -->
      <path d="${legLeft}" stroke="#1e293b" stroke-width="18"/>
      <path d="${legRight}" stroke="#1e293b" stroke-width="18"/>

      <!-- Shoes -->
      <ellipse cx="${isAction ? 410 : 470}" cy="${isAction ? 745 : 765}" rx="28" ry="14" fill="#ef4444" stroke="#000" stroke-width="6"/>
      <ellipse cx="${isAction ? 605 : 550}" cy="${isAction ? 725 : 765}" rx="28" ry="14" fill="#ef4444" stroke="#000" stroke-width="6"/>

      <!-- Red Shirt Body -->
      <path d="M 460 450 C 460 440, 560 440, 560 450 L 575 620 C 575 630, 445 630, 445 620 Z" fill="#ef4444" stroke="#000" stroke-width="10"/>

      <!-- Arms -->
      <path d="${armLeft}" stroke="#1e293b" stroke-width="18"/>
      <path d="${armRight}" stroke="#1e293b" stroke-width="18"/>

      <!-- Hands -->
      <circle cx="${armLeft.split(" ").slice(-2)[0]}" cy="${armLeft.split(" ").slice(-1)[0]}" r="16" fill="#fff" stroke="#000" stroke-width="6"/>
      <circle cx="${armRight.split(" ").slice(-2)[0]}" cy="${armRight.split(" ").slice(-1)[0]}" r="16" fill="#fff" stroke="#000" stroke-width="6"/>

      <!-- Extra Item if money -->
      ${extraItem}

      <!-- Head & Face -->
      <circle cx="512" cy="330" r="95" fill="#f8fafc" stroke="#000" stroke-width="12"/>

      <!-- Face Eyes & Smile -->
      <circle cx="485" cy="330" r="9" fill="#000"/>
      <circle cx="539" cy="330" r="9" fill="#000"/>
      <path d="M 485 365 Q 512 395 539 365" fill="none" stroke="#000" stroke-width="8"/>

      <!-- Dollar Doodles Signature Red Cap -->
      <path d="M 425 285 Q 512 210 599 285 C 570 240, 450 240, 425 285 Z" fill="#dc2626" stroke="#000" stroke-width="10"/>
      <ellipse cx="512" cy="285" rx="90" ry="18" fill="#ef4444" stroke="#000" stroke-width="8"/>
      <!-- Cap Visor -->
      <path d="M 540 285 Q 630 290 640 315 Q 570 315 520 290" fill="#b91c1c" stroke="#000" stroke-width="8"/>
      <!-- Cap Button -->
      <circle cx="512" cy="235" r="10" fill="#fff" stroke="#000" stroke-width="5"/>
    </g>

    <!-- Top Badge / Watermark -->
    <rect x="40" y="40" width="260" height="42" rx="12" fill="#0f172a" stroke="#ffffff15" stroke-width="2"/>
    <text x="56" y="67" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="16" fill="#00d2ff">DOLLAR DOODLES</text>
    <text x="210" y="67" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="12" fill="#94a3b8">STUDIO</text>

    <!-- Prompt caption text at bottom -->
    <rect x="40" y="930" width="944" height="54" rx="14" fill="#0f172a" stroke="#ffffff15" stroke-width="2"/>
    <text x="60" y="964" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="18" fill="#e2e8f0">${prompt.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").slice(0, 80)}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
