import { pathToFileURL } from "node:url";

export const verifyProductionAuthorization = ({
  ref,
  sourceCommit,
  expectedCommit,
}) => {
  if (ref !== "refs/heads/main") {
    throw new Error("Production deployment authorization requires main.");
  }
  if (!/^[0-9a-f]{40}$/u.test(sourceCommit ?? "")) {
    throw new Error("GITHUB_SHA must be a full lowercase Git SHA.");
  }
  if (expectedCommit !== sourceCommit) {
    throw new Error(
      "The owner-authorized commit must equal the workflow source commit.",
    );
  }
  return { ref, sourceCommit };
};

const runCli = () => {
  const result = verifyProductionAuthorization({
    ref: process.env.GITHUB_REF,
    sourceCommit: process.env.GITHUB_SHA,
    expectedCommit: process.env.EXPECTED_SOURCE_COMMIT,
  });
  process.stdout.write(
    `Production authorization passed for ${result.sourceCommit} on main.\n`,
  );
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli();
}
