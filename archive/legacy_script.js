// ==UserScript==
// @name         Infinder v2.0
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Поиск изображений, SVG, шрифтов, цветов и медиа.
// @author       IdeaNova
// @match        *://*/*
// @grant        GM_download
// @grant        GM_addStyle
// @grant        GM_setClipboard
// @require      https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js
// @run-at       document-end
// ==/UserScript==

!function(){"use strict";if(window.self!==window.top)return;let e={btnSize:50,zIndex:2147483647,primaryColor:"#333333",accentColor:"#007AFF"},t={isSearching:!1,foundUrls:new Set,drag:{active:!1,currentX:0,currentY:0,initialX:0,initialY:0,xOffset:0,yOffset:0}},i=`
        /* Общие сбросы внутри виджета */
        #isf-root * { box-sizing: border-box; outline: none; }

        /* Главная кнопка */
        #isf-main-button {
            position: fixed;
            width: ${e.btnSize}px; height: ${e.btnSize}px;
            background: #ffffff;
            color: #333;
            border-radius: 50%;
            cursor: grab;
            display: flex; align-items: center; justify-content: center;
            z-index: ${e.zIndex};
            box-shadow: 0 4px 15px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
            transition: transform 0.1s, box-shadow 0.2s;
            user-select: none;
        }
        #isf-main-button:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.2); transform: scale(1.05); }
        #isf-main-button:active { cursor: grabbing; transform: scale(0.95); }
        #isf-main-button svg { width: 22px; height: 22px; opacity: 0.8; pointer-events: none; }

        /* Окно */
        #isf-popup {
            position: fixed;
            width: 420px;
            max-height: 80vh;
            background: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.2);
            display: none;
            flex-direction: column;
            z-index: ${e.zIndex};
            border: 1px solid rgba(0,0,0,0.08);
            overflow: hidden;
            animation: isf-fadein 0.2s ease-out;
        }

        @keyframes isf-fadein { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }

        /* Заголовок */
        .isf-header {
            padding: 14px 18px;
            background: #fff;
            border-bottom: 1px solid #f0f0f0;
            display: flex; justify-content: space-between; align-items: center;
            cursor: grab; user-select: none;
        }
        .isf-header:active { cursor: grabbing; }
        .isf-title { font-weight: 700; font-size: 15px; color: #222; display: flex; align-items: center; gap: 10px; }
        .isf-logo { width: 10px; height: 10px; background: ${e.accentColor}; border-radius: 50%; }
        .isf-close {
            cursor: pointer; width: 28px; height: 28px;
            display: flex; align-items: center; justify-content: center;
            border-radius: 50%; background: #f5f5f5; color: #555;
            font-size: 20px; transition: all 0.2s;
        }
        .isf-close:hover { background: #ffecec; color: #ff4444; }

        /* Меню */
        .isf-controls {
            padding: 12px;
            display: flex; gap: 8px;
            overflow-x: auto;
            background: #fff;
            border-bottom: 1px solid #f0f0f0;
        }
        /* Скрываем скроллбар меню */
        .isf-controls::-webkit-scrollbar { height: 0; width: 0; }

        .isf-btn {
            flex: 1;
            white-space: nowrap;
            padding: 8px 12px;
            background: #f9f9f9;
            border: 1px solid #eee;
            border-radius: 8px;
            cursor: pointer;
            font-size: 13px; font-weight: 600; color: #555;
            transition: all 0.2s;
        }
        .isf-btn:hover { background: #f0f0f0; color: #000; }
        .isf-btn.isf-active {
            background: ${e.accentColor};
            color: #fff;
            border-color: ${e.accentColor};
            box-shadow: 0 2px 8px rgba(0,122,255,0.3);
        }

        /* Контейнер результатов */
        #isf-results-container {
            flex: 1;
            overflow-y: auto;
            padding: 12px;
            display: flex; flex-wrap: wrap;
            gap: 10px;
            align-content: flex-start;
            min-height: 150px;
            max-height: 500px;
            background: #fbfbfb;
        }
        /* Кастомный скроллбар */
        #isf-results-container::-webkit-scrollbar { width: 6px; }
        #isf-results-container::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }
        #isf-results-container::-webkit-scrollbar-track { background: transparent; }

        /* --- Типы результатов --- */

        /* 1. Сетка (Images, SVG) */
        .isf-grid-item {
            width: calc(33.33% - 7px);
            aspect-ratio: 1;
            border: 1px solid #eee;
            border-radius: 8px;
            overflow: hidden;
            position: relative;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            /* Шахматный фон */
            background-image: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
            background-size: 20px 20px;
            background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
            background-color: #fff;
        }
        .isf-grid-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border-color: ${e.accentColor};
            z-index: 2;
        }
        .isf-grid-item img, .isf-grid-item svg {
            width: 100%; height: 100%;
            object-fit: contain;
            display: block;
            padding: 4px;
        }
        .isf-overlay {
            position: absolute; bottom: 0; left: 0; right: 0;
            background: rgba(0,0,0,0.7); backdrop-filter: blur(2px);
            color: #fff; font-size: 10px; font-weight: 600;
            padding: 4px; text-align: center;
            opacity: 0; transition: opacity 0.2s;
        }
        .isf-grid-item:hover .isf-overlay { opacity: 1; }

        /* 2. Список (Fonts, Media) */
        .isf-list-item {
            width: 100%;
            padding: 10px 12px;
            background: #fff;
            border: 1px solid #eee;
            border-radius: 6px;
            cursor: pointer;
            display: flex; justify-content: space-between; align-items: center;
            transition: background 0.1s;
        }
        .isf-list-item:hover { background: #f0f7ff; border-color: ${e.accentColor}; }
        .isf-item-name { font-size: 13px; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80%; }
        .isf-item-meta { font-size: 10px; color: #888; background: #eee; padding: 2px 6px; border-radius: 4px; }

        /* Шрифт-превью */
        .isf-font-preview {
            font-size: 16px;
            margin-top: 4px;
            color: #000;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        /* 3. Цвета */
        .isf-color-item {
            width: calc(20% - 8px);
            aspect-ratio: 1;
            border-radius: 8px;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            transition: transform 0.1s;
            position: relative;
            border: 1px solid rgba(0,0,0,0.1);
        }
        .isf-color-item:hover { transform: scale(1.1); z-index: 2; box-shadow: 0 5px 15px rgba(0,0,0,0.15); }
        .isf-color-hex {
            position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%);
            font-size: 10px; background: #333; color: #fff; padding: 2px 4px; border-radius: 3px;
            opacity: 0; pointer-events: none; transition: opacity 0.2s; z-index: 10;
        }
        .isf-color-item:hover .isf-color-hex { opacity: 1; bottom: -25px; }

        /* Подвал */
        .isf-footer {
            padding: 10px 15px;
            background: #fff;
            border-top: 1px solid #f0f0f0;
            font-size: 12px; color: #777;
            display: flex; justify-content: space-between; align-items: center;
        }
        .isf-dl-btn {
            color: ${e.accentColor};
            font-weight: 600; cursor: pointer;
            padding: 4px 8px; border-radius: 4px;
            background: rgba(0,122,255,0.1);
            display: none;
        }
        .isf-dl-btn:hover { background: rgba(0,122,255,0.2); }

        /* Toast Notification */
        #isf-toast {
            position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
            background: rgba(0,0,0,0.8); color: #fff; padding: 8px 16px; border-radius: 20px;
            font-size: 13px; z-index: 2147483648; pointer-events: none;
            opacity: 0; transition: opacity 0.3s;
        }
    `;GM_addStyle(i);let r=document.createElement("div");r.id="isf-root",document.body.appendChild(r);let o=document.createElement("div");o.id="isf-main-button",o.title="Infinder (Drag me)",o.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',r.appendChild(o);let n=document.createElement("div");n.id="isf-popup",n.innerHTML=`
        <div class="isf-header" id="isf-header">
            <div class="isf-title"><span class="isf-logo"></span>Infinder 2</div>
            <div class="isf-close" id="isf-close-btn">\xd7</div>
        </div>
        <div class="isf-controls">
            <button class="isf-btn" data-action="images">Картинки</button>
            <button class="isf-btn" data-action="svg">Вектор</button>
            <button class="isf-btn" data-action="colors">Цвета</button>
            <button class="isf-btn" data-action="fonts">Шрифты</button>
            <button class="isf-btn" data-action="media">Медиа</button>
        </div>
        <div id="isf-results-container">
            <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#999; flex-direction:column; gap:10px;">
                <svg style="width:32px;height:32px;opacity:0.2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
                Выберите категорию
            </div>
        </div>
        <div class="isf-footer">
            <span id="isf-status">Ожидание...</span>
            <span class="isf-dl-btn" id="isf-dl-all">Скачать все</span>
        </div>
    `,r.appendChild(n);let s=document.createElement("div");s.id="isf-toast",r.appendChild(s);let a=JSON.parse(localStorage.getItem("isf_pos_v3"))||{right:20,bottom:20};void 0!==a.left&&(o.style.left=a.left+"px"),void 0!==a.top&&(o.style.top=a.top+"px"),void 0!==a.right&&(o.style.right=a.right+"px",o.style.left="auto"),void 0!==a.bottom&&(o.style.bottom=a.bottom+"px",o.style.top="auto");let l=()=>{n.getBoundingClientRect(),n.style.left=window.innerWidth/2-210+"px",n.style.top=window.innerHeight/2-250+"px"};function d(e,t){let i=!1,r,o,n,s;function a(t){let a=t.clientX-r,l=t.clientY-o;if(!i&&(Math.abs(a)>3||Math.abs(l)>3)&&(i=!0,e.style.cursor="grabbing"),i){t.preventDefault();let d=n+a,f=s+l,c=window.innerWidth-e.offsetWidth,p=window.innerHeight-e.offsetHeight;d=Math.max(0,Math.min(d,c)),f=Math.max(0,Math.min(f,p)),e.style.left=d+"px",e.style.top=f+"px"}}function l(t){document.removeEventListener("mousemove",a),document.removeEventListener("mouseup",l),e.style.cursor="",i&&("isf-main-button"===e.id&&localStorage.setItem("isf_pos_v3",JSON.stringify({left:parseInt(e.style.left),top:parseInt(e.style.top)})),setTimeout(()=>{i=!1},50))}(t||e).addEventListener("mousedown",t=>{if(0!==t.button)return;i=!1,r=t.clientX,o=t.clientY;let d=e.getBoundingClientRect();n=d.left,s=d.top,e.style.right="auto",e.style.bottom="auto",e.style.left=n+"px",e.style.top=s+"px",document.addEventListener("mousemove",a),document.addEventListener("mouseup",l)}),e.isJustDragged=()=>i}d(o),d(n,document.getElementById("isf-header")),o.addEventListener("click",e=>{o.isJustDragged&&o.isJustDragged()||("flex"===n.style.display?n.style.display="none":(n.style.display="flex",n.dataset.inited||(l(),n.dataset.inited="true")))}),document.getElementById("isf-close-btn").addEventListener("click",()=>n.style.display="none");let f=document.getElementById("isf-results-container"),c=document.getElementById("isf-status"),p=document.getElementById("isf-dl-all");function $(e){try{return new URL(e,document.baseURI).href}catch(t){return null}}function u(e){try{if(e.startsWith("data:"))return"file";return new URL(e).pathname.split("/").pop()||"file"}catch(t){return"file"}}async function g(e){if(t.isSearching)return;t.isSearching=!0,f.innerHTML="",t.foundUrls.clear(),c.textContent="Сканирование...",p.style.display="none",await new Promise(e=>setTimeout(e,50));let i=0;try{"images"===e?i=await x():"svg"===e?i=await b():"colors"===e?i=await h():"fonts"===e?i=await m():"media"===e&&(i=await y()),c.textContent=`Найдено: ${i}`,"colors"!==e&&i>0&&(p.style.display="block",p.textContent=`Скачать все (${i})`,p.onclick=()=>(function e(i){let r=Array.from(t.foundUrls);confirm(`Скачать ${r.length} файлов?`)&&r.forEach((e,t)=>{setTimeout(()=>{let t=e.url||e,i=e.name||u(t);"undefined"!=typeof GM_download?GM_download({url:t,name:i,saveAs:!1}):saveAs(t,i)},500*t)})})(e))}catch(r){console.error(r),c.textContent="Ошибка поиска"}finally{t.isSearching=!1,0===i&&(f.innerHTML='<div style="width:100%;text-align:center;color:#999;margin-top:20px;">Ничего не найдено</div>')}}async function x(){let e=new Set,i=i=>{let r=$(i);if(!r||e.has(r)||r.match(/\.(svg)$/i))return;e.add(r),t.foundUrls.add(r);let o=document.createElement("div");o.className="isf-grid-item";let n=new Image;n.src=r,n.onload=function(){o.innerHTML=`<img src="${r}"><div class="isf-overlay">${this.naturalWidth}x${this.naturalHeight}</div>`,o.onclick=()=>{"undefined"!=typeof GM_download?GM_download({url:r,name:u(r)}):saveAs(r,u(r))},f.appendChild(o)}};return document.querySelectorAll("img").forEach(e=>{e.src&&i(e.src),e.srcset&&e.srcset.split(",").forEach(e=>i(e.trim().split(" ")[0]))}),Array.from(document.querySelectorAll("*")).forEach(e=>{let t=window.getComputedStyle(e).backgroundImage;if(t&&t.startsWith("url")){let r=t.match(/url\(['"]?(.*?)['"]?\)/);r&&r[1]&&i(r[1])}}),e.size}async function b(){let e=0,i=new Set,r=(i,r,o)=>{let n=document.createElement("div");if(n.className="isf-grid-item",r)n.innerHTML=`<img src="${i}"><div class="isf-overlay">URL</div>`,t.foundUrls.add({url:i,name:o});else{let s=i.cloneNode(!0);s.removeAttribute("class"),s.removeAttribute("style"),s.setAttribute("width","100%"),s.setAttribute("height","100%"),s.style.fill="currentColor",n.appendChild(s),n.innerHTML+='<div class="isf-overlay">Inline</div>';let a=new XMLSerializer().serializeToString(i),l="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(a);t.foundUrls.add({url:l,name:"icon.svg"}),n.onclick=()=>saveAs(l,o||"vector.svg")}r&&(n.onclick=()=>saveAs(i,o)),f.appendChild(n),e++};return document.querySelectorAll("svg").forEach((e,t)=>{let o=e.getBoundingClientRect();if(o.width>0&&o.height>0){let n=e.innerHTML.length;i.has(n)||(i.add(n),r(e,!1,`vector_${t}.svg`))}}),document.querySelectorAll('img[src$=".svg"]').forEach(e=>{let t=$(e.src);t&&!i.has(t)&&(i.add(t),r(t,!0,u(t)))}),e}async function h(){let e={},t=e=>{if(!e||"transparent"===e||"rgba(0, 0, 0, 0)"===e)return null;if(e.startsWith("#"))return e;let t=e.match(/\d+(\.\d+)?/g);if(!t||t.length<3||4===t.length&&0===parseFloat(t[3]))return null;let i=parseInt(t[0]).toString(16).padStart(2,"0"),r=parseInt(t[1]).toString(16).padStart(2,"0"),o=parseInt(t[2]).toString(16).padStart(2,"0");return`#${i}${r}${o}`.toUpperCase()},i=document.querySelectorAll("*");for(let r of i){let o=window.getComputedStyle(r);[o.color,o.backgroundColor].forEach(i=>{let r=t(i);r&&(e[r]=(e[r]||0)+1)})}let n=Object.keys(e).sort((t,i)=>e[i]-e[t]);return n.forEach(e=>{let t=document.createElement("div");t.className="isf-color-item",t.style.backgroundColor=e,t.innerHTML=`<div class="isf-color-hex">${e}</div>`,t.onclick=()=>{var t;"undefined"!=typeof GM_setClipboard?GM_setClipboard(e):navigator.clipboard.writeText(e),t=`Скопировано: ${e}`,s.textContent=t,s.style.opacity=1,setTimeout(()=>s.style.opacity=0,2e3)},f.appendChild(t)}),n.length}async function m(){let e=new Set,i=0;for(let r of document.styleSheets)try{let o=r.cssRules||r.rules;if(!o)continue;for(let n of o)if(n.type===CSSRule.FONT_FACE_RULE){let s=n.style,a=s.getPropertyValue("font-family").replace(/['"]/g,""),l=s.getPropertyValue("src"),d=l.match(/url\(['"]?(.*?)['"]?\)/);if(d&&d[1]){let c=$(d[1]);if(c&&!c.startsWith("data:")&&!e.has(c)){e.add(c),t.foundUrls.add(c),i++;let p=document.createElement("div");p.className="isf-list-item",p.innerHTML=`
                                    <div style="width:100%">
                                        <div style="display:flex;justify-content:space-between">
                                            <span class="isf-item-name">${a}</span>
                                            <span class="isf-item-meta">${u(c).split(".").pop()}</span>
                                        </div>
                                        <div class="isf-font-preview" style="font-family: '${a}', sans-serif !important;">
                                            Quick Brown Fox 123
                                        </div>
                                    </div>
                                `,p.onclick=()=>saveAs(c,u(c)),f.appendChild(p)}}}}catch(g){}return i}async function y(){let e=new Set,i=0,r=/\.(mp4|webm|mp3|wav|mov|avi|mkv|pdf|zip|rar)$/i,o=(r,o)=>{let n=$(r);if(!n||e.has(n))return;e.add(n),t.foundUrls.add(n),i++;let s=document.createElement("div");s.className="isf-list-item",s.innerHTML=`
                <span class="isf-item-name">${u(n)}</span>
                <span class="isf-item-meta">${o}</span>
            `,s.onclick=()=>window.open(n,"_blank"),f.appendChild(s)};return document.querySelectorAll("video, audio").forEach(e=>{e.src&&o(e.src,e.tagName),e.querySelectorAll("source").forEach(t=>o(t.src,e.tagName))}),document.querySelectorAll("a").forEach(e=>{e.href&&r.test(e.href)&&o(e.href,e.href.split(".").pop().toUpperCase())}),i}document.querySelectorAll(".isf-btn").forEach(e=>{e.addEventListener("click",e=>{document.querySelectorAll(".isf-btn").forEach(e=>e.classList.remove("isf-active")),e.target.classList.add("isf-active"),g(e.target.dataset.action)})})}();