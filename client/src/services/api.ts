import type { Task, Division, ProjectInfo } from '../types/gantt';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ||
  (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}: ${res.statusText}`;
    try {
      const errorJson = await res.json();
      if (errorJson?.message) {
        errorMsg = errorJson.message;
      }
    } catch {
      // Non-JSON response
    }
    throw new Error(errorMsg);
  }
  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

// ----------------- Projects API -----------------
export async function apiGetProjects(): Promise<ProjectInfo[]> {
  const res = await fetch(`${API_BASE_URL}/project`);
  return handleResponse<ProjectInfo[]>(res);
}

export async function apiGetProjectById(id: string | number): Promise<ProjectInfo> {
  const res = await fetch(`${API_BASE_URL}/project/${encodeURIComponent(String(id))}`);
  return handleResponse<ProjectInfo>(res);
}

export async function apiCreateProject(projectData: Partial<ProjectInfo>): Promise<ProjectInfo> {
  const res = await fetch(`${API_BASE_URL}/project`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData),
  });
  return handleResponse<ProjectInfo>(res);
}

export async function apiUpdateProject(
  id: string | number,
  projectData: Partial<ProjectInfo>
): Promise<ProjectInfo> {
  const res = await fetch(`${API_BASE_URL}/project/${encodeURIComponent(String(id))}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData),
  });
  return handleResponse<ProjectInfo>(res);
}

export async function apiDeleteProject(id: string | number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/project/${encodeURIComponent(String(id))}`, {
    method: 'DELETE',
  });
  await handleResponse(res);
}

// ----------------- Tasks API -----------------
export async function apiGetTasks(projectId?: string | number): Promise<Task[]> {
  const url = projectId
    ? `${API_BASE_URL}/tasks?projectId=${encodeURIComponent(String(projectId))}`
    : `${API_BASE_URL}/tasks`;
  const res = await fetch(url);
  return handleResponse<Task[]>(res);
}

export async function apiGetTaskById(id: string | number): Promise<Task> {
  const res = await fetch(`${API_BASE_URL}/tasks/${encodeURIComponent(String(id))}`);
  return handleResponse<Task>(res);
}

export async function apiCreateTask(taskData: {
  title: string;
  startDate: string;
  endDate: string;
  divisionId: string | number | null;
  projectId?: string | number | null;
  progress?: number;
}): Promise<Task> {
  const res = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  });
  return handleResponse<Task>(res);
}

export async function apiUpdateTask(
  id: string | number,
  taskData: {
    title: string;
    startDate: string;
    endDate: string;
    divisionId: string | number | null;
    progress?: number;
  }
): Promise<Task> {
  const res = await fetch(`${API_BASE_URL}/tasks/${encodeURIComponent(String(id))}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  });
  return handleResponse<Task>(res);
}

export async function apiUpdateTaskProgress(
  id: string | number,
  progress: number
): Promise<{ id: string | number; title: string; progress: number }> {
  const res = await fetch(`${API_BASE_URL}/tasks/${encodeURIComponent(String(id))}/progress`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ progress })
  });
  return handleResponse<{ id: string | number; title: string; progress: number }>(res);
}

export async function apiDeleteTask(id: string | number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/tasks/${encodeURIComponent(String(id))}`, {
    method: 'DELETE'
  });
  await handleResponse(res);
}

// ----------------- Divisions API -----------------
export async function apiGetDivisions(projectId?: string | number): Promise<Division[]> {
  const url = projectId
    ? `${API_BASE_URL}/division?projectId=${encodeURIComponent(String(projectId))}`
    : `${API_BASE_URL}/division`;
  const res = await fetch(url);
  return handleResponse<Division[]>(res);
}

export async function apiGetDivisionById(id: string | number): Promise<Division> {
  const res = await fetch(`${API_BASE_URL}/division/${encodeURIComponent(String(id))}`);
  return handleResponse<Division>(res);
}

export async function apiCreateDivision(name: string, projectId?: string | number): Promise<Division> {
  const res = await fetch(`${API_BASE_URL}/division`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, projectId: projectId ? Number(projectId) : undefined })
  });
  return handleResponse<Division>(res);
}

export async function apiUpdateDivision(id: string | number, name: string): Promise<Division> {
  const res = await fetch(`${API_BASE_URL}/division/${encodeURIComponent(String(id))}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  return handleResponse<Division>(res);
}

export async function apiDeleteDivision(id: string | number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/division/${encodeURIComponent(String(id))}`, {
    method: 'DELETE'
  });
  await handleResponse(res);
}
