import {currentUser} from '@/lib/auth';
import {redirect} from 'next/navigation';
export default async function WorkspaceLayout({children}:{children:React.ReactNode}){if(!await currentUser())redirect('/login');return children;}
