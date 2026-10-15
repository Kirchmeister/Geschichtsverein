import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const code=readFileSync('public/archive-map.js','utf8');
async function run(config,query='',stored=null,mode={locked:true,point:true}){const elements=new Map(),scripts=[],events={};function element(){return {value:'1900',textContent:'',className:'',classList:{contains(){return false}},hidden:false,replaceChildren(...c){this.children=c},append(){},setAttribute(){},addEventListener(name,fn){(this.events??={})[name]=fn},disabled:true}}const doc={getElementById:id=>{if(!elements.has(id))elements.set(id,element());return elements.get(id)},documentElement:{classList:{add(){}}},createElement:()=>element(),createTextNode:t=>t,head:{appendChild(e){scripts.push(e.src||e.href);e.onload?.()}},addEventListener(){}};let memory=stored;const scope={sessionStorage:{getItem(){return memory},setItem(_,value){memory=value;scope.saved=value}},URL,document:doc,location:{href:'https://archive.test/karte.html'+query,origin:'https://archive.test'},window:{addEventListener(name,fn){events[name]=fn},parent:null},fetch:async url=>({ok:true,json:async()=>url==='/api/map-entries'?{entries:[{reference:'REF-ONE',title:'Erster Beitrag',location:{lat:50,lon:8,label:'Fundort',approximate:true}},{reference:'REF-TWO',title:'Zweiter Beitrag',location:{lat:50,lon:8,label:'',approximate:false}}]}:config}),setInterval,clearInterval,requestAnimationFrame:f=>{f();return 1},cancelAnimationFrame(){},maplibregl:{Map:class{constructor(options){scope.options=options}touchZoomRotate={disableRotation(){}};addSource(id,source){(scope.sources??={})[id]=source}addLayer(layer){(scope.layers??=[]).push(layer)}addControl(){}fitBounds(b){scope.bounds=b}on(){}once(_,f){f()}getZoom(){return 12}getCenter(){return {lat:50, lng:8}}jumpTo(p){scope.restored=p}easeTo(p){scope.startView=p}flyTo(p){scope.linked=p}setMinZoom(z){scope.minimumZoom=z}filterByDate(year){(scope.filtered??=[]).push(year)}},Marker:class{setLngLat(){return this}setDraggable(){}addTo(){return this}on(){}},NavigationControl:class{},AttributionControl:class{}}};scope.window.parent=query.includes('vorschau=1')?{postMessage(){}}:scope.window;vm.runInNewContext(code,scope);if(query.includes('vorschau=1'))events.message({origin:scope.location.origin,source:scope.window.parent,data:{type:'archive-map-preview',config,...mode}});await new Promise(resolve=>setImmediate(resolve));return {scope,elements,scripts,events}}
let r=await run({enabled:false});assert.equal(r.scripts.length,0);assert.match(r.elements.get('title').textContent,/ausgeschaltet/);
r=await run({enabled:true,provider:'osm',place:'Testort',lat:50,lon:8,radius:5,title:'Eigene Karte'});assert.equal(r.elements.get('time-controls').hidden,true);assert.equal(r.elements.get('map-year').hidden,true);assert.equal(r.elements.get('title').textContent,'Eigene Karte');assert.ok(r.scope.options.style.sources.osm);assert.ok(!r.scripts.some(s=>s.includes('dates')));assert.ok(r.scope.bounds[0][0]<8);assert.equal(r.scope.sources['archive-entries'].cluster,true);assert.equal(r.scope.sources['archive-entries'].data.features.length,2);assert.equal(r.scope.sources['archive-entries'].data.features[0].properties.reference,'REF-ONE');assert.ok(r.scope.layers.some(l=>l.id==='archive-points'));assert.ok(r.scope.options.style.glyphs);
r=await run({enabled:true,provider:'ohm',place:'Anderer Ort',lat:51,lon:9,radius:4,title:''});assert.equal(r.elements.get('time-controls').hidden,false);assert.equal(r.elements.get('title').textContent,'Historische Karte');assert.ok(r.scripts.some(s=>s.includes('dates')));assert.equal(typeof r.scope.options.style,'string');
console.log('PASS: disabled direct map loads no external libraries; OSM hides time controls; OHM uses configured location/title and date plugin.');

r=await run({enabled:true,provider:'both',place:'Testort',lat:50,lon:8,radius:5,title:'',osmTitle:'Heute',ohmTitle:'Damals'},'?anbieter=ohm');assert.equal(r.elements.get('title').textContent,'Damals');assert.ok(r.scripts.some(s=>s.includes('dates')));
r=await run({enabled:true,provider:'both',place:'Testort',lat:50,lon:8,radius:5,title:'',osmTitle:'Heute',ohmTitle:'Damals'},'?anbieter=osm');assert.equal(r.elements.get('title').textContent,'Heute');assert.ok(!r.scripts.some(s=>s.includes('dates')));
r=await run({enabled:true,provider:'osm',place:'Testort',lat:50,lon:8,radius:5,title:''},'?anbieter=ohm');assert.equal(r.scripts.length,0);

