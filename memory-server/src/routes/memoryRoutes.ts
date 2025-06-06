import { Router } from 'express';
import { validateMemoryAdd, validateMemorySearch } from '../middleware/validator';
import Mem0Service from '../services/Mem0Service';
import { MemoryController } from '../controllers/memoryController';

const router = Router();
const mem0Service = new Mem0Service();
const memoryController = new MemoryController(mem0Service);

router.post('/add', validateMemoryAdd, (req, res) => memoryController.addMemory(req, res));
router.post('/search', validateMemorySearch, (req, res) => memoryController.searchMemory(req, res));
router.get('/:id', (req, res) => memoryController.getMemory(req, res));
router.get('/', (req, res) => memoryController.getAllMemories(req, res));
router.delete('/:id', (req, res) => memoryController.deleteMemory(req, res));

export default router;
