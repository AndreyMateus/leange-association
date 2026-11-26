import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import DomFlowt from './vendor/dom-flowt/dom-flowt.js';
import { creators } from './data/creators.js';
import { demoCreators } from './data/creators.demo.js';
import { socialNetworks } from './data/social-networks.js';
import { AI_ENABLED, askAssistant } from './chat/assistant.js';

// Atributos da DOM Flowt: o elemento começa oculto e anima ao entrar na tela.
// `delay` usa animation-delay (o atributo dom-flowt-delay não é lido pela v2.1.0 da lib).
const flowt = (type = 'fade', { duration = 450, delay = 0 } = {}) => ({
  'dom-flowt-is-visible': 'false',
  'dom-flowt-type': type,
  'dom-flowt-duration': String(duration),
  'dom-flowt-repeat': 'no-repeat',
  ...(delay ? { style: { animationDelay: `${delay}ms` } } : {}),
});

const brandIcon = 'https://imagedelivery.net/1n9Gwvykoj9c9m8C_4GsGA/d3fbafba-3dfe-4924-e857-b45059def500/public';

const photos = {
  serra: {
    hero: 'https://imagedelivery.net/1n9Gwvykoj9c9m8C_4GsGA/25b0380d-b983-4a67-eac2-36a003dfa600/public',
    story: 'https://imagedelivery.net/1n9Gwvykoj9c9m8C_4GsGA/9e6e519c-c4c1-413e-e2ef-3395647dcc00/public',
    detail: 'https://imagedelivery.net/1n9Gwvykoj9c9m8C_4GsGA/15251f10-d814-42ff-0b42-fc731ce2e700/public',
  },
  mar: {
    hero: 'https://imagedelivery.net/1n9Gwvykoj9c9m8C_4GsGA/e0715e71-0836-4817-640d-a92472a02600/public',
    story: 'https://imagedelivery.net/1n9Gwvykoj9c9m8C_4GsGA/e1457430-68c7-4936-2932-1f0f97f49700/public',
    detail: 'https://imagedelivery.net/1n9Gwvykoj9c9m8C_4GsGA/e0715e71-0836-4817-640d-a92472a02600/public',
  },
};

const galleryPhotos = [
  {
    src: 'https://imagedelivery.net/1n9Gwvykoj9c9m8C_4GsGA/15251f10-d814-42ff-0b42-fc731ce2e700/public',
    alt: 'Vista aérea da pousada em meio às montanhas e áreas verdes.',
    caption: 'Refúgio entre montanhas',
    unit: 'Le Ange Serra',
  },
  {
    src: 'https://imagedelivery.net/1n9Gwvykoj9c9m8C_4GsGA/c1d96802-7777-4493-5799-9b927ea1de00/public',
    alt: 'Hóspede descansa com seu cão em uma cadeira suspensa na varanda.',
    caption: 'Tempo para desacelerar',
    unit: 'Le Ange Serra',
  },
  {
    src: 'https://imagedelivery.net/1n9Gwvykoj9c9m8C_4GsGA/25b0380d-b983-4a67-eac2-36a003dfa600/public',
    alt: 'Cão dourado relaxa em uma prancha na piscina da Le Ange Serra.',
    caption: 'Um mergulho na Serra',
    unit: 'Le Ange Serra',
  },
  {
    src: 'https://imagedelivery.net/1n9Gwvykoj9c9m8C_4GsGA/9e6e519c-c4c1-413e-e2ef-3395647dcc00/public',
    alt: 'Tutora e cão compartilham um momento de lazer na piscina.',
    caption: 'Diversão lado a lado',
    unit: 'Le Ange Serra',
  },
  {
    src: 'https://imagedelivery.net/1n9Gwvykoj9c9m8C_4GsGA/9e5f8ee2-ddde-4d62-950e-baad7c4ee900/public',
    alt: 'Suíte aconchegante da unidade Serra com decoração em madeira.',
    caption: 'Aconchego na suíte',
    unit: 'Le Ange Serra',
  },
  {
    src: 'https://imagedelivery.net/1n9Gwvykoj9c9m8C_4GsGA/e0715e71-0836-4817-640d-a92472a02600/public',
    alt: 'Suíte da unidade Mar com varanda e vista para o oceano.',
    caption: 'Janela para o mar',
    unit: 'Le Ange Mar',
  },
  {
    src: 'https://imagedelivery.net/1n9Gwvykoj9c9m8C_4GsGA/e1457430-68c7-4936-2932-1f0f97f49700/public',
    alt: 'Cão descansa ao lado da cama em uma acomodação da unidade Mar.',
    caption: 'Descanso com companhia',
    unit: 'Le Ange Mar',
  },
];

const petPolicies = {
  serra: 'https://pousadaleange.com.br/assets/politica-de-reservas-le-ange-serra-DZj3grri.pdf',
  mar: 'https://pousadaleange.com.br/assets/politica-de-reservas-le-ange-mar-CDWsmeu8.pdf',
};

const units = {
  serra: {
    id: 'serra',
    name: 'Le Ange Serra',
    shortName: 'Serra',
    place: 'Miguel Pereira · RJ',
    heroAlt: 'Cão dourado relaxa em uma prancha na piscina da Pousada Le Ange Serra, cercada por verde e montanhas.',
    heroCaption: 'Um mergulho na rotina da serra',
    storyAlt: 'Tutora brinca na piscina com seu cão, em um dia ensolarado na Le Ange Serra.',
    locationTag: 'Vale das Videiras · região serrana do Rio de Janeiro',
    petPolicy: petPolicies.serra,
  },
  mar: {
    id: 'mar',
    name: 'Le Ange Mar',
    shortName: 'Mar',
    place: 'Armação dos Búzios · RJ',
    heroAlt: 'Suíte da Pousada Le Ange Mar com varanda e vista para o oceano.',
    heroCaption: 'Uma janela para o mar de Búzios',
    storyAlt: 'Cão descansa ao lado da cama em uma acomodação da Le Ange Mar.',
    locationTag: 'Praia Rasa · Armação dos Búzios, RJ',
    petPolicy: petPolicies.mar,
  },
};

const faqItems = [
  {
    question: 'Como funciona a parceria remunerada?',
    answer: 'Sim, creators pet podem ser remunerados por divulgar a Le Ange. Você compartilha seu perfil e sua proposta, e a equipe conversa sobre unidade, formato, datas, entregas e remuneração. Nada fica confirmado antes desse alinhamento.',
  },
  {
    question: 'Preciso ter um número mínimo de seguidores?',
    answer: 'A landing page não define um número mínimo. Envie seu perfil e conte como você cria conteúdo com seu pet para a equipe avaliar a proposta.',
  },
  {
    question: 'Posso escolher entre a Serra e o Mar?',
    answer: 'Sim. Você pode indicar Le Ange Serra, em Miguel Pereira, ou Le Ange Mar, em Búzios. A disponibilidade e os detalhes da parceria são conversados com a equipe.',
  },
  {
    question: 'O pet pode acompanhar o tutor nas áreas da pousada?',
    id: 'pet',
    answer: 'Os pets podem acompanhar seus tutores em comodidades como piscina e restaurante, sempre sob supervisão. Regras de convivência e cuidados variam por unidade e espécie; consulte a política antes da visita.',
  },
  {
    question: 'Como envio meu perfil para a equipe?',
    answer: 'Preencha sua candidatura na página indicada pelo botão ao final desta landing. O formulário prepara uma mensagem no WhatsApp para você revisar e enviar.',
  },
  {
    question: 'Quais conteúdos e entregas posso propor?',
    answer: 'Conte à equipe quais formatos você costuma criar e em quais canais publica. As postagens, datas e entregas serão alinhadas com você antes de confirmar a parceria.',
  },
  {
    question: 'A parceria cobre hospedagem ou deslocamento?',
    answer: 'A página não define uma regra única para esses custos. Converse com a equipe e deixe hospedagem, transporte e demais itens descritos na proposta antes de aceitar.',
  },
  {
    question: 'Como funcionam o pagamento e o uso do conteúdo?',
    answer: 'Remuneração, prazos de pagamento e autorização para uso das publicações devem ser combinados diretamente com a equipe e registrados antes do início da parceria.',
  },
  {
    question: 'Em quanto tempo recebo uma resposta?',
    answer: 'A página não promete um prazo de retorno. Ao apresentar seu perfil pelo WhatsApp, você pode perguntar à equipe qual será o próximo passo e o prazo estimado para a avaliação.',
  },
];

