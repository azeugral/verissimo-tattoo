/* Hero "valores primeiro, depois a cor": cada tatuagem surge em preto e cinza
   e a cor se espalha do centro, como na pintura realista. WebGL1, sem dependências.
   veroHero(canvas, {guardar}) -> {textura(i, img), desenha(t, lado, dpr), fase(t), n, P} */
(function () {
  var P = 6.5;            // segundos por peça
  var FLOOD0 = 1.15, FLOOD = 2.3, TROCA = 0.95;

  var VS = 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;v.y=1.-v.y;gl_Position=vec4(p,0.,1.);}';
  var FS = [
    'precision highp float;',
    'varying vec2 v;',
    'uniform sampler2D A,B;uniform float s,P,F0,F,TR,tm;',
    'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
    ' return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}',
    'float fb(vec2 p){float a=.5,r=0.;for(int k=0;k<5;k++){r+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return r;}',
    'vec3 cinza(vec3 c){float l=dot(c,vec3(.299,.587,.114));l=smoothstep(-.02,1.04,l);l=pow(l,1.12);return vec3(l)*vec3(1.,.985,.955);}',
    'vec3 tx(sampler2D T,vec2 u,float z){return texture2D(T,(u-.5)/z+.5).rgb;}',
    'float ease(float x){x=clamp(x,0.,1.);return x<.5?4.*x*x*x:1.-pow(-2.*x+2.,3.)/2.;}',
    'void main(){',
    ' vec2 q=v-.5; float d=length(q)*2.;',
    ' float z=1.035-.035*ease(s/P);',
    ' vec3 c=tx(A,v,z), g=cinza(c);',
    // frente de cor: raio cresce do centro, borda orgânica
    ' float r=ease((s-F0)/F)*1.32;',
    ' float e=d+(fb(q*5.+vec2(s*.05,0.))-.5)*.34;',
    ' float m=(1.-smoothstep(r-.07,r,e))*step(.001,r);',
    ' float borda=exp(-pow((e-r+.03)/.035,2.))*step(.001,r)*(1.-step(1.3,r));',
    ' vec3 cor=c+(c-vec3(dot(c,vec3(.333))))*.12*borda+borda*vec3(.09,.035,0.);',
    ' vec3 o=mix(g,cor,m);',
    // troca: dissolve em tinta para a próxima peça (em preto e cinza)
    ' float k=clamp((s-(P-TR))/TR,0.,1.);',
    ' if(k>0.){float z2=1.035; vec3 g2=cinza(tx(B,v,z2));',
    '  float th=fb(q*3.2+vec2(7.,3.))*.7+d*.3; float w=smoothstep(th-.06,th+.06,ease(k)*1.12);',
    '  o=mix(o,g2,w);}',
    ' o*=mix(1.,.72,smoothstep(.55,1.02,d));',
    ' o+=(h(v*900.+tm)-.5)*.022;',
    ' gl_FragColor=vec4(o,1.);}'
  ].join('\n');

  window.veroHero = function (cv, op) {
    op = op || {};
    var gl = cv.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: !!op.guardar, powerPreference: 'low-power' });
    if (!gl) return null;
    function sh(t, src) { var o = gl.createShader(t); gl.shaderSource(o, src); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(o); return o; }
    var pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pr); gl.useProgram(pr);
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var lp = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0);
    var U = {}; ['A', 'B', 's', 'P', 'F0', 'F', 'TR', 'tm'].forEach(function (k) { U[k] = gl.getUniformLocation(pr, k); });
    gl.uniform1i(U.A, 0); gl.uniform1i(U.B, 1);
    gl.uniform1f(U.P, P); gl.uniform1f(U.F0, FLOOD0); gl.uniform1f(U.F, FLOOD); gl.uniform1f(U.TR, TROCA);
    var tex = [];
    var api = {
      P: P, n: 0,
      textura: function (i, img) {
        var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        tex[i] = t; api.n = tex.length;
      },
      fase: function (t) {
        var n = Math.max(api.n, 1), i = Math.floor(t / P) % n, s = t % P;
        var f = Math.min(Math.max((s - FLOOD0) / FLOOD, 0), 1);
        return { i: i, s: s, cor: f, troca: s > P - TROCA };
      },
      desenha: function (t, lado, dpr) {
        if (!api.n) return;
        var px = Math.round(lado * (dpr || 1));
        if (cv.width !== px) { cv.width = cv.height = px; }
        gl.viewport(0, 0, px, px);
        var f = api.fase(t);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex[f.i]);
        gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tex[(f.i + 1) % api.n]);
        gl.uniform1f(U.s, f.s); gl.uniform1f(U.tm, Math.floor(t * 24) % 97);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    };
    return api;
  };
})();
