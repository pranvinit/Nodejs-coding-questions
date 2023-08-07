import ExpenseRepository from "./expense.repository.js";

export default class ExpenseController {
  constructor() {
    this.expenseRepository = new ExpenseRepository();
  }

  // Create new expense
  add = async (req, res) => {};

  // Get a specific expense
  getOne = async (req, res) => {};

  // Get all expenses
  getAll = async (req, res) => {};

  // Add a tag to an expense
  addTag = async (req, res) => {};

  // Filter expenses based on given criteria
  filter = async (req, res) => {};
}
