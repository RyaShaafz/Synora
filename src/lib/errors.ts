import {ZodError} from 'zod';
export class AppError extends Error {constructor(public status:number,message:string){super(message);}}
export function errorResponse(error:unknown){
 if(error instanceof AppError)return Response.json({error:error.message},{status:error.status});
 if(error instanceof ZodError)return Response.json({error:error.issues.map(i=>`${i.path.join('.')||'Input'}: ${i.message}`).join('; ')},{status:400});
 if(error && typeof error==='object' && 'code' in error && error.code==='P2002')return Response.json({error:'This entry already exists.'},{status:409});
 console.error('Synora request failed:',error instanceof Error?error.name:'Unknown error');
 return Response.json({error:'Something went wrong. Please try again.'},{status:500});
}
export async function body(req:Request){const text=await req.text();if(text.length>100000)throw new AppError(413,'This request is too large.');try{return JSON.parse(text);}catch{throw new AppError(400,'Invalid JSON request.');}}
