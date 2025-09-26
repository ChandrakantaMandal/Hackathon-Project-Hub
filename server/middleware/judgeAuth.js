import jwt from 'jsonwebtoken';
import Judge from '../models/Judge.js';

export const authenticateJudge = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'judge') {
      return res.status(403).json({
        success: false,
        message: 'Judge access required'
      });
    }
    
    const judge = await Judge.findById(decoded.judgeId).select('-password');
    if (!judge || !judge.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Judge not found or inactive'
      });
    }

    req.judge = judge;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};