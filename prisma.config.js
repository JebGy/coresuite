const { defineConfig } = require("/home/rg25/.npm/_npx/2778af9cee32ff87/node_modules/prisma/config.js");
require("dotenv").config();

module.exports = defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
