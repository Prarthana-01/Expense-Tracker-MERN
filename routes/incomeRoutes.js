const express = require("express");
const router = express.Router();
const incomeController = require("../controllers/incomeController");
const auth = require("../middlewares/auth");

router.get("/", auth, incomeController.getIncomes);
router.post("/", auth, incomeController.addIncome);
router.put("/:id", auth, incomeController.updateIncome);
router.delete("/:id", auth, incomeController.deleteIncome);

module.exports = router;


