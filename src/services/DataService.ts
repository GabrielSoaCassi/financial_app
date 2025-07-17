

class DataService {
  // Utility methods
  getCategories(): string[] {
    return [
      'Food & Dining',
      'Transportation',
      'Housing',
      'Shopping',
      'Entertainment',
      'Healthcare',
      'Education',
      'Travel',
      'Utilities',
      'Insurance',
      'Income',
      'Other'
    ];
  }
}

export const dataService = new DataService();