import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { registry } from "./registry";

export function generateOpenApiSpec() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.3",
    info: {
      title: "Prevalentware prueba API",
      version: "1.0.0",
      description: "API REST – Gestión de ingresos y egresos",
    },
    servers: [
      { url: "http://localhost:3000" },
    ],
  });
}
