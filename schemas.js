const BaseJoi = require("joi");
const { isValidObjectId } = require("mongoose");
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

const warningSchema = Joi.object({
  violence: Joi.number().min(0).max(3).default(0),
  profanity: Joi.number().min(0).max(3).default(0),
  sexualContent: Joi.number().min(0).max(3).default(0),
});

module.exports.storySchema = Joi.object({
  story: Joi.object({
    title: Joi.string().required().min(1).max(200).escapeHTML(),
    // Should this also be escapeHTML?
    link: Joi.string().required().max(2000),
    reported: Joi.boolean(),
    // image: Joi.string().required(),
    author: Joi.string().required().escapeHTML().max(200),
    reportList: Joi.array(),
    description: Joi.string().required().escapeHTML().max(4000),
    requestDelete: Joi.boolean(),
    warnings: warningSchema,
    audience: Joi.number().min(0).max(3).default(0),
    tags: Joi.alternatives().try(
      Joi.array().max(4).min(1),
      Joi.string().max(1000)
    ),
    popularity: Joi.number().optional(),
  }).required(),
  deleteImages: Joi.array(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    body: Joi.string().required().max(4000).escapeHTML(),
    edited: Joi.boolean(),
    previousVersions: Joi.array().max(10),
    warnings: warningSchema,
    audience: Joi.number().required().min(0).max(3).default(0),
  }).required(),
  reviewedStory: Joi.string(),
  reportList: Joi.array(),
});

module.exports.collectionSchema = Joi.object({
  collection: Joi.object({
    title: Joi.string().min(1).max(200).required(),
    // poster: Joi.string().required(),
    description: Joi.string().max(2000),
    tags: Joi.alternatives().try(
      Joi.array().max(8).min(1),
      Joi.string().max(1000)
    ),
    stories: Joi.alternatives().try(
      Joi.array().max(50),
      Joi.string().max(1000)
    ),
    // FIX ME I want to set max length:
    upvotes: Joi.object({
      number: Joi.number(),
      upvoters: Joi.array().items(Joi.string()),
    }),
    reported: Joi.boolean(),
    reportList: Joi.array().items(Joi.string()),
    pending: Joi.boolean(),
    public: Joi.boolean().default(false),
  }),
});

module.exports.reportStorySchema = Joi.object({
  message: Joi.string().max(500),
  adminResponded: Joi.boolean(),
  adminAccepted: Joi.boolean(),
  // This checks to make sure it is an object id
  reportedStory: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  poster: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
});
module.exports.reportCollectionSchema = Joi.object({
  message: Joi.string().max(500),
  adminResponded: Joi.boolean(),
  adminAccepted: Joi.boolean(),
  // This checks to make sure it is an object id
  reportedCollection: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  poster: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
});
