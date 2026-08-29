import { onRequest as __api_gfg_potd_ts_onRequest } from "C:\\Users\\User\\Desktop\\edustream\\functions\\api\\gfg\\potd.ts"
import { onRequest as __api_leetcode_potd_ts_onRequest } from "C:\\Users\\User\\Desktop\\edustream\\functions\\api\\leetcode\\potd.ts"
import { onRequest as __api_potd_gfg_ts_onRequest } from "C:\\Users\\User\\Desktop\\edustream\\functions\\api\\potd\\gfg.ts"
import { onRequest as __api_potd_leetcode_ts_onRequest } from "C:\\Users\\User\\Desktop\\edustream\\functions\\api\\potd\\leetcode.ts"
import { onRequest as __api_gfg_potd_ts_onRequest_2 } from "C:\\Users\\User\\Desktop\\edustream\\functions\\api\\gfg-potd.ts"
import { onRequest as __api___catchall___ts_onRequest } from "C:\\Users\\User\\Desktop\\edustream\\functions\\api\\[[catchall]].ts"

export const routes = [
    {
      routePath: "/api/gfg/potd",
      mountPath: "/api/gfg",
      method: "",
      middlewares: [],
      modules: [__api_gfg_potd_ts_onRequest],
    },
  {
      routePath: "/api/leetcode/potd",
      mountPath: "/api/leetcode",
      method: "",
      middlewares: [],
      modules: [__api_leetcode_potd_ts_onRequest],
    },
  {
      routePath: "/api/potd/gfg",
      mountPath: "/api/potd",
      method: "",
      middlewares: [],
      modules: [__api_potd_gfg_ts_onRequest],
    },
  {
      routePath: "/api/potd/leetcode",
      mountPath: "/api/potd",
      method: "",
      middlewares: [],
      modules: [__api_potd_leetcode_ts_onRequest],
    },
  {
      routePath: "/api/gfg-potd",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_gfg_potd_ts_onRequest_2],
    },
  {
      routePath: "/api/:catchall*",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api___catchall___ts_onRequest],
    },
  ]