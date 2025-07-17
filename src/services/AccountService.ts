import { Account } from "../types";
import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json'
    }
})

export class AccountService {

    static async getAccounts(): Promise<Account[]> {
        const response = await api.get<Account[]>("/account")
        return response.data || []
    }

    static async addAccount(account: Omit<Account, 'id'>): Promise<Account> {
        const response = await api.post("/account", account)
        const newAccount: Account = response.data; // backend returns account with id
        return newAccount;
    }

    static async updateAccount(id: string, updates: Partial<Omit<Account, 'id'>>): Promise<Account>{
        const response = await api.put(`/account/${id}`,updates)
        return response.data
    }

    static async deleteAccount(id: string): Promise<boolean> {
        const response = await api.delete(`/account/${id}`)
        return response.status === 200 || response.status === 204;
    }
}