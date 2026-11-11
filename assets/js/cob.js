/* Hero "cobertura ao vivo": a tatuagem antiga, e a nova cobrindo por cima.
   A tinta preta avança do ponto da peça (com a borda molhada), o desenho entra em preto e cinza
   e a cor vem logo atrás, como numa sessão acelerada. Depois passa para a próxima cobertura.
   cobHero(canvas, pares[[imgAntes, imgDepois, [sx, sy]], ...], {guardar}) -> {P, n, fase(T), desenha(T, dpr)} */
(function () {
  var P = 8.0;                       // segundos por cobertura
  var VS = 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;v.y=1.-v.y;gl_Position=vec4(p,0.,1.);}';
  var FS = [
    'precision highp float;',
    'varying vec2 v;',
    'uniform sampler2D A,D,N;uniform vec2 c0;uniform float s,P;uniform vec2 res;',
    'const vec3 LUM=vec3(.299,.587,.114);',
    'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
    ' return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}',
    'float fb(vec2 p){float a=.5,r=0.;for(int k=0;k<5;k++){r+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return r;}',
    'float ease(float x){x=clamp(x,0.,1.);return x<.5?4.*x*x*x:1.-pow(-2.*x+2.,3.)/2.;}',
    'vec3 cinza(vec3 c){float l=dot(c,LUM);l=smoothstep(-.02,1.03,l);l=pow(l,1.1);return vec3(l)*vec3(1.,.985,.96);}',
    'vec3 tx(sampler2D T,vec2 u,float z){return texture2D(T,(u-.5)/z+.5).rgb;}',
    'void main(){',
    ' float z=1.05-.05*ease(s/P);',
    ' vec3 a=tx(A,v,z), d=tx(D,v,z);',
    ' vec3 an=mix(a,vec3(dot(a,LUM)),.3)*.92;',
    ' vec2 q=(v-c0)*vec2(.8,1.);',
    ' float dist=length(q)*2.;',
    // duas frentes: tinta (preto e cinza) e cor, com bordas orgânicas diferentes
    ' float r1=pow(clamp((s-1.1)/3.5,0.,1.),.85)*1.75, r2=pow(clamp((s-2.5)/3.5,0.,1.),.85)*1.75;',
    ' float e1=dist+(fb(q*3.6+vec2(2.,7.))-.5)*.42+(fb(q*16.)-.5)*.07;',
    ' float e2=dist+(fb(q*3.1+vec2(9.,1.))-.5)*.46+(fb(q*14.+3.)-.5)*.08;',
    ' float m1=(1.-smoothstep(r1-.045,r1,e1))*step(.001,r1);',
    ' float m2=(1.-smoothstep(r2-.07,r2,e2))*step(.001,r2);',
    ' vec3 o=mix(an,cinza(d),m1);',
    ' o=mix(o,d,m2);',
    // borda molhada da tinta: escurece e tem um brilho fino
    ' float viva=step(.001,r1)*(1.-smoothstep(1.5,1.75,r1));',
    ' float rim=exp(-pow((e1-r1+.03)/.028,2.))*viva;',
    ' float bri=exp(-pow((e1-r1+.012)/.006,2.))*viva;',
    ' o*=1.-.5*rim; o+=bri*.10;',
    ' float vc=step(.001,r2)*(1.-smoothstep(1.5,1.75,r2));',
    ' float rc=exp(-pow((e2-r2+.04)/.05,2.))*vc;',
    ' o+=(o-vec3(dot(o,LUM)))*.25*rc;',
    // troca para a próxima cobertura: dissolve em tinta
    ' float tr=smoothstep(P-.9,P,s);',
    ' float k=fb(v*5.+vec2(s*.1,0.));',
    ' float mt=smoothstep(k-.12,k+.12,tr*1.25-.12);',
    ' vec3 nx=texture2D(N,(v-.5)/1.05+.5).rgb; nx=mix(nx,vec3(dot(nx,LUM)),.3)*.92;',
    ' o=mix(o,nx,mt)*(1.-.35*sin(tr*3.1416));',
    // vinheta e grão
    ' vec2 w=v-.5; o*=1.-.32*pow(length(w*vec2(1.1,.95))*1.35,2.2);',
    ' o+=(h(v*res+fract(s)*91.)-.5)*.018;',
    ' gl_FragColor=vec4(o,1.);}'
  ].join('\n');

  window.cobHero = function (cv, pares, op) {
    op = op || {};
    var gl = cv.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: !!op.guardar, powerPreference: 'low-power' });
    if (!gl) return null;
    function sh(tp, src) { var o = gl.createShader(tp); gl.shaderSource(o, src); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(o); return o; }
    var pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
    var bf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var lp = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    function tex(img) {
      var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    }
    var T = pares.map(function (p) { return [tex(p[0]), tex(p[1]), p[2] || [.5, .5]]; });
    var U = {}; ['A', 'D', 'N', 'c0', 's', 'P', 'res'].forEach(function (k) { U[k] = gl.getUniformLocation(pr, k); });
    gl.uniform1i(U.A, 0); gl.uniform1i(U.D, 1); gl.uniform1i(U.N, 2); gl.uniform1f(U.P, P);
    var n = T.length;
    function fase(t) { var i = Math.floor(t / P) % n; return { i: i, s: t - Math.floor(t / P) * P }; }
    return {
      P: P, n: n, fase: fase,
      desenha: function (t, dpr) {
        var r = cv.getBoundingClientRect(); dpr = Math.min(dpr || 1, 2);
        var W = Math.max(2, Math.round(r.width * dpr)), H = Math.max(2, Math.round(r.height * dpr));
        if (op.tam) { W = op.tam[0]; H = op.tam[1]; }
        if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
        gl.viewport(0, 0, W, H);
        var f = fase(t), c = T[f.i], nx = T[(f.i + 1) % n];
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, c[0]);
        gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, c[1]);
        gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, nx[0]);
        gl.uniform2f(U.c0, c[2][0], c[2][1]); gl.uniform1f(U.s, f.s); gl.uniform2f(U.res, W, H);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    };
  };
})();
