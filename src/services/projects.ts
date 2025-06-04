import { api } from "../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Id } from "../../convex/_generated/dataModel";

export function useProjects(userId: Id<"users">) {
  return useQuery(api.projects.getProjects, { userId });
}

export function useCreateProject() {
  return useMutation(api.projects.createProject);
}

export function useDeleteProject() {
  return useMutation(api.projects.deleteProject);
}