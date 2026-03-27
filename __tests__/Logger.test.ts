import { describe, expect, it } from "vitest";
import { logger } from "../server/lib/logger";

describe("structured logger (pino)", () => {
  it("exports a logger instance with standard methods", () => {
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.error).toBe("function");
    expect(typeof logger.debug).toBe("function");
    expect(typeof logger.child).toBe("function");
  });

  it("creates child loggers with additional context", () => {
    const child = logger.child({ event: "test-event", service: "test" });
    expect(typeof child.info).toBe("function");
    expect(typeof child.error).toBe("function");
  });

  it("has a name binding set to aegisops-api", () => {
    // pino bindings include the name
    const bindings = logger.bindings();
    expect(bindings.name).toBe("aegisops-api");
  });
});
