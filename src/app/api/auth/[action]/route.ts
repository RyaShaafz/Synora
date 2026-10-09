import {defaultModel} from '@/lib/ai/provider';
import {z} from 'zod';
import {db} from '@/lib/db';
import {body,errorResponse,AppError} from '@/lib/errors';
import {checkOrigin,hashPassword,checkPassword,startSession,endSession,rateLimit,requestKey,requireUser} from '@/lib/auth';
const credentials=z.object({email:z.email().max(254).transform(v=>v.toLowerCase()),password:z.string().min(10).max(128),name:z.string().trim().min(1).max(60).optional()});
export async function POST(req:Request,{params}:{params:Promise<{action:string}>}){try{checkOrigin(req);rateLimit('auth:'+requestKey(req),15,15*60000);const {action}=await params;if(action==='logout'){await endSession();return Response.json({ok:true});}if(!['login','register'].includes(action))throw new AppError(404,'Unknown action.');const input=credentials.parse(await body(req));let user;
 if(action==='register'){if(!input.name)throw new AppError(400,'Your name is required.');user=await db.user.create({data:{email:input.email,name:input.name,passwordHash:hashPassword(input.password),preference:{create:{aiModel:defaultModel()}}}});}else{user=await db.user.findUnique({where:{email:input.email}});if(!user||!checkPassword(input.password,user.passwordHash))throw new AppError(401,'The email or password did not match.');}
 await startSession(user.id);return Response.json({ok:true});}catch(e){return errorResponse(e);}}
export async function DELETE(req:Request){try{checkOrigin(req);const user=await requireUser();const input=z.object({password:z.string(),confirmation:z.literal('DELETE')}).parse(await body(req));if(!checkPassword(input.password,user.passwordHash))throw new AppError(403,'The password did not match.');await db.user.delete({where:{id:user.id}});await endSession();return Response.json({ok:true});}catch(e){return errorResponse(e);}}
