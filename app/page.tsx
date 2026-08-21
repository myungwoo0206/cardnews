"use client";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
type Card = { text: string; image?: string; layout: "bottom" | "top" | "center" };
const sourceSample = `이 책에서 가장 많이 반복되는 표현이자, 반드시 쓰지 말아야 한다고 정의하는 표현이 있다. 될 대로 되라지! 조금 더 일상적으로 풀어본다면 '어떻게든 되겠지' 마인드가 아닐까 싶다. 중요한 순간들에 있어서는 어떤 결과가 나오든 나와는 상관없다는 무책임한 의미가 될 수도 있다. 특히 일에서 마주치는 크고 작은 문제들에 어떻게 대처하는가에 따라 성과와 평판이 좌우되기에 결정하는 습관은 더욱 중요해진다. 그렇다면 '될 대로 되라지'라는 마인드의 반대는 기준을 갖고 결정하는 마인드이다. 무언가를 결정한다는 건 그에 따른 리스크를 감내하겠다는 의지이며, 내 결정이 틀렸더라도 이 길을 헤쳐가겠다는 다짐이다. 결정보다 중요한 것은 그 결정을 옳게 만드는 일이다. 과거에 내린 결정을 후회하는 데 시간과 에너지를 쏟지 말자.`;
const focusSample = `중요한 순간에 '어떻게든 되겠지'라는 태도는 어떤 결과가 나오든 나와는 상관없다는 무책임한 의미가 될 수도 있다. 결정의 반대편에는 기준 없이 흘러가는 태도가 있다. 무언가를 결정한다는 건 그에 따른 리스크를 감내하겠다는 의지다. 내 결정이 틀렸더라도 이 길을 헤쳐가겠다는 다짐이기도 하다. 결정보다 중요한 것은 그 결정을 옳게 만드는 일이다.`;
function createCards(title: string, focus: string, previous: Card[]): Card[] {
  const sentences = focus.split(/(?<=[.!?]|다\.)\s+/).map((s) => s.trim()).filter(Boolean);
  const bodyCards = sentences.slice(0, 6).map((text, index) => ({ text: text.length > 78 ? `${text.slice(0, 77)}…` : text, image: previous[index + 1]?.image, layout: (index % 3 === 0 ? "bottom" : index % 3 === 1 ? "top" : "center") as Card["layout"] }));
  return [{ text: title, image: previous[0]?.image, layout: "bottom" }, ...bodyCards];
}
export default function Home() {
  const [title, setTitle] = useState("결정이 어렵다면 지켜야 할 태도"); const [source, setSource] = useState(sourceSample); const [focus, setFocus] = useState(focusSample);
  const [cards, setCards] = useState<Card[]>(() => createCards("결정이 어렵다면 지켜야 할 태도", focusSample, [])); const [active, setActive] = useState(0); const current = cards[active];
  useEffect(() => () => cards.forEach((c) => c.image?.startsWith("blob:") && URL.revokeObjectURL(c.image)), []);
  function generate() { setCards((old) => createCards(title, focus, old)); setActive(0); }
  function addPhotos(event: ChangeEvent<HTMLInputElement>) { const files = Array.from(event.target.files || []); if (!files.length) return; setCards((old) => old.map((card, i) => files[i] ? { ...card, image: URL.createObjectURL(files[i]) } : card)); }
  function updateCard(patch: Partial<Card>) { setCards((old) => old.map((c, i) => i === active ? { ...c, ...patch } : c)); }
  async function saveCard(index = active) {
    const card = cards[index]; const canvas = document.createElement("canvas"); canvas.width = 1080; canvas.height = 1350; const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.fillStyle = "#d8d4cb"; ctx.fillRect(0, 0, 1080, 1350); if (card.image) { const img = new Image(); img.src = card.image; await img.decode(); const scale = Math.max(1080 / img.width, 1350 / img.height); const w = img.width * scale, h = img.height * scale; ctx.drawImage(img, (1080 - w) / 2, (1350 - h) / 2, w, h); }
    if (index === 0) { const grad = ctx.createLinearGradient(0, 590, 0, 1350); grad.addColorStop(0, "transparent"); grad.addColorStop(1, "rgba(0,0,0,.86)"); ctx.fillStyle = grad; ctx.fillRect(0, 0, 1080, 1350); const lines = wrap(ctx, card.text, 790, "700 66px Arial"); ctx.fillStyle = "white"; ctx.font = "700 66px Arial"; const startY = 1010 - (lines.length - 1) * 42; lines.forEach((line, i) => ctx.fillText(line, 145, startY + i * 86)); }
    else { const lines = wrap(ctx, card.text, 790, "700 43px Arial"); ctx.font = "700 43px Arial"; const widest = Math.max(...lines.map((line) => ctx.measureText(line).width)); const boxW = Math.min(900, Math.max(430, widest + 104)); const boxH = lines.length * 61 + 66; const x = card.layout === "top" ? 70 : card.layout === "center" ? (1080 - boxW) / 2 : 78; const y = card.layout === "top" ? 115 : card.layout === "center" ? (1350 - boxH) / 2 : 1350 - boxH - 105; ctx.fillStyle = "white"; ctx.fillRect(x, y, boxW, boxH); ctx.strokeStyle = "#111"; ctx.lineWidth = 3; ctx.strokeRect(x, y, boxW, boxH); ctx.fillStyle = "#111"; lines.forEach((line, i) => ctx.fillText(line, x + 52, y + 58 + i * 61)); }
    const link = document.createElement("a"); link.download = `cardletter-${index + 1}.png`; link.href = canvas.toDataURL("image/png"); link.click();
  }
  async function saveAll() { for (let i = 0; i < cards.length; i++) { await saveCard(i); await new Promise((r) => setTimeout(r, 180)); } }
  const photoCount = useMemo(() => cards.filter((c) => c.image).length, [cards]);
  return <main className="app-shell"><header><div className="brand"><span>CL</span><b>CARDLETTER</b><small>블로그에서 골라 만드는 카드뉴스</small></div><button className="save-all" onClick={saveAll}>전체 PNG 저장</button></header>
    <div className="workflow"><span className="done">1 원문 입력</span><i>→</i><span className="done">2 파트 선택</span><i>→</i><span>3 사진·문구 편집</span></div>
    <section className="workspace"><aside className="input-column"><div className="section-head"><span>01</span><div><h2>블로그 글</h2><p>전체 글을 붙여 넣고, 카드로 만들 부분만 골라주세요.</p></div></div>
      <label>카드뉴스 제목<input value={title} onChange={(e) => setTitle(e.target.value)} /></label><label>블로그 원문 <em>{source.length.toLocaleString()}자</em><textarea className="source" value={source} onChange={(e) => setSource(e.target.value)} /></label>
      <div className="focus-block"><label>카드로 만들 파트 <em>{focus.length}자</em><textarea value={focus} onChange={(e) => setFocus(e.target.value)} /></label><p>💡 원문 중 한 가지 메시지가 이어지는 300~700자를 붙여 넣으면 좋아요.</p></div><button className="primary" onClick={generate}>선택한 파트로 카드 구성하기 <b>→</b></button></aside>
      <section className="canvas-column"><div className="section-head"><span>02</span><div><h2>사진과 문구</h2><p>사진을 순서대로 넣고, 각 장의 문구를 다듬으세요.</p></div><label className="upload">사진 추가<input type="file" accept="image/*" multiple onChange={addPhotos}/></label></div>
        <div className="editor-grid"><div className="stage"><article className={`photo-card ${active === 0 ? "cover" : "inside"} ${current.layout}`} style={current.image ? { backgroundImage: `url(${current.image})` } : undefined}>{!current.image && <div className="empty-photo"><b>사진을 추가하세요</b><span>권장 1080 × 1350</span></div>}{active === 0 && <div className="shade"/>}<div className="text-box">{current.text}</div><div className="count">{active + 1} / {cards.length}</div></article></div>
          <div className="controls"><label>이 장의 문구<textarea value={current.text} onChange={(e) => updateCard({ text: e.target.value })}/></label>
            <div className="control-row"><div><span>문구 위치</span><div className="segmented">{(["top","center","bottom"] as Card["layout"][]).map((v) => <button key={v} className={current.layout === v ? "on" : ""} onClick={() => updateCard({layout:v})}>{v === "top" ? "위" : v === "center" ? "가운데" : "아래"}</button>)}</div></div></div>
            <button className="single-save" onClick={() => saveCard()}>현재 카드 PNG 저장 ↓</button><p className="photo-status">사진 {photoCount}/{cards.length}장 · 업로드한 순서대로 카드에 배치됩니다.</p></div></div>
        <div className="filmstrip">{cards.map((c, i) => <button key={i} className={active === i ? "active" : ""} onClick={() => setActive(i)}><span style={c.image ? {backgroundImage:`url(${c.image})`} : undefined}>{!c.image && "+"}</span><b>{i + 1}</b></button>)}</div></section></section></main>;
}
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, font: string) { ctx.font = font; const words = text.split(" "); const lines: string[] = []; let line = ""; for (const word of words) { const test = line ? `${line} ${word}` : word; if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word; } else line = test; } if (line) lines.push(line); return lines.slice(0, 6); }
