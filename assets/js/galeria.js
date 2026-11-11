/* Hero "galeria no chão": obras do Veríssimo em quadros estilizados, largados num chão de concreto escuro sob uma luz quente.
   Em cada quadro, a obra seguinte cobre a anterior com tinta (borda molhada, preto e cinza, depois cor); os quadros trocam
   em onda, um depois do outro. No quadro principal, coberturas reais: a tatuagem antiga dá lugar ao trabalho novo.
   galeria(canvas, {imgs:{nome:Image}, meta:{nome:[cx,cy,z]}, quadros:[...], fundo:[ini,fim], guardar, tam})
     -> {P, desenha(t, dpr, par)}   (par = deslocamento do mouse em px CSS) */
(function () {
  var P = 13, TR = 6.8, CICLO = 52, W1 = 2 * Math.PI / 52, PARES = ['dragao', 'cerejeira', 'pastor', 'onca'];
  var SEM = { dragao: [.5, .42], cerejeira: [.5, .4], pastor: [.5, .45], onca: [.42, .72] };
  var RUIDO = 'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}' +
    'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}' +
    'float fb(vec2 p){float a=.5,r=0.;for(int k=0;k<5;k++){r+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return r;}';
  var VQ = 'attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;uv.y=1.-uv.y;gl_Position=vec4(p,0.,1.);}';
  /* chão: concreto escuro, poros, luz quente de cima e, embaixo, a cor da página */
  var FCHAO = ['precision highp float;varying vec2 uv;uniform vec2 res,par,fd;', RUIDO,
    'void main(){',
    ' vec2 px=uv*res-par*.35; vec2 q=px/res.y;',
    ' float m=fb(q*2.6)*.6+fb(q*9.)*.3+n(q*70.)*.1;',
    ' vec3 c=vec3(.074,.069,.065)*(.84+.32*m);',
    ' c-=step(.988,h(floor(px/2.)))*.014;',
    ' float ri=smoothstep(.0,.004,abs(fract(q.x*1.3+q.y*.2+fb(q*4.)*.15)-.5)-.497);',
    ' c*=1.-.06*(1.-ri);',
    ' vec2 d=(uv-vec2(.5,.36))*vec2(res.x/res.y,1.);',
    ' float sp=exp(-dot(d,d)*2.);',
    ' c+=vec3(.11,.06,.032)*sp*.6+vec3(.025)*sp;',
    ' c*=1.-.4*smoothstep(.35,1.25,length(d));',
    ' c=mix(c,vec3(.0392,.0392,.0431),smoothstep(fd.x,fd.y,uv.y));',
    ' c+=(h(uv*res)-.5)*.012;',
    ' gl_FragColor=vec4(c,1.);}'].join('\n');
  var VR = ['attribute vec2 p;uniform vec2 res,cen,meia,ex;uniform float rot,esc;varying vec2 lp;',
    'void main(){vec2 l=p*(meia+ex);lp=l;float c=cos(rot),s=sin(rot);',
    ' vec2 w=vec2(c*l.x-s*l.y,s*l.x+c*l.y)*esc+cen;vec2 k=w/res*2.-1.;gl_Position=vec4(k.x,-k.y,0.,1.);}'].join('\n');
  var FSOMBRA = ['precision highp float;varying vec2 lp;uniform vec2 meia;uniform float blur,forca;',
    'float sd(vec2 p,vec2 b){vec2 d=abs(p)-b;return length(max(d,0.))+min(max(d.x,d.y),0.);}',
    'void main(){float d=sd(lp,meia);float a=(1.-smoothstep(-blur,blur,d))*forca;gl_FragColor=vec4(0.,0.,0.,a);}'].join('\n');
  /* quadro: moldura (3 estilos), passe-partout com chanfro, janela da obra com a cobertura em tinta e o vidro */
  var FQUADRO = ['precision highp float;varying vec2 lp;',
    'uniform vec2 meia;uniform float bo,ma,est,px,alfa,luz;',
    'uniform sampler2D A,B;uniform vec3 zA,zB;uniform vec2 c0;uniform float s,modo,dA,dB;', RUIDO,
    'const vec3 LUM=vec3(.299,.587,.114);',
    'vec3 cinza(vec3 c){float l=dot(c,LUM);l=smoothstep(-.02,1.03,l);return vec3(pow(l,1.1))*vec3(1.,.985,.96);}',
    'vec3 estudio(vec2 u){float r=length((u-vec2(.5,.36))*vec2(1.,.8));return mix(vec3(.12,.112,.106),vec3(.04,.038,.037),smoothstep(0.,.78,r));}',
    'vec3 obra(sampler2D T,vec3 z,vec2 u,float velha){vec4 t=texture2D(T,(u-.5)/z.z+z.xy);',
    ' vec3 c=t.rgb; c=mix(c,mix(c,vec3(dot(c,LUM)),.3)*.92,velha); return mix(estudio(u),c,t.a);}',
    'vec3 arte(vec2 u){',
    ' vec3 a=obra(A,zA,u,dA); if(s<0.) return a;',
    ' vec3 b=obra(B,zB,u,dB);',
    ' if(modo>1.5){ float k=fb(u*5.+3.); return mix(a,b,smoothstep(k-.12,k+.12,clamp(s/1.6,0.,1.)*1.5-.22)); }',
    ' vec2 q=(u-c0)*vec2(.8,1.); float di=length(q)*2.;',
    ' float r1=pow(clamp(s/4.6,0.,1.),.85)*2.15, r2=pow(clamp((s-1.9)/4.6,0.,1.),.85)*2.15;',
    ' float e1=di+(fb(q*3.6+vec2(2.,7.))-.5)*.42+(fb(q*16.)-.5)*.07;',
    ' float e2=di+(fb(q*3.1+vec2(9.,1.))-.5)*.46+(fb(q*14.+3.)-.5)*.08;',
    ' float m1=(1.-smoothstep(r1-.045,r1,e1))*step(.001,r1);',
    ' float m2=(1.-smoothstep(r2-.07,r2,e2))*step(.001,r2);',
    ' vec3 o=mix(a,cinza(b),m1); o=mix(o,b,m2);',
    ' float viva=step(.001,r1)*(1.-smoothstep(1.85,2.15,r1));',
    ' float rim=exp(-pow((e1-r1+.03)/.028,2.))*viva, bri=exp(-pow((e1-r1+.012)/.006,2.))*viva;',
    ' o*=1.-.5*rim; o+=bri*.1;',
    ' float vc=step(.001,r2)*(1.-smoothstep(1.85,2.15,r2)); float rc=exp(-pow((e2-r2+.04)/.05,2.))*vc;',
    ' o+=(o-vec3(dot(o,LUM)))*.25*rc;',
    ' return o;}',
    'void main(){',
    ' vec2 dd=meia-abs(lp); float d=min(dd.x,dd.y);',
    ' float aa=smoothstep(0.,1.2*px,d); if(aa<=0.) discard;',
    ' vec2 nr=dd.x<dd.y?vec2(sign(lp.x),0.):vec2(0.,sign(lp.y)); float lit=dot(nr,vec2(-.6,-.8));',
    ' vec2 jan=meia-bo-ma; vec3 col;',
    ' if(d<bo){',
    '  float t=d/bo, perf=sin(t*3.14159);',
    '  vec3 base=est<.5?vec3(.032,.031,.033):est<1.5?vec3(.15,.092,.058):vec3(.42,.29,.18);',
    '  float veio=est>.5&&est<1.5?fb(vec2((nr.x!=0.?lp.y:lp.x)*.012,(nr.x!=0.?lp.x:lp.y)*.35)):.5;',
    '  float esc=est>1.5?fb(vec2((nr.x!=0.?lp.y:lp.x)*.004,(nr.x!=0.?lp.x:lp.y)*2.)):.5;',
    '  col=base*(.7+.55*perf)*(.85+.3*veio)*(.92+.16*esc);',
    '  col+=vec3(lit*(est>1.5?.12:.05))*perf;',
    '  col+=vec3(.06)*smoothstep(.16,0.,t)*max(lit,0.);',
    '  col*=1.-.55*smoothstep(.82,1.,t);',
    ' } else if(d<bo+ma){',
    '  vec3 pp=est<.5?vec3(.925,.9,.855):vec3(.055,.053,.052);',
    '  col=pp*(.97+.05*(n(lp*.35/px)*.5+n(lp*1.2/px)*.5));',
    '  col*=1.-.28*exp(-(d-bo)/(4.*px));',
    '  float dw=bo+ma-d;',
    '  col=mix(col,(est<.5?vec3(1.,.985,.95):vec3(.2,.19,.18))*(.9-.1*lit),smoothstep(3.*px,.5*px,dw));',
    ' } else {',
    '  vec2 u=(lp+jan)/(2.*jan);',
    '  col=arte(u);',
    '  col*=1.-.42*exp(-(d-bo-ma)/(5.*px));',
    ' }',
    ' if(d>bo){ float g=(lp.x*.55+lp.y*.83)/length(meia)+luz;',
    '  col+=vec3(.05)*smoothstep(-.2,.05,g)*smoothstep(.45,.08,g)+vec3(.025)*smoothstep(.55,.62,g)*smoothstep(.75,.62,g); }',
    ' gl_FragColor=vec4(col*aa*alfa,aa*alfa);}'].join('\n');

  function ease(x) { x = Math.min(1, Math.max(0, x)); return 1 - Math.pow(1 - x, 3); }

  window.galeria = function (cv, op) {
    var gl = cv.getContext('webgl', { antialias: true, alpha: false, premultipliedAlpha: true, preserveDrawingBuffer: !!op.guardar, powerPreference: 'high-performance' });
    if (!gl) return null;
    function sh(tp, src) { var o = gl.createShader(tp); gl.shaderSource(o, src); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(o); return o; }
    function prog(v, f) {
      var p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, v)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, f));
      gl.bindAttribLocation(p, 0, 'p'); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw gl.getProgramInfoLog(p);
      var u = {}, k = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (var i = 0; i < k; i++) { var nm = gl.getActiveUniform(p, i).name; u[nm] = gl.getUniformLocation(p, nm); }
      return { p: p, u: u };
    }
    var CH = prog(VQ, FCHAO), SO = prog(VR, FSOMBRA), QU = prog(VR, FQUADRO);
    var bf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    var TX = {};
    Object.keys(op.imgs).forEach(function (k) {
      var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, op.imgs[k]);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      TX[k] = t;
    });
    var M = op.meta || {};
    var Z = function (k) { return M[k] || [.5, .5, 1]; };
    var Q = op.quadros.map(function (q, k) { q.k = k; return q; }).sort(function (a, b) { return a.w - b.w; });

    /* estado de um quadro no tempo t: obras A e B, tempo da troca (s<0 = parado) e modo */
    function estado(q, t) {
      var sl = ((t - q.off) % CICLO + CICLO) % CICLO, i = Math.floor(sl / P), si = sl - i * P;
      if (q.cob != null) {
        var pa = PARES[(q.cob + i) % 4], pb = PARES[(q.cob + i + 1) % 4];
        if (si < 1.8) return { A: pa + '-a', B: pa + '-d', s: -1, modo: 1, dA: 1, dB: 0, c0: SEM[pa] };
        if (si < P - 1.6) return { A: pa + '-a', B: pa + '-d', s: si - 1.8, modo: 1, dA: 1, dB: 0, c0: SEM[pa] };
        return { A: pa + '-d', B: pb + '-a', s: si - (P - 1.6), modo: 2, dA: 0, dB: 1, c0: SEM[pb] };
      }
      var n = q.arts.length, a = q.arts[i % n], b = q.arts[(i + 1) % n];
      return { A: a, B: b, s: si - (P - TR), modo: 0, dA: 0, dB: 0, c0: [.5, .44] };
    }
    return {
      P: P, CICLO: CICLO,
      desenha: function (t, dpr, par) {
        var r = cv.getBoundingClientRect(); dpr = Math.min(dpr || 1, 2);
        var W = op.tam ? op.tam[0] : Math.max(2, Math.round(r.width * dpr)), H = op.tam ? op.tam[1] : Math.max(2, Math.round(r.height * dpr));
        if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
        var u = op.tam ? 1 : dpr; par = par || [0, 0];
        var dx = (par[0] + Math.sin(t * W1) * 5) * u, dy = (par[1] + Math.cos(t * W1 * 2) * 4) * u;
        gl.viewport(0, 0, W, H);
        gl.disable(gl.BLEND);
        gl.useProgram(CH.p);
        gl.uniform2f(CH.u.res, W, H); gl.uniform2f(CH.u.par, dx, dy); gl.uniform2f(CH.u.fd, op.fundo[0], op.fundo[1]);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        Q.forEach(function (q) {
          var e = ease((t - .15 - q.ordem * .14) / 1.35), lev = 1 - e;
          var fw = q.w * H, est = q.est;
          var bo = fw * (est === 0 ? .052 : est === 1 ? .046 : .02), ma = fw * (est === 0 ? .085 : est === 1 ? .06 : 0);
          var jw = fw - 2 * (bo + ma), fh = jw * 1.25 + 2 * (bo + ma);
          var rot = (q.rot + Math.sin(t * W1 * 2 + q.k * 1.7) * .3) * Math.PI / 180;
          var esc = 1 + .07 * lev, dep = q.dep || .8;
          var cx = W / 2 + q.x * H + dx * dep, cy = q.y * H + dy * dep - 10 * u * lev;
          // sombra larga e sombra de contato
          gl.useProgram(SO.p);
          gl.uniform2f(SO.u.res, W, H); gl.uniform1f(SO.u.rot, rot); gl.uniform1f(SO.u.esc, esc);
          [[(10 + 26 * lev) * u * q.w * 2.4, (14 + 30 * lev) * u * q.w * 2.4, (16 + 30 * lev) * u, .5 * e], [3 * u, 4 * u, 3 * u, .55 * e]].forEach(function (s) {
            gl.uniform2f(SO.u.cen, cx + s[0], cy + s[1]); gl.uniform2f(SO.u.meia, fw / 2, fh / 2);
            gl.uniform2f(SO.u.ex, s[2] * 2, s[2] * 2); gl.uniform1f(SO.u.blur, s[2]); gl.uniform1f(SO.u.forca, s[3]);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
          });
          var st = estado(q, t);
          gl.useProgram(QU.p);
          gl.uniform2f(QU.u.res, W, H); gl.uniform2f(QU.u.cen, cx, cy); gl.uniform2f(QU.u.meia, fw / 2, fh / 2); gl.uniform2f(QU.u.ex, 0, 0);
          gl.uniform1f(QU.u.rot, rot); gl.uniform1f(QU.u.esc, esc);
          gl.uniform1f(QU.u.bo, bo); gl.uniform1f(QU.u.ma, ma); gl.uniform1f(QU.u.est, est); gl.uniform1f(QU.u.px, u);
          gl.uniform1f(QU.u.alfa, Math.min(1, e * 1.6)); gl.uniform1f(QU.u.luz, dx / W * .5 + Math.sin(t * W1 + q.k) * .06);
          gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, TX[st.A]); gl.uniform1i(QU.u.A, 0);
          gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, TX[st.B]); gl.uniform1i(QU.u.B, 1);
          var za = Z(st.A), zb = Z(st.B);
          gl.uniform3f(QU.u.zA, za[0], za[1], za[2]); gl.uniform3f(QU.u.zB, zb[0], zb[1], zb[2]);
          gl.uniform2f(QU.u.c0, st.c0[0], st.c0[1]); gl.uniform1f(QU.u.s, st.s); gl.uniform1f(QU.u.modo, st.modo);
          gl.uniform1f(QU.u.dA, st.dA); gl.uniform1f(QU.u.dB, st.dB);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        });
      }
    };
  };
  /* composições: x em alturas a partir do centro, y em alturas a partir do topo, w = largura do quadro em alturas */
  window.GALERIA = {
    pc: [
      { cob: 0, x: 0, y: .385, w: .40, rot: -2, est: 0, dep: 1, off: 0, ordem: 0 },
      { arts: ['leao-chamas', 'jesus-cor'], x: -.47, y: .34, w: .28, rot: 6.5, est: 1, dep: .85, off: 1.9, ordem: 1 },
      { arts: ['santa-rita', 'tigre'], x: .46, y: .36, w: .29, rot: -5, est: 2, dep: .85, off: 3.8, ordem: 2 },
      { arts: ['itachi', 'retrato-asas'], x: -.86, y: .25, w: .25, rot: -9, est: 0, dep: .7, off: 5.7, ordem: 3 },
      { arts: ['indigena', 'rosto-cosmico'], x: .85, y: .23, w: .25, rot: 8, est: 1, dep: .7, off: 7.6, ordem: 4 },
      { arts: ['samurai-pc', 'urso'], x: -.80, y: .76, w: .22, rot: 11, est: 2, dep: .6, off: 9.5, ordem: 5 },
      { cob: 2, x: .81, y: .77, w: .22, rot: -7, est: 0, dep: .6, off: 11.4, ordem: 6 }
    ],
    baixa: [
      { cob: 0, x: 0, y: .31, w: .3, rot: -2, est: 0, dep: 1, off: 0, ordem: 0 },
      { arts: ['leao-chamas', 'jesus-cor'], x: -.5, y: .3, w: .25, rot: 6.5, est: 1, dep: .85, off: 1.9, ordem: 1 },
      { arts: ['santa-rita', 'tigre'], x: .5, y: .32, w: .25, rot: -5, est: 2, dep: .85, off: 3.8, ordem: 2 },
      { arts: ['itachi', 'retrato-asas'], x: -.92, y: .28, w: .24, rot: -9, est: 0, dep: .7, off: 5.7, ordem: 3 },
      { arts: ['indigena', 'rosto-cosmico'], x: .92, y: .27, w: .24, rot: 8, est: 1, dep: .7, off: 7.6, ordem: 4 },
      { arts: ['samurai-pc', 'urso'], x: -1.32, y: .38, w: .22, rot: 11, est: 2, dep: .6, off: 9.5, ordem: 5 },
      { cob: 2, x: 1.32, y: .4, w: .22, rot: -7, est: 0, dep: .6, off: 11.4, ordem: 6 }
    ],
    cel: [
      { arts: ['leao-chamas', 'jesus-cor'], x: -.27, y: .15, w: .25, rot: 9, est: 1, dep: .8, off: 2.6, ordem: 1 },
      { arts: ['santa-rita', 'tigre'], x: .27, y: .16, w: .25, rot: -8, est: 2, dep: .8, off: 5.2, ordem: 2 },
      { arts: ['itachi', 'retrato-asas'], x: -.28, y: .84, w: .24, rot: -7, est: 2, dep: .7, off: 7.8, ordem: 3 },
      { arts: ['indigena', 'rosto-cosmico'], x: .28, y: .85, w: .24, rot: 10, est: 1, dep: .7, off: 10.4, ordem: 4 },
      { cob: 0, x: 0, y: .5, w: .5, rot: -3, est: 0, dep: 1, off: 0, ordem: 0 }
    ]
  };
})();
