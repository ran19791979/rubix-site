(function(global,factory){typeof exports==="object"&&typeof module!=="undefined"?module.exports=factory():typeof define==="function"&&define.amd?define(factory):(global=global||self,global.morphdom=factory())})(this,function(){"use strict";var DOCUMENT_FRAGMENT_NODE=11;function morphAttrs(fromNode,toNode){var toNodeAttrs=toNode.attributes;var attr;var attrName;var attrNamespaceURI;var attrValue;var fromValue;if(toNode.nodeType===DOCUMENT_FRAGMENT_NODE||fromNode.nodeType===DOCUMENT_FRAGMENT_NODE){return}for(var i=toNodeAttrs.length-1;i>=0;i--){attr=toNodeAttrs[i];attrName=attr.name;attrNamespaceURI=attr.namespaceURI;attrValue=attr.value;if(attrNamespaceURI){attrName=attr.localName||attrName;fromValue=fromNode.getAttributeNS(attrNamespaceURI,attrName);if(fromValue!==attrValue){if(attr.prefix==="xmlns"){attrName=attr.name}fromNode.setAttributeNS(attrNamespaceURI,attrName,attrValue)}}else{fromValue=fromNode.getAttribute(attrName);if(fromValue!==attrValue){fromNode.setAttribute(attrName,attrValue)}}}var fromNodeAttrs=fromNode.attributes;for(var d=fromNodeAttrs.length-1;d>=0;d--){attr=fromNodeAttrs[d];attrName=attr.name;attrNamespaceURI=attr.namespaceURI;if(attrNamespaceURI){attrName=attr.localName||attrName;if(!toNode.hasAttributeNS(attrNamespaceURI,attrName)){fromNode.removeAttributeNS(attrNamespaceURI,attrName)}}else{if(!toNode.hasAttribute(attrName)){fromNode.removeAttribute(attrName)}}}}var range;var NS_XHTML="http://www.w3.org/1999/xhtml";var doc=typeof document==="undefined"?undefined:document;var HAS_TEMPLATE_SUPPORT=!!doc&&"content"in doc.createElement("template");var HAS_RANGE_SUPPORT=!!doc&&doc.createRange&&"createContextualFragment"in doc.createRange();function createFragmentFromTemplate(str){var template=doc.createElement("template");template.innerHTML=str;return template.content.childNodes[0]}function createFragmentFromRange(str){if(!range){range=doc.createRange();range.selectNode(doc.body)}var fragment=range.createContextualFragment(str);return fragment.childNodes[0]}function createFragmentFromWrap(str){var fragment=doc.createElement("body");fragment.innerHTML=str;return fragment.childNodes[0]}function toElement(str){str=str.trim();if(HAS_TEMPLATE_SUPPORT){return createFragmentFromTemplate(str)}else if(HAS_RANGE_SUPPORT){return createFragmentFromRange(str)}return createFragmentFromWrap(str)}function compareNodeNames(fromEl,toEl){var fromNodeName=fromEl.nodeName;var toNodeName=toEl.nodeName;var fromCodeStart,toCodeStart;if(fromNodeName===toNodeName){return true}fromCodeStart=fromNodeName.charCodeAt(0);toCodeStart=toNodeName.charCodeAt(0);if(fromCodeStart<=90&&toCodeStart>=97){return fromNodeName===toNodeName.toUpperCase()}else if(toCodeStart<=90&&fromCodeStart>=97){return toNodeName===fromNodeName.toUpperCase()}else{return false}}function createElementNS(name,namespaceURI){return!namespaceURI||namespaceURI===NS_XHTML?doc.createElement(name):doc.createElementNS(namespaceURI,name)}function moveChildren(fromEl,toEl){var curChild=fromEl.firstChild;while(curChild){var nextChild=curChild.nextSibling;toEl.appendChild(curChild);curChild=nextChild}return toEl}function syncBooleanAttrProp(fromEl,toEl,name){if(fromEl[name]!==toEl[name]){fromEl[name]=toEl[name];if(fromEl[name]){fromEl.setAttribute(name,"")}else{fromEl.removeAttribute(name)}}}var specialElHandlers={OPTION:function(fromEl,toEl){var parentNode=fromEl.parentNode;if(parentNode){var parentName=parentNode.nodeName.toUpperCase();if(parentName==="OPTGROUP"){parentNode=parentNode.parentNode;parentName=parentNode&&parentNode.nodeName.toUpperCase()}if(parentName==="SELECT"&&!parentNode.hasAttribute("multiple")){if(fromEl.hasAttribute("selected")&&!toEl.selected){fromEl.setAttribute("selected","selected");fromEl.removeAttribute("selected")}parentNode.selectedIndex=-1}}syncBooleanAttrProp(fromEl,toEl,"selected")},INPUT:function(fromEl,toEl){syncBooleanAttrProp(fromEl,toEl,"checked");syncBooleanAttrProp(fromEl,toEl,"disabled");if(fromEl.value!==toEl.value){fromEl.value=toEl.value}if(!toEl.hasAttribute("value")){fromEl.removeAttribute("value")}},TEXTAREA:function(fromEl,toEl){var newValue=toEl.value;if(fromEl.value!==newValue){fromEl.value=newValue}var firstChild=fromEl.firstChild;if(firstChild){var oldValue=firstChild.nodeValue;if(oldValue==newValue||!newValue&&oldValue==fromEl.placeholder){return}firstChild.nodeValue=newValue}},SELECT:function(fromEl,toEl){if(!toEl.hasAttribute("multiple")){var selectedIndex=-1;var i=0;var curChild=fromEl.firstChild;var optgroup;var nodeName;while(curChild){nodeName=curChild.nodeName&&curChild.nodeName.toUpperCase();if(nodeName==="OPTGROUP"){optgroup=curChild;curChild=optgroup.firstChild}else{if(nodeName==="OPTION"){if(curChild.hasAttribute("selected")){selectedIndex=i;break}i++}curChild=curChild.nextSibling;if(!curChild&&optgroup){curChild=optgroup.nextSibling;optgroup=null}}}fromEl.selectedIndex=selectedIndex}}};var ELEMENT_NODE=1;var DOCUMENT_FRAGMENT_NODE$1=11;var TEXT_NODE=3;var COMMENT_NODE=8;function noop(){}function defaultGetNodeKey(node){if(node){return node.getAttribute&&node.getAttribute("id")||node.id}}function morphdomFactory(morphAttrs){return function morphdom(fromNode,toNode,options){if(!options){options={}}if(typeof toNode==="string"){if(fromNode.nodeName==="#document"||fromNode.nodeName==="HTML"||fromNode.nodeName==="BODY"){var toNodeHtml=toNode;toNode=doc.createElement("html");toNode.innerHTML=toNodeHtml}else{toNode=toElement(toNode)}}else if(toNode.nodeType===DOCUMENT_FRAGMENT_NODE$1){toNode=toNode.firstElementChild}var getNodeKey=options.getNodeKey||defaultGetNodeKey;var onBeforeNodeAdded=options.onBeforeNodeAdded||noop;var onNodeAdded=options.onNodeAdded||noop;var onBeforeElUpdated=options.onBeforeElUpdated||noop;var onElUpdated=options.onElUpdated||noop;var onBeforeNodeDiscarded=options.onBeforeNodeDiscarded||noop;var onNodeDiscarded=options.onNodeDiscarded||noop;var onBeforeElChildrenUpdated=options.onBeforeElChildrenUpdated||noop;var skipFromChildren=options.skipFromChildren||noop;var addChild=options.addChild||function(parent,child){return parent.appendChild(child)};var childrenOnly=options.childrenOnly===true;var fromNodesLookup=Object.create(null);var keyedRemovalList=[];function addKeyedRemoval(key){keyedRemovalList.push(key)}function walkDiscardedChildNodes(node,skipKeyedNodes){if(node.nodeType===ELEMENT_NODE){var curChild=node.firstChild;while(curChild){var key=undefined;if(skipKeyedNodes&&(key=getNodeKey(curChild))){addKeyedRemoval(key)}else{onNodeDiscarded(curChild);if(curChild.firstChild){walkDiscardedChildNodes(curChild,skipKeyedNodes)}}curChild=curChild.nextSibling}}}function removeNode(node,parentNode,skipKeyedNodes){if(onBeforeNodeDiscarded(node)===false){return}if(parentNode){parentNode.removeChild(node)}onNodeDiscarded(node);walkDiscardedChildNodes(node,skipKeyedNodes)}function indexTree(node){if(node.nodeType===ELEMENT_NODE||node.nodeType===DOCUMENT_FRAGMENT_NODE$1){var curChild=node.firstChild;while(curChild){var key=getNodeKey(curChild);if(key){fromNodesLookup[key]=curChild}indexTree(curChild);curChild=curChild.nextSibling}}}indexTree(fromNode);function handleNodeAdded(el){onNodeAdded(el);var curChild=el.firstChild;while(curChild){var nextSibling=curChild.nextSibling;var key=getNodeKey(curChild);if(key){var unmatchedFromEl=fromNodesLookup[key];if(unmatchedFromEl&&compareNodeNames(curChild,unmatchedFromEl)){curChild.parentNode.replaceChild(unmatchedFromEl,curChild);morphEl(unmatchedFromEl,curChild)}else{handleNodeAdded(curChild)}}else{handleNodeAdded(curChild)}curChild=nextSibling}}function cleanupFromEl(fromEl,curFromNodeChild,curFromNodeKey){while(curFromNodeChild){var fromNextSibling=curFromNodeChild.nextSibling;if(curFromNodeKey=getNodeKey(curFromNodeChild)){addKeyedRemoval(curFromNodeKey)}else{removeNode(curFromNodeChild,fromEl,true)}curFromNodeChild=fromNextSibling}}function morphEl(fromEl,toEl,childrenOnly){var toElKey=getNodeKey(toEl);if(toElKey){delete fromNodesLookup[toElKey]}if(!childrenOnly){var beforeUpdateResult=onBeforeElUpdated(fromEl,toEl);if(beforeUpdateResult===false){return}else if(beforeUpdateResult instanceof HTMLElement){fromEl=beforeUpdateResult;indexTree(fromEl)}morphAttrs(fromEl,toEl);onElUpdated(fromEl);if(onBeforeElChildrenUpdated(fromEl,toEl)===false){return}}if(fromEl.nodeName!=="TEXTAREA"){morphChildren(fromEl,toEl)}else{specialElHandlers.TEXTAREA(fromEl,toEl)}}function morphChildren(fromEl,toEl){var skipFrom=skipFromChildren(fromEl,toEl);var curToNodeChild=toEl.firstChild;var curFromNodeChild=fromEl.firstChild;var curToNodeKey;var curFromNodeKey;var fromNextSibling;var toNextSibling;var matchingFromEl;outer:while(curToNodeChild){toNextSibling=curToNodeChild.nextSibling;curToNodeKey=getNodeKey(curToNodeChild);while(!skipFrom&&curFromNodeChild){fromNextSibling=curFromNodeChild.nextSibling;if(curToNodeChild.isSameNode&&curToNodeChild.isSameNode(curFromNodeChild)){curToNodeChild=toNextSibling;curFromNodeChild=fromNextSibling;continue outer}curFromNodeKey=getNodeKey(curFromNodeChild);var curFromNodeType=curFromNodeChild.nodeType;var isCompatible=undefined;if(curFromNodeType===curToNodeChild.nodeType){if(curFromNodeType===ELEMENT_NODE){if(curToNodeKey){if(curToNodeKey!==curFromNodeKey){if(matchingFromEl=fromNodesLookup[curToNodeKey]){if(fromNextSibling===matchingFromEl){isCompatible=false}else{fromEl.insertBefore(matchingFromEl,curFromNodeChild);if(curFromNodeKey){addKeyedRemoval(curFromNodeKey)}else{removeNode(curFromNodeChild,fromEl,true)}curFromNodeChild=matchingFromEl;curFromNodeKey=getNodeKey(curFromNodeChild)}}else{isCompatible=false}}}else if(curFromNodeKey){isCompatible=false}isCompatible=isCompatible!==false&&compareNodeNames(curFromNodeChild,curToNodeChild);if(isCompatible){morphEl(curFromNodeChild,curToNodeChild)}}else if(curFromNodeType===TEXT_NODE||curFromNodeType==COMMENT_NODE){isCompatible=true;if(curFromNodeChild.nodeValue!==curToNodeChild.nodeValue){curFromNodeChild.nodeValue=curToNodeChild.nodeValue}}}if(isCompatible){curToNodeChild=toNextSibling;curFromNodeChild=fromNextSibling;continue outer}if(curFromNodeKey){addKeyedRemoval(curFromNodeKey)}else{removeNode(curFromNodeChild,fromEl,true)}curFromNodeChild=fromNextSibling}if(curToNodeKey&&(matchingFromEl=fromNodesLookup[curToNodeKey])&&compareNodeNames(matchingFromEl,curToNodeChild)){if(!skipFrom){addChild(fromEl,matchingFromEl)}morphEl(matchingFromEl,curToNodeChild)}else{var onBeforeNodeAddedResult=onBeforeNodeAdded(curToNodeChild);if(onBeforeNodeAddedResult!==false){if(onBeforeNodeAddedResult){curToNodeChild=onBeforeNodeAddedResult}if(curToNodeChild.actualize){curToNodeChild=curToNodeChild.actualize(fromEl.ownerDocument||doc)}addChild(fromEl,curToNodeChild);handleNodeAdded(curToNodeChild)}}curToNodeChild=toNextSibling;curFromNodeChild=fromNextSibling}cleanupFromEl(fromEl,curFromNodeChild,curFromNodeKey);var specialElHandler=specialElHandlers[fromEl.nodeName];if(specialElHandler){specialElHandler(fromEl,toEl)}}var morphedNode=fromNode;var morphedNodeType=morphedNode.nodeType;var toNodeType=toNode.nodeType;if(!childrenOnly){if(morphedNodeType===ELEMENT_NODE){if(toNodeType===ELEMENT_NODE){if(!compareNodeNames(fromNode,toNode)){onNodeDiscarded(fromNode);morphedNode=moveChildren(fromNode,createElementNS(toNode.nodeName,toNode.namespaceURI))}}else{morphedNode=toNode}}else if(morphedNodeType===TEXT_NODE||morphedNodeType===COMMENT_NODE){if(toNodeType===morphedNodeType){if(morphedNode.nodeValue!==toNode.nodeValue){morphedNode.nodeValue=toNode.nodeValue}return morphedNode}else{morphedNode=toNode}}}if(morphedNode===toNode){onNodeDiscarded(fromNode)}else{if(toNode.isSameNode&&toNode.isSameNode(morphedNode)){return}morphEl(morphedNode,toNode,childrenOnly);if(keyedRemovalList){for(var i=0,len=keyedRemovalList.length;i<len;i++){var elToRemove=fromNodesLookup[keyedRemovalList[i]];if(elToRemove){removeNode(elToRemove,elToRemove.parentNode,false)}}}}if(!childrenOnly&&morphedNode!==fromNode&&fromNode.parentNode){if(morphedNode.actualize){morphedNode=morphedNode.actualize(fromNode.ownerDocument||doc)}fromNode.parentNode.replaceChild(morphedNode,fromNode)}return morphedNode}}var morphdom=morphdomFactory(morphAttrs);return morphdom});