function Icon({ name, className = '' }) {
  const paths = {
    arrow: <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
    paw: <><ellipse cx="12" cy="15.5" rx="5.5" ry="4" /><ellipse cx="5.8" cy="9" rx="1.6" ry="2.1" /><ellipse cx="10" cy="6.6" rx="1.6" ry="2.1" /><ellipse cx="14.5" cy="6.6" rx="1.6" ry="2.1" /><ellipse cx="18.3" cy="9" rx="1.6" ry="2.1" /></>,
    heart: <path d="M20.8 8.8c0 5.1-8.8 10.4-8.8 10.4S3.2 13.9 3.2 8.8A4.5 4.5 0 0 1 12 6.7a4.5 4.5 0 0 1 8.8 2.1Z" />,
    instagram: <><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.7" cy="6.6" r="0.8" fill="currentColor" stroke="none" /></>,
    whatsapp: <><path d="M20.2 11.7a8.2 8.2 0 0 1-12.1 7.2L3.8 20l1.1-4.1a8.2 8.2 0 1 1 15.3-4.2Z" /><path d="M8.4 8.3c.2-.5.4-.5.7-.5h.5c.2 0 .4 0 .5.4l.8 1.8c.1.2.1.4 0 .5l-.5.6c-.2.2-.2.4 0 .6.4.7 1.1 1.4 1.8 1.8.2.1.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.7.8c.3.1.4.3.4.5 0 .3-.2 1.1-.7 1.5-.5.5-1.2.7-1.8.7s-1.7-.3-2.8-1c-1.4-.8-2.5-2-3.2-3.1-.8-1.2-1-2.1-1-2.8s.3-1.1.7-1.6Z" /></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    camera: <><path d="M4 8h3l1.5-2h7L17 8h3v11H4z" /><circle cx="12" cy="13.5" r="3.5" /></>,
    leaf: <><path d="M20.5 3.5c-9.7 0-15 3.9-15 10.3 0 3.3 2.2 5.7 5.3 5.7 6.5 0 9.7-6.3 9.7-16Z" /><path d="M3.5 21c3-5 6.7-8.2 12.1-11.4" /></>,
    wave: <><path d="M2 9c2.1 0 2.1-2 4.2-2s2.1 2 4.2 2 2.1-2 4.2-2 2.1 2 4.2 2 2.1-2 3.2-2" /><path d="M2 15c2.1 0 2.1-2 4.2-2s2.1 2 4.2 2 2.1-2 4.2-2 2.1 2 4.2 2 2.1-2 3.2-2" /><path d="M2 21c2.1 0 2.1-2 4.2-2s2.1 2 4.2 2 2.1-2 4.2-2 2.1 2 4.2 2 2.1-2 3.2-2" /></>,
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9" /><path d="M9 20v-6h6v6" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    pause: <><path d="M8 5v14" /><path d="M16 5v14" /></>,
    play: <path d="m8 5 11 7-11 7z" />,
    coin: <><circle cx="12" cy="12" r="9" /><path d="M14.6 9.3c-.5-.8-1.5-1.3-2.6-1.3-1.5 0-2.6.8-2.6 2 0 2.8 5.2 1.5 5.2 4.2 0 1.2-1.2 2.1-2.7 2.1-1.2 0-2.3-.5-2.8-1.4" /><path d="M12 6.2V8m0 8v1.8" /></>,
  };

  return (
    <svg className={`icon ${className}`.trim()} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {paths[name] || paths.paw}
    </svg>
  );
}

// Detalhes por unidade (somente informações já publicadas no site e nas páginas oficiais).
const unitDetails = {
  serra: {
    summary: 'Refúgio no Vale das Videiras, na região serrana do Rio de Janeiro, cercado por montanhas, trilhas, cachoeiras e áreas verdes.',
    highlights: [
      'Montanhas, trilhas, cachoeiras e áreas verdes na região',
      'Piscina, varandas e suítes aconchegantes',
      'Pets acompanham os tutores em áreas como piscina e restaurante, sempre sob supervisão',
    ],
  },
  mar: {
    summary: 'Em Armação dos Búzios, perto da Praia Rasa, com piscina aquecida e vista para o oceano.',
    highlights: [
      'Praia Rasa a cerca de 150 metros',
      'Piscina aquecida com vista para o oceano',
      'Suítes com varanda e vista para o mar',
      'Pets acompanham os tutores em áreas como piscina e restaurante, sempre sob supervisão',
    ],
  },
};

// Seção "Convite": slide de tela inteira guiado pela rolagem.
// A seção fica presa (sticky) enquanto a rolagem leva da Serra ao Mar com um corte diagonal;
// depois a página segue normalmente. Sem JavaScript ou com movimento reduzido, os slides aparecem empilhados.
const slidePhotos = { serra: photos.serra.detail, mar: photos.mar.hero };

function UnitSlide({ unitId, index }) {
  const unit = units[unitId];
  const details = unitDetails[unitId];
  return (
    <article className={`unit-slide unit-slide--${unitId}`} data-slide={unitId} aria-labelledby={`slide-${unitId}-title`}>
      <img className="unit-slide__photo" src={slidePhotos[unitId]} alt="" width="1600" height="1000" loading="lazy" decoding="async" />
      <span className="unit-slide__shade" aria-hidden="true"></span>
      <Icon name={unitId === 'serra' ? 'leaf' : 'wave'} className="unit-slide__mark" />
      <div className="unit-slide__content page-shell">
        <div className="unit-slide__copy">
          <span className="unit-slide__index" aria-hidden="true">0{index + 1}</span>
          <span className="unit-slide__place"><Icon name="pin" /> {unit.place}</span>
          <h3 id={`slide-${unitId}-title`}>{unit.name}</h3>
          <p>{details.summary}</p>
          <ul className="unit-slide__list">
            {details.highlights.slice(0, 3).map((item) => <li key={item}><Icon name="check" /> {item}</li>)}
          </ul>
          <div className="unit-slide__actions">
            <a className={`button button--cta button--cta-${unitId}`} href={`/candidatura/${unitId}`}><span className="button__coin" aria-hidden="true"><Icon name="coin" /></span>Quero criar {unitId === 'mar' ? 'no Mar' : 'na Serra'} <Icon name="arrow" /></a>
            <a className="unit-slide__link" href={unit.petPolicy} target="_blank" rel="noopener noreferrer">Política pet</a>
          </div>
        </div>
      </div>
    </article>
  );
}

