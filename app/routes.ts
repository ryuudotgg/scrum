import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/BoardList/route.tsx"),
  route("boards/:boardId", "routes/Board/route.tsx"),
] satisfies RouteConfig;
