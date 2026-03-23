import { useState, useEffect, useRef, useCallback } from "react";

const FONT = `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif`;
const FONT_SERIF = `Georgia, 'Times New Roman', serif`;
const FONT_MONO = `'Courier New', Courier, monospace`;

function detectDefaultLang() {
  try {
    const nav = navigator.language || navigator.languages?.[0] || "en";
    return nav.toLowerCase().startsWith("zh") ? "zh" : "en";
  } catch { return "en"; }
}

const I18N = {
  zh: {
    htmlLang: "zh-CN",
    pill: ["对话", "选风格", "生成"],
    langLabel: "中文 / EN",
    placeholder: "说说你的经历...",
    genBtn: "生成我的个人网站",
    dlBtn: "下载",
    styleSectionLabel: "选择风格",
    mainTitles: ["正在提炼你的价值...", "选择风格，准备生成", "你的个人网站已生成 ✦"],
    mainSubs: ["与 AI 对话，右侧实时呈现关键词", "也可以继续补充信息", "点击右上角下载文件"],
    dlItems: {
      html: ["HTML 文件", "部署到服务器或 GitHub Pages"],
      pdf:  ["PDF 文档", "发给 HR / 潜在客户"],
      png:  ["PNG 截图", "分享到社交媒体"],
      md:   ["Markdown", "纯文字，方便编辑"],
    },
    pngFail: "截图失败，请下载 HTML 后在浏览器中截图",
    pdfPopup: "请允许弹出窗口以生成 PDF",
    genOverlay: ["正在生成你的个人网站", "通常需要 2-3 秒"],
    readyMsg: "✦ 信息收集完成！选择风格后点击生成。",
    networkErr: "网络出了点问题，请重试一下～",
    initFallback: "你好！告诉我你是做什么的，想到什么说什么——我来帮你找到最打动人的价值点。",
    styleNames: ["编辑·温暖", "深色·科技", "极简·冲击", "柔和·渐变"],
    cardLines: [
      ["你有几年经验？", "说出来，我来翻译成让人眼前一亮的个人品牌"],
      ["做过什么项目？", "不只是「做过」，而是「值多少」——AI 帮你提炼"],
      ["你的核心竞争力？", "大多数人知道自己干了什么，但不知道为什么值钱"],
      ["有量化的成果吗？", "数字会说话——60万、40亿……让它们替你开口"],
      ["什么问题只有你能解？", "别人说难、你觉得没啥，那就是你的护城河"],
      ["你的下一个客户在哪？", "让对的人一眼认出你——这就是个人品牌的价值"],
    ],
    keywords: [
      [/产品经理|PM|产品/, "产品经理"],
      [/供应链|仓储|WMS|物流/, "供应链专家"],
      [/跨境|电商|Shopify|Amazon/, "跨境电商"],
      [/0到1|0-1|从零/, "0→1 建设者"],
      [/亿|千万|营收|规模/, "大规模经验"],
      [/年.{0,4}经验|工作了/, "资深从业者"],
      [/创业|初创|startup/i, "创业背景"],
      [/ToB|B端|企业级/, "ToB 专家"],
      [/系统|架构|中台/, "架构思维"],
      [/落地|推动|上线/, "强执行力"],
      [/客户|沟通|售前/, "客户沟通"],
      [/数据|指标|量化/, "数据驱动"],
      [/设计|用户体验|UX/i, "UX 洞察"],
      [/海外|国际|出海/, "国际化视野"],
      [/管理|团队|带队/, "团队管理"],
    ],
    siteNav: ["关于我", "核心能力", "合作对象", "联系"],
    siteLabels: ["01 · 关于我", "02 · 核心能力", "03 · 合作对象", "04 · 联系我"],
    siteTitles: [["既懂业务", "又", "能落地"], ["我能为你", "做", "什么"], ["哪些人在", "找", "我"], ["有问题", "聊聊？", ""]],
    siteContact: ["无论是全职机会、顾问合作，还是只是想交流，都欢迎发邮件。", "通常在 48 小时内回复 · 中英文均可"],
    siteBtns: ["开始合作 →", "查看能力"],
    siteFooter: "Made with PageMe",
    initMsg: "你好，我想创建个人网站",
    confirmSwitch: "切换语言将重新开始对话，确认吗？",
    systemPrompt: `你是一位专业的个人品牌顾问，帮助用户梳理职业经历并提炼核心竞争力，最终生成个人网站内容。

## 对话流程
### 第一阶段：引导开口
用一句简单自然的话引导用户说出自己的背景，不要问问卷式问题。
### 第二阶段：深入挖掘
根据用户说的内容，定向追问1-2个问题，挖掘：最有代表性的项目或成果（有量化数字？）、遇到过什么难题如何解决的、在同类人中什么是只有你才有的。如果用户说得少，引导多说具体场景。如果用户说得多，专注提炼最有价值的部分。
### 第三阶段：价值确认
把提炼出的核心价值用3句话总结，问用户"这样描述准确吗？"
### 第四阶段：收集基本信息
确认之后，收集：姓名、联系邮箱、希望网站面向的目标受众。
### 完成信号
收集完所有信息并用户确认后，输出：[READY_TO_GENERATE]
然后输出JSON（在\`\`\`json代码块中）：
{"name":"姓名","title":"一句话职业定位","hook":"最打动人的一句话","about":"关于我段落（150字以内）","capabilities":[{"title":"能力","desc":"说明"}],"proofs":[{"title":"核心能力","body":"具体说明含证据","result":"成果"}],"forwho":[{"icon":"emoji","title":"目标客群","desc":"为什么找你"}],"email":"邮箱","keywords":["关键词"]}
## 风格：自然温暖像朋友聊天，每次最多1-2个问题，用中文对话`,
  },
  en: {
    htmlLang: "en",
    pill: ["Chat", "Style", "Generate"],
    langLabel: "EN / 中文",
    placeholder: "Tell me about your work...",
    genBtn: "Generate My Website",
    dlBtn: "Download",
    styleSectionLabel: "Choose a style",
    mainTitles: ["Distilling your value...", "Pick a style, then generate", "Your website is ready ✦"],
    mainSubs: ["Chat with AI — keywords appear on the right", "You can still add more details", "Click download above"],
    dlItems: {
      html: ["HTML File", "Deploy to server or GitHub Pages"],
      pdf:  ["PDF Document", "Send to recruiters or clients"],
      png:  ["PNG Screenshot", "Share on social media"],
      md:   ["Markdown", "Plain text, easy to edit"],
    },
    pngFail: "Screenshot failed. Download HTML and try in browser.",
    pdfPopup: "Please allow popups to generate PDF.",
    genOverlay: ["Generating your website", "Usually takes 2–3 seconds"],
    readyMsg: "✦ All set! Pick a style and click Generate.",
    networkErr: "Network hiccup — please try again.",
    initFallback: "Hi! Tell me what you do — whatever comes to mind. I'll help you find the value worth showcasing.",
    styleNames: ["Editorial", "Dark Tech", "Bold Minimal", "Soft Gradient"],
    cardLines: [
      ["How many years of experience?", "Tell me — I'll translate it into a brand that turns heads."],
      ["What's your most impactful project?", "Not just what you did, but why it mattered."],
      ["What's your unique edge?", "Most people know what they've done. Few know why they're valuable."],
      ["Any quantifiable results?", "Numbers speak — revenue, users, savings. Let them talk."],
      ["What problem only you can solve?", "The thing others call hard and you call Tuesday — that's your moat."],
      ["Who's your next client?", "Make the right people recognize you instantly."],
    ],
    keywords: [
      [/product manager|PM\b|product/i, "Product Manager"],
      [/supply chain|warehouse|WMS|logistics/i, "Supply Chain"],
      [/cross-border|e-?commerce|shopify|amazon/i, "E-commerce"],
      [/from scratch|zero to one|0 to 1|built/i, "0→1 Builder"],
      [/million|billion|revenue|scale|ARR/i, "Large-scale Exp."],
      [/years.{0,6}exp|worked/i, "Seasoned Pro"],
      [/startup|early.stage|founder/i, "Startup Background"],
      [/B2B|enterprise|SaaS/i, "B2B Expert"],
      [/system|architecture|platform/i, "Systems Thinker"],
      [/shipped|launched|deployed/i, "Execution Power"],
      [/client|customer|sales/i, "Client-facing"],
      [/data|metrics|analytics/i, "Data-driven"],
      [/design|UX|user experience/i, "UX Insight"],
      [/global|international|overseas/i, "Global Mindset"],
      [/manage|team|lead/i, "Team Leadership"],
    ],
    siteNav: ["About", "Strengths", "Who I Help", "Contact"],
    siteLabels: ["01 · About me", "02 · Core strengths", "03 · Who I help", "04 · Get in touch"],
    siteTitles: [["I understand the business", "and", "I ship"], ["What I can", "do for", "you"], ["Who should", "reach", "out"], ["Got a question?", "Let's", "talk"]],
    siteContact: ["Whether it's a full-time role, consulting, or just a conversation — feel free to reach out.", "Usually replies within 48 hours"],
    siteBtns: ["Work together →", "See my strengths"],
    siteFooter: "Made with PageMe",
    initMsg: "Hi, I want to create a personal website",
    confirmSwitch: "Switching language will restart the conversation. Continue?",
    systemPrompt: `You are a personal brand consultant. Help the user surface their career experience, distill their core value, and produce content for a personal website.

## Conversation flow
### Stage 1 — Open the conversation
One natural sentence to get them talking. No questionnaires.
### Stage 2 — Dig deeper
Ask 1–2 targeted follow-ups to uncover: most impactful project or result (any numbers?), a hard problem they solved and how, what makes them rare. If they say little, ask for a specific story. If they say a lot, focus on the most compelling thread.
### Stage 3 — Confirm the value
Summarise their core value in 3 sentences. Ask "Does this sound right?"
### Stage 4 — Collect basics
Name, email, who the site is aimed at.
### Ready signal
Once all info is confirmed, output: [READY_TO_GENERATE]
Then output JSON in a \`\`\`json block:
{"name":"Name","title":"One-line positioning","hook":"The most compelling headline","about":"About paragraph (under 120 words)","capabilities":[{"title":"Skill","desc":"Description"}],"proofs":[{"title":"Strength","body":"Explanation with evidence","result":"Outcome"}],"forwho":[{"icon":"emoji","title":"Target audience","desc":"Why they need you"}],"email":"email","keywords":["keyword"]}
## Tone: warm and natural. Max 1–2 questions at a time. Reply in English.`,
  },
};

