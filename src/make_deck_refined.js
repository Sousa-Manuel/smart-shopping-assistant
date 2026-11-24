const pptxgen = require('pptxgenjs');
const {
  warnIfSlideHasOverlaps, warnIfSlideElementsOutOfBounds
} = require('/home/oai/skills/slides/pptxgenjs_helpers');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Microsoft Copilot';
pptx.subject = 'Big Data group reading pitch on The FastLanes File Format';
pptx.title = 'FastLanes: compression designed for processing';
pptx.company = 'University of Luxembourg';
pptx.lang = 'en-US';
pptx.theme = { headFontFace: 'Georgia', bodyFontFace: 'Calibri', lang: 'en-US' };

const C = {
  bg: 'F7F4EE', ink: '1F1F1F', muted: '6B6B6B', accent: 'B5532F',
  rule: 'CFC8BE', pale: 'EEE8DF', white: 'FFFFFF', soft: 'E2DBD1'
};
const W = 13.333, H = 7.5, M = 0.7;

function baseSlide() {
  const s = pptx.addSlide();
  s.background = { color: C.bg };
  s.addText('THE FASTLANES FILE FORMAT', {
    x: M, y: 7.13, w: 4.0, h: .16, fontFace: 'Calibri', fontSize: 8,
    color: C.muted, charSpacing: 1.2, margin: 0
  });
  s.addText(String(pptx._slides.length), {
    x: 12.25, y: 7.12, w: .38, h: .16, fontFace: 'Calibri', fontSize: 8,
    color: C.muted, align: 'right', margin: 0
  });
  return s;
}
function headline(s, text, y=.58, w=11.9, fs=27) {
  s.addText(text, { x:M, y, w, h:.76, fontFace:'Georgia', fontSize:fs,
    bold:false, color:C.ink, margin:0, breakLine:false, fit:'shrink' });
}
function eyebrow(s, text, x=M, y=.31) {
  s.addText(text.toUpperCase(), { x, y, w:3.4, h:.18, fontFace:'Calibri', fontSize:9,
    bold:true, color:C.accent, charSpacing:1.4, margin:0 });
}
function rule(s, y, x=M, w=W-2*M, color=C.rule, width=1) {
  s.addShape(pptx.ShapeType.line, { x, y, w, h:0, line:{color, width} });
}
function notes(s, body, sources) {
  s.addNotes(`${body}\n\n[Sources]\n${sources.join('\n')}\n[/Sources]`);
}

// 1: Editorial opening, asymmetric statement + tension diagram
{
  const s = baseSlide();
  eyebrow(s, 'The problem');
  headline(s, 'Modern analytics needs compression that is cheap to undo.', .62, 7.20, 27);
  s.addText('Parquet-style storage reduces bytes with large general-purpose blocks. The trade-off is irregular decompression that does not map naturally to SIMD or GPU execution.', {
    x:M, y:1.62, w:6.55, h:.88, fontFace:'Calibri', fontSize:16, color:C.muted,
    margin:0, breakLine:false, fit:'shrink'
  });
  rule(s, 2.78, M, 6.55);
  s.addText('The old bargain', {x:M,y:3.04,w:2.15,h:.26,fontFace:'Calibri',fontSize:11,bold:true,color:C.accent,margin:0});
  s.addText('Fewer bytes', {x:M,y:3.47,w:2.5,h:.55,fontFace:'Georgia',fontSize:25,color:C.ink,margin:0});
  s.addText('More decoding work', {x:3.45,y:3.47,w:3.15,h:.55,fontFace:'Georgia',fontSize:25,color:C.ink,margin:0});
  s.addShape(pptx.ShapeType.line,{x:2.68,y:3.74,w:.52,h:0,line:{color:C.accent,width:2,beginArrowType:'none',endArrowType:'triangle'}});
  s.addText('FastLanes changes the target: make the encoded representation directly useful to the execution engine.', {
    x:M,y:4.68,w:6.2,h:1.02,fontFace:'Georgia',fontSize:20,color:C.accent,italic:true,margin:0,fit:'shrink'
  });
  // right visual: a deliberately spare bandwidth/decode tension
  s.addShape(pptx.ShapeType.rect,{x:8.25,y:.68,w:4.38,h:5.82,fill:{color:C.pale},line:{color:C.pale}});
  s.addText('STORAGE', {x:8.62,y:1.08,w:1.2,h:.18,fontFace:'Calibri',fontSize:9,bold:true,color:C.muted,charSpacing:1.2,margin:0});
  s.addText('compact', {x:8.62,y:1.46,w:2.3,h:.48,fontFace:'Georgia',fontSize:28,color:C.ink,margin:0});
  s.addShape(pptx.ShapeType.rect,{x:8.62,y:2.15,w:2.9,h:.38,fill:{color:C.accent},line:{color:C.accent}});
  s.addShape(pptx.ShapeType.rect,{x:8.62,y:2.72,w:1.95,h:.38,fill:{color:C.accent,transparency:45},line:{color:C.accent,transparency:100}});
  s.addShape(pptx.ShapeType.rect,{x:8.62,y:3.29,w:1.15,h:.38,fill:{color:C.accent,transparency:70},line:{color:C.accent,transparency:100}});
  s.addText('PROCESSING', {x:8.62,y:4.02,w:1.5,h:.18,fontFace:'Calibri',fontSize:9,bold:true,color:C.muted,charSpacing:1.2,margin:0});
  s.addText('parallel', {x:8.62,y:4.42,w:2.3,h:.48,fontFace:'Georgia',fontSize:28,color:C.ink,margin:0});
  for(let i=0;i<6;i++) s.addShape(pptx.ShapeType.line,{x:8.65,y:5.15+i*.17,w:3.05,h:0,line:{color:i===2?C.accent:C.ink,width:i===2?3:1.2}});
  s.addText('Group [XX]  |  [Member names]', {x:M,y:6.62,w:4.8,h:.22,fontFace:'Calibri',fontSize:11,color:C.muted,margin:0});
  notes(s,'Opening, about 55 seconds. Start with the conclusion in the title. Parquet and ORC commonly combine columnar layouts with large compressed blocks. This saves storage and I/O, but the decompression step is difficult to parallelize efficiently. Frame the paper as a response to that hardware mismatch, not simply as another compression algorithm.',[
    'Afroozeh, A.; Boncz, P. The FastLanes File Format. PVLDB 18(11), 2025, pp. 4629-4643. DOI: 10.14778/3749646.3749718. Introduction and Section 1.1.'
  ]);
}

