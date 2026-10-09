import {randomBytes,scryptSync,timingSafeEqual,createHash,createHmac} from 'node:crypto';
import {cookies} from 'next/headers';
import {db} from './db';
import {AppError} from './errors';
const cookieName='aura_session';
function secret(){const value=process.env.AUTH_SECRET;if(!value||value.length<32)throw new Error('AUTH_SECRET must have at least 32 characters.');return value;}
function digest(token:string){return createHmac('sha256',secret()).update(token).digest('hex');}
export function hashPassword(password:string){const salt=randomBytes(16).toString('hex');return salt+':'+scryptSync(password,salt,64).toString('hex');}
export function checkPassword(password:string,hash:string){const [salt,key]=hash.split(':');const actual=scryptSync(password,salt,64);const expected=Buffer.from(key,'hex');return expected.length===actual.length&&timingSafeEqual(actual,expected);}
export async function currentUser(){const token=(await cookies()).get(cookieName)?.value;if(!token)return null;const session=await db.session.findUnique({where:{id:digest(token)},include:{user:{include:{preference:true}}}});return session&&session.expiresAt>new Date()?session.user:null;}
export async function requireUser(){const user=await currentUser();if(!user)throw new AppError(401,'Sign in to continue.');return user;}
export async function startSession(userId:string){const token=randomBytes(32).toString('hex');const expiresAt=new Date(Date.now()+30*86400000);await db.session.create({data:{id:digest(token),userId,expiresAt}});(await cookies()).set(cookieName,token,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production'&&process.env.APP_ORIGIN?.startsWith('https:')===true,path:'/',expires:expiresAt});}
export async function endSession(){const store=await cookies();const token=store.get(cookieName)?.value;if(token)await db.session.deleteMany({where:{id:digest(token)}});store.delete(cookieName);}
export function checkOrigin(req:Request){const origin=req.headers.get('origin');const configured=process.env.APP_ORIGIN||'http://localhost:3000';const allowed=new Set([configured]);if(process.env.NODE_ENV!=='production'){allowed.add('http://127.0.0.1:3000');}if(!origin||!allowed.has(origin))throw new AppError(403,'This request did not come from your Synora app.');}
const hits=new Map<string,{count:number,reset:number}>();
export function rateLimit(key:string,limit=20,windowMs=60000){const now=Date.now();if(hits.size>10000)for(const [k,v]of hits)if(v.reset<now)hits.delete(k);const entry=hits.get(key);if(!entry||entry.reset<now){hits.set(key,{count:1,reset:now+windowMs});return;}if(++entry.count>limit)throw new AppError(429,'Please wait a moment before trying again.');}
export function requestKey(req:Request){return createHash('sha256').update(req.headers.get('x-forwarded-for')?.split(',')[0]||'local').digest('hex');}