/* ── CANVAS: safe for iframe sandbox ── */
function AnimCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const COLORS = ["#c84b2f","#ff6b35","#ff8c5a","#7c3aed","#a78bfa"];
    let W = 0, H = 0, particles = [], lines = [], raf;

    function setSize() {
      const rect = canvas.getBoundingClientRect();
      W = canvas.width = rect.width || canvas.parentElement?.offsetWidth || 600;
      H = canvas.height = rect.height || canvas.parentElement?.offsetHeight || 400;
    }

    const mkP = () => ({
      x: Math.random()*W, y: Math.random()*H,
      r: Math.random()*1.6+.4,
      vx: (Math.random()-.5)*.3, vy: (Math.random()-.5)*.3,
      color: COLORS[Math.floor(Math.random()*COLORS.length)],
      opacity: Math.random()*.45+.1,
      pulse: Math.random()*Math.PI*2, ps: Math.random()*.02+.008,
    });

    const mkL = () => ({
      pts: [{x:Math.random()*W, y:Math.random()*H}],
      color: COLORS[Math.floor(Math.random()*COLORS.length)],
      op: Math.random()*.1+.03,
      spd: Math.random()*.5+.2,
      ang: Math.random()*Math.PI*2,
      ts: (Math.random()-.5)*.015,
      life: 0, max: 160+Math.random()*100,
    });

    function init() {
      const n = Math.min(Math.floor(W*H/10000), 60);
      particles = Array.from({length: n}, mkP);
      lines = Array.from({length: 10}, mkL);
    }

    function draw() {
      if (!W || !H) { raf = requestAnimationFrame(draw); return; }
      ctx.clearRect(0,0,W,H);

      // grid
      ctx.strokeStyle = "rgba(255,255,255,.02)"; ctx.lineWidth = .5;
      for (let x=0; x<W; x+=60) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
      for (let y=0; y<H; y+=60) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

      // lines
      lines.forEach(l => {
        l.ang += l.ts;
        const nx = l.pts[l.pts.length-1].x + Math.cos(l.ang)*l.spd;
        const ny = l.pts[l.pts.length-1].y + Math.sin(l.ang)*l.spd;
        l.pts.push({x:nx,y:ny}); if(l.pts.length>70) l.pts.shift(); l.life++;
        const fi=Math.min(l.life/30,1), fo=l.life>l.max-30?(l.max-l.life)/30:1;
        if (l.pts.length>2) {
          ctx.beginPath(); ctx.moveTo(l.pts[0].x,l.pts[0].y);
          for (let i=1;i<l.pts.length-1;i++) ctx.quadraticCurveTo(l.pts[i].x,l.pts[i].y,(l.pts[i].x+l.pts[i+1].x)/2,(l.pts[i].y+l.pts[i+1].y)/2);
          ctx.strokeStyle = l.color + Math.floor(l.op*fi*fo*255).toString(16).padStart(2,"0");
          ctx.lineWidth = 1; ctx.stroke();
        }
        if (l.life>=l.max||nx<-50||nx>W+50||ny<-50||ny>H+50) Object.assign(l,mkL());
      });

      // particles
      particles.forEach(p => {
        p.x+=p.vx; p.y+=p.vy; p.pulse+=p.ps;
        if(p.x<-10)p.x=W+10; if(p.x>W+10)p.x=-10;
        if(p.y<-10)p.y=H+10; if(p.y>H+10)p.y=-10;
        const a = p.opacity*(.7+.3*Math.sin(p.pulse));
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle = p.color + Math.floor(a*255).toString(16).padStart(2,"0"); ctx.fill();
      });

      // connections
      for(let i=0;i<particles.length;i++) for(let j=i+1;j<particles.length;j++){
        const dx=particles[i].x-particles[j].x, dy=particles[i].y-particles[j].y, d=Math.sqrt(dx*dx+dy*dy);
        if(d<90){ ctx.beginPath(); ctx.moveTo(particles[i].x,particles[i].y); ctx.lineTo(particles[j].x,particles[j].y); ctx.strokeStyle=`rgba(255,255,255,${.05*(1-d/90)})`; ctx.lineWidth=.5; ctx.stroke(); }
      }
      raf = requestAnimationFrame(draw);
    }

    // Delay to ensure layout is complete
    setTimeout(() => { setSize(); init(); draw(); }, 100);
    const onResize = () => { setSize(); init(); };
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("resize", onResize); cancelAnimationFrame(raf); };
  }, []);

  return <canvas ref={ref} style={{position:"absolute",inset:0,width:"100%",height:"100%"}}/>;
}