const remembered=JSON.stringify({lat:50,lon:8,zoom:15,year:1750,signature:JSON.stringify(['Testort',50,8,5,'area'])});
r=await run({enabled:true,provider:'both',place:'Testort',lat:50,lon:8,radius:5,title:''},'?anbieter=ohm',remembered);assert.equal(r.scope.restored.zoom,15);assert.equal(r.elements.get('year').value,1750);assert.equal(JSON.parse(r.scope.saved).year,1750);
r=await run({enabled:true,provider:'both',place:'Neuer Ort',lat:50,lon:8,radius:5,title:''},'?anbieter=ohm',remembered);assert.equal(r.scope.restored,undefined);

r=await run({enabled:true,provider:'osm',place:'Testort',lat:50,lon:8,radius:5,title:'',startView:'detail'});assert.equal(r.scope.startView.zoom,16);assert.equal(r.scope.minimumZoom,11);assert.deepEqual([...r.scope.startView.center],[8,50]);
r=await run({enabled:true,provider:'ohm',place:'Testort',lat:50,lon:8,radius:5,title:'',startView:'locality'});assert.equal(r.scope.startView.zoom,14);assert.equal(r.scope.minimumZoom,11);
r=await run({enabled:true,provider:'osm',place:'Testort',lat:50,lon:8,radius:5,title:'',startView:'detail'},'',remembered);assert.equal(r.scope.restored,undefined);
r=await run({enabled:true,provider:'osm',place:'Standort',lat:50,lon:8,radius:2,title:'',startView:'detail'},'?vorschau=1');assert.equal(r.scope.startView.zoom,16);
r=await run({enabled:true,provider:'osm',place:'Standort',lat:50,lon:8,radius:2,title:'',startView:'locality'},'?vorschau=1');assert.equal(r.scope.startView.zoom,14);
r=await run({enabled:true,provider:'osm',place:'Standort',lat:50,lon:8,radius:2,title:'',startView:'area'},'?vorschau=1');assert.equal(r.scope.startView,undefined);
r=await run({enabled:true,provider:'osm',place:'Testort',lat:50,lon:8,radius:5,title:'',startView:'detail'},'?lat=50&lon=8&zoom=14',remembered);assert.equal(r.scope.linked.zoom,14);assert.deepEqual([...r.scope.linked.center],[8,50]);
r=await run({enabled:true,provider:'osm',place:'Testort',lat:50,lon:8,radius:5,title:'',startView:'locality'},'?lat=50&lon=8');assert.equal(r.scope.linked.zoom,16);

const historicalPoint={enabled:true,provider:'ohm',place:'Standort',lat:50,lon:8,radius:2,title:'',startView:'detail'};
r=await run(historicalPoint,'?vorschau=1');assert.equal(r.scope.options.style,'https://www.openhistoricalmap.org/map-styles/main/main.json');assert.equal(r.scope.startView.zoom,16);assert.equal(r.elements.get('time-controls').hidden,true);assert.equal(r.scope.sources,undefined);assert.equal(r.elements.get('status').textContent,'Standort auf der historischen Karte');
r=await run(historicalPoint,'?vorschau=1',null,{locked:false,point:true});assert.ok(r.scope.options.style.sources.osm);
r=await run(historicalPoint,'?vorschau=1',null,{locked:true,point:false});assert.ok(r.scope.options.style.sources.osm);assert.equal(r.elements.get('status').textContent,'Standort auf der heutigen Karte');
r=await run({...historicalPoint,provider:'osm'},'?vorschau=1');assert.ok(r.scope.options.style.sources.osm);assert.equal(r.elements.get('status').textContent,'Standort auf der heutigen Karte');
console.log('PASS: locked historical contribution point uses OHM material; coordinate editor and settings preview retain OSM.');

// The contribution date takes precedence over a remembered map year.
r=await run({...historicalPoint,year:1848},'?vorschau=1');
assert.deepEqual([...r.scope.filtered],['1848']);
r.events.message({origin:r.scope.location.origin,source:r.scope.window.parent,data:{type:'archive-map-preview',config:{...historicalPoint,year:1914},locked:true,point:true}});assert.equal(r.scope.filtered.at(-1),'1914');
assert.match(r.elements.get('status').textContent,/Jahr 1914/);
const dated=await run({...historicalPoint,place:'Testort',radius:5,startView:'area'},'?anbieter=ohm&jahr=1848',remembered);
assert.deepEqual([...dated.scope.filtered],['1848']);assert.equal(dated.elements.get('slider').value,1848);
assert.match(dated.elements.get('provider-link').href,/date=1848$/);
dated.elements.get('slider').value='1914';dated.elements.get('slider').events.input();assert.equal(dated.scope.filtered.at(-1),'1914');
for(const year of ['700','-500','0','9999']){
 const dated=await run(historicalPoint,'?jahr='+year);assert.equal(dated.scope.filtered.at(-1),year);
}
for(const year of ['', 'no', '1848.5','10000']){
 const dated=await run({...historicalPoint,place:'Testort',radius:5,startView:'area'},'?jahr='+year,remembered);assert.equal(dated.scope.filtered.at(-1),'1750');
}
r=await run({...historicalPoint,provider:'osm',year:1848},'?vorschau=1');assert.equal(r.scope.filtered,undefined);
r=await run({...historicalPoint,year:1848},'?vorschau=1',null,{locked:false,point:true});assert.equal(r.scope.filtered,undefined);
console.log('PASS: contribution start year filters mini/full OHM maps, overrides remembered years, remains manually adjustable; missing/invalid dates and OSM keep existing behaviour.');
