const express = require('express');
const { register, login } = require('../controllers/authController');
const router = express.Router();
const auth = require('../middlewares/auth');
const User = require('../models/userModel'); 

router.post('/register', register);
router.post('/login', login);
router.get("/user", auth, (req, res) => {
  User.findById(req.user.id)
    .select("-password")
    .then((user) => res.json(user))
    .catch(() => res.status(404).json({ message: "User not found" }));
});


module.exports = router;
