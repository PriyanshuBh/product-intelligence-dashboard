import swaggerAutogen from "swagger-autogen";

swaggerAutogen({ openapi: "3.0.0" })(
  "./src/docs/swagger.json",
  ["./src/routes/index.ts"],
  {
    info: { title: "Product Intelligence Dashboard API", version: "1.0.0" },
    servers: [{ url: "http://localhost:9000/api" }]
  }
);