class DCLogic { constructor(p) { this.props = p; this.state = {}; } setState(u) { const n = typeof u === 'function' ? u(this.state) : u; Object.assign(this.state, n); window.__dcRender && window.__dcRender(); } }

class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { prAll: false, mode: 'stories', wk: 1, v: -1, i: 0, open: 0, story: 0, menu: false, prog: 0, hours: 10, team: 3, wage: 100, eff: 30, desc: '', recording: false, micMsg: '', phase: 'empty', res: null };
  }
  componentDidMount() {
    document.addEventListener('scroll', (e) => {
      const r = e.target;
      if (!r || !r.classList || !r.classList.contains('wk-rail') || !r.children.length) return;
      const step = r.children[0].getBoundingClientRect().width + 14;
      const n = Math.min(r.children.length, Math.max(1, Math.round(Math.abs(r.scrollLeft) / step) + 1));
      if (n !== this.state.wk) this.setState({ wk: n });
    }, true);
    this.tw = { wi: 0, n: 0, del: false };
    const tick = this.tick = () => {
      const words = this.getWords();
      if (!words.length) { this.twTimer = setTimeout(tick, 500); return; }
      if (this.state.paused) { this.setState({ typed: words[this.tw.wi % words.length] }); return; }
      const t = this.tw;
      const w = words[t.wi % words.length];
      let delay;
      if (this.props.animations === false) {
        t.wi = (t.wi + 1) % words.length; t.n = 0; t.del = false;
        this.setState({ i: t.wi, typed: words[t.wi] });
        this.twTimer = setTimeout(tick, 2400);
        return;
      }
      if (!t.del) {
        t.n = Math.min(w.length, t.n + 1);
        delay = t.n >= w.length ? 1700 : 75;
        if (t.n >= w.length) t.del = true;
      } else {
        t.n = Math.max(0, t.n - 1);
        delay = t.n === 0 ? 350 : 38;
        if (t.n === 0) { t.del = false; t.wi = (t.wi + 1) % words.length; }
      }
      const cur = words[(t.n === 0 && !t.del) ? ((t.wi - 1 + words.length) % words.length) : t.wi % words.length];
      this.setState({ typed: cur.slice(0, t.n) });
      this.twTimer = setTimeout(tick, delay);
    };
    try { if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) this.setState({ paused: true }); } catch (e) {}
    this.twTimer = setTimeout(tick, 400);
    this.onScroll = () => {
      if (this.raf) return;
      this.raf = requestAnimationFrame(() => {
        this.raf = null;
        const doc = document.documentElement;
        const max = Math.max(1, doc.scrollHeight - window.innerHeight);
        this.setState({ prog: Math.min(100, Math.max(0, (window.scrollY / max) * 100)) });
      });
    };
    window.addEventListener('scroll', this.onScroll, { passive: true });
    this.onMove = (e) => {
      const el = e.target && e.target.closest ? e.target.closest('.card') : null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    };
    document.addEventListener('pointermove', this.onMove, { passive: true });
    this.onVidTap = (e) => { const b = e.target && e.target.closest ? e.target.closest('button.vprev') : null; if (b) this.openVideo(Array.prototype.indexOf.call(document.querySelectorAll('button.vprev'), b), b); };
    document.addEventListener('click', this.onVidTap, true);
  }
  vidsData() {
    return [{"src": "../media/desk.mp4?v=545a95c9#t=0.5", "poster": "../media/desk-start.jpg?v=3af9e69a", "title": "מערכת לניהול תוכן ולקוחות"}, {"src": "../media/agent.mp4?v=688ddf9c#t=0.5", "poster": "../media/agent-start.jpg?v=5b3927f8", "title": "סוכן AI שבודק ומתקן תוכן"}, {"src": "../media/automation.mp4?v=1a67bd5e#t=0.5", "poster": "../media/automation-start.jpg?v=d308e178", "title": "אוטומציה שממיינת פניות לפי דחיפות"}, {"src": "../media/website.mp4?v=5c1b9535#t=0.5", "poster": "../media/website-start.jpg?v=babd1c47", "title": "אתר תדמית ומידע, עם פאנל ניהול"}];
  }
  buildViewer() {
    if (this.vv) return this.vv;
    const root = document.querySelector('[style*="--accent"]');
    const cs = root ? getComputedStyle(root) : null;
    const vv = document.createElement('div');
    vv.className = 'vv'; vv.hidden = true;
    vv.setAttribute('role', 'dialog'); vv.setAttribute('aria-modal', 'true');
    if (cs) { vv.style.setProperty('--accent', cs.getPropertyValue('--accent').trim() || '#C8F45A'); vv.style.setProperty('--bg', cs.getPropertyValue('--bg').trim() || '#07080C'); }
    vv.innerHTML = '<button type="button" class="vv-x" aria-label="סגירה"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"></path></svg></button>'
      + '<div class="vv-box"><div class="vv-title"></div><div class="vv-frame"><video class="vv-video" playsinline webkit-playsinline controls preload="none"></video><div class="vv-spin"></div><button type="button" class="vv-sound" hidden>🔊 הפעלת סאונד</button></div>'
      + '<div class="vv-ctas"><a class="cta vv-wa" target="_blank" rel="noopener">דברו איתי בוואטסאפ</a><a class="ghost-strong vv-cta" href="#contact">או השאירו פרטים</a></div></div>';
    document.body.appendChild(vv);
    const v = vv.querySelector('video');
    const spin = vv.querySelector('.vv-spin');
    const snd = vv.querySelector('.vv-sound');
    const fab = document.querySelector('a.fab'); const waA = vv.querySelector('.vv-wa');
    if (fab && fab.href) waA.href = fab.href; else waA.href = '#contact';
    waA.addEventListener('click', () => this.closeVideo());
    v.addEventListener('loadedmetadata', () => { if (v.currentTime < 0.5) { try { v.currentTime = 0.5; } catch (e) {} } });
    v.addEventListener('playing', () => { spin.hidden = true; });
    v.addEventListener('waiting', () => { spin.hidden = false; });
    v.addEventListener('pause', () => { spin.hidden = true; });
    v.addEventListener('error', () => {
      if (vv.hidden || !v.getAttribute('src')) return;
      spin.hidden = true; snd.textContent = 'לא נטען, נסו שוב'; snd.hidden = false;
    });
    snd.addEventListener('click', () => {
      if (v.error) { v.src = this.vidsData()[this.vvIdx].src; }
      v.muted = false; v.volume = 1; snd.hidden = true;
      vv.querySelector('.vv-x').focus({ preventScroll: true });
      const p = v.play(); if (p && p.catch) p.catch(() => {});
    });
    vv.querySelector('.vv-x').addEventListener('click', () => this.closeVideo());
    vv.querySelector('.vv-cta').addEventListener('click', () => this.closeVideo());
    vv.addEventListener('click', (e) => { if (e.target === vv) this.closeVideo(); });
    this.onVvKey = (e) => { if (e.key === 'Escape' && this.vv && !this.vv.hidden) this.closeVideo(); };
    document.addEventListener('keydown', this.onVvKey);
    this.vv = vv; this.vvVideo = v; this.vvSpin = spin; this.vvSound = snd;
    return vv;
  }
  openVideo(i, opener) {
    if (this.vv && !this.vv.hidden) return;
    const d = this.vidsData()[i];
    if (!d) return;
    const vv = this.buildViewer();
    const v = this.vvVideo;
    const tok = this.vvTok = (this.vvTok || 0) + 1;
    this.vvIdx = i;
    this.vvOpener = opener && opener.focus ? opener : document.querySelectorAll('button.vprev')[i];
    vv.querySelector('.vv-title').textContent = d.title;
    vv.setAttribute('aria-label', d.title);
    this.vvSound.hidden = true; this.vvSound.textContent = '🔊 הפעלת סאונד'; this.vvSpin.hidden = false;
    v.poster = d.poster;
    v.src = d.src;
    v.muted = false; v.volume = 1;
    vv.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    this.vvInert = Array.prototype.filter.call(document.body.children, (n) => n !== vv);
    this.vvInert.forEach((n) => { n.inert = true; });
    // play() runs inside the tap itself: the artifact frame disables autoplay, so this is the only way it starts with sound
    const p = v.play();
    if (p && p.catch) p.catch((err) => {
      if (tok !== this.vvTok || vv.hidden || v.error || (err && err.name === 'AbortError')) return;
      v.muted = true;
      this.vvSound.hidden = false;
      const p2 = v.play();
      if (p2 && p2.catch) p2.catch(() => { if (tok !== this.vvTok) return; this.vvSpin.hidden = true; this.vvSound.textContent = '▶ הפעלה'; });
    });
    setTimeout(() => { const x = vv.querySelector('.vv-x'); if (x && !vv.hidden) x.focus({ preventScroll: true }); }, 50);
  }
  closeVideo() {
    if (!this.vv || this.vv.hidden) return;
    this.vvTok = (this.vvTok || 0) + 1;
    const v = this.vvVideo;
    try { v.pause(); } catch (e) {}
    v.removeAttribute('src'); try { v.load(); } catch (e) {}
    this.vv.hidden = true;
    document.documentElement.style.overflow = '';
    (this.vvInert || []).forEach((n) => { n.inert = false; });
    this.vvInert = null;
    const back = this.vvOpener && this.vvOpener.isConnected ? this.vvOpener : document.querySelectorAll('button.vprev')[this.vvIdx];
    if (back && back.focus) back.focus({ preventScroll: true });
  }
  componentWillUnmount() {
    clearInterval(this.timer);
    clearTimeout(this.twTimer);
    if (this.onScroll) window.removeEventListener('scroll', this.onScroll);
    if (this.onMove) document.removeEventListener('pointermove', this.onMove);
    clearTimeout(this.anTimer);
    if (this.onVidTap) document.removeEventListener('click', this.onVidTap, true);
    if (this.onVvKey) document.removeEventListener('keydown', this.onVvKey);
    if (this.vv && this.vv.parentNode) this.vv.parentNode.removeChild(this.vv);
    this.wantRec = false;
    if (this.rec) { try { this.rec.stop(); } catch (e) {} }
  }
  stopMic() {
    this.wantRec = false;
    if (this.rec) { try { this.rec.stop(); } catch (e) {} }
    this.setState({ recording: false });
  }
  toggleMic() {
    if (this.state.recording) { this.stopMic(); return; }
    const blockedMsg = 'בתצוגה המקדימה הדפדפן חוסם את המיקרופון. באתר עצמו ההקלטה תעבוד. בינתיים אפשר לכתוב, או ללחוץ על תיבת הטקסט ולהשתמש במיקרופון של המקלדת בטלפון.';
    const pol = document.permissionsPolicy || document.featurePolicy;
    if (pol && typeof pol.allowsFeature === 'function' && !pol.allowsFeature('microphone')) {
      this.setState({ micMsg: blockedMsg });
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      this.setState({ micMsg: 'הדפדפן הזה לא תומך בהקלטה (עובד בכרום, אדג׳ וספארי). אפשר לכתוב, או להשתמש במיקרופון של המקלדת בטלפון.' });
      return;
    }
    const base = (this.state.desc || '').trim();
    this.finalText = base ? base + ' ' : '';
    this.wantRec = true;
    const startOnce = () => {
      let rec;
      try {
        rec = new SR();
      } catch (err) {
        this.wantRec = false;
        this.setState({ recording: false, micMsg: 'לא הצלחתי להפעיל הקלטה. אפשר לכתוב במקום.' });
        return;
      }
      rec.lang = 'he-IL';
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.onresult = (e) => {
        let interim = '';
        for (let k = e.resultIndex; k < e.results.length; k++) {
          const t = e.results[k][0].transcript;
          if (e.results[k].isFinal) this.finalText += t.trim() + ' ';
          else interim += t;
        }
        this.setState({ desc: (this.finalText + interim).trim() });
      };
      rec.onerror = (ev) => {
        const code = ev && ev.error;
        if (code === 'no-speech' || code === 'aborted') return;
        this.wantRec = false;
        let msg = 'ההקלטה נעצרה. אפשר לנסות שוב או לכתוב.';
        if (code === 'not-allowed' || code === 'service-not-allowed') msg = blockedMsg;
        else if (code === 'audio-capture') msg = 'לא נמצא מיקרופון במכשיר. אפשר לכתוב במקום.';
        else if (code === 'network') msg = 'ההקלטה צריכה חיבור לאינטרנט. נסו שוב בעוד רגע.';
        this.setState({ recording: false, micMsg: msg });
      };
      rec.onend = () => {
        if (this.wantRec) { setTimeout(() => { if (this.wantRec) startOnce(); }, 150); }
        else this.setState({ recording: false });
      };
      try {
        rec.start();
        this.rec = rec;
        this.setState({ recording: true, micMsg: '' });
      } catch (err) {
        this.wantRec = false;
        this.setState({ recording: false, micMsg: 'לא הצלחתי להפעיל הקלטה. אפשר לכתוב במקום.' });
      }
    };
    startOnce();
  }
  getWords() {
    return String(this.props.heroWords ?? 'מערכות ניהול חכמות, אתרים שמביאים פניות, אוטומציות שחוסכות שעות, סוכני AI שעונים ללקוחות').split(',').map((w) => w.trim()).filter((w) => w.length > 0);
  }
  waNumber() {
    const digits = String(this.props.phone ?? '0547714300').replace(/[^0-9]/g, '');
    return digits.charAt(0) === '0' ? '972' + digits.slice(1) : digits;
  }
  analyze() {
    const text = (this.state.desc || '').trim();
    if (text.length < 8) {
      this.setState({ micMsg: 'כתבו עוד קצת, אפילו משפט אחד מלא.' });
      return;
    }
    if (this.state.recording) this.stopMic();
    this.setState({ phase: 'loading', micMsg: '', recording: false });
    clearTimeout(this.anTimer);
    this.anTimer = setTimeout(() => this.setState({ phase: 'result', res: this.buildResult(text) }), 1500);
  }
  buildResult(text) {
    const cats = [
      { key: 'agent', label: 'סוכן AI למענה', kw: ['וואטסאפ', 'ווטסאפ', 'הודעות', 'שאלות', 'לענות', 'עונה', 'עונים', 'מענה', 'פניות', 'תור', 'לקבוע', 'שיחות', 'טלפונים'],
        understood: 'אתם מקבלים הרבה פניות ושאלות שחוזרות על עצמן, וזה אוכל לכם חלק גדול מהיום.',
        plan: ['הסוכן לומד את השאלות הנפוצות ואת התשובות שלכם', 'הוא עונה ללקוחות מיד, גם בערב ובסופ״ש', 'כל פנייה שבאמת צריכה אתכם מגיעה אליכם מסודרת, עם סיכום קצר'] },
      { key: 'auto', label: 'אוטומציה בין המערכות', kw: ['מעתיק', 'מעתיקה', 'להעתיק', 'העתקה', 'אקסל', 'גיליון', 'טופס', 'טפסים', 'ידני', 'ידנית', 'הצעות מחיר', 'הצעת מחיר', 'חשבונית', 'חשבוניות', 'שוכח', 'שוכחת', 'יומן', 'תזכורת'],
        understood: 'יש אצלכם עבודה ידנית של העברת מידע ממקום למקום, ודברים הולכים לאיבוד בדרך.',
        plan: ['ממפים יחד מאיפה המידע מגיע ולאן הוא צריך להגיע', 'מחברים את הכלים כך שהמידע עובר לבד, בלי העתקות', 'מוסיפים תזכורות אוטומטיות, כדי ששום דבר לא ייפול'] },
      { key: 'dash', label: 'דשבורד לניהול העסק', kw: ['לקוחות', 'מעקב', 'מפוזר', 'נתונים', 'דוח', 'דוחות', 'משימות', 'בלגן', 'פרויקטים', 'לנהל', 'ניהול', 'סדר'],
        understood: 'המידע על הלקוחות והמשימות מפוזר, וקשה לראות את התמונה המלאה של העסק.',
        plan: ['מרכזים את כל המידע החשוב למקום אחד', 'בונים מסך שמראה איפה עומד כל לקוח ומה הצעד הבא', 'כל בוקר מתחיל עם תמונה ברורה, בלי לחפש'] },
      { key: 'site', label: 'אתר תדמית', kw: ['אתר', 'תדמית', 'גוגל', 'חשיפה', 'נוכחות', 'דף נחיתה', 'אינסטגרם', 'פייסבוק', 'שיווק'],
        understood: 'אתם צריכים נוכחות דיגיטלית שמציגה את העסק כמו שצריך ומביאה פניות.',
        plan: ['מגדירים יחד למי האתר מדבר ומה הוא צריך להשיג', 'בונים אתר מהיר שנראה מעולה בנייד', 'מחברים את הפניות מהאתר ישר אליכם'] },
      { key: 'home', label: 'סוכן AI לבית', kw: ['ילדים', 'ילד', 'בית', 'משפחה', 'חוגים', 'גן', 'הורים', 'קניות', 'סידורים'],
        understood: 'העומס של היומיום בבית, הודעות, תאריכים וסידורים, מרגיש כמו עוד משרה.',
        plan: ['מחברים את המייל ואת היומן המשפחתי', 'הסוכן אוסף תאריכים ומשימות ומכניס אותם ליומן לבד', 'פעם בשבוע מגיע אליכם סיכום קצר של מה שמחכה'] },
      { key: 'train', label: 'סדנת AI לצוות', kw: ['צוות', 'עובדים', 'ללמוד', 'סדנה', 'הדרכה', 'ללמד', 'להבין', 'מתחיל', 'מתחילה'],
        understood: 'אתם רוצים שאתם או הצוות תדעו להשתמש בכלי AI בעצמכם, בביטחון.',
        plan: ['מבינים מה הצוות עושה ביום יום', 'בונים סדנה מעשית סביב המשימות האמיתיות שלכם', 'כל משתתף יוצא עם כלים שעובדים כבר בסיום המפגש'] }
    ];
    const scored = cats.map((c) => ({ c, score: c.kw.filter((w) => text.indexOf(w) !== -1).length }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);
    let understood, solutions, plan;
    if (scored.length === 0) {
      understood = 'עוד לא הצלחתי להבין עד הסוף, וזה בסדר גמור. בדיוק בשביל זה יש שיחת היכרות קצרה.';
      solutions = ['שיחת היכרות'];
      plan = ['שיחת היכרות על מה שמעכב אתכם', 'אני שואל כמה שאלות ומבין את התמונה', 'אומר לכם בכנות אם ואיך אפשר לעזור'];
    } else {
      const top = scored[0].c;
      const second = scored[1] ? scored[1].c : null;
      understood = top.understood + (second ? ' ונשמע שיש גם מקום ל' + second.label + '.' : '');
      solutions = second ? [top.label, second.label] : [top.label];
      plan = top.plan.slice();
    }
    const msg = 'היי רובי, ניסיתי את הכלי באתר של Rubix Solutions.\nהמקרה שלי: ' + text + '\nמה שהוצע לי: ' + solutions.join(', ');
    return {
      understood: understood,
      solutions: solutions,
      plan: plan.map((t, idx) => ({ n: String(idx + 1), t: t })),
      wa: 'https://wa.me/' + this.waNumber() + '?text=' + encodeURIComponent(msg)
    };
  }
  renderVals() {
    const p = this.props;
    const words = String(p.heroWords ?? 'מערכות ניהול חכמות, אתרים שמביאים פניות, אוטומציות שחוסכות שעות, סוכני AI שעונים ללקוחות').split(',').map((w) => w.trim()).filter((w) => w.length > 0);
    const word = this.state.typed ?? '';
    const themes = {
      'לילה': { bg: '#07080C', bg2: '#0A0B10', card: '#0E1017', card2: '#12141C', inset: '#0C0E14' },
      'כחול עמוק': { bg: '#050A18', bg2: '#081028', card: '#0C1632', card2: '#111D3E', inset: '#0A1329' },
      'גרפיט חם': { bg: '#0D0B09', bg2: '#12100D', card: '#191613', card2: '#201C18', inset: '#15120F' }
    };
    const th = themes[p.theme ?? 'לילה'] || themes['לילה'];
    const fonts = {
      'SF Pro (מערכת)': "-apple-system,BlinkMacSystemFont,'SF Pro Display','Heebo',system-ui,sans-serif",
      'Heebo': "'Heebo',sans-serif",
      'Rubik': "'Rubik','Heebo',sans-serif",
      'Secular One': "'Secular One','Heebo',sans-serif",
      'Varela Round': "'Varela Round','Heebo',sans-serif",
      'Frank Ruhl Libre': "'Frank Ruhl Libre',Georgia,serif",
      'Assistant': "'Assistant','Heebo',sans-serif"
    };
    const displayFont = fonts[p.headingFont ?? 'SF Pro (מערכת)'] || fonts['SF Pro (מערכת)'];
    const phone = String(p.phone ?? '0547714300');
    const digits = phone.replace(/[^0-9]/g, '');
    const phoneDisplay = digits.length === 10 ? digits.slice(0, 3) + ' ' + digits.slice(3, 6) + ' ' + digits.slice(6) : phone;
    const intl = this.waNumber();
    const email = String(p.email ?? 'ryanir2608@gmail.com');
    const on = (v) => v === undefined || v === null ? true : !!v;
    const tabFor = (idx) => {
      const act = this.state.story === idx;
      return {
        border: act ? 'var(--accent)' : 'rgba(255,255,255,0.18)',
        bg: act ? 'var(--accent)' : 'transparent',
        fg: act ? 'var(--bg)' : '#D2D5DE',
        pick: () => this.setState({ story: idx })
      };
    };
    const faqFor = (idx) => ({
      open: this.state.open === idx,
      sign: this.state.open === idx ? '−' : '+',
      toggle: () => this.setState({ open: this.state.open === idx ? -1 : idx })
    });
    const exTexts = [
      'יש לי קליניקה קטנה. אני מקבלת המון הודעות בוואטסאפ עם אותן שאלות על מחירים ותורים, ועונה עד מאוחר בלילה.',
      'כל פנייה שמגיעה מהטופס באתר אני מעתיק ידנית לאקסל ואחר כך ליומן, ולפעמים אני שוכח לחזור ללקוח.',
      'יש לי כמה לקוחות במקביל, המידע מפוזר בין מיילים וגיליונות ואין לי מעקב מסודר אחרי המשימות.'
    ];
    const useEx = (idx) => () => this.setState({ desc: exTexts[idx], micMsg: '' });
    const emptyRes = { understood: '', solutions: [], plan: [], wa: '#analyzer' };
    const { hours, team, wage, eff } = this.state;
    const saved = Math.round(hours * team * 4.33 * (eff / 100));
    const money = saved * wage;
    return {
      prAll: this.state.prAll,
      prAllStr: this.state.prAll ? 'true' : 'false',
      prBtn: this.state.prAll ? 'פחות מחירים' : 'כל המחירים (עוד 6 שירותים)',
      togglePr: () => this.setState({ prAll: !this.state.prAll }),
      modeStories: this.state.mode === 'stories',
      modeRoi: this.state.mode === 'roi',
      segA: { bg: this.state.mode === 'stories' ? 'var(--accent)' : 'transparent', fg: this.state.mode === 'stories' ? 'var(--bg)' : '#D2D5DE' },
      segB: { bg: this.state.mode === 'roi' ? 'var(--accent)' : 'transparent', fg: this.state.mode === 'roi' ? 'var(--bg)' : '#D2D5DE' },
      pickStories: () => this.setState({ mode: 'stories' }),
      pickRoi: () => this.setState({ mode: 'roi' }),
      wkPos: this.state.wk + ' מתוך 4',
      accent: p.accent ?? '#C8F45A',
      th, displayFont,
      rootClass: on(p.animations) && !this.state.paused ? '' : 'calm',
      paused: this.state.paused ? 'true' : 'false',
      motionLabel: this.state.paused ? 'הפעלת אנימציות' : 'עצירת אנימציות',
      toggleMotion: () => { const np = !this.state.paused; this.setState({ paused: np }); clearTimeout(this.twTimer); this.twTimer = setTimeout(this.tick, np ? 0 : 400); },
      progW: this.state.prog.toFixed(1) + '%',
      progScale: (this.state.prog / 100).toFixed(4),
      menuOpen: this.state.menu,
      menuClosed: !this.state.menu,
      toggleMenu: () => this.setState({ menu: !this.state.menu }),
      closeMenu: () => this.setState({ menu: false }),
      word,
      phoneDisplay, email,
      telHref: 'tel:+' + intl,
      waHref: 'https://wa.me/' + intl,
      mailHref: 'mailto:' + email,
      showTools: on(p.showTools), showWork: on(p.showWork), showStories: on(p.showStories),
      showAnalyzer: on(p.showAnalyzer), showRoi: on(p.showRoi), showAbout: on(p.showAbout),
      showFaq: on(p.showFaq), showWhatsapp: on(p.showWhatsapp), showTestimonials: on(p.showTestimonials),
      tab0: tabFor(0), tab1: tabFor(1), tab2: tabFor(2), tab3: tabFor(3), tab4: tabFor(4), tab5: tabFor(5), tab6: tabFor(6), tab7: tabFor(7),
      story0: this.state.story === 0, story1: this.state.story === 1, story2: this.state.story === 2, story3: this.state.story === 3, story4: this.state.story === 4, story5: this.state.story === 5, story6: this.state.story === 6, story7: this.state.story === 7,
      faq0: faqFor(0), faq1: faqFor(1), faq2: faqFor(2), faq3: faqFor(3), faq4: faqFor(4), faq5: faqFor(5),
      useEx0: useEx(0), useEx1: useEx(1), useEx2: useEx(2),
      desc: this.state.desc,
      setDesc: (e) => this.setState({ desc: e.target.value }),
      toggleMic: () => this.toggleMic(),
      analyze: () => this.analyze(),
      recording: this.state.recording,
      notRecording: !this.state.recording,
      micMsg: this.state.micMsg,
      hasMicMsg: !!this.state.micMsg,
      showEmpty: this.state.phase === 'empty',
      loading: this.state.phase === 'loading',
      showResult: this.state.phase === 'result',
      res: this.state.res || emptyRes,
      hours, team, wage, eff,
      savedHours: saved.toLocaleString('he-IL'),
      savedMoney: money.toLocaleString('he-IL'),
      setHours: (e) => this.setState({ hours: Number(e.target.value) }),
      setTeam: (e) => this.setState({ team: Number(e.target.value) }),
      setWage: (e) => this.setState({ wage: Number(e.target.value) }),
      setEff: (e) => this.setState({ eff: Number(e.target.value) }),
      openV0: (e) => this.openVideo(0, e && e.currentTarget), openV1: (e) => this.openVideo(1, e && e.currentTarget), openV2: (e) => this.openVideo(2, e && e.currentTarget), openV3: (e) => this.openVideo(3, e && e.currentTarget),
    };
  }
}

