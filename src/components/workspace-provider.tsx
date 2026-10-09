'use client';
import {createContext,useContext,useState,useEffect,useCallback,type ReactNode} from 'react';
import type {WorkspaceData} from '@/lib/types';
import type {Entity} from '@/lib/validation';
export class RequestError extends Error{constructor(message:string,public status:number){super(message);}}
export async function request<T=unknown>(url:string,method='GET',data?:unknown):Promise<T>{const response=await fetch(url,{method,headers:data?{'Content-Type':'application/json'}:undefined,body:data?JSON.stringify(data):undefined,cache:'no-store'});let result;try{result=await response.json();}catch{throw new RequestError('The server could not respond. Please try again.',response.status);}if(!response.ok)throw new RequestError(result.error||'Something went wrong.',response.status);return result as T;}
export type EditState={entity:Entity;id?:string;values?:Record<string,unknown>};
type ConfirmState={title:string;message:string;action:()=>Promise<void>;danger?:boolean};
type Context={data:WorkspaceData|null;loading:boolean;error:string;busy:boolean;refresh:()=>Promise<void>;mutate:(url:string,method:string,input:unknown,message?:string)=>Promise<void>;toast:(message:string)=>void;edit:EditState|null;setEdit:(edit:EditState|null)=>void;confirm:ConfirmState|null;setConfirm:(value:ConfirmState|null)=>void;remove:(entity:Entity,id:string)=>void};
const WorkspaceContext=createContext<Context|null>(null);
export function useWorkspace(){const value=useContext(WorkspaceContext);if(!value)throw new Error('Workspace provider missing');return value;}
export function WorkspaceProvider({children}:{children:ReactNode}){const [data,setData]=useState<WorkspaceData|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[edit,setEdit]=useState<EditState|null>(null),[confirm,setConfirm]=useState<ConfirmState|null>(null);
 const refresh=useCallback(async()=>{try{setData(await request<WorkspaceData>('/api/workspace'));setError('');}catch(e){setError(e instanceof Error?e.message:'Could not load your workspace.');throw e;}finally{setLoading(false);}},[]);
 useEffect(()=>{void refresh().catch(()=>{});},[refresh]);useEffect(()=>{if(!message)return;const timer=setTimeout(()=>setMessage(''),4000);return()=>clearTimeout(timer);},[message]);
 useEffect(()=>{const pref=data?.preferences.theme;const dark=pref==='dark'||(pref==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.body.classList.toggle('dark',dark);const media=matchMedia('(prefers-color-scheme: dark)');const update=()=>{if(pref==='system')document.body.classList.toggle('dark',media.matches);};media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[data?.preferences.theme]);
 async function mutate(url:string,method:string,input:unknown,note='Saved.'){setBusy(true);try{await request(url,method,input);await refresh();if(note)setMessage(note);}finally{setBusy(false);}}
 function remove(entity:Entity,id:string){setConfirm({title:'Delete this entry?',message:'This permanently removes the entry from your workspace.',danger:true,action:async()=>{await mutate('/api/records/'+entity,'DELETE',{id},'Entry deleted.');}});}
 return <WorkspaceContext.Provider value={{data,loading,error,busy,refresh,mutate,toast:setMessage,edit,setEdit,confirm,setConfirm,remove}}>{children}{message&&<div className="toast" role="status">{message}</div>}</WorkspaceContext.Provider>;
}
