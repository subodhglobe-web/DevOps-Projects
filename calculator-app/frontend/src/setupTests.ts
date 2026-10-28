// Runs once before the test files, via vite.config.ts's test.setupFiles.
// This single import extends Vitest's `expect` with jest-dom's DOM matchers
// (toBeDisabled(), toHaveTextContent(), etc.) - the equivalent of adding
// AssertJ's assertThat() extensions in a Java test suite.
import "@testing-library/jest-dom/vitest";

import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// React Testing Library normally unmounts components after each test
// automatically, but only if it can detect a *global* afterEach (which
// happens with test.globals: true in vite.config.ts). Since this project
// keeps test.globals off and imports afterEach explicitly instead, we wire
// up that same cleanup by hand here - otherwise components from one test
// would stay mounted and leak into the next one.
afterEach(() => {
  cleanup();
});
