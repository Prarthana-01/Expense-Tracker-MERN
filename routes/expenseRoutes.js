const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expenseController");
const auth = require("../middlewares/auth");

router.get("/", auth, expenseController.getExpenses);
router.post("/", auth, expenseController.addExpense);
router.put("/:id", auth, expenseController.updateExpense);
router.delete("/:id", auth, expenseController.deleteExpense);

module.exports = router;
