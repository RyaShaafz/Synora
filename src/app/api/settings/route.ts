import {checkOrigin,requireUser} from '@/lib/auth';
import {body,errorResponse} from '@/lib/errors';
import {preferenceSchema} from '@/lib/validation';
import {db} from '@/lib/db';
import {loadWorkspace} from '@/lib/workspace';
export async function POST(req:Request){try{checkOrigin(req);const user=await requireUser();const {name,...preference}=preferenceSchema.parse(await body(req));await db.$transaction([db.user.update({where:{id:user.id},data:{name}}),db.userPreference.update({where:{userId:user.id},data:preference})]);return Response.json({ok:true});}catch(e){return errorResponse(e);}}
export async function GET(){try{const user=await requireUser();const data=await loadWorkspace(user.id);return Response.json(data,{headers:{'Content-Disposition':'attachment; filename="synora-export.json"','Cache-Control':'no-store'}});}catch(e){return errorResponse(e);}}
