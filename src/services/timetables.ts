import { api } from "../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Id } from "../../convex/_generated/dataModel";

export function useTimetables(projectId: Id<"projects">) {
  return useQuery(api.timetables.getTimetables, { projectId });
}

export function useCreateTimetable() {
  return useMutation(api.timetables.createTimetable);
}

export function useUpdateTimetable() {
  return useMutation(api.timetables.updateTimetable);
}

export function useDeleteTimetable() {
  return useMutation(api.timetables.deleteTimetable);
}