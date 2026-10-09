import type {Metadata} from 'next';
import './globals.css';
import './studio.css';
import './depth.css';
export const metadata:Metadata={title:'Synora — Your AI-powered Personal Life OS',description:'Your AI-powered Personal Life OS. A private space to plan, reflect, and grow.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
