class ExpenseRepository {
  constructor() {
    this.collectionName = "expenses"; // name of the collection in mongodb
  }

  // Create a new expense
  async addExpense(expense) {}

  // Get one expnese by its ID
  async getOne(id) {}

  // Get all expenses
  async getAllExpenses() {}

  // Add tag to an expense
  async addTagToExpense(id, tag) {}

  // Filter expenses based on date, amount, and isRecurring field
  async filterExpenses(criteria) {}
}

export default ExpenseRepository;