(function () {
  const props = {"accent": "#C8F45A", "theme": "לילה", "headingFont": "SF Pro (מערכת)", "heroWords": "מערכות ניהול חכמות, אתרים שמביאים פניות, אוטומציות שחוסכות שעות, סוכני AI שעונים ללקוחות", "phone": "0547714300", "email": "ryanir2608@gmail.com", "showTools": false, "showWork": true, "showStories": true, "showRoi": true, "showAbout": true, "showFaq": true, "showTestimonials": false, "showWhatsapp": true, "animations": true};
  const comp = new Component(props);
  const tpl = document.getElementById('dc-tpl');
  const root = document.getElementById('dc-root');
  let vals = {};
  const get = (path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), vals);
  const hole = (expr) => { expr = expr.trim(); if (expr === 'true') return true; if (expr === 'false') return false; return get(expr); };
  const fill = (s) => s.replace(/{{(.*?)}}/g, (_, e) => { const v = hole(e); return v == null || v === false ? '' : String(v); });
  const EV = { click: 'click', change: 'input', input: 'input', keydown: 'keydown', submit: 'submit' };
  function build() {
    vals = comp.renderVals();
    const frag = tpl.content.cloneNode(true);
    const walk = (node) => {
      for (const el of Array.from(node.children)) {
        if (el.tagName === 'SC-IF') {
          const h = (el.getAttribute('value') || '').match(/^{{(.*)}}$/);
          if (!(h && hole(h[1]))) { el.remove(); continue; }
          walk(el); el.replaceWith(...el.childNodes); continue;
        }
        for (const a of Array.from(el.attributes)) {
          if (!a.value.includes('{{')) continue;
          if (/^on[a-z]+$/i.test(a.name)) {
            const ev = EV[a.name.slice(2).toLowerCase()] || a.name.slice(2).toLowerCase();
            el.removeAttribute(a.name);
            el.setAttribute('data-on-' + ev, a.value.slice(2, -2).trim());
            continue;
          }
          el.setAttribute(a.name, fill(a.value));
        }
        walk(el);
      }
    };
    walk(frag);
    const tw = document.createTreeWalker(frag, NodeFilter.SHOW_TEXT);
    let n; while ((n = tw.nextNode())) if (n.nodeValue.includes('{{')) n.nodeValue = fill(n.nodeValue);
    const next = document.createElement('div'); next.id = 'dc-root'; next.appendChild(frag);
    return next;
  }
  function render() {
    morphdom(root, build(), {
      onBeforeElUpdated(from, to) {
        if (from.isEqualNode(to)) return false;
        // never wipe what a visitor is typing
        if ((from.tagName === 'TEXTAREA' || (from.tagName === 'INPUT' && from.type !== 'range')) && !to.hasAttribute('value')) to.value = from.value;
        return true;
      },
    });
  }
  let pending = false;
  window.__dcRender = () => { if (pending) return; pending = true; requestAnimationFrame(() => { pending = false; render(); }); };
  for (const ev of ['click', 'input', 'keydown', 'submit']) {
    document.addEventListener(ev, (e) => {
      const el = e.target && e.target.closest ? e.target.closest('[data-on-' + ev + ']') : null;
      if (!el || !root.contains(el)) return;
      const fn = get(el.getAttribute('data-on-' + ev));
      if (typeof fn === 'function') fn(e);
    });
  }
  render();
  comp.componentDidMount && comp.componentDidMount();
})();


