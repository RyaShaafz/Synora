import {CalendarDays,ArrowUpRight,Sparkles} from 'lucide-react';
import Link from 'next/link';
import {AuraScene} from './aura-scene';

/** Vector artwork stays crisp and lightweight on every screen size. */
export function AuraOrbit({completed,total,date}:{completed:number;total:number;date:string}){
 const percent=total?Math.round(completed/total*100):0;
 return <div className="aura-universe">
  <div className="orbit-art" aria-hidden="true">
   <AuraScene/>
   <span className="orbit-spark spark-one">✦</span><span className="orbit-spark spark-two">✧</span>
   <span className="orbit-planet planet-sage"/><span className="orbit-planet planet-lilac"/>
  </div>
  <Link href="/calendar" className="orbit-card orbit-date"><span className="orbit-card-icon"><CalendarDays size={17}/></span><span><small>A little room for you</small><strong>{new Intl.DateTimeFormat('en-IN',{day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(date+'T00:00:00Z'))}</strong></span><ArrowUpRight size={14}/></Link>
  <Link href="/tasks" className="orbit-card orbit-progress"><svg className="day-ring" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="20" className="ring-track"/><circle cx="24" cy="24" r="20" className="ring-fill" strokeDasharray={`${percent*1.257} 125.7`}/></svg><span><small>Your daily rhythm</small><strong>{completed} of {total} tasks complete</strong></span></Link>
  <span className="orbit-caption"><Sparkles size={12}/> Less rush. More you.</span>
 </div>;
}

export function MoodFace({value}:{value:number}){
 return <svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><circle cx="13" cy="16" r="1.8" fill="currentColor"/><circle cx="27" cy="16" r="1.8" fill="currentColor"/>{value===0?<path d="M13 29Q20 20 27 29"/>:value===1?<path d="M13 25Q16 21 20 25Q24 29 27 25"/>:value===2?<path d="M14 25H26"/>:value===3?<path d="M13 23Q20 31 27 23"/>:<><path d="M12 22Q20 35 28 22Z" fill="currentColor"/><path d="M9 9L13 11M31 9L27 11"/></>}</svg>;
}
