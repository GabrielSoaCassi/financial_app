import axios from "axios";
import { Budget, Transaction } from "../types";

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json'
    }
})

export class BudgetService{

    static async getBudgets(): Promise<Budget[]> {

        let response = await api.get<Budget[]>('/budget')
        return response.data || []
    }
    
    static async addBudget(budget: Omit<Budget, 'id' | 'spent'>): Promise<Budget> {
        const newBudget ={
            ...budget,
            spent: await this.calculateSpentForCategory(budget.category!)
        }
        let response = await api.post("/budget",newBudget)
        return response.data
      }
    
    static async updateBudget(id: string, updates: Partial<Omit<Budget, 'id' | 'spent'>>): Promise<Budget | null> {
        const updated_budget ={
            ...updates,
            spent: await this.calculateSpentForCategory(updates.category!)
        }
        let response = await api.put(`/budget/${id}`,updated_budget)
        return response.data
      }
    
    static async deleteBudget(id: string): Promise<boolean> {
        const response = await api.delete(`/budget/${id}`)
        return response.status === 200 || response.status === 204;
    }

    private static async calculateSpentForCategory(category: string): Promise<number> {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    let transactions = await api.get<Transaction[]>("/transaction")
    if(!transactions.data)
        transactions.data = []
    return Math.abs(transactions.data
      .filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'expense' && 
               t.category === category &&
               tDate.getMonth() === currentMonth && 
               tDate.getFullYear() === currentYear;
      })
      .reduce((total, t) => total + t.amount, 0));
  }
    
}