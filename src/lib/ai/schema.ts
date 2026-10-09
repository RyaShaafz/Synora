import {z} from 'zod';
import {taskSchema,eventSchema,goalSchema,habitSchema,budgetSchema} from '../validation';
export const actionSchema=z.discriminatedUnion('type',[
 z.object({type:z.literal('create_task'),data:taskSchema}).strict(),
 z.object({type:z.literal('update_task'),id:z.string().min(1),data:taskSchema}).strict(),
 z.object({type:z.literal('create_event'),data:eventSchema}).strict(),
 z.object({type:z.literal('update_event'),id:z.string().min(1),data:eventSchema}).strict(),
 z.object({type:z.literal('create_goal'),data:goalSchema}).strict(),
 z.object({type:z.literal('create_milestone'),goalId:z.string().min(1),title:z.string().trim().min(1).max(160)}).strict(),
 z.object({type:z.literal('create_habit'),data:habitSchema}).strict(),
 z.object({type:z.literal('set_budget'),data:budgetSchema}).strict()
]);
export const aiOutputSchema=z.object({message:z.string().trim().min(1).max(15000),actions:z.array(actionSchema).max(10)}).strict();
export type AIAction=z.infer<typeof actionSchema>;
export type AIOutput=z.infer<typeof aiOutputSchema>;
