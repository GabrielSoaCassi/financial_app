import axios from "axios";
import { Goal } from "../types";

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json'
    }
})

export class GoalsService{
       static async getGoals(): Promise<Goal[]> {
           const response = await api.get<Goal[]>("/goal")
           return response.data || []
       }
   
       static async addGoal(goal: Omit<Goal, 'id'>): Promise<Goal> {
           const response = await api.post("/goal", goal)
           const newGoal: Goal = response.data; // backend returns goal with id
           return newGoal;
       }
   
       static async updateGoal(id: string, updates: Partial<Omit<Goal, 'id'>>): Promise<Goal>{
           const response = await api.put(`/goal/${id}`,updates)
           return response.data
       }
   
       static async deleteGoal(id: string): Promise<boolean> {
           const response = await api.delete(`/goal/${id}`)
           return response.status === 200 || response.status === 204;
       }

}