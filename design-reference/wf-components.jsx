
// Shared wireframe components — sketchy lo-fi style

const WF_COLORS = {
  bg: '#faf9f6',
  paper: '#ffffff',
  ink: '#1c1c1c',
  gray: '#888',
  lightGray: '#d8d5cf',
  blue: '#3b72d9',
  orange: '#e07b39',
  green: '#3dab6b',
  red: '#d94040',
  hatching: '#e8e5df',
};

const wfBase = {
  fontFamily: "'Caveat', cursive",
  boxSizing: 'border-box',
};

/* ── Primitives ── */

const Box = ({ w, h, label, bg = '#fff', dash = false, color = WF_COLORS.ink, style = {}, children, note }) => (
  <div style={{
    ...wfBase,
    width: w, height: h,
    border: `2px ${dash ? 'dashed' : 'solid'} ${color}`,
    borderRadius: 4,
    background: bg,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
    ...style,
  }}>
    {label && <span style={{ fontSize: 15, color: color === WF_COLORS.ink ? WF_COLORS.gray : color, textAlign: 'center', padding: '0 6px' }}>{label}</span>}
    {children}
    {note && <Note text={note} />}
  </div>
);

const ImgBox = ({ w, h, label, style = {} }) => (
  <div style={{
    ...wfBase,
    width: w, height: h,
    border: `2px solid ${WF_COLORS.ink}`,
    background: WF_COLORS.hatching,
    position: 'relative',
    flexShrink: 0,
    ...style,
  }}>
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <line x1="0" y1="0" x2="100%" y2="100%" stroke={WF_COLORS.lightGray} strokeWidth="1.5" />
      <line x1="100%" y1="0" x2="0" y2="100%" stroke={WF_COLORS.lightGray} strokeWidth="1.5" />
    </svg>
    {label && <span style={{ ...wfBase, position: 'absolute', bottom: 6, left: 0, right: 0, textAlign: 'center', fontSize: 13, color: WF_COLORS.gray }}>{label}</span>}
  </div>
);

const Btn = ({ label, primary = false, small = false, style = {} }) => (
  <div style={{
    ...wfBase,
    padding: small ? '4px 12px' : '8px 20px',
    background: primary ? WF_COLORS.ink : '#fff',
    color: primary ? '#fff' : WF_COLORS.ink,
    border: `2px solid ${WF_COLORS.ink}`,
    borderRadius: 4,
    fontSize: small ? 14 : 17,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    ...style,
  }}>{label}</div>
);

const Tag = ({ label, color = WF_COLORS.blue }) => (
  <span style={{
    ...wfBase,
    padding: '2px 8px',
    background: color + '22',
    border: `1.5px solid ${color}`,
    borderRadius: 3,
    fontSize: 13,
    color: color,
  }}>{label}</span>
);

const Chip = ({ label }) => (
  <span style={{
    ...wfBase,
    padding: '3px 10px',
    background: WF_COLORS.hatching,
    border: `1.5px solid ${WF_COLORS.lightGray}`,
    borderRadius: 20,
    fontSize: 14,
    color: WF_COLORS.ink,
    whiteSpace: 'nowrap',
  }}>{label}</span>
);

const Note = ({ text, side = 'right', color = WF_COLORS.blue }) => (
  <div style={{
    ...wfBase,
    position: 'absolute',
    [side === 'right' ? 'left' : 'right']: 'calc(100% + 10px)',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: 13,
    color: color,
    fontStyle: 'italic',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
  }}>← {text}</div>
);

const Annot = ({ text, color = WF_COLORS.blue, style = {} }) => (
  <div style={{
    ...wfBase,
    fontSize: 13,
    color: color,
    fontStyle: 'italic',
    ...style,
  }}>{text}</div>
);

const Row = ({ children, gap = 8, align = 'center', style = {} }) => (
  <div style={{ display: 'flex', flexDirection: 'row', alignItems: align, gap, ...style }}>{children}</div>
);

const Col = ({ children, gap = 8, align = 'stretch', style = {} }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: align, gap, ...style }}>{children}</div>
);