/* ── STYLE PREVIEWS ── */
function StylePreview({ id }) {
  const previews = {
    editorial: (
      <div style={{background:"#f7f4ef",padding:"8px 10px",height:"100%"}}>
        <div style={{fontSize:7,color:"#c84b2f",letterSpacing:".1em",textTransform:"uppercase",marginBottom:3}}>PM</div>
        <div style={{width:16,height:1.5,background:"#c84b2f",marginBottom:4}}/>
        <div style={{fontSize:12,fontWeight:700,color:"#1a1814",fontStyle:"italic",marginBottom:5}}>Your Name</div>
        <div style={{display:"flex",gap:4}}>
          {["8y+","$40B","$600K"].map(t=><div key={t} style={{background:"#ede9e2",padding:"2px 5px",fontSize:6.5,color:"#4a4640"}}>{t}</div>)}
        </div>
      </div>
    ),
    darktech: (
      <div style={{background:"#0d1117",padding:"8px 10px",height:"100%"}}>
        <div style={{fontSize:7,color:"#58a6ff",letterSpacing:".1em",textTransform:"uppercase",marginBottom:3}}>PM · SUPPLY CHAIN</div>
        <div style={{fontSize:13,fontWeight:700,color:"#e6edf3",marginBottom:2}}>Your Name</div>
        <div style={{width:26,height:1.5,background:"#58a6ff",margin:"4px 0"}}/>
        <div style={{display:"flex",gap:8}}>
          {[["$40B","scale"],["$600K","saved"]].map(([n,l])=>(
            <div key={n}><span style={{fontSize:10,fontWeight:700,color:"#58a6ff"}}>{n}</span><br/><span style={{fontSize:6,color:"rgba(230,237,243,.35)"}}>{l}</span></div>
          ))}
        </div>
      </div>
    ),
    boldminimal: (
      <div style={{background:"#fff",display:"grid",gridTemplateColumns:"1fr 34px",height:"100%"}}>
        <div style={{padding:"8px 10px"}}>
          <div style={{fontSize:6,color:"#999",letterSpacing:".1em",textTransform:"uppercase",marginBottom:3}}>Product Manager</div>
          <div style={{fontSize:16,fontWeight:900,color:"#111",lineHeight:1,letterSpacing:-1}}>Your<br/><span style={{color:"#c84b2f"}}>Name</span></div>
          <div style={{width:14,height:2,background:"#111",margin:"5px 0"}}/>
          <div style={{fontSize:6,color:"#666"}}>Supply Chain</div>
        </div>
        <div style={{background:"#111"}}/>
      </div>
    ),
    softgradient: (
      <div style={{background:"linear-gradient(135deg,#667eea,#764ba2)",padding:"8px 10px",height:"100%"}}>
        <div style={{fontSize:7,color:"rgba(255,255,255,.65)",marginBottom:3}}>Product Manager</div>
        <div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:5}}>Your Name</div>
        <div style={{background:"rgba(255,255,255,.18)",borderRadius:4,padding:"4px 7px",display:"inline-block"}}>
          <div style={{fontSize:8,fontWeight:700,color:"#fff"}}>8y+ exp</div>
          <div style={{fontSize:6,color:"rgba(255,255,255,.65)"}}>Supply Chain</div>
        </div>
      </div>
    ),
  };
  return previews[id] || null;
}

