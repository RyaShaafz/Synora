'use client';
import {useEffect,useRef,useState} from 'react';

const vertex=`attribute vec2 position; void main(){gl_Position=vec4(position,0.,1.);}`;
const fragment=`
precision highp float;
uniform vec2 resolution;
uniform vec2 pointer;
uniform float time;
mat2 rotate(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
vec2 scene(vec3 p){
 vec3 q=p;
 q.xz=rotate(-.35+pointer.x*.22+time*.06)*q.xz;
 q.yz=rotate(.48+pointer.y*.18)*q.yz;
 q.xy=rotate(-.4)*q.xy;
 float ring=length(vec2(length(q.xy)-1.04,q.z))-.115;
 float ball=length(p-vec3(0.,.07,0.))-.73;
 vec3 planet=vec3(1.08,.75,.28);
 float small=length(p-planet)-.19;
 vec2 result=ball<ring?vec2(ball,1.):vec2(ring,2.);
 if(small<result.x)result=vec2(small,3.);
 return result;
}
vec3 normal(vec3 p){vec2 e=vec2(.0015,0.);return normalize(vec3(scene(p+e.xyy).x-scene(p-e.xyy).x,scene(p+e.yxy).x-scene(p-e.yxy).x,scene(p+e.yyx).x-scene(p-e.yyx).x));}
float occlusion(vec3 p,vec3 n){float occ=0.;float scale=1.;for(int i=1;i<5;i++){float h=float(i)*.09;occ+=(h-scene(p+n*h).x)*scale;scale*=.55;}return clamp(1.-occ*1.6,.25,1.);}
void main(){
 vec2 uv=(gl_FragCoord.xy-resolution*.5)/resolution.y;
 vec3 origin=vec3(pointer.x*.2,.2-pointer.y*.12,4.7);
 vec3 ray=normalize(vec3(uv*3.05,-3.2));
 float travel=0.;vec2 hit=vec2(0.);bool found=false;
 for(int i=0;i<72;i++){vec3 p=origin+ray*travel;hit=scene(p);if(hit.x<.0018){found=true;break;}travel+=hit.x*.85;if(travel>7.)break;}
 if(!found){gl_FragColor=vec4(0.);return;}
 vec3 p=origin+ray*travel;vec3 n=normal(p);vec3 light=normalize(vec3(-.7,1.1,1.6));
 float diffuse=max(dot(n,light),0.);float fresnel=pow(1.-max(dot(n,-ray),0.),3.);
 vec3 base=mix(vec3(.76,.38,.16),vec3(1.,.82,.54),clamp(n.y*.5+.5,0.,1.));
 if(hit.y>1.5)base=mix(vec3(.42,.48,.36),vec3(.89,.94,.75),n.y*.5+.5);
 if(hit.y>2.5)base=vec3(.68,.68,.83);
 vec3 color=base*(.42+diffuse*.63)*occlusion(p,n);
 vec3 reflected=reflect(ray,n);
 float softbox=pow(max(dot(reflected,normalize(vec3(-.6,.8,1.4))),0.),28.);
 float edgebox=pow(max(dot(reflected,normalize(vec3(1.,-.2,1.))),0.),45.);
 color+=vec3(1.,.96,.83)*softbox*.7+vec3(.98,.8,.6)*edgebox*.28;
 color+=vec3(.97,.9,.7)*fresnel*.2;
 color=pow(color,vec3(.88));
 gl_FragColor=vec4(color,1.);
}`;

/** Actual 3D geometry, lighting, reflections, and depth rendered with WebGL. */
export function AuraScene(){
 const canvasRef=useRef<HTMLCanvasElement>(null),[ready,setReady]=useState(false);
 useEffect(()=>{
  const canvas=canvasRef.current;if(!canvas)return;
  const gl=canvas.getContext('webgl',{alpha:true,antialias:false,powerPreference:'low-power'});if(!gl)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(pointer:fine)');
  let disposed=false,frame=0,visible=true,lastFrame=0;const pointer={x:0,y:0},target={x:0,y:0};
  function shader(type:number,source:string){const result=gl!.createShader(type);if(!result)return null;gl!.shaderSource(result,source);gl!.compileShader(result);if(!gl!.getShaderParameter(result,gl!.COMPILE_STATUS)){gl!.deleteShader(result);return null;}return result;}
  const vs=shader(gl.VERTEX_SHADER,vertex),fs=shader(gl.FRAGMENT_SHADER,fragment),program=gl.createProgram();
  if(!vs||!fs||!program){if(vs)gl.deleteShader(vs);if(fs)gl.deleteShader(fs);if(program)gl.deleteProgram(program);return;}
  gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)){gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);return;}
  gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  const size=gl.getUniformLocation(program,'resolution'),mouse=gl.getUniformLocation(program,'pointer'),clock=gl.getUniformLocation(program,'time');
  function draw(timestamp:number){if(disposed||gl!.isContextLost())return;
   if(visible&&!document.hidden&&(timestamp-lastFrame>33||reduced.matches)){
    const ratio=Math.min(devicePixelRatio||1,1.4),width=Math.round(canvas!.clientWidth*ratio),height=Math.round(canvas!.clientHeight*ratio);
    if(canvas!.width!==width||canvas!.height!==height){canvas!.width=width;canvas!.height=height;gl!.viewport(0,0,width,height);}
    pointer.x+=(target.x-pointer.x)*.045;pointer.y+=(target.y-pointer.y)*.045;
    gl!.uniform2f(size,width,height);gl!.uniform2f(mouse,pointer.x,pointer.y);gl!.uniform1f(clock,reduced.matches?0:timestamp*.001);gl!.drawArrays(gl!.TRIANGLES,0,6);lastFrame=timestamp;
   }
   if(!reduced.matches)frame=requestAnimationFrame(draw);
  }
  function move(e:PointerEvent){if(!fine.matches||reduced.matches)return;const bounds=canvas!.getBoundingClientRect();target.x=Math.max(-1,Math.min(1,(e.clientX-bounds.left)/bounds.width*2-1));target.y=Math.max(-1,Math.min(1,(e.clientY-bounds.top)/bounds.height*2-1));}
  function reset(){target.x=0;target.y=0;}
  function lost(e:Event){e.preventDefault();setReady(false);cancelAnimationFrame(frame);}
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible&&reduced.matches)draw(0);});observer.observe(canvas);
  const resize=new ResizeObserver(()=>{if(reduced.matches)draw(0);});resize.observe(canvas);
  function motion(){cancelAnimationFrame(frame);draw(0);}
  reduced.addEventListener('change',motion);canvas.addEventListener('webglcontextlost',lost);canvas.parentElement?.addEventListener('pointermove',move);canvas.parentElement?.addEventListener('pointerleave',reset);
  draw(0);setReady(true);
  return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();resize.disconnect();reduced.removeEventListener('change',motion);canvas.removeEventListener('webglcontextlost',lost);canvas.parentElement?.removeEventListener('pointermove',move);canvas.parentElement?.removeEventListener('pointerleave',reset);gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);};
 },[]);
 return <div className={'aura-scene '+(ready?'scene-ready':'scene-fallback')} aria-hidden="true" data-renderer={ready?'webgl':'css'}><div className="scene-ground"/><div className="scene-backdrop"/><div className="scene-css-orb"/><canvas ref={canvasRef}/></div>;
}
