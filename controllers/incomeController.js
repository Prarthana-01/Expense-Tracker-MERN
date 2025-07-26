const Income = require('../models/Income');

exports.getIncomes = async (req, res) => {
  try {
    const incomes = await Income.find({ user: req?.userId }).sort({ date: -1 });
    res.status(200).json(incomes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch incomes" });
  }
};

exports.addIncome = async (req, res) => {
  const income = new Income({ ...req?.body, user: req?.userId });
  await income.save();
  res.status(201).json({ message: "Income added", income });
};

exports.updateIncome = async (req, res) => {
  try {
    const updatedIncome = await Income.findOneAndUpdate(
      { _id: req.params.id, user: req.userId }, 
      req?.body,
      { new: true }
    );

    if (!updatedIncome) {
      return res.status(404).json({ message: "Income not found or not authorized" });
    }

    res.status(200).json(updatedIncome);
  } catch (err) {
    res.status(500).json({ message: "Error updating income", error: err?.message });
  }
};

exports.deleteIncome = async (req, res) => {
  try {
    const deletedIncome = await Income.findOneAndDelete({
      _id: req?.params?.id,
      user: req?.userId, 
    });

    if (!deletedIncome) {
      return res.status(404).json({ message: "Income not found or not authorized" });
    }

    res.status(200).json({ message: "Income deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting income", error: err?.message });
  }
};
