export const UserRolesEnum = {
    ADMIN: 'admin',
    PROJECT_ADMIN: "project_admin",
    MEMBER : "member"
}
export const AvailableUserRoles = Object.values(UserRolesEnum);

export const TaskStatusEnum = {
    TODO: "todo",
    IN_PROGRESS: "in_progress",
    Done: 'done'
}
export const AvailableTaskStatus = Object.values(TaskStatusEnum);

export const ProjectStatusEnum = {
    pending: "pending",
    in_progress: "in_progress",
    completed: "completed"
}
export const AvailableProjectStatus = Object.values(ProjectStatusEnum);


export const options = {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
    expires: new Date(Date.now() + (24 * 60 * 60 * 1000))
}