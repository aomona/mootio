import { createHonoApp } from "@/server/create-app";
import authRoute from "@/server/routes/auth";
import cardDetailRoute from "@/server/routes/card-detail";
import cardsRoute from "@/server/routes/cards";
import chainsRoute from "@/server/routes/chains";
import followsRoute from "@/server/routes/follows";
import notificationsRoute from "@/server/routes/notifications";
import trophiesRoute from "@/server/routes/trophies";
import usersRoute from "@/server/routes/users";

const app = createHonoApp()
	.basePath("/api")
	.route("/auth", authRoute)
	.route("/cards", cardDetailRoute)
	.route("/notifications", notificationsRoute)
	.route("/users", usersRoute)
	.route("/users", followsRoute)
	.route("/chain", chainsRoute)
	.route("/users", cardsRoute)
	.route("/users", trophiesRoute);

export type AppType = typeof app;
export { app };
