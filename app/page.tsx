"use client";
import { useMemo, useState } from "react";

const sample = `요즘 브랜드가 고객의 마음을 얻는 방식이 달라지고 있습니다. 더 이상 많은 정보를 전달하는 것만으로는 충분하지 않습니다. 사람들은 자신과 관련 있는 한 문장, 저장해두고 싶은 팁, 바로 행동할 수 있는 제안을 원합니다.\n\n좋은 콘텐츠는 독자의 문제를 선명하게 짚고, 복잡한 내용을 작은 단위로 나눕니다. 첫 문장에서는 호기심을 만들고, 본문에서는 구체적인 방법을 알려주며, 마지막에는 다음 행동을 제안합니다.\n\n블로그 글도 같은 원리로 다시 편집하면 훌륭한 카드뉴스가 됩니다. 핵심은 글을 줄이는 것이 아니라, 한 장마다 하나의 메시지만 남기는 것입니다.`;
const presets = [
  { name: "Cream", bg: "#F5F0E8", fg: "#181815", accent: "#FF5C35" },
  { name: "Midnight", bg: "#16181D", fg: "#F7F4ED", accent: "#A8FF60" },
  { name: "Lavender", bg: "#EAE1FF", fg: "#221B38", accent: "#6D43D7" },
];
function makeCards(title: string, body: string) {
  const sentences = body.split(/(?<=[.!?。]|다\.)\s+/).map((s) => s.trim()).filter(Boolean);
  const groups = Array.from({ length: 4 }, (_, i) => sentences.slice(i * 2, i * 2 + 2).join(" ")).filter(Boolean);
  return [
    { kicker: "오늘의 인사이트", title: title || "좋은 콘텐츠는 한 문장에서 시작됩니다", body: "긴 글을 넘기고 싶어지는 카드뉴스로 바꿔보세요." },
    ...groups.map((text, i) => ({ kicker: `0${i + 1}`, title: text.split(/[,.]/)[0], body: text })),
    { kicker: "SAVE & SHARE", title: "한 장마다 하나의 메시지만", body: "도움이 됐다면 저장하고, 함께 보고 싶은 사람에게 공유해 보세요." },
  ];
}
export default function Home() {
  const [title, setTitle] = useState("블로그 글을 카드뉴스로 바꾸는 가장 쉬운 방법");
  const [body, setBody] = useState(sample);
  const [theme, setTheme] = useState(0);
  const [active, setActive] = useState(0);
  const cards = useMemo(() => makeCards(title, body), [title, body]);
  const palette = presets[theme];
  const card = cards[Math.min(active, cards.length - 1)];
  function download() {
    const canvas = document.createElement("canvas"); canvas.width = 1080; canvas.height = 1350;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.fillStyle = palette.bg; ctx.fillRect(0, 0, 1080, 1350); ctx.fillStyle = palette.accent; ctx.fillRect(76, 78, 210, 14);
    ctx.fillStyle = palette.fg; ctx.font = "700 32px Arial"; ctx.fillText(card.kicker, 76, 160); ctx.font = "800 72px Arial";
    const words = card.title.split(" "); let line = ""; let y = 360;
    for (const word of words) { const test = `${line}${word} `; if (ctx.measureText(test).width > 900) { ctx.fillText(line, 76, y); line = `${word} `; y += 92; } else line = test; } ctx.fillText(line, 76, y);
    ctx.font = "400 34px Arial"; (card.body.match(/.{1,27}/g) || []).slice(0, 6).forEach((l, i) => ctx.fillText(l, 76, 820 + i * 52));
    ctx.font = "700 26px Arial"; ctx.fillText(`CARDLETTER  ·  ${active + 1}/${cards.length}`, 76, 1260);
    const link = document.createElement("a"); link.download = `cardletter-${active + 1}.png`; link.href = canvas.toDataURL("image/png"); link.click();
  }
  return <main>
    <header><div className="brand"><span>CL</span> CARDLETTER</div><div className="header-note">블로그가 카드뉴스가 되는 곳</div></header>
    <section className="hero"><div><p className="eyebrow">WRITE ONCE · PUBLISH EVERYWHERE</p><h1>긴 글의 핵심을<br/><em>넘기고 싶은 장면</em>으로.</h1></div><p className="intro">블로그 글을 붙여 넣으세요. 핵심 문장을 골라 카드 흐름을 만들고, 인스타그램에 바로 올릴 수 있는 이미지로 완성합니다.</p></section>
    <section className="studio">
      <div className="editor panel"><div className="panel-title"><span>01</span><h2>원문</h2><small>{body.length}자</small></div><label>포스트 제목<input value={title} onChange={(e) => setTitle(e.target.value)} /></label><label>블로그 본문<textarea value={body} onChange={(e) => setBody(e.target.value)} /></label><button className="generate" onClick={() => setActive(0)}>카드 구성 만들기 <b>→</b></button></div>
      <div className="preview panel"><div className="panel-title"><span>02</span><h2>미리보기</h2><small>{cards.length}장</small></div><div className="toolbar"><div className="swatches">{presets.map((p, i) => <button key={p.name} aria-label={`${p.name} 테마`} className={theme === i ? "on" : ""} style={{ background: p.bg }} onClick={() => setTheme(i)} />)}</div><button className="download" onClick={download}>PNG 저장 ↓</button></div>
        <article className="card" style={{ background: palette.bg, color: palette.fg }}><div className="accent" style={{ background: palette.accent }} /><p className="kicker">{card.kicker}</p><h3>{card.title}</h3><p className="card-body">{card.body}</p><footer>CARDLETTER <span>{active + 1} / {cards.length}</span></footer></article>
        <div className="pager"><button aria-label="이전 카드" onClick={() => setActive(Math.max(0, active - 1))}>←</button><div>{cards.map((_, i) => <button key={i} className={active === i ? "active" : ""} onClick={() => setActive(i)}>{i + 1}</button>)}</div><button aria-label="다음 카드" onClick={() => setActive(Math.min(cards.length - 1, active + 1))}>→</button></div>
      </div>
    </section>
  </main>;
}
