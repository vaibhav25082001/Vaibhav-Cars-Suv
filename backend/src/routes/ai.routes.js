const express = require("express");
const { authMiddleware } = require("../middleware/auth.middleware");
const { generateResponse, MODEL_REGISTRY } = require("../ai/ai.service");
const { buildCustomerPrompt } = require("../ai/vaia-customer.prompt");
const { buildEmployeePrompt } = require("../ai/vaia-employee.prompt");
const { buildSupportPrompt } = require("../ai/vaia-support.prompt");
const { buildAdminPrompt } = require("../ai/vaia-admin.prompt");
const { asyncHandler } = require("./_helpers");

const router = express.Router();

const promptBuilders = {
  customer: buildCustomerPrompt,
  employee: buildEmployeePrompt,
  support: buildSupportPrompt,
  admin: buildAdminPrompt,
};

router.get("/models", (req, res) => {
  res.json({ data: Object.keys(MODEL_REGISTRY) });
});

router.post(
  "/generate",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const response = await generateResponse({
      provider: req.body.provider,
      prompt: req.body.prompt,
      systemPrompt: req.body.systemPrompt,
      context: req.body.context,
    });
    res.json({ data: response });
  })
);

router.post(
  "/vaia/:persona",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const builder = promptBuilders[req.params.persona];

    if (!builder) {
      return res.status(400).json({ message: "Invalid Vaia persona" });
    }

    const response = await generateResponse({
      provider: req.body.provider,
      prompt: req.body.prompt,
      systemPrompt: builder(req.body.context || {}),
      context: req.body.context,
    });

    res.json({ data: response });
  })
);

module.exports = router;