const Divider = ({ label, style = {} }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', ...style }}>
    <div style={{ flex: 1, height: 1.5, background: WF_COLORS.lightGray }} />
    {label && <span style={{ ...wfBase, fontSize: 13, color: WF_COLORS.gray }}>{label}</span>}
    <div style={{ flex: 1, height: 1.5, background: WF_COLORS.lightGray }} />
  </div>
);

const SearchBar = ({ placeholder = 'Поиск оборудования...', wide = false, ai = false }) => (
  <Row style={{ width: wide ? '100%' : 360, position: 'relative' }}>
    <div style={{
      ...wfBase,
      flex: 1,
      border: `2px solid ${WF_COLORS.ink}`,
      borderRadius: 4,
      padding: '8px 14px',
      fontSize: 17,
      color: WF_COLORS.gray,
      background: '#fff',
    }}>{placeholder}</div>
    {ai && <Tag label="✦ AI" color={WF_COLORS.orange} style={{ position: 'absolute', right: 60, top: '50%', transform: 'translateY(-50%)' }} />}
    <Btn label="Найти" primary />
  </Row>
);

const NavBar = ({ dark = false }) => {
  const bg = dark ? WF_COLORS.ink : '#fff';
  const fg = dark ? '#fff' : WF_COLORS.ink;
  const border = dark ? 'none' : `2px solid ${WF_COLORS.ink}`;
  return (
    <div style={{ ...wfBase, width: '100%', background: bg, border, borderRadius: 4, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ ...wfBase, fontSize: 22, fontWeight: 700, color: dark ? '#fff' : WF_COLORS.ink, letterSpacing: 1 }}>СТРАЖ<span style={{ color: WF_COLORS.orange }}>39</span></div>
      <div style={{ flex: 1 }} />
      {['Каталог', 'О нас', 'Монтаж', 'Контакты'].map(l => (
        <span key={l} style={{ ...wfBase, fontSize: 16, color: fg, opacity: 0.85 }}>{l}</span>
      ))}
      <div style={{ flex: 1 }} />
      <Btn label="🧮 Смета" small style={{ background: WF_COLORS.orange, borderColor: WF_COLORS.orange, color: '#fff' }} />
      <Btn label="📞 Звонок" small style={{ background: dark ? '#ffffff22' : '#fff', color: fg, borderColor: dark ? '#ffffff44' : WF_COLORS.ink }} />
    </div>
  );
};

const Footer = () => (
  <div style={{ ...wfBase, width: '100%', background: WF_COLORS.ink, borderRadius: 4, padding: '16px 20px', display: 'flex', gap: 24 }}>
    {['О компании', 'Каталог', 'Монтаж', 'Контакты', 'SEO-статьи'].map(l => (
      <Col key={l} gap={4}>
        <span style={{ ...wfBase, fontSize: 14, color: '#fff', opacity: 0.9, fontWeight: 700 }}>{l}</span>
        {['Ссылка', 'Ссылка', 'Ссылка'].map((s, i) => (
          <span key={i} style={{ ...wfBase, fontSize: 13, color: '#ffffff66' }}>{s}</span>
        ))}
      </Col>
    ))}
    <div style={{ flex: 1 }} />
    <Col gap={6} align="flex-end">
      <span style={{ ...wfBase, fontSize: 13, color: WF_COLORS.orange }}>vsb39.ru</span>
      <span style={{ ...wfBase, fontSize: 12, color: '#ffffff44' }}>SEO · Sitemap · Robots.txt</span>
    </Col>
  </div>
);

