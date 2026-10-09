import {notFound} from 'next/navigation';
import {AppShell} from '@/components/app-shell';
import {WorkspacePage} from '@/components/workspace-page';
const pages=['dashboard','tasks','calendar','assistant','goals','habits','journal','finance','insights','settings'] as const;
export default async function Page({params}:{params:Promise<{page:string}>}){const {page}=await params;if(!pages.includes(page as typeof pages[number]))notFound();return <AppShell><WorkspacePage page={page as typeof pages[number]}/></AppShell>;}
