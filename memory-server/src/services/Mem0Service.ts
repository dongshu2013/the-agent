import { Memory } from 'mem0ai/oss';
import { config } from '../config';

export default class Mem0Service {
  private memory: Memory;

  constructor() {
    this.memory = new Memory(config.mem0);

    console.log('vectorStore config:', config.mem0.vectorStore);
  }

  addMemory(messages: any, options: any) {
    return this.memory.add(messages, options);
  }

  searchMemory(query: string, options: any) {
    return this.memory.search(query, options);
  }

  getMemory(id: string) {
    return this.memory.get(id);
  }

  getAllMemories(options: any = {}) {
    return this.memory.getAll(options);
  }

  deleteMemory(id: string) {
    return this.memory.delete(id);
  }
}
