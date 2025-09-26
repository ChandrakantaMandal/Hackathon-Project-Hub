import Joi from 'joi';

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// Validation schemas
export const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  createTeam: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    description: Joi.string().max(500).allow('')
  }),

  createProject: Joi.object({
    title: Joi.string().min(2).max(100).required(),
    description: Joi.string().min(10).max(2000).required(),
    shortDescription: Joi.string().max(200).allow(''),
    tags: Joi.array().items(Joi.string()),
    category: Joi.string().valid('web', 'mobile', 'ai', 'blockchain', 'iot', 'game', 'other'),
    teamId: Joi.string().required(),
    dueDate: Joi.date().iso()
  }),

  createTask: Joi.object({
    title: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(1000).allow(''),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
    project: Joi.string().hex().length(24).required(),
    assignedTo: Joi.string().hex().length(24).allow(null, ''),
    dueDate: Joi.date().iso(),
    estimatedHours: Joi.number().min(0)
  })
};



