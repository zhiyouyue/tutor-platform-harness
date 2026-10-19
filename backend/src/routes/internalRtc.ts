import type { FastifyInstance } from "fastify";
import * as rtcRecordingService from "../services/rtcRecordingService.js";
import { success } from "../utils/response.js";
import { handleRouteError } from "../utils/routeHelpers.js";

export default async function internalRtcRoutes(fastify: FastifyInstance) {
  fastify.post("/internal/rtc/recording-callback", async (request, reply) => {
    try {
      const secret = request.headers["x-rtc-callback-secret"];
      rtcRecordingService.assertCallbackSecret(
        typeof secret === "string" ? secret : undefined,
      );
      const body = request.body as {
        channelId?: string;
        rtcSessionId?: number;
        appointmentId?: number;
        ossKey?: string;
        ossBucket?: string;
        durationSec?: number;
        status?: "ready" | "failed";
      };
      const data = await rtcRecordingService.handleRecordingCallback({
        channelId: body.channelId,
        rtcSessionId: body.rtcSessionId,
        appointmentId: body.appointmentId,
        ossKey: body.ossKey ?? "",
        ossBucket: body.ossBucket,
        durationSec: body.durationSec,
        status: body.status,
      });
      return success(reply, data, "录制已登记");
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });
}
