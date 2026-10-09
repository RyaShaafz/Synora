import {requireUser} from '@/lib/auth';
import {errorResponse} from '@/lib/errors';
import {loadWorkspace} from '@/lib/workspace';
export async function GET(){try{const user=await requireUser();return Response.json(await loadWorkspace(user.id),{headers:{'Cache-Control':'no-store'}});}catch(e){return errorResponse(e);}}
