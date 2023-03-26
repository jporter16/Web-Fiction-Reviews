const BaseJoi = require("joi");
const sanitizeHTML = require("sanitize-html");

const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHTML": "{{#label}} must not include HTML!",
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHTML(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value)
          return helpers.error("string.escapeHTML", { value });
        return clean;
      },
    },
  },
});

const Joi = BaseJoi.extend(extension);

module.exports.storySchema = Joi.object({
  story: Joi.object({
    title: Joi.string().required().escapeHTML(),
    // Should this also be escapeHTML?
    link: Joi.string().required(),
    reported: Joi.boolean(),
    // image: Joi.string().required(),
    author: Joi.string().required().escapeHTML(),
    reportList: Joi.array(),
    description: Joi.string().required(),
    tags: Joi.alternatives().try(Joi.array().max(3).min(1), Joi.string()),
    // ratingScore: Joi.number(),
  }).required(),
  deleteImages: Joi.array(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    body: Joi.string().required().escapeHTML(),
  }).required(),
  reviewedStory: Joi.string(),
  reportList: Joi.array(),
});
