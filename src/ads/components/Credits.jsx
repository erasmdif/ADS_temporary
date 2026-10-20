import React, { useEffect, useRef, useState } from "react";
import { assetUrl } from "../services/paths.jsx";
import { creditsContent } from "../content/credits-content.js";
import "../styles/credits.css";
const asset = (path) => assetUrl(`/ads-credits/${path}`);
function Icon({ name, light = false }) { return <img className="credits-icon" src={asset(`icons/${name}${light ? "_avorio" : ""}.svg`)} alt="" aria-hidden="true" />; }
function GraphLines({ root, institution = false }) {
  const [paths, setPaths] = useState([]), [size, setSize] = useState([1, 1]);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const update = () => {
      const area = element.getBoundingClientRect();
      const point = (name, side) => {
        const node = element.querySelector(`[data-node="${name}"]`);
        if (!node) return null;
        const r = node.getBoundingClientRect();
        return [r.left - area.left + (side === "left" ? 0 : side === "right" ? r.width : r.width / 2), r.top - area.top + (side === "top" ? 0 : side === "bottom" ? r.height : r.height / 2)];
      };
      const links = institution ? [["isime", "right", "hub", "left"], ["lad", "right", "hub", "left"], ["hub", "right", "sapienza", "left"], ["hub", "right", "restory", "left"]] : [["leader", "bottom", "hub", "top"], ["science", "right", "hub", "left"], ["hub", "right", "digital", "left"]];
      setPaths(links.flatMap(([a, sideA, b, sideB]) => {
        const start = point(a, sideA), end = point(b, sideB); if (!start || !end) return [];
        const vertical = sideA === "bottom", mid = vertical ? (start[1] + end[1]) / 2 : (start[0] + end[0]) / 2;
        return [{ d: vertical ? `M ${start} C ${start[0]},${mid} ${end[0]},${mid} ${end}` : `M ${start} C ${mid},${start[1]} ${mid},${end[1]} ${end}`, start, end }];
      }));
      setSize([area.width, area.height]);
    };
    const observer = new ResizeObserver(update); observer.observe(element);
    element.querySelectorAll('[data-node]').forEach((node) => observer.observe(node)); update();
    return () => observer.disconnect();
  }, [root, institution]);
  return <svg className="credits-connectors" viewBox={`0 0 ${size[0]} ${size[1]}`} preserveAspectRatio="none" aria-hidden="true">{paths.map((path, i) => <g key={i}><path d={path.d} /><circle cx={path.start[0]} cy={path.start[1]} r="4" /><circle cx={path.end[0]} cy={path.end[1]} r="4" /></g>)}</svg>;
}
function Person({ person, leader = false }) {
  return <article className={`credits-person ${leader ? "credits-person-leader" : ""}`}>
    <details className="credits-person-details">
      <summary className="credits-badge" aria-label={`${person.name}: mostra o nascondi la biografia`}>
        <div className="credits-portrait"><img src={assetUrl(person.photo || person.placeholder)} alt="" style={{ objectPosition: person.photoPosition }} loading={leader ? "eager" : "lazy"} onError={(event) => { if (!event.currentTarget.dataset.fallback) { event.currentTarget.dataset.fallback = "true"; event.currentTarget.src = assetUrl(person.placeholder); } }} /></div>
        <div className="credits-badge-label"><h3>{person.name}</h3><p className="credits-role">{person.role}</p></div>
        <span className="credits-badge-chevron" aria-hidden="true">⌄</span>
      </summary>
      <div className="credits-person-bio"><p className="credits-description">{person.description}</p>{person.profile && <a className="credits-profile" href={person.profile} target="_blank" rel="noreferrer">Profilo <Icon name="freccia" /></a>}</div>
    </details>
  </article>;
}
function Hub({ light = false }) { return <div className={`credits-hub ${light ? "light" : ""}`} data-node="hub"><img src={asset(`graph/medaglione_ads${light ? "_chiaro" : ""}.svg`)} alt="ADS" /></div>; }
export default function Credits() {
  const peopleRoot = useRef(null), institutionRoot = useRef(null);
  const leader = creditsContent.persons.find((p) => p.group === "scientifico");
  return <div className="credits-app">
    <header className="credits-hero" style={{ backgroundImage: `linear-gradient(90deg, #f4f0e9f5, #f4f0e999), url("${asset("backgrounds/header_avorio.png")}")` }}><div className="credits-inner"><h1>Credits e ringraziamenti</h1><p>Le persone, le istituzioni e i progetti che rendono possibile ADS.</p><nav aria-label="Sezioni dei crediti"><a href="#credits-persone">Le persone <Icon name="persona" /></a><a href="#credits-istituzioni">Istituzioni e progetti <Icon name="manoscritto" /></a></nav></div></header>
    <section id="credits-persone" className="credits-people credits-inner" aria-labelledby="credits-people-title"><div className="credits-section-heading"><h2 id="credits-people-title">Le persone del progetto</h2><p>Competenze diverse, una ricerca condivisa.</p></div><div className="credits-people-graph" ref={peopleRoot}><GraphLines root={peopleRoot} /><div className="credits-leader" data-node="leader"><Person person={leader} leader /></div><section className="credits-science"><h2 className="credits-group-heading" data-node="science"><Icon name="manoscritto" />Collaborazioni scientifiche</h2><div className="credits-person-stack">{creditsContent.persons.filter((p) => p.group === "collaborazioni").map((person) => <Person key={person.id} person={person} />)}</div></section><Hub /><section className="credits-digital"><h2 className="credits-group-heading" data-node="digital"><Icon name="codice" />Infrastruttura digitale</h2><div className="credits-person-stack">{creditsContent.persons.filter((p) => p.group === "digitale").map((person) => <Person key={person.id} person={person} />)}</div></section></div></section>
    <section id="credits-istituzioni" className="credits-institutions" style={{ backgroundImage: `linear-gradient(#741827aa, #7418279c), url("${asset("backgrounds/istituzioni_porpora.png")}")` }} aria-labelledby="credits-institution-title"><div className="credits-inner"><div className="credits-section-heading"><h2 id="credits-institution-title">Istituzioni e progetti</h2><p>Una rete per la ricerca e il patrimonio.</p></div><p className="credits-network-caption">Riferimenti e collaborazioni del progetto</p><div className="credits-institution-graph" ref={institutionRoot}><GraphLines root={institutionRoot} institution /><Hub light />{creditsContent.institutions_projects.map((item) => <article className={`credits-institution node-${item.id}`} key={item.id} data-node={item.id}><div className="credits-institution-heading"><div className={`credits-logo ${item.placeholder ? "placeholder" : ""}`}><img src={assetUrl(item.logo)} alt={item.placeholder ? `Segnaposto logo ${item.name}` : `Logo ${item.name}`} loading="lazy" /></div><div><span>{item.type === "progetto" ? "Progetto" : "Istituzione"}</span><h3>{item.name}</h3></div></div><h4>{item.fullName}</h4><p>{item.description}</p><a href={item.url} target="_blank" rel="noreferrer">Visita il sito <Icon name="freccia" /></a></article>)}</div><p className="credits-graph-caption">Le linee rappresentano i contributi al progetto.</p></div></section>
  </div>;
}
