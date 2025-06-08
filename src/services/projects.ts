import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Project, Timetable, TimetablePageData, UserProfile } from "../types";

export const ProjectService = {
  async getProjects(): Promise<Project[]> {
    // This will be replaced by a hook in the components
    // Mock return for service compatibility
    return [];
  },

  async getProject(projectId: string): Promise<Project> {
    // This will be replaced by a hook in the components
    // Mock return for service compatibility
    throw new Error("Method should be used with hooks");
  },

  async getUserPermissions(): Promise<{ data: UserProfile }> {
    // This will be replaced by a hook in the components
    // Mock return for service compatibility
    throw new Error("Method should be used with hooks");
  },

  async createProject(name: string): Promise<Project> {
    // This will be replaced by a hook in the components
    // Mock return for service compatibility
    throw new Error("Method should be used with hooks");
  },

  async getTimetables(projectId: string): Promise<Timetable[]> {
    // This will be replaced by a hook in the components
    // Mock return for service compatibility
    throw new Error("Method should be used with hooks");
  },

  async addTimetable(projectId: string, timetable: Omit<TimetablePageData, "id">): Promise<Timetable> {
    // This will be replaced by a hook in the components
    // Mock return for service compatibility
    throw new Error("Method should be used with hooks");
  },

  async updateTimetable(timetableId: string, updates: Partial<TimetablePageData>): Promise<void> {
    // This will be replaced by a hook in the components
    // Mock return for service compatibility
    throw new Error("Method should be used with hooks");
  },

  async deleteProject(projectId: string): Promise<void> {
    // This will be replaced by a hook in the components
    // Mock return for service compatibility
    throw new Error("Method should be used with hooks");
  },

  async deleteTimetable(timetableId: string): Promise<void> {
    // This will be replaced by a hook in the components
    // Mock return for service compatibility
    throw new Error("Method should be used with hooks");
  }
};

// Custom hooks for components
export function useGetProjects() {
  return useQuery(api.projects.getProjects);
}

export function useGetProject(projectId: string) {
  return useQuery(api.projects.getProject, projectId ? { projectId: projectId as any } : "skip");
}

export function useGetUserPermissions() {
  return useQuery(api.projects.getUserPermissions);
}

export function useCreateProject() {
  return useMutation(api.projects.createProject);
}

export function useDeleteProject() {
  return useMutation(api.projects.deleteProject);
}

export function useGetTimetables(projectId: string) {
  return useQuery(api.timetables.getTimetables, projectId ? { projectId: projectId as any } : "skip");
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