function UnitScroller() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    section.classList.add('is-pinned');
    let frame = 0;

    const update = () => {
      frame = 0;
      const total = section.offsetHeight - window.innerHeight;
      const progress = total > 0 ? Math.min(1, Math.max(0, -section.getBoundingClientRect().top / total)) : 0;
      // 25% parado na Serra, 50% de transição, 25% parado no Mar.
      const raw = Math.min(1, Math.max(0, (progress - 0.25) / 0.5));
      const wipe = raw * raw * (3 - 2 * raw);
      section.style.setProperty('--progress', progress.toFixed(4));
      section.style.setProperty('--wipe', wipe.toFixed(4));
      section.dataset.active = wipe > 0.5 ? 'mar' : 'serra';
    };
    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    // Navegação por teclado: ao focar algo de um slide, a rolagem vai até ele ficar visível.
    const handleFocus = (event) => {
      const slide = event.target.closest('[data-slide]');
      if (!slide) return;
      const total = section.offsetHeight - window.innerHeight;
      const target = slide.dataset.slide === 'mar' ? 0.9 : 0.1;
      window.scrollTo({ top: window.scrollY + section.getBoundingClientRect().top + total * target, behavior: 'auto' });
    };

    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
    section.addEventListener('focusin', handleFocus);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      section.removeEventListener('focusin', handleFocus);
      section.classList.remove('is-pinned');
    };
  }, []);

  return (
    <section className="unit-scroller" id="inicio" ref={sectionRef} aria-labelledby="hero-title" data-active="serra">
      <div className="unit-scroller__stage">
        <UnitSlide unitId="serra" index={0} />
        <UnitSlide unitId="mar" index={1} />
        <div className="unit-scroller__top page-shell">
          <h2 className="eyebrow eyebrow--light unit-scroller__eyebrow" id="hero-title"><span className="eyebrow__dot"></span> Convite para criadores de conteúdo pet <span className="business-badge">Parceria remunerada</span></h2>
        </div>
        <div className="unit-scroller__progress page-shell" aria-hidden="true">
          <span data-step="serra">01 · Serra</span>
          <span className="unit-scroller__bar"><i></i></span>
          <span data-step="mar">02 · Mar</span>
          <small className="unit-scroller__hint">Continue rolando <span>↓</span></small>
        </div>
      </div>
    </section>
  );
}

// Celular gravando um vídeo na pousada enquanto chegam notificações de pagamento da parceria.
// Os valores ficam mascarados (R$ ••••) porque a remuneração é combinada caso a caso.
function RecordingPhone({ unit, image }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setSeconds((value) => (value + 1) % 3600), 1000);
    return () => clearInterval(timer);
  }, []);
  const time = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return (
    <figure className="brand-story__phone">
      <div className="rec-phone" role="img" aria-label={`Ilustração: celular gravando um vídeo com pet na ${unit.name} enquanto chegam notificações de pagamento da parceria.`}>
        <span className="rec-coin rec-coin--1"><Icon name="coin" /></span>
        <span className="rec-coin rec-coin--2"><Icon name="coin" /></span>
        <span className="rec-coin rec-coin--3"><Icon name="coin" /></span>
        <span className="rec-coin rec-coin--4"><Icon name="coin" /></span>
        <div className="rec-phone__body">
          <div className="rec-phone__screen">
            <img src={image} alt="" width="640" height="1280" loading="eager" decoding="async" fetchPriority="high" />
            <span className="rec-phone__shade"></span>
            <span className="rec-phone__camera"></span>
            <div className="rec-phone__top">
              <span className="rec-phone__rec"><i></i>REC</span>
              <span className="rec-phone__time">{time}</span>
              <span className="rec-phone__res">4K · 60</span>
            </div>
            <span className="rec-phone__frame"></span>
            <div className="rec-phone__toasts">
              <div className="rec-toast">
                <span className="rec-toast__icon"><Icon name="coin" /></span>
                <span className="rec-toast__copy"><strong>Pagamento recebido</strong><small>Parceria Le Ange</small></span>
                <span className="rec-toast__amount">+ R$ ••••</span>
              </div>
              <div className="rec-toast rec-toast--blue">
                <span className="rec-toast__icon"><Icon name="heart" /></span>
                <span className="rec-toast__copy"><strong>Post publicado</strong><small>Le Ange {unit.shortName}</small></span>
                <span className="rec-toast__amount">✓</span>
              </div>
              <div className="rec-toast">
                <span className="rec-toast__icon"><Icon name="coin" /></span>
                <span className="rec-toast__copy"><strong>Remuneração creditada</strong><small>Parceria Le Ange</small></span>
                <span className="rec-toast__amount">+ R$ ••••</span>
              </div>
            </div>
            <div className="rec-phone__modes"><span>Foto</span><strong>Vídeo</strong><span>Lento</span></div>
            <span className="rec-phone__shutter"></span>
          </div>
        </div>
        <div className="rec-balance">
          <div className="rec-balance__head"><small>Saldo da parceria</small><span>+ entrada</span></div>
          <strong>R$ ••••</strong>
          <span className="rec-balance__bar"><i></i></span>
        </div>
      </div>
      <figcaption><span>{unit.name} · {unit.place}</span><strong>Grave sua história. Receba pela parceria.</strong></figcaption>
    </figure>
  );
}

