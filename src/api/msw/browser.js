import { setupWorker } from "msw/browser";
import { controllers } from "./controllers";

export const worker = setupWorker(...controllers);
