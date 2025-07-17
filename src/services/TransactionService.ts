import axios from "axios";
import { Transaction } from "../types";

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json'
    }
})

export class TransactionService {
    static async getTransactions(): Promise<Transaction[]> {
        let response = await api.get<Transaction[]>("transaction")
        let data = response.data ? response.data : []
        return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    static async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
        let responseTransaction = await api.post("/transaction", transaction);
        return responseTransaction.data;
    }

    static async updateTransaction(id: string, updates: Partial<Omit<Transaction, 'id'>>): Promise<Transaction | null> {
        let response = await api.put(`transaction/${id}`, updates)
        return response.data || []
    }

    static async deleteTransaction(id: string): Promise<boolean> {
        let response = await api.delete(`transaction/${id}`)
        return response.status === 200 || response.status === 204
    }
}