// 2: Process strip with concrete example, visually unlike slide 1
{
  const s = baseSlide();
  eyebrow(s, 'The method');
  headline(s, 'FastLanes wins by stacking simple encodings, not by adding a heavier codec.', .60, 11.9, 27);
  s.addText('Concrete example', {x:M,y:1.55,w:1.8,h:.22,fontFace:'Calibri',fontSize:11,bold:true,color:C.accent,margin:0});
  // process sequence
  const stages = [
    {x:.70,w:2.15,label:'RAW VALUES',value:'Alice  Alice\nBob     Bob',cap:'Repeated strings'},
    {x:3.48,w:2.15,label:'DICTIONARY',value:'0   0   1   1',cap:'Small integer codes'},
    {x:6.26,w:2.15,label:'FFOR',value:'0001',cap:'Bit-packed codes'},
    {x:9.04,w:3.58,label:'VECTOR ACCESS',value:'1,024 values',cap:'Decode only what the engine needs'}
  ];
  stages.forEach((d,i)=>{
    s.addText(d.label,{x:d.x,y:2.03,w:d.w,h:.18,fontFace:'Calibri',fontSize:9,bold:true,color:C.muted,charSpacing:1.1,margin:0});
    rule(s,2.33,d.x,d.w,i===2?C.accent:C.rule,i===2?2:1);
    s.addText(d.value,{x:d.x,y:2.62,w:d.w,h:.78,fontFace:'Georgia',fontSize:i===3?24:23,color:C.ink,margin:0,fit:'shrink',breakLine:false});
    s.addText(d.cap,{x:d.x,y:3.57,w:d.w,h:.36,fontFace:'Calibri',fontSize:12,color:C.muted,margin:0,fit:'shrink'});
    if(i<3) s.addText('→',{x:d.x+d.w+.18,y:2.65,w:.35,h:.34,fontFace:'Georgia',fontSize:22,color:C.accent,margin:0,align:'center'});
  });
  rule(s,4.37);
  s.addText('What distinguishes the format', {x:M,y:4.68,w:3.2,h:.25,fontFace:'Georgia',fontSize:19,color:C.ink,margin:0});
  const cols=[
    ['Expression Encoding','Cascades dictionary, frame-of-reference, delta, run-length and string encodings.'],
    ['Cross-column reuse','Equality and one-to-one relationships avoid storing the same information twice.'],
    ['Segmented layout','The engine can access or partially decode vectors instead of entire large blocks.']
  ];
  cols.forEach((d,i)=>{
    const x=M+i*4.12;
    s.addText(d[0],{x,y:5.28,w:3.58,h:.28,fontFace:'Calibri',fontSize:14,bold:true,color:i===1?C.accent:C.ink,margin:0});
    s.addText(d[1],{x,y:5.72,w:3.55,h:.73,fontFace:'Calibri',fontSize:12.3,color:C.muted,margin:0,fit:'shrink'});
  });
  notes(s,'Main idea, about 2 minutes. Use the repeated-name example. Dictionary encoding replaces strings with small codes; frame-of-reference then bit-packs those codes. FastLanes composes simple operators into an expression, detects useful properties and cross-column relationships, and selects expressions using samples from three 1,024-value vectors. Its segmented layout supports vector-level access and partial decompression.',[
    'Afroozeh, A.; Boncz, P. The FastLanes File Format. PVLDB 18(11), 2025. Sections 1.1-3, Tables 1-2 and Figure 2.'
  ]);
}