// contact form: the "שליחה" button opens WhatsApp with the details filled in
document.addEventListener('click', (e) => {
  const b = e.target && e.target.closest ? e.target.closest('button.send') : null;
  if (!b) return;
  const v = (id) => ((document.getElementById(id) || {}).value || '').trim();
  const name = v('f-name'), mail = v('f-email'), need = v('f-need');
  const hasMail = !!document.getElementById('f-email');
  const needPhone = !hasMail && !!document.getElementById('f-phone');
  if (!name || (hasMail && !mail) || (needPhone && !v('f-phone')) || !need) {
    let t = document.getElementById('form-toast');
    if (!t) { t = document.createElement('div'); t.id = 'form-toast'; t.setAttribute('role', 'status'); t.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:300;background:#111319;color:#fff;font:700 16px Heebo,sans-serif;padding:14px 20px;border-radius:14px;border:1px solid rgba(255,255,255,0.16);box-shadow:0 20px 50px -14px rgba(0,0,0,0.85)'; document.body.appendChild(t); }
    t.textContent = hasMail ? 'נא למלא שם, מייל ומה הייתם רוצים לבנות' : 'נא למלא שם טלפון ומה הייתם רוצים לבנות'; t.hidden = false;
    clearTimeout(t._h); t._h = setTimeout(() => { t.hidden = true; }, 2800);
    return;
  }
  const lines = ['היי רובי, אשמח לשמוע עוד.', 'שם: ' + name];
  if (mail) lines.push('מייל: ' + mail);
  if (v('f-phone')) lines.push('טלפון: ' + v('f-phone'));
  if (v('f-biz')) lines.push('עסק: ' + v('f-biz'));
  lines.push('מה אני רוצה לבנות: ' + need);
  const wa = document.querySelector('a.fab');
  const base = wa ? wa.href.split('?')[0] : 'https://wa.me/972547714300';
  window.open(base + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
});
