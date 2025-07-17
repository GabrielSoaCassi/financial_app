import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json'
    }
})
export class AnalyticsService {
    static async getTotalBalance(): Promise<number> {
        let result = await api.get("/analytics/get-total-balance")
        return result.data || 0
    }
    static async getMonthlyIncome(): Promise<number> {
        let result = await api.get("/analytics/get-monthly-income")
        return result.data || 0
    }

    static async getMonthlyExpenses(): Promise<number> {
        let result = await api.get("/analytics/get-monthly-expense")
        return result.data || 0
    }
    static async getExpensesByCategory(): Promise<{ [key: string]: number; }> {
        let result = await api.get("/analytics/get-expense-category")
        return result.data || {}
    }
}