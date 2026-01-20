import { defineApp } from "convex/server";
import posthog from "@samhoque/convex-posthog/convex.config";
import aggregate from "@convex-dev/aggregate/convex.config";
import shardedCounter from "@convex-dev/sharded-counter/convex.config";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";
import workpool from "@convex-dev/workpool/convex.config";
import workflow from "@convex-dev/workflow/convex.config";
import crons from "@convex-dev/crons/convex.config";

const app = defineApp();
app.use(posthog);
app.use(aggregate);
app.use(shardedCounter);
app.use(rateLimiter);
app.use(workpool);
app.use(workflow);
app.use(crons);

export default app;
