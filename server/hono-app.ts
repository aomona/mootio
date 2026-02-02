import { createHonoApp } from "@/server/create-app";
import authRoute from "@/server/routes/auth";
import chainsRoute from "@/server/routes/chains";
import followsRoute from "@/server/routes/follows";
import notificationsRoute from "@/server/routes/notifications";
import usersRoute from "@/server/routes/users";

const app = createHonoApp()
	.basePath("/api")
	.route("/auth", authRoute)
	.route("/notifications", notificationsRoute)
	.route("/users", usersRoute)
	.route("/follows", followsRoute)
	.route("/chain", chainsRoute);

export type AppType = typeof app;
export { app };