/* ── WEBSITE GENERATOR ── */
function generateWebsite(data, styleId, lang) {
  const L = I18N[lang];
  const [nav0,nav1,nav2,nav3] = L.siteNav;
  const [lbl0,lbl1,lbl2,lbl3] = L.siteLabels;
  const [[ta0,ta1,ta2],[tb0,tb1,tb2],[tc0,tc1,tc2],[td0,td1]] = L.siteTitles;
  const [cBody,cNote] = L.siteContact;
  const [btnA,btnB] = L.siteBtns;

  const themes = {
    editorial:    {bg:"#f7f4ef",bg2:"#ede9e2",bg3:"#e2ddd6",ink:"#1a1814",ink2:"#4a4640",ink3:"#8a8480",accent:"#c84b2f",hBg:"rgba(247,244,239,.92)",rBg:"#ede9e2",altBg:"#1a1814",altC:"#f7f4ef",fd:FONT_SERIF,fb:FONT,ns:"font-style:italic"},
    darktech:     {bg:"#0d1117",bg2:"#161b22",bg3:"#21262d",ink:"#e6edf3",ink2:"#b0bec5",ink3:"#6e7681",accent:"#58a6ff",hBg:"rgba(13,17,23,.92)",rBg:"#161b22",altBg:"#161b22",altC:"#e6edf3",fd:FONT_MONO,fb:FONT,ns:"letter-spacing:-1px"},
    boldminimal:  {bg:"#fff",bg2:"#f8f8f8",bg3:"#eee",ink:"#111",ink2:"#444",ink3:"#888",accent:"#c84b2f",hBg:"rgba(255,255,255,.95)",rBg:"#111",altBg:"#111",altC:"#fff",fd:FONT,fb:FONT,ns:"font-weight:900;letter-spacing:-2px"},
    softgradient: {bg:"#faf8ff",bg2:"#f0eef8",bg3:"#e4e0f0",ink:"#2d1b69",ink2:"#4a3880",ink3:"#7c6da0",accent:"#764ba2",hBg:"rgba(250,248,255,.92)",rBg:"linear-gradient(135deg,#667eea,#764ba2)",altBg:"linear-gradient(135deg,#667eea,#764ba2)",altC:"#fff",fd:FONT_SERIF,fb:FONT,ns:"font-style:italic"},
  };
  const t = themes[styleId]||themes.editorial;
  const isG = t.rBg.includes("gradient");
  const rNumC=isG?"#fff":t.ink, rC=isG?"rgba(255,255,255,.65)":t.ink3;
  const tagBg=isG?"rgba(255,255,255,.15)":t.bg, tagC=isG?"rgba(255,255,255,.8)":t.ink2;
  const aO = t.altBg==="#1a1814"?"247,244,239":"255,255,255";
  const caps=(data.capabilities||[]).slice(0,5), proofs=(data.proofs||[]).slice(0,3);
  const forwho=(data.forwho||[]).slice(0,4), kws=(data.keywords||[]).slice(0,6);

  return `<!DOCTYPE html><html lang="${L.htmlLang}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${data.name||"Portfolio"} · ${data.title||""}</title>
<style>*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}body{background:${t.bg};color:${t.ink};font-family:${t.fb};line-height:1.7;overflow-x:hidden}
nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:16px 48px;display:flex;justify-content:space-between;align-items:center;background:${t.hBg};backdrop-filter:blur(12px);border-bottom:1px solid rgba(128,128,128,.1)}
.nl{font-family:${t.fd};font-size:18px;font-weight:700;color:${t.ink};text-decoration:none}nav ul{display:flex;gap:32px;list-style:none}nav a{font-size:12px;color:${t.ink3};text-decoration:none;letter-spacing:.06em;text-transform:uppercase;transition:color .2s}nav a:hover{color:${t.accent}}
.hero{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;padding-top:68px}
.hl{padding:68px 48px;display:flex;flex-direction:column;justify-content:center;border-right:1px solid rgba(128,128,128,.12)}
.ey{font-size:11px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:${t.accent};margin-bottom:22px;display:flex;align-items:center;gap:10px}.ey::before{content:"";display:block;width:22px;height:1.5px;background:${t.accent}}
h1{font-family:${t.fd};font-size:clamp(48px,6vw,78px);line-height:1.05;${t.ns};margin-bottom:6px}
.hk{font-family:${t.fd};font-size:clamp(18px,2.4vw,26px);line-height:1.3;color:${t.ink};margin:22px 0 12px;max-width:460px;font-style:italic}.hk em{color:${t.accent};font-style:normal}
.hs{font-size:15px;color:${t.ink3};line-height:1.75;max-width:400px;margin-bottom:40px}
.btns{display:flex;gap:12px;flex-wrap:wrap}
.bp{display:inline-flex;align-items:center;background:${t.ink};color:${t.bg};padding:13px 26px;font-size:13px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;text-decoration:none;border:2px solid ${t.ink};transition:all .2s}.bp:hover{background:${t.accent};border-color:${t.accent}}
.bs{display:inline-flex;align-items:center;background:transparent;color:${t.ink};padding:13px 26px;font-size:13px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;text-decoration:none;border:2px solid rgba(128,128,128,.2);transition:all .2s}.bs:hover{border-color:${t.ink}}
.hr{padding:56px 48px;display:flex;flex-direction:column;justify-content:center;background:${t.rBg}}
.sg{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:rgba(128,128,128,.12);border:1px solid rgba(128,128,128,.12)}
.sc{background:${isG?"rgba(255,255,255,.12)":t.bg2};padding:26px 22px}.sn{font-family:${t.fd};font-size:52px;line-height:1;margin-bottom:7px;color:${rNumC}}.sd{font-size:13px;color:${rC};line-height:1.45}
.tgs{display:flex;flex-wrap:wrap;gap:7px;margin-top:24px}.tg{font-size:11px;letter-spacing:.05em;color:${tagC};padding:5px 13px;border:1px solid rgba(128,128,128,.18);background:${tagBg}}
section{padding:88px 48px}.sl{font-size:11px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:${t.ink3};margin-bottom:9px}
.st{font-family:${t.fd};font-size:clamp(30px,4vw,46px);line-height:1.1;margin-bottom:52px}.st em{font-style:italic;color:${t.accent}}
#about{background:${t.altBg};color:${t.altC}}#about .sl{color:rgba(128,128,128,.4)}#about .st{color:${t.altC}}
.ag{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:start}
.ab{font-size:16px;line-height:1.9;color:rgba(${aO},.72)}.ab strong{color:${t.altC};font-weight:600}.ab p+p{margin-top:14px}
.cl{display:flex;flex-direction:column}.ci{padding:15px 0;border-bottom:1px solid rgba(255,255,255,.08);display:flex;gap:13px;align-items:flex-start}
.ca{color:rgba(255,255,255,.28);font-size:14px;margin-top:1px;flex-shrink:0}.ct{font-size:15px;font-weight:600;color:${t.altC};margin-bottom:3px}.cd{font-size:13px;color:rgba(${aO},.44);line-height:1.6}
.pl{display:flex;flex-direction:column;gap:2px}
.proof{background:${t.bg2};padding:38px 48px;position:relative;overflow:hidden;transition:background .2s}.proof:hover{background:${t.bg3}}
.pn{font-family:${t.fd};font-size:76px;color:rgba(128,128,128,.07);position:absolute;right:28px;top:14px;line-height:1;pointer-events:none}
.pt{font-family:${t.fd};font-size:clamp(20px,2.6vw,28px);line-height:1.2;margin-bottom:10px}.pt em{font-style:italic;color:${t.accent}}
.pb{font-size:15px;color:${t.ink2};line-height:1.8;max-width:620px;margin-bottom:14px}
.pr{display:inline-flex;align-items:center;gap:7px;font-size:14px;font-weight:600;color:${t.accent}}.pr::before{content:"→"}
.wg{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.wc{border:1px solid rgba(128,128,128,.12);padding:30px 26px;position:relative;overflow:hidden;background:${t.bg};transition:border-color .2s}.wc::before{content:"";position:absolute;top:0;left:0;width:3px;height:0;background:${t.accent};transition:height .3s}.wc:hover::before{height:100%}
.wi{font-size:26px;margin-bottom:12px}.wt{font-size:16px;font-weight:600;color:${t.ink};margin-bottom:9px}.wd{font-size:14px;color:${t.ink2};line-height:1.8}
#contact{background:${t.altBg};color:${t.altC};text-align:center;padding:96px 48px}
#contact .sl{color:rgba(128,128,128,.38)}#contact .st{color:${t.altC};max-width:420px;margin-left:auto;margin-right:auto}
.cs{font-size:16px;color:rgba(${aO},.5);max-width:420px;margin:0 auto 40px;line-height:1.8}
.ce{font-family:${t.fd};font-size:21px;color:${t.accent};text-decoration:none;border-bottom:1px solid rgba(128,128,128,.2);padding-bottom:3px;transition:all .2s}.ce:hover{color:${t.altC}}
.cn{margin-top:40px;font-size:12px;color:rgba(128,128,128,.32);letter-spacing:.06em}
footer{background:${t.altBg};padding:18px 48px;display:flex;justify-content:space-between;border-top:1px solid rgba(128,128,128,.08)}
footer p{font-size:12px;color:rgba(128,128,128,.22);letter-spacing:.04em}
@media(max-width:768px){nav{padding:14px 20px}nav ul{display:none}.hero{grid-template-columns:1fr}.hl{padding:56px 20px 36px;border-right:none;border-bottom:1px solid rgba(128,128,128,.1)}.hr{padding:36px 20px 52px}.ag{grid-template-columns:1fr;gap:36px}.wg{grid-template-columns:1fr}section{padding:68px 20px}.proof{padding:26px 20px}footer{flex-direction:column;gap:4px;text-align:center}}
</style></head><body>
<nav><a href="#" class="nl">${data.name||"Your Name"}</a><ul><li><a href="#about">${nav0}</a></li><li><a href="#proofs">${nav1}</a></li><li><a href="#forwho">${nav2}</a></li><li><a href="#contact">${nav3}</a></li></ul></nav>
<section class="hero" id="home"><div class="hl"><div class="ey">${data.title||""}</div><h1>${data.name||"Your Name"}</h1>
<p class="hk">${(data.hook||"").replace(/《(.+?)》/g,"<em>$1</em>")}</p>
<p class="hs">${(data.about||"").substring(0,90)}${(data.about||"").length>90?"...":""}</p>
<div class="btns"><a href="#contact" class="bp">${btnA}</a><a href="#proofs" class="bs">${btnB}</a></div></div>
<div class="hr"><div class="sg">${proofs.slice(0,4).map((p,i)=>`<div class="sc"><div class="sn">0${i+1}</div><div class="sd">${p.title||""}</div></div>`).join("")}</div>
<div class="tgs">${kws.map(k=>`<span class="tg">${k}</span>`).join("")}</div></div></section>
<section id="about"><div class="ag"><div><div class="sl">${lbl0}</div><h2 class="st">${ta0}<br>${ta1}<em>${ta2}</em></h2>
<div class="ab">${(data.about||"").split("\n").filter(Boolean).map(p=>`<p>${p}</p>`).join("")||`<p>${data.about||""}</p>`}</div></div>
<div class="cl">${caps.map(c=>`<div class="ci"><div class="ca">→</div><div><div class="ct">${c.title||""}</div><div class="cd">${c.desc||""}</div></div></div>`).join("")}</div></div></section>
<section id="proofs"><div class="sl">${lbl1}</div><h2 class="st">${tb0}<br>${tb1}<em>${tb2}</em></h2>
<div class="pl">${proofs.map((p,i)=>`<div class="proof"><div class="pn">0${i+1}</div><h3 class="pt">${p.title||""}</h3><p class="pb">${p.body||""}</p><div class="pr">${p.result||""}</div></div>`).join("")}</div></section>
<section id="forwho" style="background:${t.bg2}"><div class="sl">${lbl2}</div><h2 class="st">${tc0}<br>${tc1}<em>${tc2}</em></h2>
<div class="wg">${forwho.map(w=>`<div class="wc"><div class="wi">${w.icon||"🎯"}</div><div class="wt">${w.title||""}</div><div class="wd">${w.desc||""}</div></div>`).join("")}</div></section>
<section id="contact"><div class="sl">${lbl3}</div><h2 class="st">${td0}<br><em>${td1}</em></h2>
<p class="cs">${cBody}</p><a href="mailto:${data.email||""}" class="ce">${data.email||"your@email.com"}</a>
<p class="cn">${cNote}</p></section>
<footer><p>© 2025 ${data.name||"Your Name"}</p><p>${L.siteFooter}</p></footer>
</body></html>`;
}

