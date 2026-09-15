import { JobStatus } from './job-status.enum';
export declare class Job {
    id: string;
    title: string;
    type: string;
    status: JobStatus;
    createdAt: Date;
}
