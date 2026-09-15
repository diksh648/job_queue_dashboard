import { CreateJobDto } from './dto/create-job.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JobsService } from './jobs.service';
export declare class JobsController {
    private readonly jobs;
    constructor(jobs: JobsService);
    create(dto: CreateJobDto): Promise<import("./job.entity").Job>;
    findAll(): Promise<import("./job.entity").Job[]>;
    updateStatus(id: string, dto: UpdateStatusDto): Promise<import("./job.entity").Job>;
    remove(id: string): Promise<void>;
}
