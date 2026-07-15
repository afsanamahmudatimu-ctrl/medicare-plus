const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Unauthorized"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ব্যাকওয়ার্ড কম্প্যাটিবিলিটির জন্য আগের ফিল্ডগুলোও রাখা হলো
    req.userId = decoded.id;
    req.role = decoded.role;

    // আপনার রিকোয়েস্ট অনুযায়ী req.user._id ফিক্স করা হলো
    req.user = {
      _id: decoded.id,
      role: decoded.role
    };

    next();
  } catch (err) {
    console.error("JWT Verify Error:", err.name, "-", err.message);
    return res.status(401).json({
      message: "Invalid Token"
    });
  }
};