// 3: Big-number evidence slide with small comparison strip
{
  const s = baseSlide();
  eyebrow(s, 'The evidence');
  headline(s, 'FastLanes decoded Public BI data about 44× faster without giving up compression.', .60, 11.9, 27);
  s.addText('44×', {x:.66,y:1.57,w:4.1,h:1.28,fontFace:'Georgia',fontSize:72,color:C.accent,margin:0});
  s.addText('faster than Parquet + Zstd', {x:.76,y:2.92,w:3.75,h:.4,fontFace:'Calibri',fontSize:17,bold:true,color:C.ink,margin:0});
  s.addText('16.32 ms vs 731.45 ms total decoding time', {x:.76,y:3.42,w:3.85,h:.34,fontFace:'Calibri',fontSize:13,color:C.muted,margin:0});
  s.addText('36 datasets\n2,289 columns', {x:.76,y:4.57,w:2.05,h:.85,fontFace:'Georgia',fontSize:23,color:C.ink,margin:0,breakLine:false});
  s.addText('Public BI benchmark', {x:.76,y:5.56,w:2.2,h:.25,fontFace:'Calibri',fontSize:11,color:C.muted,margin:0});
  // comparison lines on right
  s.addText('TOTAL DECODING TIME  ·  LOWER IS BETTER', {x:5.10,y:1.77,w:4.0,h:.2,fontFace:'Calibri',fontSize:9,bold:true,color:C.muted,charSpacing:1.1,margin:0});
  const data=[['FastLanes',16.32],['BtrBlocks',115.43],['DuckDB',483.45],['Parquet + Snappy',712.55],['Parquet + Zstd',731.45]];
  const max=760, x0=7.0, maxW=4.8;
  data.forEach((d,i)=>{
    const y=2.20+i*.65, bw=Math.max(.14,d[1]/max*maxW);
    s.addText(d[0],{x:5.10,y:y-.02,w:1.62,h:.22,fontFace:'Calibri',fontSize:11,color:C.ink,align:'right',margin:0});
    s.addShape(pptx.ShapeType.rect,{x:x0,y,w:bw,h:.20,fill:{color:i===0?C.accent:C.ink,transparency:i===0?0:72},line:{color:i===0?C.accent:C.ink,transparency:100}});
    s.addText(`${d[1]} ms`,{x:x0+bw+.12,y:y-.02,w:.85,h:.22,fontFace:'Calibri',fontSize:10,bold:i===0,color:i===0?C.accent:C.muted,margin:0});
  });
  rule(s,5.72,5.10,7.52);
  s.addText('Compression also improved', {x:5.10,y:6.02,w:2.6,h:.28,fontFace:'Georgia',fontSize:18,color:C.ink,margin:0});
  s.addText('41% better than Parquet + Snappy  ·  2% better than Parquet + Zstd', {x:7.80,y:6.07,w:4.78,h:.25,fontFace:'Calibri',fontSize:12,bold:true,color:C.accent,align:'right',margin:0,fit:'shrink'});
  s.addText('Interpretation: fewer bytes moved + cheap parallel decoding can reinforce each other.', {x:5.10,y:6.53,w:7.48,h:.32,fontFace:'Calibri',fontSize:13,color:C.muted,italic:true,margin:0,align:'right'});
  notes(s,'Evidence, about 1 minute. Identify the workload, baselines and metric before citing the result. The Public BI evaluation covers 36 datasets and 2,289 columns. FastLanes took 16.32 ms to decode the tested rowgroups, compared with 712.55 ms for Parquet+Snappy and 731.45 ms for Parquet+Zstd. It also compressed Public BI 41 percent better than Snappy and 2 percent better than Zstd. The result supports the claim that fast, regular decoding can remove the usual compression penalty.',[
    'Afroozeh, A.; Boncz, P. The FastLanes File Format. PVLDB 18(11), 2025. Section 4, Tables 3-4.'
  ]);
}