// Galeria resumida: 4 fotos, duas da unidade da página e duas da outra unidade.
// Ao clicar, a foto se expande e ocupa quase toda a área; as outras viram um menu de miniaturas.
// A transição usa FLIP: mede as posições antes e depois da troca de layout e anima a diferença.
function PhotoGrid({ unit }) {
  const pick = (sameUnit) => galleryPhotos.filter((photo) => (photo.unit === unit.name) === sameUnit).slice(0, 2);
  const photos = [...pick(true), ...pick(false)];
  const [active, setActive] = useState(null);
  const listRef = useRef(null);
  const firstRects = useRef(null);
  const closeRef = useRef(null);
  const openerRefs = useRef([]);
  const lastOpened = useRef(null);

  function changeActive(next) {
    const items = Array.from(listRef.current?.children || []);
    firstRects.current = new Map(items.map((item) => [item, item.getBoundingClientRect()]));
    if (next !== null) lastOpened.current = next;
    setActive(next);
  }

  useLayoutEffect(() => {
    const before = firstRects.current;
    if (!before) return;
    firstRects.current = null;

    if (active !== null) closeRef.current?.focus({ preventScroll: true });
    else if (lastOpened.current !== null) openerRefs.current[lastOpened.current]?.focus({ preventScroll: true });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    before.forEach((first, item) => {
      const last = item.getBoundingClientRect();
      if (!last.width || !last.height) return;
      const dx = first.left - last.left;
      const dy = first.top - last.top;
      const sx = first.width / last.width;
      const sy = first.height / last.height;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(sx - 1) < 0.01 && Math.abs(sy - 1) < 0.01) return;
      item.animate(
        [
          { transformOrigin: 'top left', transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
          { transformOrigin: 'top left', transform: 'none' },
        ],
        { duration: 560, easing: 'cubic-bezier(0.2, 0.65, 0.3, 1)' },
      );
      item.querySelector('figcaption')?.animate([{ opacity: 0 }, { opacity: 0 }, { opacity: 1 }], { duration: 560, easing: 'ease-out' });
    });
  }, [active]);

  useEffect(() => {
    if (active === null) return undefined;
    const handleEscape = (event) => {
      if (event.key === 'Escape') changeActive(null);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [active]);

  return (
    <section className="gallery-section section-pad" aria-labelledby="gallery-title">
      <div className="page-shell">
        <header className="gallery-heading" {...flowt('float-up')}>
          <h2 id="gallery-title" className="gallery-title">Um pouco do que <em>somos.</em></h2>
        </header>
        <ul className={`photo-grid${active !== null ? ' is-expanded' : ''}`} ref={listRef}>
          {photos.map((photo, index) => {
            const isActive = active === index;
            return (
              <li key={photo.src} className={isActive ? 'is-active' : undefined} {...flowt('pop-up', { delay: index * 50 })}>
                <figure className="photo-grid__item" id={`photo-${index}`}>
                  <img src={photo.src} alt={photo.alt} width="900" height="1200" loading="lazy" decoding="async" />
                  <figcaption>
                    <span>{photo.unit}</span>
                    <strong>{photo.caption}</strong>
                    {isActive && <small className="photo-grid__description">{photo.alt}</small>}
                  </figcaption>
                  {!isActive && (
                    <button type="button" className="photo-grid__open" ref={(node) => { openerRefs.current[index] = node; }} onClick={() => changeActive(index)} aria-expanded="false" aria-controls={`photo-${index}`}>
                      <span className="sr-only">Ampliar a foto “{photo.caption}”, {photo.unit}</span>
                      <span className="photo-grid__zoom" aria-hidden="true">+</span>
                    </button>
                  )}
                  {isActive && (
                    <button type="button" className="photo-grid__close" ref={closeRef} onClick={() => changeActive(null)} aria-label="Fechar foto ampliada">×</button>
                  )}
                </figure>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

// Abre e fecha o <details> com transição de altura e opacidade (Web Animations API).
// Com movimento reduzido ou sem suporte, o navegador abre e fecha normalmente.
function toggleFaqItem(event) {
  const details = event.currentTarget.parentElement;
  const content = details.querySelector('.faq-item__content');
  if (!content?.animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  event.preventDefault();

  details.faqAnimation?.cancel();
  const opening = !details.open || details.dataset.closing === 'true';
  const startHeight = details.open ? content.getBoundingClientRect().height : 0;
  details.open = true;
  delete details.dataset.closing;
  const endHeight = opening ? content.scrollHeight : 0;
  if (!opening) details.dataset.closing = 'true';

  const animation = content.animate(
    [
      { height: `${startHeight}px`, opacity: opening ? 0 : 1, transform: opening ? 'translateY(-6px)' : 'none' },
      { height: `${endHeight}px`, opacity: opening ? 1 : 0, transform: opening ? 'none' : 'translateY(-6px)' },
    ],
    { duration: opening ? 340 : 260, easing: 'cubic-bezier(0.2, 0.65, 0.3, 1)' },
  );
  details.faqAnimation = animation;
  animation.onfinish = () => {
    if (!opening) details.open = false;
    delete details.dataset.closing;
    details.faqAnimation = null;
  };
}

function FrequentlyAskedQuestions({ unit }) {
  return (
    <section className="faq-section section-pad" id="duvidas" aria-labelledby="faq-title">
      <div className="faq-layout page-shell">
        <header className="faq-intro" {...flowt('float-right')}>
          <p className="eyebrow eyebrow--green"><span className="eyebrow__dot"></span> Antes de dar o próximo passo</p>
          <h2 id="faq-title">Dúvidas <em>frequentes.</em></h2>
          <p>Se ainda ficar alguma dúvida, o chatbot pode ajudar com respostas rápidas. Para conversar sobre a candidatura, use o botão no final da página.</p>
        </header>
        <div className="faq-list">
          {faqItems.map((item, index) => (
            <details className="faq-item" key={item.question} {...flowt('pop-up', { delay: Math.min(index, 4) * 40 })}>
              <summary onClick={toggleFaqItem}>{item.question}<span className="faq-item__indicator" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="m6 9 6 6 6-6" /></svg></span></summary>
              <div className="faq-item__content">
                <p>{item.answer}</p>
                {item.id === 'pet' && <p className="faq-policy-link"><a className="text-link text-link--green" href={unit.petPolicy} target="_blank" rel="noreferrer">Ler a política pet da {unit.shortName} <Icon name="arrow" /></a></p>}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

const whatsAppNumber = '5521994230871';
const whatsAppLink = (text) => `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(text)}`;

// Chat: ao abrir mostra um menu de opções pré-definidas; depois da escolha, a conversa fica livre.
// As mensagens digitadas vão para askAssistant (src/chat/assistant.js), onde a IA será integrada.
function FrequentlyAskedChatbot({ unit }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const toggleRef = useRef(null);
  const inputRef = useRef(null);
  const logRef = useRef(null);
  const requestRef = useRef(0);
  const chatbotQuestions = [
    { question: 'Como recebo pela parceria?', answer: faqItems[0].answer },
    { question: 'Há um mínimo de seguidores?', answer: faqItems[1].answer },
    { question: 'Qual é a diferença entre as unidades?', answer: unit.id === 'serra'
      ? 'A Serra fica em Miguel Pereira e destaca montanhas, trilhas, cachoeiras e áreas verdes. O Mar fica em Búzios, próximo à Praia Rasa, e tem piscina aquecida com vista para o oceano. Você pode conhecer as duas páginas pelos links de escolha da unidade.'
      : 'O Mar fica em Búzios, próximo à Praia Rasa, e tem piscina aquecida com vista para o oceano. A Serra fica em Miguel Pereira e destaca montanhas, trilhas, cachoeiras e áreas verdes. Você pode conhecer as duas páginas pelos links de escolha da unidade.' },
    { question: 'Quais são as regras para levar meu pet?', answer: faqItems[3].answer },
    { question: 'Como envio meu perfil?', answer: faqItems[4].answer },
  ];

  useEffect(() => {
    if (!chatOpen) return undefined;
    const handleEscape = (event) => {
      if (event.key !== 'Escape') return;
      closeAll();
      toggleRef.current?.focus();
    };
    document.addEventListener('keydown', handleEscape);
    requestAnimationFrame(() => inputRef.current?.focus());
    return () => document.removeEventListener('keydown', handleEscape);
  }, [chatOpen]);

  const askedQuestions = new Set(messages.filter((message) => message.type === 'visitor').map((message) => message.text));
  const remainingQuestions = chatbotQuestions.filter((item) => !askedQuestions.has(item.question));

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, pending, chatOpen]);

  // Respostas do assistente entram depois da animação de "digitando"; o tempo acompanha o tamanho do texto.
  const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });
  async function typeReplies(replies) {
    const requestId = ++requestRef.current;
    for (const reply of replies) {
      setPending(true);
      await wait(Math.min(1700, 650 + reply.text.length * 7));
      if (requestId !== requestRef.current) return;
      setPending(false);
      setMessages((current) => [...current, reply]);
      await wait(180);
      if (requestId !== requestRef.current) return;
    }
  }

  // O chat abre direto: na primeira vez o assistente "digita" a saudação e as sugestões aparecem em balões.
  function openChat() {
    setChatOpen(true);
    if (messages.length === 0) {
      typeReplies([{ type: 'assistant', text: 'Pode escrever sua dúvida ou tocar em uma das sugestões abaixo.' }]);
    }
  }

  function askQuestion(item) {
    if (pending) return;
    setMessages((current) => [...current, { type: 'visitor', text: item.question }]);
    typeReplies([{ type: 'assistant', text: item.answer }]);
  }

  async function sendMessage(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || pending) return;
    const history = [...messages, { type: 'visitor', text }];
    setMessages(history);
    setDraft('');
    setPending(true);
    const requestId = ++requestRef.current;
    let reply;
    try {
      reply = await askAssistant({
        unit,
        messages: history.map((message) => ({ role: message.type === 'visitor' ? 'user' : 'assistant', text: message.text })),
      });
    } catch {
      reply = { text: 'Não consegui responder agora. Você pode falar com a equipe pelo WhatsApp.', offerWhatsApp: true };
    }
    if (requestId !== requestRef.current) return;
    setPending(false);
    setMessages((current) => [
      ...current,
      { type: 'assistant', text: reply.text, whatsapp: reply.offerWhatsApp ? whatsAppLink(`Oi, Le Ange! ${text}`) : null },
    ]);
  }

  function closeAll() {
    requestRef.current += 1;
    setPending(false);
    setChatOpen(false);
  }

  function toggleHelp() {
    if (chatOpen) {
      closeAll();
      return;
    }
    openChat();
  }

  return (
    <aside className="help-chat" aria-label="Chat Le Ange">
      {chatOpen && (
        <section className="help-chat__panel help-chat__panel--chat" id="chat-panel" role="dialog" aria-modal="false" aria-labelledby="chat-title">
          <div className="help-chat__header">
            <span className="help-chat__avatar"><Icon name="paw" /></span>
            <span><strong id="chat-title">Assistente Le Ange</strong><small>{AI_ENABLED ? 'Online agora' : 'Chat aberto · IA em breve'}</small></span>
            <button type="button" className="help-chat__close" onClick={() => { closeAll(); toggleRef.current?.focus(); }} aria-label="Fechar chat">×</button>
          </div>
          <div className="help-chat__scroll" ref={logRef}>
          <div className="help-chat__messages" role="log" aria-live="polite" aria-relevant="additions text" aria-label="Conversa com o assistente Le Ange">
            <p className="help-chat__message help-chat__message--assistant">Oi! Posso ajudar com informações sobre a parceria e as unidades.</p>
            {messages.map((message, index) => (
              <div key={`${message.type}-${index}`} className={`help-chat__message help-chat__message--${message.type}`}>
                <p>{message.text}</p>
                {message.whatsapp && <a className="help-chat__whatsapp" href={message.whatsapp} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" /> Enviar pelo WhatsApp</a>}
              </div>
            ))}
            {pending && <p className="help-chat__typing" role="status"><span aria-hidden="true"><i></i><i></i><i></i></span><span className="sr-only">O assistente está respondendo</span></p>}
          </div>
          {!pending && remainingQuestions.length > 0 && (
            <div className="help-chat__quick" role="group" aria-label="Sugestões de perguntas">
              {remainingQuestions.slice(0, 3).map((item) => (
                <button key={item.question} type="button" className="help-chat__bubble" onClick={() => askQuestion(item)}>{item.question}</button>
              ))}
            </div>
          )}
          </div>
          <form className="help-chat__composer" onSubmit={sendMessage}>
            <label className="sr-only" htmlFor="chat-input">Escreva sua mensagem</label>
            <input ref={inputRef} id="chat-input" type="text" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Escreva sua mensagem…" maxLength={500} autoComplete="off" aria-describedby="chat-note" />
            <button type="submit" aria-label="Enviar mensagem" disabled={!draft.trim() || pending}><Icon name="arrow" /></button>
          </form>
          <p className="help-chat__coming-soon" id="chat-note">{AI_ENABLED ? 'Respostas geradas por IA podem conter erros. Confirme detalhes com a equipe.' : 'As respostas automáticas com IA chegam em breve. Até lá, a equipe responde pelo WhatsApp.'}</p>
        </section>
      )}
      <button ref={toggleRef} className="help-chat__toggle" type="button" onClick={toggleHelp} aria-haspopup="dialog" aria-expanded={chatOpen} aria-controls={chatOpen ? 'chat-panel' : undefined}>
        <Icon name="paw" /><span>{chatOpen ? 'Fechar chat' : 'Abrir chat'}</span>
      </button>
    </aside>
  );
}

const passSteps = [
  { title: 'Você divulga', text: 'a Le Ange com o seu olhar, a sua rede e o seu pet.' },
  { title: 'Você é remunerado', text: 'pelas postagens acordadas com a equipe.' },
];

const initialsOf = (name) => name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

const templateQuote = 'Aqui entra o depoimento de um creator parceiro, publicado com autorização.';

// Rede do creator (pelo nome ou slug) para colorir o cartão com a cor da marca.
const findNetwork = (name = '') => {
  const key = name.trim().toLowerCase();
  return socialNetworks.find((network) => network.name.toLowerCase() === key || network.slug === key);
};

// Texto escuro sobre marcas claras e branco sobre marcas escuras.
const inkFor = (hex) => {
  const [r, g, b] = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255)
    .map((value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? '#202f29' : '#ffffff';
};

// Cartão da faixa: creator (colorido pela rede escolhida) ou exemplo de layout (lista vazia).
function CreatorCard({ item }) {
  if (item.kind === 'creator') {
    const unitName = units[item.unit]?.shortName;
    const unitId = item.unit === 'mar' ? 'mar' : 'serra';
    const network = findNetwork(item.network);
    const theme = network ? `creator-card--network creator-card--${network.slug}` : `creator-card--${unitId}`;
    const brandStyle = network ? { '--brand': network.hex, '--brand-ink': inkFor(network.hex) } : undefined;
    return (
      <article className={`creator-card ${theme}`} style={brandStyle}>
        <div className="creator-card__cover" aria-hidden="true">
          {item.demo && <span className="creator-card__tag">Prévia · fictício</span>}
          {network
            ? <svg className="creator-card__mark creator-card__mark--network" viewBox="0 0 24 24" focusable="false"><path d={network.path} /></svg>
            : <Icon name={unitId === 'mar' ? 'wave' : 'leaf'} className="creator-card__mark" />}
        </div>
        <div className="creator-card__avatar">{item.avatar ? <img src={item.avatar} alt="" width="64" height="64" loading="lazy" decoding="async" /> : initialsOf(item.name)}</div>
        <div className="creator-card__body">
          <h4 className="creator-card__name">{item.name}</h4>
          <p className="creator-card__handle">{item.handle}{item.network ? ` · ${item.network}` : ''}</p>
          {item.pet && <p className="creator-card__pet"><Icon name="paw" /> com {item.pet}</p>}
          {item.quote && <blockquote className="creator-card__quote"><p>{item.quote}</p></blockquote>}
        </div>
        <footer className="creator-card__foot">
          {unitName && <span className={`creator-card__unit creator-card__unit--${unitId}`}>Le Ange {unitName}</span>}
          {item.profileUrl && <a className="creator-card__link" href={item.profileUrl} target="_blank" rel="noopener noreferrer" aria-label={`Ver perfil de ${item.name} no ${item.network || 'Instagram'}`}>Ver perfil <Icon name="arrow" /></a>}
        </footer>
      </article>
    );
  }

  if (item.kind === 'template') {
    return (
      <article className="creator-card creator-card--template">
        <div className="creator-card__cover"><span className="creator-card__tag">Exemplo de layout</span></div>
        <div className="creator-card__avatar"><Icon name="paw" /></div>
        <div className="creator-card__body">
          <h4 className="creator-card__name">Nome do creator</h4>
          <p className="creator-card__handle">@perfil · rede</p>
          <p className="creator-card__pet"><Icon name="paw" /> com nome do pet</p>
          <blockquote className="creator-card__quote"><p>{templateQuote}</p></blockquote>
        </div>
        <footer className="creator-card__foot"><span className="creator-card__unit">Le Ange</span></footer>
      </article>
    );
  }

  return null;
}

function CreatorMarquee() {
  const [paused, setPaused] = useState(false);
  const hasCreators = creators.length > 0;
  // Sem creators reais: em `npm run dev` mostra a prévia fictícia; em produção, cartões "Exemplo de layout".
  const showDemo = !hasCreators && import.meta.env.DEV;
  const source = hasCreators ? creators : showDemo ? demoCreators : [];
  const base = source.length
    ? source.map((creator) => ({ ...creator, kind: 'creator', demo: showDemo, id: creator.handle || creator.name }))
    : Array.from({ length: 4 }, (_, index) => ({ kind: 'template', id: `exemplo-${index}` }));
  // Repete os cartões até cobrir telas largas; a segunda cópia fecha o loop infinito.
  const row = Array.from({ length: Math.max(base.length, 8) }, (_, index) => base[index % base.length]);
  // Poucas redes: repete a lista para a faixa cobrir telas largas sem buracos no loop.
  const socialRow = Array.from({ length: Math.ceil(24 / socialNetworks.length) }, () => socialNetworks).flat();

  return (
    <div className={`creator-marquee${paused ? ' is-paused' : ''}`} aria-labelledby="creator-marquee-title" role="region" {...flowt('pop-up')}>
      <div className="creator-marquee__head page-shell">
        <h3 id="creator-marquee-title">{hasCreators || showDemo ? 'Creators parceiros da Le Ange' : 'Seu perfil pode passar por aqui'}</h3>
        <button type="button" className="creator-marquee__toggle" onClick={() => setPaused((value) => !value)} aria-pressed={paused}>
          <Icon name={paused ? 'play' : 'pause'} />{paused ? 'Retomar movimento' : 'Pausar movimento'}
        </button>
      </div>
      <div className="creator-marquee__row" aria-hidden={!hasCreators || undefined} inert={!hasCreators || undefined}>
        <div className="creator-marquee__track">
          {[false, true].map((isCopy) => (
            <ul className="creator-marquee__group" key={String(isCopy)} aria-label={!isCopy && hasCreators ? 'Creators parceiros da Le Ange' : undefined} aria-hidden={isCopy || undefined} inert={isCopy || undefined}>
              {row.map((item, index) => <li key={`${item.id}-${index}`}><CreatorCard item={item} /></li>)}
            </ul>
          ))}
        </div>
      </div>
      <div className="social-marquee">
        <p className="social-marquee__label page-shell">Instagram, TikTok, YouTube e outras redes de vídeo: crie na rede em que você já fala com a sua comunidade.</p>
        <div className="social-marquee__band">
        <div className="creator-marquee__row social-marquee__row">
          <div className="creator-marquee__track">
            {[false, true].map((isCopy) => (
              <ul className="creator-marquee__group social-marquee__group" key={String(isCopy)} aria-label={isCopy ? undefined : 'Redes em que você pode criar'} aria-hidden={isCopy || undefined} inert={isCopy || undefined}>
                {socialRow.map((network, index) => (
                  <li key={`${network.slug}-${index}`}>
                    <span className="social-chip" style={{ '--brand': network.hex }}>
                      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d={network.path} /></svg>
                      <span>{network.name}</span>
                    </span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

function PartnershipSection({ unit, applicationHref }) {
  return (
    <section className="partnership-section section-pad" id="vantagens" aria-labelledby="partnership-title">
      <div className="partnership-top page-shell">
        <header className="partnership-intro" {...flowt('float-right')}>
          <p className="eyebrow eyebrow--light"><span className="eyebrow__dot"></span> Parceria remunerada para creators pet</p>
          <h2 id="partnership-title">Sua criatividade merece uma <em>parceria à altura.</em></h2>
          <p>Você traz seu olhar e a conexão real com sua comunidade. A Le Ange oferece um cenário cheio de histórias e uma parceria <strong className="business-rule-highlight business-rule-highlight--dark">remunerada pelas postagens acordadas.</strong></p>
          <small className="partnership-intro__note">Formato, entregas, datas e remuneração são conversados com clareza antes da confirmação.</small>
        </header>
        <article className="creator-pass" aria-labelledby="creator-pass-title" {...flowt('float-left')}>
          <span className="partnership-coin" aria-hidden="true">
            <span className="partnership-coin__face"><Icon name="coin" /></span>
            <span className="partnership-coin__face partnership-coin__face--back"><Icon name="paw" /></span>
          </span>
          <div className="creator-pass__card">
            <header className="creator-pass__head">
              <p><Icon name="paw" /> Creator Pass</p>
              <span>Le Ange {unit.shortName}</span>
            </header>
            <h3 id="creator-pass-title">Parceria remunerada</h3>
            <ol className="creator-pass__steps">
              {passSteps.map((step, index) => (
                <li key={step.title}><span className="creator-pass__num" aria-hidden="true">{index + 1}</span><span><strong>{step.title}</strong><small>{step.text}</small></span></li>
              ))}
            </ol>
            <footer className="creator-pass__foot">
              <span className="creator-pass__code" aria-hidden="true"></span>
              <a className="button button--dark" href={applicationHref}>Apresentar meu perfil <Icon name="arrow" /></a>
            </footer>
          </div>
        </article>
      </div>
      <CreatorMarquee />
    </section>
  );
}

function ApplicationRoute({ unit, onSubmit, whatsAppDraft }) {
  return (
    <section className="application-section section-pad" aria-labelledby="application-title">
      <div className="application-grid page-shell">
        <div className="application-copy">
          <p className="eyebrow eyebrow--green"><span className="eyebrow__dot"></span> Um primeiro passo, sem complicação</p>
          <h1 id="application-title">Vamos imaginar essa parceria <em>juntos?</em></h1>
          <p>Conte um pouco sobre você e seu conteúdo. Nossa equipe conversa com você sobre unidade, formato, disponibilidade e remuneração.</p>
          <ol className="next-steps">
            <li><span>1</span><span><strong>Você se apresenta</strong><small>Compartilhe seu perfil e o tipo de conteúdo que cria.</small></span></li>
            <li><span>2</span><span><strong>A gente conversa</strong><small>Alinhamos os detalhes e as possibilidades de parceria.</small></span></li>
            <li><span>3</span><span><strong>Se fizer sentido para ambos</strong><small>Combinamos a experiência e as postagens antes de confirmar.</small></span></li>
          </ol>
          <p className="application-privacy">A mensagem ficará preenchida no WhatsApp para você revisar antes de enviá-la à equipe.</p>
        </div>
        <form className="creator-form" onSubmit={onSubmit}>
          <div className="creator-form__heading"><span className="form-icon"><Icon name="paw" /></span><div><p>PROGRAMA LE ANGE CREATORS</p><h2>Conte sua história</h2></div></div>
          <input type="hidden" name="unidade" value={unit.name} />
          <div className="form-field"><label htmlFor="name">Como podemos chamar você?</label><input id="name" name="nome" autoComplete="name" placeholder="Seu nome" required /></div>
          <div className="form-row">
            <div className="form-field"><label htmlFor="whatsapp">Seu WhatsApp</label><input id="whatsapp" name="whatsapp" type="tel" autoComplete="tel" placeholder="(00) 00000-0000" required /></div>
            <div className="form-field"><label htmlFor="network">Rede principal</label><select id="network" name="rede" defaultValue="Instagram"><option>Instagram</option><option>TikTok</option><option>YouTube</option><option>Outra</option></select></div>
          </div>
          <div className="form-field"><label htmlFor="profile">Seu @ ou link do perfil</label><input id="profile" name="perfil" placeholder="@seuperfil" required /></div>
          <div className="form-field"><label htmlFor="pet">Quem é seu companheiro de conteúdo?</label><input id="pet" name="pet" placeholder="Nome e tipo de pet (opcional)" /></div>
          <div className="form-field"><label htmlFor="content">Que tipo de história vocês gostam de contar?</label><textarea id="content" name="conteudo" rows="3" placeholder="Viagens, rotina, aventuras... (opcional)"></textarea></div>
          <button className="button button--dark button--submit" type="submit">Continuar pelo WhatsApp <Icon name="arrow" /></button>
          <p className="form-consent">A candidatura não confirma a parceria. Os detalhes são combinados com a equipe Le Ange.</p>
          {whatsAppDraft && <p className="application-handoff" role="status">Sua mensagem está pronta. Revise e envie pelo WhatsApp. Se a nova aba não abriu, <a href={whatsAppDraft} target="_blank" rel="noreferrer">abra o WhatsApp por este link</a>.</p>}
        </form>
      </div>
    </section>
  );
}

// Rolagem feita em JavaScript (sem âncoras #id na URL): anima com requestAnimationFrame,
// desconta o menu fixo, respeita movimento reduzido e para se a pessoa rolar por conta própria.
let scrollAnimationFrame = 0;
let cancelScrollAnimation = null;

function animateScrollTo(targetTop) {
  cancelScrollAnimation?.();
  const start = window.scrollY;
  const distance = Math.max(0, targetTop) - start;
  if (Math.abs(distance) < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo(0, start + distance);
    return;
  }
  const duration = Math.min(1100, Math.max(450, Math.abs(distance) * 0.35));
  const startedAt = performance.now();
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2);
  const stop = () => {
    cancelAnimationFrame(scrollAnimationFrame);
    ['wheel', 'touchstart', 'keydown'].forEach((type) => window.removeEventListener(type, stop));
    cancelScrollAnimation = null;
  };
  ['wheel', 'touchstart', 'keydown'].forEach((type) => window.addEventListener(type, stop, { passive: true }));
  cancelScrollAnimation = stop;
  const step = (now) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    window.scrollTo(0, start + distance * ease(progress));
    if (progress < 1) scrollAnimationFrame = requestAnimationFrame(step);
    else stop();
  };
  scrollAnimationFrame = requestAnimationFrame(step);
}

function scrollToSection(id, { focus = true } = {}) {
  const target = document.getElementById(id);
  if (!target) return false;
  const headerHeight = document.querySelector('.site-header')?.getBoundingClientRect().height ?? 0;
  animateScrollTo(window.scrollY + target.getBoundingClientRect().top - headerHeight - 8);
  if (focus) {
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }
  return true;
}

function App({ initialUnit = 'serra', applicationPage = false }) {
  const selected = initialUnit === 'mar' ? 'mar' : 'serra';
  const unit = units[selected];
  const images = photos[selected];
  const [whatsAppDraft, setWhatsAppDraft] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);

  // Menu hambúrguer (celular): fecha com Esc, clique fora ou ao voltar para telas largas.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const handleKey = (event) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      navRef.current?.querySelector('.site-nav__toggle')?.focus();
    };
    const handleOutside = (event) => {
      if (!navRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const wide = window.matchMedia('(min-width: 701px)');
    const handleWide = (event) => { if (event.matches) setMenuOpen(false); };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('pointerdown', handleOutside);
    wide.addEventListener('change', handleWide);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('pointerdown', handleOutside);
      wide.removeEventListener('change', handleWide);
    };
  }, [menuOpen]);
  const copyrightYear = new Date().getFullYear();
  const applicationHref = `/candidatura/${selected}`;
  const sectionHref = (section) => `/${selected}?secao=${section}`;
  const scrollLink = (section) => ({ href: sectionHref(section), 'data-scroll-to': section });

  useEffect(() => {
    const header = document.querySelector('.site-header');
    const progressBar = document.querySelector('.scroll-progress');
    const backToTop = document.querySelector('.back-to-top');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;

    const syncScrollState = () => {
      frame = 0;
      header?.classList.toggle('is-scrolled', window.scrollY > 12);
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollableHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollableHeight)) : 0;
      progressBar?.style.setProperty('--scroll-progress', progress);
      backToTop?.style.setProperty('--progress', progress);
      backToTop?.classList.toggle('is-visible', window.scrollY > 600);
      // No fim da página, a última seção do menu fica ativa mesmo que não alcance o meio da tela.
      if (scrollableHeight > 0 && window.scrollY >= scrollableHeight - 4 && navLinks.length) setActiveSection(navLinks[navLinks.length - 1].dataset.section);
    };
    const requestSync = () => {
      if (!frame) frame = requestAnimationFrame(syncScrollState);
    };

    const handleScrollLink = (event) => {
      const link = event.target.closest('[data-scroll-to]');
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      // Na página de candidatura a seção não existe: o link segue para /serra?secao=..., que rola ao carregar.
      if (!document.getElementById(link.dataset.scrollTo)) return;
      event.preventDefault();
      scrollToSection(link.dataset.scrollTo);
    };

    // Menu: um indicador verde desliza até o link da seção visível (scroll-spy).
    const navList = document.querySelector('.site-nav__links');
    const navIndicator = navList?.querySelector('.site-nav__indicator');
    const navLinks = Array.from(navList?.querySelectorAll('a[data-section]') || []);
    let activeSection = null;
    const placeIndicator = () => {
      if (!navIndicator) return;
      const link = navLinks.find((item) => item.dataset.section === activeSection);
      if (!link || !link.offsetWidth) {
        navIndicator.style.opacity = '0';
        return;
      }
      navIndicator.style.opacity = '1';
      navIndicator.style.width = `${link.offsetWidth}px`;
      navIndicator.style.transform = `translateX(${link.offsetLeft}px)`;
    };
    const setActiveSection = (id) => {
      if (id === activeSection) return;
      activeSection = id;
      navLinks.forEach((link) => {
        const isActive = link.dataset.section === id;
        link.classList.toggle('is-active', isActive);
        if (isActive) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      placeIndicator();
    };
    const spySections = navLinks.map((link) => document.getElementById(link.dataset.section)).filter(Boolean);
    let sectionSpy;
    if (spySections.length && 'IntersectionObserver' in window) {
      sectionSpy = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      }, { rootMargin: '-40% 0px -55% 0px' });
      spySections.forEach((section) => sectionSpy.observe(section));
    }

    // DOM Flowt: o IntersectionObserver da lib dispensa chamadas a cada scroll, então basta iniciar uma vez.
    // Sem IntersectionObserver ou com movimento reduzido, o conteúdo fica visível sem animação.
    const flowtTargets = document.querySelectorAll('[dom-flowt-is-visible]');
    if (flowtTargets.length) {
      if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        flowtTargets.forEach((target) => target.setAttribute('dom-flowt-is-visible', 'true'));
      } else {
        DomFlowt.watch();
      }
    }

    // Animações infinitas (celular gravando, faixas, moeda, brilho dos botões) pausam fora da tela:
    // economiza CPU e bateria, principalmente no celular.
    const animatedBlocks = document.querySelectorAll('.rec-phone, .creator-marquee, .unit-scroller, .creator-pass, .button--cta');
    let animationGate;
    if (animatedBlocks.length && 'IntersectionObserver' in window) {
      animationGate = new IntersectionObserver((entries) => {
        entries.forEach((entry) => entry.target.classList.toggle('is-offscreen', !entry.isIntersecting));
      }, { rootMargin: '120px 0px' });
      animatedBlocks.forEach((block) => animationGate.observe(block));
    }

    syncScrollState();
    window.addEventListener('scroll', requestSync, { passive: true });
    window.addEventListener('resize', requestSync, { passive: true });
    document.addEventListener('click', handleScrollLink);
    window.addEventListener('resize', placeIndicator, { passive: true });

    // Chegando com ?secao=... (ou um #id antigo), rola até a seção e limpa a URL.
    const params = new URLSearchParams(window.location.search);
    const initialSection = params.get('secao') || decodeURIComponent(window.location.hash.slice(1));
    if (initialSection) {
      requestAnimationFrame(() => {
        if (scrollToSection(initialSection)) window.history.replaceState(null, '', window.location.pathname);
      });
    }

    return () => {
      if (frame) cancelAnimationFrame(frame);
      document.removeEventListener('click', handleScrollLink);
      cancelScrollAnimation?.();
      window.removeEventListener('resize', placeIndicator);
      sectionSpy?.disconnect();
      animationGate?.disconnect();
      window.removeEventListener('scroll', requestSync);
      window.removeEventListener('resize', requestSync);
    };
  }, []);

  function handleApplication(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const lines = [
      'Oi, Le Ange! Quero conversar sobre uma parceria como creator pet.',
      '',
      `Unidade de interesse: ${unit.name}`,
      `Meu nome: ${form.get('nome')}`,
      `Meu WhatsApp: ${form.get('whatsapp')}`,
      `Meu perfil: ${form.get('perfil')}`,
      `Rede principal: ${form.get('rede')}`,
      `Meu pet: ${form.get('pet') || 'Prefiro contar na conversa'}`,
      `Sobre meu conteúdo: ${form.get('conteudo') || 'Vou explicar na conversa'}`,
    ];
    const destination = `https://wa.me/5521994230871?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(destination, '_blank', 'noopener,noreferrer');
    setWhatsAppDraft(destination);
  }

  return (
    <>
      <a className="skip-link" {...scrollLink('conteudo')}>Pular para o conteúdo</a>
      <div className="scroll-progress" aria-hidden="true" />
      <header className="site-header">
        <div className="site-header__inner page-shell">
          <nav className={`site-nav${menuOpen ? ' is-open' : ''}`} aria-label="Navegação principal" ref={navRef}>
            <a className="brand" {...scrollLink('quem-somos')} aria-label="Le Ange Creators, início">
              <span className="brand__mark"><img src={brandIcon} alt="" width="40" height="40" /></span>
            </a>
            <button
              type="button"
              className="site-nav__toggle"
              aria-expanded={menuOpen}
              aria-controls="site-nav-menu"
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>
            </button>
            <div className="site-nav__menu" id="site-nav-menu" onClick={(event) => { if (event.target.closest('a')) setMenuOpen(false); }}>
            <ul className="site-nav__links">
              <li className="site-nav__indicator" aria-hidden="true"></li>
              <li><a {...scrollLink('quem-somos')} data-section={applicationPage ? undefined : 'quem-somos'}>Quem somos</a></li>
              <li><a {...scrollLink('vantagens')} data-section={applicationPage ? undefined : 'vantagens'}>Parceria</a></li>
              <li><a {...scrollLink('duvidas')} data-section={applicationPage ? undefined : 'duvidas'}>Dúvidas</a></li>
            </ul>
            <a className="site-nav__cta" href={applicationHref}>
              <span className="site-nav__coin" aria-hidden="true"><Icon name="coin" /></span>
              <span>Seja parceiro</span>
            </a>
            </div>
          </nav>
        </div>
      </header>

      <main id="conteudo">
        {applicationPage ? <ApplicationRoute unit={unit} onSubmit={handleApplication} whatsAppDraft={whatsAppDraft} /> : <>
        <section className="brand-story section-pad" id="quem-somos" aria-labelledby="brand-story-title">
          <div className="brand-story__inner page-shell">
            <div className="brand-story__copy">
              <h1 id="brand-story-title">Torne-se um <em>parceiro da Le Ange.</em></h1>
              <p>Nascida em Miguel Pereira em 2018 e presente em Búzios desde 2023, a Le Ange se posiciona como a pousada mais Pet Friendly do Brasil: aqui, tutores e pets vivem a viagem juntos, nas áreas de lazer e convivência.</p>
              <p>Agora queremos contar essas histórias com quem cria conteúdo. Como creator parceiro, você mostra a experiência Le Ange com a sua voz e o seu pet, e <strong className="business-rule-highlight">recebe pelas postagens combinadas</strong> com a nossa equipe.</p>
              <div className="brand-story__actions">
                <a className="button button--cta" {...scrollLink('candidatura')}><span className="button__coin" aria-hidden="true"><Icon name="coin" /></span>Quero ser parceiro <Icon name="arrow" /></a>
              </div>
            </div>
            <RecordingPhone unit={unit} image={images.story} />
          </div>
        </section>
        <PhotoGrid unit={unit} />
        <UnitScroller />

        <PartnershipSection unit={unit} applicationHref={applicationHref} />

        <FrequentlyAskedQuestions unit={unit} />

        <section className="application-cta-section section-pad" id="candidatura" aria-labelledby="application-cta-title">
          <div className="application-cta-card page-shell" {...flowt('pop-up')}>
            <p className="eyebrow eyebrow--light"><span className="eyebrow__dot"></span> Seu próximo passo</p>
            <h2 id="application-cta-title">Vamos imaginar essa parceria <em>juntos?</em></h2>
            <p>Conte um pouco sobre você, seu pet e seu conteúdo. A candidatura abre em uma página própria para você preencher com calma.</p>
            <a className="button button--light" href={applicationHref}>Ir para o formulário <Icon name="arrow" /></a>
          </div>
        </section>
        </>}
      </main>

      <footer className="site-footer">
        <div className="site-footer__inner page-shell">
          <div className="site-footer__grid">
            <nav className="site-footer__col" aria-labelledby="footer-creators">
              <h2 className="site-footer__title" id="footer-creators">Le Ange Creators</h2>
              <ul className="site-footer__list">
                <li><a {...scrollLink('quem-somos')}>Quem somos</a></li>
                <li><a {...scrollLink('vantagens')}>A parceria</a></li>
                <li><a {...scrollLink('duvidas')}>Dúvidas frequentes</a></li>
                <li><a href={applicationHref}>Candidatar-se</a></li>
              </ul>
              <ul className="site-footer__list site-footer__list--muted">
                <li><a href="/serra">Le Ange Serra</a></li>
                <li><a href="/mar">Le Ange Mar</a></li>
              </ul>
            </nav>
            <nav className="site-footer__col" aria-labelledby="footer-info">
              <h2 className="site-footer__title" id="footer-info">Precisa de mais informações?</h2>
              <ul className="site-footer__list">
                <li><a {...scrollLink('duvidas')}>Perguntas sobre a parceria</a></li>
                <li><a href={petPolicies.serra} target="_blank" rel="noopener noreferrer">Política pet da Serra</a></li>
                <li><a href={petPolicies.mar} target="_blank" rel="noopener noreferrer">Política pet do Mar</a></li>
                <li><a href="https://www.pousadaleange.com.br/" target="_blank" rel="noopener noreferrer">Site da pousada</a></li>
              </ul>
              <p className="site-footer__note">Formato, entregas, datas e remuneração são combinados com a equipe antes da confirmação.</p>
            </nav>
            <nav className="site-footer__col" aria-labelledby="footer-social">
              <h2 className="site-footer__title" id="footer-social">Também estamos nas redes</h2>
              <ul className="site-footer__list">
                <li><a href="https://www.instagram.com/pousadaleange/" target="_blank" rel="noopener noreferrer">Instagram</a></li>
                <li><a href={`https://wa.me/${whatsAppNumber}`} target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
              </ul>
              <p className="site-footer__note">Marque @pousadaleange quando publicar a sua viagem com o seu pet.</p>
            </nav>
            <div className="site-footer__col">
              <h2 className="site-footer__title">Fale com a gente</h2>
              <address className="site-footer__address">
                <span><strong>Le Ange Serra</strong><br />Miguel Pereira · RJ</span>
                <span><strong>Le Ange Mar</strong><br />Armação dos Búzios · RJ</span>
              </address>
              <p className="site-footer__note site-footer__note--plain">WhatsApp: <a href={`https://wa.me/${whatsAppNumber}`} target="_blank" rel="noopener noreferrer">+55 21 99423-0871</a></p>
            </div>
          </div>
          <div className="site-footer__bottom">
            <a className="brand brand--footer" {...scrollLink('quem-somos')} aria-label="Le Ange Creators, voltar ao início"><span className="brand__mark"><img src={brandIcon} alt="" width="40" height="40" /></span></a>
            <p className="site-footer__badge"><Icon name="coin" /> Parceria remunerada para creators pet</p>
            <small>© {copyrightYear} Le Ange · Feito para viver e compartilhar.</small>
          </div>
        </div>
      </footer>
      <button
        type="button"
        className={`back-to-top${applicationPage ? ' back-to-top--alone' : ''}`}
        aria-label="Voltar ao topo"
        onClick={() => {
          animateScrollTo(0);
          document.querySelector('.site-header .brand')?.focus({ preventScroll: true });
        }}
      >
        <Icon name="arrow" />
      </button>
      {!applicationPage && <FrequentlyAskedChatbot unit={unit} />}
    </>
  );
}

export default App;
