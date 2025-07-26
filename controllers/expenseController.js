const Expense = require("../models/Expense");

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req?.userId }).sort({
      date: -1,
    });
    res.status(200).json(expenses);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
};

exports.addExpense = async (req, res) => {
  const expense = new Expense({ ...req?.body, user: req?.userId });
  await expense.save();
  res.status(201).json({ message: "Expense added", expense });
};

exports.updateExpense = async (req, res) => {
  try {
    const updatedExpense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    );

    if (!updatedExpense) {
      return res
        .status(404)
        .json({ message: "Expense not found or not authorized" });
    }

    res.status(200).json(updatedExpense);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating expense", error: err?.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const deletedExpense = await Expense.findOneAndDelete({
      _id: req?.params?.id,
      user: req?.userId,
    });

    if (!deletedExpense) {
      return res
        .status(404)
        .json({ message: "Expense not found or not authorized" });
    }

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting expense", error: err?.message });
  }
};