// 4: provocative close / quote-like slide with narrow evidence column
{
  const s = baseSlide();
  eyebrow(s, 'Our assessment');
  headline(s, 'The codec result is convincing; the end-to-end query result is still missing.', .60, 7.95, 25);
  s.addText('“', {x:.62,y:1.59,w:.7,h:.58,fontFace:'Georgia',fontSize:58,color:C.accent,margin:0});
  s.addText('FastLanes is most credible for scan-heavy, bandwidth-sensitive analytics over repeated or correlated data.', {
    x:1.35,y:1.83,w:6.75,h:1.53,fontFace:'Georgia',fontSize:27,color:C.ink,italic:true,margin:0,fit:'shrink'
  });
  rule(s,3.67,.72,7.45);
  s.addText('WHY IT SHOULD WORK', {x:.72,y:4.03,w:2.0,h:.2,fontFace:'Calibri',fontSize:9,bold:true,color:C.accent,charSpacing:1.1,margin:0});
  s.addText('• vectorized decoding\n• reduced memory traffic\n• cross-column redundancy removal', {x:.72,y:4.42,w:3.2,h:1.25,fontFace:'Calibri',fontSize:15,color:C.ink,breakLine:false,margin:0,breakLineOnTextOverflow:false});
  s.addText('WHAT REMAINS OPEN', {x:4.55,y:4.03,w:2.1,h:.2,fontFace:'Calibri',fontSize:9,bold:true,color:C.accent,charSpacing:1.1,margin:0});
  s.addText('• complete joins and aggregations\n• query-engine integration\n• broader nested and ML data', {x:4.55,y:4.42,w:3.2,h:1.25,fontFace:'Calibri',fontSize:15,color:C.ink,margin:0});
  // vertical evidence sidebar
  s.addShape(pptx.ShapeType.rect,{x:9.05,y:.70,w:3.57,h:5.95,fill:{color:C.pale},line:{color:C.pale}});
  s.addText('THE COUNTEREXAMPLE', {x:9.43,y:1.08,w:2.8,h:.18,fontFace:'Calibri',fontSize:9,bold:true,color:C.accent,charSpacing:1.1,margin:0});
  s.addText('15.3%', {x:9.42,y:1.58,w:2.45,h:.74,fontFace:'Georgia',fontSize:46,color:C.ink,margin:0});
  s.addText('Parquet + Zstd compressed TPC-H better.', {x:9.43,y:2.49,w:2.63,h:.66,fontFace:'Calibri',fontSize:15,bold:true,color:C.ink,margin:0,fit:'shrink'});
  rule(s,3.47,9.43,2.65,C.rule,1);
  s.addText('Why?', {x:9.43,y:3.83,w:1.2,h:.28,fontFace:'Georgia',fontSize:20,color:C.ink,margin:0});
  s.addText('TPC-H is normalized, offers fewer cross-column opportunities, and contains patterns the current selector misses.', {
    x:9.43,y:4.33,w:2.63,h:1.25,fontFace:'Calibri',fontSize:13,color:C.muted,margin:0,fit:'shrink'
  });
  s.addText('Best next test', {x:9.43,y:5.67,w:2.2,h:.22,fontFace:'Calibri',fontSize:10,bold:true,color:C.accent,margin:0});
  s.addText('Run full DuckDB queries, not only codecs.', {x:9.43,y:6.00,w:2.65,h:.42,fontFace:'Calibri',fontSize:12,bold:true,color:C.ink,margin:0,fit:'shrink'});
  s.addText('Compression becomes a processing advantage only when the engine can exploit the encoded form.', {x:.72,y:6.48,w:7.5,h:.32,fontFace:'Georgia',fontSize:17,color:C.accent,margin:0,fit:'shrink'});
  notes(s,'Assessment and close, about 1 minute. Separate the authors findings from the group interpretation. The paper establishes strong codec, decompression and access results, but does not evaluate full analytical queries. DuckDB integration is future work. Use the TPC-H counterexample to avoid overselling: Parquet+Zstd compressed 15.3 percent better because normalized synthetic data offered fewer multi-column opportunities and included patterns not covered by the current rules. Close by saying FastLanes is most useful where compressed vectors can become part of execution.',[
    'Afroozeh, A.; Boncz, P. The FastLanes File Format. PVLDB 18(11), 2025. Sections 4, 7 and 8; Table 3.'
  ]);
}

for (const s of pptx._slides) {
  warnIfSlideHasOverlaps(s, pptx);
  warnIfSlideElementsOutOfBounds(s, pptx);
}

pptx.writeFile({ fileName: '/mnt/data/FastLanes_4_Slide_Pitch_Refined.pptx' });
