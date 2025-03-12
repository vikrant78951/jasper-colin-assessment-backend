import rateLimit from 'express-rate-limit'

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 60,  
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,  
  legacyHeaders: false,  
});
