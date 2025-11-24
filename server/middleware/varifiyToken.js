import jwt from "jsonwebtoken";

export const varifiyToken = (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized - no Token Provided" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - invalid Token" });
    }
    
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error("Token verification error:", error.message);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};
