import { Request, Response } from "express";
import { openApiSchema } from "../openapi-schema";

export function handleOpenAPIRequest(req: Request, res: Response) {
  res.json(openApiSchema);
}