/* ══════════════════════════════════════
   MAIN APP
══════════════════════════════════════ */
const STYLES_DEF = ["editorial","darktech","boldminimal","softgradient"];
const STYLE_SNAME_COLORS = {
  editorial: {bg:"#f7f4ef",color:"#1a1814"},
  darktech:  {bg:"#0d1117",color:"#e6edf3"},
  boldminimal:{bg:"#fff",color:"#111"},
  softgradient:{bg:"#f0eef8",color:"#3d2b6b"},
};

export default function PageMe() {
  const [lang, setLangRaw] = useState(() => detectDefaultLang());
  const [langLocked, setLangLocked] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [step, setStep] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState("editorial");
  const [siteData, setSiteData] = useState(null);
  const [siteHtml, setSiteHtml] = useState("");
  const [generating, setGenerating] = useState(false);
  const [chips, setChips] = useState([]);
  const [shownChips] = useState(() => new Set());
  const [cardIdx, setCardIdx] = useState(0);
  const [dlOpen, setDlOpen] = useState(false);

  const chatRef = useRef(null);
  const iframeRef = useRef(null);
  const langRef = useRef(lang);
  langRef.current = lang;

  const L = I18N[lang];

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, aiLoading]);

  useEffect(() => {
    const id = setInterval(() => setCardIdx(i => (i+1) % I18N[langRef.current].cardLines.length), 3800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => { startConversation(lang); }, []);

  function addChips(text, currentLang) {
    const newChips = [];
    I18N[currentLang].keywords.forEach(([pat, label]) => {
      if (pat.test(text) && !shownChips.has(label)) {
        shownChips.add(label); newChips.push(label);
      }
    });
    if (newChips.length) setChips(prev => [...prev, ...newChips]);
  }

  async function callClaude(msgs, currentLang) {
    // 独立部署时走 /api/chat（Vercel Serverless）
    // 在 Claude Artifacts 环境中直接调用 Anthropic（无需 Key）
    const isArtifact = window.location.hostname === 'claude.ai' ||
                       window.location.hostname.includes('claude.ai');
    const endpoint = isArtifact
      ? "https://api.anthropic.com/v1/messages"
      : "/api/chat";

    const body = isArtifact
      ? JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: I18N[currentLang].systemPrompt, messages: msgs })
      : JSON.stringify({ system: I18N[currentLang].systemPrompt, messages: msgs });

    const headers = { "Content-Type": "application/json" };

    const res = await fetch(endpoint, { method: "POST", headers, body });
    const data = await res.json();
    if (data.error) throw new Error(typeof data.error === 'string' ? data.error : data.error.message);
    return data.content?.[0]?.text || "";
  }

  async function startConversation(currentLang) {
    setMessages([]); setHistory([]); setSiteData(null); setSiteHtml("");
    setChips([]); shownChips.clear(); setStep(0); setAiLoading(true);
    try {
      const init = [{ role: "user", content: I18N[currentLang].initMsg }];
      const reply = await callClaude(init, currentLang);
      setHistory(init);
      setMessages([{ role: "ai", text: reply }]);
    } catch {
      setMessages([{ role: "ai", text: I18N[currentLang].initFallback }]);
    }
    setAiLoading(false);
  }

  function detectInputLang(text) {
    if (langLocked) return;
    const hasCN = /[\u4e00-\u9fa5]/.test(text);
    const hasEN = /[a-zA-Z]{3,}/.test(text);
    let next = langRef.current;
    if (hasCN) next = "zh";
    else if (!hasCN && hasEN) next = "en";
    setLangLocked(true);
    if (next !== langRef.current) { setLangRaw(next); langRef.current = next; }
  }

  async function send() {
    const text = input.trim();
    if (!text || aiLoading) return;
    detectInputLang(text);
    const currentLang = langRef.current;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text }]);
    addChips(text, currentLang);
    const newHist = [...history, { role: "user", content: text }];
    setAiLoading(true);
    try {
      const reply = await callClaude(newHist, currentLang);
      setHistory([...newHist, { role: "assistant", content: reply }]);
      addChips(reply, currentLang);
      if (reply.includes("[READY_TO_GENERATE]")) {
        const m = reply.match(/```json\n?([\s\S]*?)\n?```/);
        if (m) { try { setSiteData(JSON.parse(m[1])); } catch {} }
        const clean = reply.replace("[READY_TO_GENERATE]","").replace(/```json[\s\S]*?```/,"").trim();
        setMessages(prev => [...prev, { role: "ai", text: clean + "\n\n" + I18N[currentLang].readyMsg }]);
        setStep(1);
      } else {
        setMessages(prev => [...prev, { role: "ai", text: reply }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: I18N[currentLang].networkErr }]);
    }
    setAiLoading(false);
  }

  function toggleLang() {
    const next = lang === "zh" ? "en" : "zh";
    if (history.length > 0 && !confirm(L.confirmSwitch)) return;
    setLangLocked(false);
    setLangRaw(next); langRef.current = next;
    setCardIdx(0);
    startConversation(next);
  }

  async function generate() {
    if (!siteData) return;
    setGenerating(true);
    await new Promise(r => setTimeout(r, 300));
    const html = generateWebsite(siteData, selectedStyle, langRef.current);
    setSiteHtml(html);
    setTimeout(() => { setGenerating(false); setStep(2); }, 500);
  }

  function dlBlob(c, n, m) {
    const b=new Blob([c],{type:m}), u=URL.createObjectURL(b), a=document.createElement("a");
    a.href=u; a.download=n; a.click(); URL.revokeObjectURL(u);
  }
  const baseName = () => (siteData?.name||"my").replace(/\s+/g,"-");

  const [ct, cs] = L.cardLines[cardIdx % L.cardLines.length];
  const canGen = !!siteData && !generating;

  return (
    <div style={{display:"grid",gridTemplateColumns:"380px 1fr",height:"100vh",overflow:"hidden",fontFamily:FONT,background:"#0f0e0d",color:"#fff"}}>

      {/* ── SIDEBAR ── */}
      <div style={{display:"flex",flexDirection:"column",overflow:"hidden",background:"#161412",borderRight:"1px solid rgba(255,255,255,.06)"}}>

        {/* Header */}
        <div style={{padding:"20px 20px 14px",flexShrink:0,borderBottom:"1px solid rgba(255,255,255,.06)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <div style={{width:26,height:26,background:"linear-gradient(135deg,#ff6b35,#c84b2f)",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>✦</div>
            <span style={{fontSize:14,fontWeight:600,color:"#fff"}}>PageMe</span>
            <span style={{fontSize:12,color:"rgba(255,255,255,.3)",fontWeight:400}}>by AI</span>
          </div>
          {/* Step pills */}
          <div style={{display:"flex",gap:5}}>
            {[0,1,2].map(i => (
              <div key={i} style={{flex:1,display:"flex",alignItems:"center",gap:5,padding:"6px 8px",borderRadius:7,background:i===step?"rgba(200,75,47,.12)":i<step?"rgba(255,255,255,.03)":"rgba(255,255,255,.04)",border:i===step?"1px solid rgba(200,75,47,.3)":"1px solid rgba(255,255,255,.06)"}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:i===step?"#c84b2f":i<step?"rgba(200,75,47,.4)":"rgba(255,255,255,.18)",boxShadow:i===step?"0 0 5px #c84b2f":"none"}}/>
                <span style={{fontSize:10,fontWeight:500,color:i===step?"rgba(200,75,47,.9)":"rgba(255,255,255,.3)",whiteSpace:"nowrap"}}>{L.pill[i]}</span>
              </div>
            ))}
          </div>
          {/* Lang toggle */}
          <button onClick={toggleLang} style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:20,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.09)",fontSize:10,fontWeight:500,color:"rgba(255,255,255,.45)",cursor:"pointer",marginTop:10,fontFamily:FONT}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:"#c84b2f"}}/>
            {L.langLabel}
          </button>
        </div>

        {/* Chat */}
        <div ref={chatRef} style={{flex:1,overflowY:"auto",padding:"14px 18px",display:"flex",flexDirection:"column",gap:10}}>
          {messages.map((m, i) => (
            <div key={i} style={{display:"flex",gap:8,alignItems:"flex-end",flexDirection:m.role==="user"?"row-reverse":"row"}}>
              <div style={{width:24,height:24,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,background:m.role==="ai"?"linear-gradient(135deg,#ff6b35,#c84b2f)":"rgba(255,255,255,.1)",color:"#fff"}}>
                {m.role==="ai"?"AI":"›"}
              </div>
              <div style={{maxWidth:260,padding:"9px 12px",fontSize:13,lineHeight:1.65,whiteSpace:"pre-wrap",wordBreak:"break-word",background:m.role==="ai"?"rgba(255,255,255,.07)":"#c84b2f",color:m.role==="ai"?"rgba(255,255,255,.85)":"#fff",borderRadius:m.role==="ai"?"12px 12px 12px 3px":"12px 12px 3px 12px"}}>
                {m.text}
              </div>
            </div>
          ))}
          {aiLoading && (
            <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
              <div style={{width:24,height:24,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,background:"linear-gradient(135deg,#ff6b35,#c84b2f)",color:"#fff"}}>AI</div>
              <div style={{display:"flex",gap:4,alignItems:"center",padding:"12px 14px",background:"rgba(255,255,255,.07)",borderRadius:"12px 12px 12px 3px"}}>
                {[0,.18,.36].map((d,i)=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:"rgba(255,255,255,.35)",animation:`tdrop 1.3s ease ${d}s infinite`}}/>)}
              </div>
            </div>
          )}
        </div>

        {/* Style picker */}
        {step >= 1 && (
          <div style={{padding:"10px 18px",borderTop:"1px solid rgba(255,255,255,.06)",flexShrink:0}}>
            <div style={{fontSize:10,color:"rgba(255,255,255,.28)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:8,fontWeight:500}}>{L.styleSectionLabel}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {STYLES_DEF.map((id, i) => {
                const sc = STYLE_SNAME_COLORS[id];
                return (
                  <div key={id} onClick={()=>setSelectedStyle(id)} style={{borderRadius:9,overflow:"hidden",cursor:"pointer",border:selectedStyle===id?"1.5px solid #c84b2f":"1.5px solid rgba(255,255,255,.07)",boxShadow:selectedStyle===id?"0 0 0 1px rgba(200,75,47,.25)":"none",transition:"all .2s",position:"relative"}}>
                    {selectedStyle===id && <div style={{position:"absolute",top:4,right:4,background:"#c84b2f",color:"#fff",width:14,height:14,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,zIndex:1,lineHeight:"14px",textAlign:"center"}}>✓</div>}
                    <div style={{height:60,overflow:"hidden"}}><StylePreview id={id}/></div>
                    <div style={{fontSize:9,fontWeight:500,padding:"4px 7px",background:sc.bg,color:sc.color}}>{L.styleNames[i]}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Input */}
        <div style={{padding:"10px 18px 14px",borderTop:"1px solid rgba(255,255,255,.06)",flexShrink:0}}>
          <div style={{display:"flex",gap:7,alignItems:"flex-end"}}>
            <textarea
              value={input}
              onChange={e=>{setInput(e.target.value);e.target.style.height="40px";e.target.style.height=Math.min(e.target.scrollHeight,100)+"px";}}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
              placeholder={L.placeholder}
              rows={1}
              style={{flex:1,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.09)",borderRadius:10,padding:"9px 12px",color:"rgba(255,255,255,.9)",fontSize:13,resize:"none",outline:"none",fontFamily:FONT,lineHeight:1.5,height:40,maxHeight:100,overflowY:"auto"}}
            />
            <button onClick={send} disabled={aiLoading||!input.trim()} style={{width:36,height:36,background:aiLoading||!input.trim()?"rgba(255,255,255,.07)":"linear-gradient(135deg,#ff6b35,#c84b2f)",border:"none",borderRadius:9,cursor:aiLoading||!input.trim()?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"/></svg>
            </button>
          </div>
          {step >= 1 && (
            <button onClick={generate} disabled={!canGen} style={{width:"100%",padding:"11px",background:canGen?"linear-gradient(135deg,#ff6b35,#c84b2f)":"rgba(255,255,255,.07)",border:"none",borderRadius:9,color:canGen?"#fff":"rgba(255,255,255,.2)",fontSize:13,fontWeight:600,cursor:canGen?"pointer":"not-allowed",marginTop:8,fontFamily:FONT,boxShadow:canGen?"0 3px 12px rgba(200,75,47,.3)":"none"}}>
              ✦ {L.genBtn}
            </button>
          )}
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* Header */}
        <div style={{padding:"14px 22px",borderBottom:"1px solid rgba(255,255,255,.06)",background:"#0f0e0d",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:"#fff"}}>
              {step===0?L.mainTitles[0]:step===1?L.mainTitles[1]:L.mainTitles[2]}
            </div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:2}}>
              {step===0?L.mainSubs[0]:step===1?L.mainSubs[1]:L.mainSubs[2]}
            </div>
          </div>
          {/* Download */}
          <div style={{position:"relative"}}>
            <button onClick={e=>{e.stopPropagation();setDlOpen(o=>!o);}} disabled={!siteHtml} style={{padding:"6px 13px",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.1)",borderRadius:7,color:"rgba(255,255,255,.8)",fontSize:12,fontWeight:500,cursor:siteHtml?"pointer":"not-allowed",display:"flex",alignItems:"center",gap:5,fontFamily:FONT,opacity:siteHtml?1:.3}}>
              {L.dlBtn}
              <svg width="9" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:.6,transform:dlOpen?"rotate(180deg)":"none",transition:"transform .2s"}}><path d="M1 1l4 4 4-4"/></svg>
            </button>
            {dlOpen && (
              <div onClick={e=>e.stopPropagation()} style={{position:"absolute",top:"calc(100% + 5px)",right:0,background:"#1e1c1a",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,boxShadow:"0 12px 32px rgba(0,0,0,.5)",minWidth:200,overflow:"hidden",zIndex:50}}>
                {[
                  {fn:()=>{dlBlob(siteHtml,`${baseName()}-website.html`,"text/html;charset=utf-8");setDlOpen(false);},icon:"🌐",bg:"rgba(88,166,255,.15)",n:L.dlItems.html[0],d:L.dlItems.html[1]},
                  {fn:()=>{if(!siteHtml)return;const ps=`<style>@page{size:A4;margin:0}@media print{nav{display:none!important}.hero{min-height:auto!important}section{padding:40px 48px!important}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}}</style><script>window.onload=function(){window.print();window.onafterprint=function(){window.close()}}<\/script>`;const w=window.open("","_blank");if(!w){alert(L.pdfPopup);return;}w.document.write(siteHtml.replace("</head>",ps+"</head>"));w.document.close();setDlOpen(false);},icon:"📄",bg:"rgba(255,107,53,.15)",n:L.dlItems.pdf[0],d:L.dlItems.pdf[1]},
                  {fn:async()=>{if(!siteHtml||!iframeRef.current)return;try{await new Promise((res,rej)=>{if(window.html2canvas){res();return;}const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";s.onload=res;s.onerror=rej;document.head.appendChild(s);});const d=iframeRef.current.contentDocument;const c=await html2canvas(d.body,{scale:1.5,useCORS:true,allowTaint:true,backgroundColor:null,width:d.body.scrollWidth,height:Math.min(d.body.scrollHeight,4000)});c.toBlob(b=>{const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=`${baseName()}-preview.png`;a.click();URL.revokeObjectURL(u);},"image/png");}catch{alert(L.pngFail);}setDlOpen(false);},icon:"🖼",bg:"rgba(52,211,153,.15)",n:L.dlItems.png[0],d:L.dlItems.png[1]},
                  {fn:()=>{if(!siteData)return;const d=siteData,l=[];l.push(`# ${d.name||""}`,``,`> ${d.title||""}`,``,`**${d.hook||""}**`,``);l.push(lang==="zh"?"## 关于我":"## About",d.about||"","");if(d.capabilities?.length){l.push(lang==="zh"?"## 核心能力":"## Skills");d.capabilities.forEach(c=>l.push(`- **${c.title}**: ${c.desc}`));l.push("");}if(d.proofs?.length){l.push(lang==="zh"?"## 能力证明":"## Proof of Work");d.proofs.forEach((p,i)=>{l.push(`### ${i+1}. ${p.title}`,p.body||"");if(p.result)l.push(`\n→ **${p.result}**`);l.push("");});}if(d.forwho?.length){l.push(lang==="zh"?"## 合作对象":"## Who I Help");d.forwho.forEach(w=>l.push(`- **${w.icon||""} ${w.title}**: ${w.desc}`));l.push("");}l.push(lang==="zh"?"## 联系方式":"## Contact",`📧 ${d.email||""}`,``,`*${(d.keywords||[]).join(" · ")}*`);dlBlob(l.join("\n"),`${baseName()}-profile.md`,"text/markdown;charset=utf-8");setDlOpen(false);},icon:"📝",bg:"rgba(167,139,250,.15)",n:L.dlItems.md[0],d:L.dlItems.md[1]},
                ].map((item,i)=>(
                  <button key={i} onClick={item.fn} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 12px",fontSize:12,color:"rgba(255,255,255,.8)",cursor:"pointer",border:"none",background:"none",width:"100%",textAlign:"left",fontFamily:FONT,borderTop:i>0?"1px solid rgba(255,255,255,.05)":"none"}}>
                    <div style={{width:26,height:26,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0,background:item.bg}}>{item.icon}</div>
                    <div><div style={{fontWeight:500,color:"#fff",lineHeight:1.2}}>{item.n}</div><div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginTop:1}}>{item.d}</div></div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        <div style={{flex:1,overflow:"hidden",position:"relative",background:"#0a0908"}} onClick={()=>setDlOpen(false)}>
          <AnimCanvas/>

          {/* Waiting card */}
          {step < 2 && !generating && (
            <>
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
                <div style={{background:"rgba(255,255,255,.04)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,.08)",borderRadius:18,padding:"28px 32px",textAlign:"center",maxWidth:300,pointerEvents:"all"}}>
                  <div style={{width:64,height:64,position:"relative",margin:"0 auto 18px"}}>
                    <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:18,height:18,borderRadius:"50%",background:"linear-gradient(135deg,#ff6b35,#c84b2f)",boxShadow:"0 0 16px rgba(200,75,47,.6)",animation:"orbpulse 2.4s ease-in-out infinite"}}/>
                    {[{s:64},{s:46,t:9,l:9,dur:"7s",dir:"reverse"},{s:80,t:-8,l:-8,dur:"10s"}].map((r,i)=>(
                      <div key={i} style={{position:"absolute",top:r.t??0,left:r.l??0,width:r.s,height:r.s,borderRadius:"50%",border:`1px solid rgba(200,75,47,${[.25,.2,.1][i]})`,animation:`orbspin ${r.dur||"4s"} linear infinite`,animationDirection:r.dir||"normal"}}/>
                    ))}
                  </div>
                  <div style={{fontSize:15,fontWeight:600,color:"#fff",marginBottom:8,letterSpacing:"-.2px"}}>
                    {ct}<span style={{animation:"cblink .9s step-end infinite",marginLeft:1,color:"#c84b2f"}}>|</span>
                  </div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,.38)",lineHeight:1.7}}>{cs}</div>
                </div>
              </div>
              {/* Chips */}
              <div style={{position:"absolute",bottom:20,left:20,right:20,display:"flex",gap:7,flexWrap:"wrap",pointerEvents:"none"}}>
                {chips.map((label,i)=>(
                  <div key={i} style={{background:"rgba(255,255,255,.06)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,.1)",borderRadius:18,padding:"4px 11px",fontSize:11,color:"rgba(255,255,255,.65)",display:"flex",alignItems:"center",gap:5}}>
                    <div style={{width:5,height:5,borderRadius:"50%",background:"#c84b2f",animation:"icpulse 2s infinite"}}/>
                    {label}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Generating */}
          {generating && (
            <div style={{position:"absolute",inset:0,background:"rgba(10,9,8,.85)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14,zIndex:10}}>
              <div style={{width:48,height:48,border:"3px solid rgba(255,255,255,.1)",borderTopColor:"#c84b2f",borderRadius:"50%",animation:"spin .9s linear infinite"}}/>
              <div style={{fontSize:13,color:"rgba(255,255,255,.7)",fontWeight:500}}>{L.genOverlay[0]}</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:-6}}>{L.genOverlay[1]}</div>
            </div>
          )}

          {/* Site iframe */}
          {step >= 2 && !generating && (
            <div style={{position:"absolute",inset:0,background:"#fff"}}>
              <iframe ref={iframeRef} srcDoc={siteHtml} sandbox="allow-scripts allow-same-origin" style={{width:"100%",height:"100%",border:"none"}}/>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes tdrop{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-5px);opacity:1}}
        @keyframes orbpulse{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.15)}}
        @keyframes orbspin{to{transform:rotate(360deg)}}
        @keyframes cblink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes icpulse{0%,100%{opacity:1}50%{opacity:.35}}
        @keyframes spin{to{transform:rotate(360deg)}}
        textarea::-webkit-scrollbar{width:3px}textarea::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:2px}
        div::-webkit-scrollbar{width:3px}div::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:2px}
        button:hover{opacity:.9}
      `}</style>
    </div>
  );
}
