import {z} from 'zod';
import {checkOrigin,requireUser} from '@/lib/auth';
import {body,errorResponse,AppError} from '@/lib/errors';
import {date} from '@/lib/validation';
import {dateInZone} from '@/lib/metrics';
import {db} from '@/lib/db';
export async function POST(req:Request){try{checkOrigin(req);const user=await requireUser();const input=z.object({date,value:z.number().int().min(0).max(4)}).strict().parse(await body(req));if(input.date>dateInZone(new Date(),user.preference!.timezone))throw new AppError(400,'Future moods cannot be recorded.');await db.moodEntry.upsert({where:{userId_date:{userId:user.id,date:input.date}},create:{userId:user.id,...input},update:{value:input.value}});return Response.json({ok:true});}catch(e){return errorResponse(e);}}
