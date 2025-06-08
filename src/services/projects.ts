import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

// Custom hooks for projects
export function useGetProjects() {
  return useQuery(api.projects.getProjects);
}

export function useGetProject(projectId: string | undefined) {
  return useQuery(
    api.projects.getProject, 
    projectId ? { projectId: projectId as Id<"projects"> } : "skip"
  );
}

export function useCreateProject() {
  return useMutation(api.projects.createProject);
}

export function useDeleteProject() {
  return useMutation(api.projects.deleteProject);
}

// Custom hooks for timetables
export function useGetTimetables(projectId: string | undefined) {
  return useQuery(
    api.timetables.getTimetables, 
    projectId ? { projectId: projectId as Id<"projects"> } : "skip"
  );
}

export function useAddTimetable() {
  return useMutation(api.timetables.addTimetable);
}

export function useUpdateTimetable() {
  return useMutation(api.timetables.updateTimetable);
}

export function useDeleteTimetable() {
  return useMutation(api.timetables.deleteTimetable);
}

// Get user permissions
export function useGetUserPermissions() {
  return useQuery(api.auth.getUserPermissions);
}