const ProductCard = ({ name = 'Камера 4MP IP', price = '3 490 ₽', tag, compact = false }) => (
  <Col style={{
    border: `2px solid ${WF_COLORS.ink}`,
    borderRadius: 4,
    background: '#fff',
    width: compact ? 140 : 190,
    flexShrink: 0,
    overflow: 'hidden',
  }} gap={0}>
    <ImgBox w="100%" h={compact ? 90 : 120} label="фото" />
    <Col style={{ padding: compact ? 6 : 10 }} gap={4}>
      {tag && <Tag label={tag} color={WF_COLORS.green} />}
      <span style={{ ...wfBase, fontSize: compact ? 13 : 15, color: WF_COLORS.ink }}>{name}</span>
      <span style={{ ...wfBase, fontSize: compact ? 15 : 18, fontWeight: 700, color: WF_COLORS.ink }}>{price}</span>
      <Row gap={4}>
        <Btn label="+ Смета" primary small />
        <Btn label="↗" small />
      </Row>
    </Col>
  </Col>
);

const FilterPanel = ({ style = {} }) => (
  <Col style={{ width: 200, border: `2px solid ${WF_COLORS.ink}`, borderRadius: 4, background: '#fff', padding: 14, flexShrink: 0, ...style }} gap={14}>
    <span style={{ ...wfBase, fontSize: 18, fontWeight: 700 }}>Фильтры</span>
    {[
      { label: 'Категория', opts: ['Камеры', 'Видеорегистраторы', 'СКД', 'Кабели', 'ОПС'] },
      { label: 'Бренд', opts: ['Hikvision', 'Dahua', 'RVi', 'BOLID'] },
      { label: 'Разрешение', opts: ['2MP', '4MP', '8MP'] },
      { label: 'Цена, ₽', opts: null },
    ].map(({ label, opts }) => (
      <Col key={label} gap={4}>
        <span style={{ ...wfBase, fontSize: 16, fontWeight: 700 }}>{label}</span>
        {opts ? opts.map(o => (
          <Row key={o} gap={6}>
            <div style={{ width: 14, height: 14, border: `2px solid ${WF_COLORS.ink}`, borderRadius: 2, flexShrink: 0 }} />
            <span style={{ ...wfBase, fontSize: 14 }}>{o}</span>
          </Row>
        )) : (
          <Row gap={6}>
            <Box w={70} h={28} label="от" />
            <Box w={70} h={28} label="до" />
          </Row>
        )}
      </Col>
    ))}
    <Btn label="Применить" primary style={{ width: '100%' }} />
    <Btn label="Сбросить" style={{ width: '100%' }} />
  </Col>
);

const AIChatBubble = ({ style = {} }) => (
  <div style={{
    ...wfBase,
    width: 260,
    border: `2px solid ${WF_COLORS.orange}`,
    borderRadius: 8,
    background: '#fff',
    padding: 14,
    boxShadow: `3px 3px 0 ${WF_COLORS.orange}`,
    ...style,
  }}>
    <Row gap={8} style={{ marginBottom: 10 }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: WF_COLORS.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16 }}>✦</div>
      <Col gap={2}>
        <span style={{ ...wfBase, fontSize: 15, fontWeight: 700 }}>AI-Консультант</span>
        <span style={{ ...wfBase, fontSize: 12, color: WF_COLORS.green }}>● онлайн</span>
      </Col>
    </Row>
    <div style={{ ...wfBase, fontSize: 14, color: WF_COLORS.gray, borderLeft: `3px solid ${WF_COLORS.orange}`, paddingLeft: 8, marginBottom: 10 }}>
      "Нужна камера для парковки 50 авто, ночью, бюджет 15к"
    </div>
    <div style={{ ...wfBase, fontSize: 13, color: WF_COLORS.ink, marginBottom: 10, background: WF_COLORS.hatching, padding: 8, borderRadius: 4 }}>
      ✓ Подобрал 3 варианта по вашей задаче →
    </div>
    <Row gap={4}>
      <div style={{ flex: 1, height: 32, border: `1.5px solid ${WF_COLORS.lightGray}`, borderRadius: 4 }} />
      <Btn label="→" primary small />
    </Row>
  </div>
);

// Export all
Object.assign(window, {
  WF_COLORS, wfBase,
  Box, ImgBox, Btn, Tag, Chip, Note, Annot,
  Row, Col, Divider, SearchBar,
  NavBar, Footer, ProductCard, FilterPanel,
  AIChatBubble,
});
