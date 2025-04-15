// agent/types.ts
export interface Observation {
  type: string;
  payload: any;
}

export interface Task {
  description: string;
  payload?: any;
}

export interface AgentMemory {
  logs: string[];
  knowledge: Record<string, any>;
}

export interface Agent {
  observe(): Promise<Observation>;
  plan(observation: Observation): Promise<Task>;
  act(task: Task): Promise<void>;
  remember(log: string): void;
}
