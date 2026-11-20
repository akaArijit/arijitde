import { Router } from 'express';
import statsRouter from './stats';
import usersRouter from './users';
import clientsRouter from './clients';
import foliosRouter from './folios';
import queriesRouter from './queries';
import availabilityRouter from './availability';
import valuationsRouter from './valuations';

const router = Router();

router.use('/stats', statsRouter);
router.use('/users', usersRouter);
router.use('/', clientsRouter);
router.use('/', foliosRouter);
router.use('/', queriesRouter);
router.use('/', availabilityRouter);
router.use('/', valuationsRouter);

export default router;