const jwt = require("jsonwebtoken");

const bcrypt = require("bcrypt");

const jwtSecret = "JWT_SECRET";

const jwtToken = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: "24h" });

module.exports = (req, res) => {
  const token = req.cookie("jwt");
  if (!token) {
    return res.status(401).send({ message: "Неавторизованный запрос" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    if (decoded.id !== user.id) {
      throw new Error("Некорректные данные", "invalidToken");
    }

    res.locals.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(403).send({ message: "Доступ запрещен" });
  }
};

module.exports = authMiddleware;
