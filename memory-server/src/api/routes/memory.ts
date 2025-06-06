import { Router } from 'express';
import { MemoryService } from '../services/memory';

export const createMemoryRoutes = (service: MemoryService): Router => {
  const router = Router();

  router.post('/', service.addMemory.bind(service));
  router.get('/search', service.searchMemories.bind(service));
  router.get('/:id', service.getMemory.bind(service));
  router.get('/', service.getAll.bind(service));
  router.delete('/:id', service.delete.bind(service));

  return router;
};
