import { Repository } from 'typeorm';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Job } from './job.entity';
export declare class JobsService {
    private readonly jobs;
    constructor(jobs: Repository<Job>);
    create(dto: CreateJobDto): Promise<Job>;
    findAll(): Promise<Job[]>;
    updateStatus(id: string, dto: UpdateStatusDto): Promise<Job>;
    remove(id: string): Promise<void>;
}
