import {randomBytes} from 'node:crypto';
import {existsSync,writeFileSync} from 'node:fs';
import path from 'node:path';
if(!existsSync('.env')){
 const password=randomBytes(24).toString('hex');
 const databaseDir=path.join(process.env.LOCALAPPDATA||process.cwd(),'AuraAI','postgres').replaceAll('\\','/');
 writeFileSync('.env',`DATABASE_URL=postgresql://aura:${password}@127.0.0.1:5433/aura\nAUTH_SECRET=${randomBytes(48).toString('hex')}\nAPP_ORIGIN=http://localhost:3000\nAI_PROVIDER=groq\nGROQ_API_KEY=\nGROQ_MODEL=openai/gpt-oss-120b\nOLLAMA_BASE_URL=http://127.0.0.1:11434\nOLLAMA_MODEL=qwen3:4b\nDATABASE_DIR="${databaseDir}"\n`);
 console.log('Created ignored local environment configuration. No credentials are printed.');
}else console.log('Existing local configuration preserved.');
