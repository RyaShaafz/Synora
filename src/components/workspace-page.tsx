'use client';
import {Suspense} from 'react';
import {Plus,Sparkles} from 'lucide-react';
import Link from 'next/link';
import {useWorkspace} from './workspace-provider';
import {DashboardPage} from './dashboard';
import {TasksPage} from './tasks';
import {CalendarPage} from './calendar';
import {GoalsPage,HabitsPage} from './goals-habits';
import {JournalPage} from './journal';
import {FinancePage} from './finance';
import {AssistantPage} from './assistant';
import {InsightsPage} from './insights';
import {SettingsPage} from './settings';
import {Loading} from './ui';
import type {Entity} from '@/lib/validation';
const pages={dashboard:['A little clarity for your day.','Make room for what matters. Synora will help with the rest.'],tasks:['One thing at a time.','Clear your mind. Give your next step a little space.'],calendar:['Find your own rhythm.','A thoughtful balance of doing, resting, and being.'],assistant:['A little guidance, just for you.','Turn a thought into a plan with your personal AI companion.'],goals:['Make progress feel personal.','A little intention today. A little closer tomorrow.'],habits:['Small rituals. Lasting change.','Consistency, at a pace that feels like you.'],journal:['Come back to yourself.','A private space for your feelings, thoughts, and discoveries.'],finance:['Spend with a little intention.','More clarity around your money. More space to breathe.'],insights:['See the bigger picture.','A thoughtful look at the life you’re building.'],settings:['Make this space your own.','A few thoughtful preferences for your personal workspace.']};
export function WorkspacePage({page}:{page:keyof typeof pages}){const w=useWorkspace();if(!w.data)return null;const data=w.data;const action:Partial<Record<keyof typeof pages,Entity>>={dashboard:'tasks',tasks:'tasks',calendar:'events',goals:'goals',habits:'habits',journal:'journal',finance:'transactions'};const date=new Intl.DateTimeFormat('en-IN',{timeZone:data.preferences.timezone,weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date());return <div className={"page-content page-"+page}><div className="page-heading"><div><span className="eyebrow">{date}</span><h1>{pages[page][0]}</h1><p>{pages[page][1]}</p></div><div className="heading-actions">{page==='dashboard'&&<Link className="btn secondary" href="/assistant?prompt=Help%20me%20plan%20my%20day."><Sparkles size={14}/>Plan my day</Link>}{action[page]&&<button className="btn primary" onClick={()=>w.setEdit({entity:action[page]!})}><Plus size={15}/>{page==='dashboard'?'Quick add':page==='calendar'?'New event':page==='goals'?'New goal':page==='habits'?'New habit':page==='journal'?'Write an entry':page==='finance'?'Add transaction':'New task'}</button>}</div></div>{page==='dashboard'?<DashboardPage/>:page==='tasks'?<TasksPage/>:page==='calendar'?<CalendarPage/>:page==='goals'?<GoalsPage/>:page==='habits'?<HabitsPage/>:page==='journal'?<JournalPage/>:page==='finance'?<FinancePage/>:page==='assistant'?<Suspense fallback={<Loading/>}><AssistantPage/></Suspense>:page==='insights'?<InsightsPage/>:<SettingsPage/>}</div>;}
