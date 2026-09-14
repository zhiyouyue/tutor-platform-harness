import type { FastifyInstance } from "fastify";
import * as dictRepo from "../repositories/dictionaryRepository.js";
import { success } from "../utils/response.js";
import { handleRouteError } from "../utils/routeHelpers.js";

function mapDict(rows: dictRepo.DictRow[]) {
  return rows.map((r) => ({ code: r.code, label: r.label }));
}

export default async function dictionaryRoutes(fastify: FastifyInstance) {
  fastify.get("/dictionaries/service-audiences", async (_req, reply) => {
    try {
      return success(reply, { items: mapDict(await dictRepo.listServiceAudiences()) });
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.get("/dictionaries/coaching-types", async (_req, reply) => {
    try {
      return success(reply, { items: mapDict(await dictRepo.listCoachingTypes()) });
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.get("/dictionaries/industries", async (_req, reply) => {
    try {
      return success(reply, { items: mapDict(await dictRepo.listIndustries()) });
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.get("/dictionaries/job-roles", async (_req, reply) => {
    try {
      return success(reply, { items: mapDict(await dictRepo.listJobRoles()) });
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });

  fastify.get("/dictionaries/all", async (_req, reply) => {
    try {
      const [audiences, coachingTypes, industries, jobRoles] = await Promise.all([
        dictRepo.listServiceAudiences(),
        dictRepo.listCoachingTypes(),
        dictRepo.listIndustries(),
        dictRepo.listJobRoles(),
      ]);
      return success(reply, {
        serviceAudiences: mapDict(audiences),
        coachingTypes: mapDict(coachingTypes),
        industries: mapDict(industries),
        jobRoles: mapDict(jobRoles),
      });
    } catch (e) {
      return handleRouteError(reply, e);
    }
  });
}
